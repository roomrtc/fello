/**
 * Created by Vunb on 1/2/2015.
 */
angular.module('fello.dashboard')
  .controller('LiveController', ['$scope', '$filter', '$timeout', '$compile', 'CallService',
    function ($scope, $filter, $timeout, $compile, callService) {

      var initApp = function () {

        $scope.waitingClients = {};
        $scope.agentList = {};
        $scope.processingList = {};
        $scope.dialogistList = {};
        $scope.me = {};
        $scope.me.easyrtcid = "fetching ...";
        $scope.me.roomName = "fello.in_congtya";
        $scope.me.name = "Vu Bao Nhu";

        $scope.roomInfo = {};
        $scope.roomInfo.roomName = "fello.in_congtya";
        $scope.waitingCount = 0;
        $scope.proccessingCount = 0;

        var now = new Date();

        var client1 = {
          name: "Vu Bao Nhu"        // required:
          , email: "vunb@fello.in"  // required:
          , messages: [{
            timeSent: new Date().setMilliseconds(now.getMilliseconds() - 10),
            timeReceived: new Date().setMilliseconds(now.getMilliseconds() - 20),
            message: "Hello bussiness!"
          }, {
            timeSent: new Date().setMilliseconds(now.getMilliseconds() - 10),
            timeReceived: new Date().setMilliseconds(now.getMilliseconds() - 10),
            message: "Can i ask you a question ?"
          }]
          , callId: 'thewqe15' // required: rtc_id used for call
          , uuid: 'ahgfdfghjh'  // --> identify to blocked
          , timeJoined: now
          , timeAccepted: now
          , timeEnd: now
          , isAgent: false  // required:
          , state: 'waiting(default)|processing|blocked|dropped|end' // required:

        };
        $scope.waitingClients[client1.callId] = (client1);
        $scope.$watch('waitingClients', function (newVal, oldVal) {
          $scope.waitingCount = Object.keys(newVal).length;
          $scope.processingCount = Object.keys($scope.processingList).length;
        });
        $scope.$watch('agentList', function (newVal, oldVal) {
          $scope.agentCount = Object.keys(newVal).length;
        });

      };

      var _getMe = function () {
        return $scope.me;
      };


      function _roomListener(roomName, otherPeers) {
        console.log(JSON.stringify(otherPeers));
        _parsePeers(roomName, otherPeers);

      }

      var _parsePeers = function (roomName, peers) {

        var agents = {};
        var clients = {};
        var dialogists = {};

        for (var prop in peers) {
          var peer = peers[prop];
          var callId = peer.easyrtcid;
          var client = {};
          client.name = callId;
          client.email = callId;
          client.callId = callId;
          client.easyrtcid = callId;
          client.roomJoinTime = peer.roomJoinTime;
          client.previewMsg = {};
          client.isAgent = peer["apiField"] && peer["apiField"]["isAgent"] && peer["apiField"]["isAgent"]["fieldValue"];
          client.dialogist = peer["apiField"] && peer["apiField"]["dialogist"] && peer["apiField"]["dialogist"]["fieldValue"];

          if (client.isAgent) {
            agents[prop] = client;
            if (client.dialogist) {
              var dialogist = {};
              dialogist.agent = client;
              dialogist.agentid = client.easyrtcid;
              dialogist.agentName = client.name;
              dialogist.clientid = client.dialogist;
              dialogists[client.dialogist] = dialogist;
            }
          } else {
            clients[prop] = client;
          }
        }

        console.log("room: " + roomName + ", agents: " + JSON.stringify(agents));
        console.log("room: " + roomName + ", clients: " + JSON.stringify(clients));

        // remove client out from waiting list --> to processing list
        for (var id in dialogists) {
          var _client = clients[id];
          dialogists[id] = _client;
          dialogists[id].clientName = _client.name;
          //if (dialogists[id].agentid == _getMe().easyrtcid) {
          //  $scope.me.dialogist = dialogists[id];
          //}
          delete clients[id];
        }

        $timeout(function () {
          $scope.waitingClients = clients;
          $scope.processingList = dialogists;
          $scope.agentList = agents;
        });

      };

      var _loginSuccess = function (easyrtcid) {
        var roomName = $scope.roomInfo.roomName;
        // set the id is  not Agent
        // set the id is need show
        easyrtc.setRoomApiField(roomName, "isAgent", true);
        easyrtc.setRoomApiField(roomName, "isDisplay", true);
        $scope.me.easyrtcid = easyrtcid;
        //$scope.me.name = easyrtcid;
        $scope.$apply();
      };

      var _loginFailure = function (errorCode, message) {
        console.log(errorCode + ": " + message);
        easyrtc.showError(errorCode, message);
        $scope.$apply();
      };

      function initRtc() {

        // get client list
        var roomName = $scope.roomInfo.roomName;
        var peers = easyrtc.getRoomOccupantsAsMap(roomName);
        _parsePeers(roomName, peers);
        easyrtc.setRoomOccupantListener(_roomListener);
        easyrtc.initMediaSource(function () {       // success callback
            var selfVideo = document.getElementById("self");
            easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
            easyrtc.connect("fello.serverApp", _loginSuccess, _loginFailure);
          }, _loginFailure
        );

        //easyrtc.onEmitEasyrtcMsg()

        easyrtc.setAcceptChecker(function (easyrtcid, acceptor) {
          // validate client is calling
          if ($scope.me.dialogist.easyrtcid == easyrtcid) {
            console.log("accept call", easyrtcid);
            acceptor(true);
          } else {
            console.log("do not accept call", easyrtcid, $scope.me.dialogist.easyrtcid);
            acceptor(false);
          }
          //if( easyrtc.idToName(easyrtcid) === 'Fred' ){
          //  acceptor(true);
          //} else if( easyrtc.idToName(easyrtcid) === 'Barney' ){
          //  setTimeout( function() {
          //    acceptor(true, ['myOtherCam']); // myOtherCam presumed to a streamName
          //  }, 10000);
          //} else{
          //  acceptor(false);
          //}
        });

        easyrtc.setStreamAcceptor(function (callerEasyrtcid, stream) {
          // create self dialogist
          var _c = $scope.waitingClients[callerEasyrtcid];
          var _d = {};
          _d.agent = _getMe();
          _d.agentid = _getMe().easyrtcid;
          _d.agentName = _getMe().name;
          _d.clientid = callerEasyrtcid;

          var btnDrop = $compile("<div id='btnDrop'><button class='btn btn-default' ng-click='drop(me.dialogist)'>Drop</button></div>")($scope);
          var video = document.getElementById('caller');
          easyrtc.setRoomApiField(roomName, "dialogist", callerEasyrtcid);
          easyrtc.setVideoObjectSrc(video, stream);
          // temporally
          angular.element(video).parent().append(btnDrop);
          $timeout(function () {
            // update fields
            $scope.ismeeting = true;
            $scope.me.dialogist = _d;
            $scope.processingList[callerEasyrtcid] = _d;
            delete $scope.waitingClients[callerEasyrtcid];
          });
        });

        easyrtc.setOnStreamClosed(function (callerEasyrtcid) {
          easyrtc.setVideoObjectSrc(document.getElementById('caller'), "");
          var btnDrop = document.getElementById('btnDrop');
          angular.element(btnDrop).remove();
          delete $scope.me.dialogist;
        });

        // set the id is  not Agent
        easyrtc.setRoomApiField(roomName, "isAgent", true);
        easyrtc.setRoomApiField(roomName, "isDisplay", true);
        easyrtc.joinRoom(roomName, null, function (roomName) {

          console.log("I'm now in room " + roomName);

        }, function (errorCode, errorText, roomName) {

          console.log("had problems joining " + roomName);
        });

        // custom event
        easyrtc.setServerListener(function (msgType, msgData, targeting) {
          switch (msgType) {
            case "callAccept":
              console.log('Other admin accept the call !', msgData.agentName);
              break;
            case "callDeny":
              console.log('Admin kicked client !', msgData.agentName);
              console.log('Admin kicked client name !', msgData.clientName);
              break;
            case "callBlock":
              console.log('Admin blocked client !', msgData.agentName);
              console.log('Admin blocked client name !', msgData.clientName);
              break;
            case "clientDisconnect":
              console.log('Client disconnected');
              break;
            case "test":
              console.log('test ok');
              break;
            case "clientJoin":
              console.log('new client joined !, msgData: ', msgData);
              break;
            case "prevMessage":
              var fromId = msgData.fromClientId;
              var message = {
                timeSent: new Date(msgData.timeSent),
                timeReceived: new Date(),
                message: msgData.message
              };
              var client = $scope.waitingClients[fromId];
              client.messages.push(message);
              $scope.$apply();
              break;
            case "chatMessage":
              var fromId = msgData.fromClientId;
              var message = {
                timeSent: new Date(msgData.timeSent),
                timeReceived: new Date(),
                message: msgData.message
              };
              var client = $scope.waitingClients[fromId];
              client.messages.push(message);
              $scope.$apply();
              break;
            case "ban":
              console.log('new client banned ! ', msgData);
              break;

          }
          console.log(msgType);
          console.log(msgData);
          console.log(targeting);
        });

      }

      $scope.accept = function (callId) {
        // make call
        easyrtc.hangupAll();
        easyrtc.call(callId, function (easyrtcid) {
            // send call success
            $scope.me.dialogist = $scope.waitingClients[easyrtcid];
            $scope.me.inconversation = true;
            $scope.$apply();
            console.log("completed call to " + easyrtcid);
          }, function (errorMessage) {
            // MSG_REJECT_TARGET_EASYRTCID --> remove from waiting list
            console.log("err:" + errorMessage);
          }, function (accepted, bywho) {
            console.log((accepted ? "accepted" : "rejected") + " by " + bywho);
          }
        );

      };

      $scope.chat = function (callId) {
        // make call
      };

      $scope.drop = function (callId) {
        var clientid = callId.clientid || callId;
        var roomName = _getMe().roomName;
        var data = {
          easyrtcid: clientid,
          roomName: roomName
        };
        easyrtc.setRoomApiField(roomName, "dialogist", null);
        easyrtc.hangup(clientid);
        easyrtc.sendServerMessage("callDrop", data, function (msgType, msgData) {
          console.log("OK: ", msgData);
          $scope.me.dialogist = {};
          $scope.me.inconversation = false;
          $scope.$apply();
        }, function (errorCode, errorText) {
          console.log("error was " + errorText);
        });
      };

      $scope.deny = function (callId) {
        var data = {
          easyrtcid: callId,
          roomName: $scope.roomInfo.roomName
        };
        easyrtc.hangup(callId);
        easyrtc.sendServerMessage("callDeny", data, function (msgType, msgData) {
          console.log("OK: ", msgData);
        }, function (errorCode, errorText) {
          console.log("error was " + errorText);
        });
      };

      $scope.getSocketCount = function (data) {
        data = data || {};
        easyrtc.sendServerMessage("socketCount", data, function (msgType, msgData) {
          console.log("Login users:" + msgData);
        }, function (errorCode, errorText) {
          console.log("error was " + errorText);
        });
      };

      // init
      initApp();
      initRtc();

    }]);
