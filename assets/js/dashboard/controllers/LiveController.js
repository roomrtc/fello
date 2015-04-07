/**
 * Created by Vunb on 1/2/2015.
 */
angular.module('fello.dashboard')
  .controller('LiveController', ['$scope', '$filter', '$timeout', '$compile', 'rtcapi', 'CallService', 'utils',
    function ($scope, $filter, $timeout, $compile, rtcApi, callService, utils) {

      var initApp = function () {

        $scope.chatClients = {};
        $scope.waitingClients = {};
        $scope.agentList = {};
        $scope.processingList = {};
        $scope.dialogistList = {};
        $scope.me = {};
        $scope.me.easyrtcid = "fetching ...";
        $scope.me.roomName = "demo"; // "fello.in_congtya";
        $scope.me.name = "Vu Bao Nhu";

        $scope.roomInfo = {};
        $scope.roomInfo.roomName = "demo";//"fello.in_congtya";
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
          client.name = utils.getFieldValue(peer["apiField"], "clientName") || callId;
          client.email = utils.getFieldValue(peer["apiField"], "clientEmail") || callId;
          client.callId = callId;
          client.easyrtcid = callId;
          client.roomJoinTime = peer.roomJoinTime;
          client.previewMsg = {};
          client.messages = [];
          client.isAgent = utils.getFieldValue(peer["apiField"], "isAgent");  //&& peer["apiField"]["isAgent"] && peer["apiField"]["isAgent"]["fieldValue"];
          client.dialogist = utils.getFieldValue(peer["apiField"], "dialogist"); // peer["apiField"] && peer["apiField"]["dialogist"] && peer["apiField"]["dialogist"]["fieldValue"];

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

        //console.log("room: " + roomName + ", agents: " + JSON.stringify(agents));
        //console.log("room: " + roomName + ", clients: " + JSON.stringify(clients));

        // remove client out from waiting list --> to processing list
        for (var id in dialogists) {
          var _client = clients[id];
          if (_client) {

            dialogists[id] = _client;
            dialogists[id].clientName = _client.name;
            //if (dialogists[id].agentid == _getMe().easyrtcid) {
            //  $scope.me.dialogist = dialogists[id];
            //}
            delete clients[id];
          }
        }

        $timeout(function () {
          $scope.waitingClients = clients;
          $scope.processingList = dialogists;
          $scope.agentList = agents;
        });

      };

      var _loginSuccess = function (rtcid) {
        var roomName = $scope.roomInfo.roomName;
        //// set the id is  not Agent
        //// set the id is need show
        //rtcApi.setRoomApiField(roomName, "isAgent", true);
        //rtcApi.setRoomApiField(roomName, "isDisplay", true);
        $scope.me.easyrtcid = rtcid;
        //$scope.me.name = rtcid;
        $scope.$apply();
      };

      var _loginFailure = function (errorCode, message) {
        console.log(errorCode + ": " + message);
        rtcApi.showError(errorCode, message);
        $scope.$apply();
      };

      function initRtc() {

        // get client list
        var roomName = $scope.roomInfo.roomName;
        var peers = rtcApi.getRoomOccupantsAsMap(roomName);
        _parsePeers(roomName, peers);
        rtcApi.setRoomOccupantListener(_roomListener);
        rtcApi.initMediaSource(function () {       // success callback
            var selfVideo = document.getElementById("self");
            rtcApi.setVideoObjectSrc(selfVideo, rtcApi.getLocalStream());
            rtcApi.connect("fello.serverApp", function (rtcid) {
              // set the id is  not Agent
              rtcApi.setRoomApiField(roomName, "isAgent", true);
              rtcApi.setRoomApiField(roomName, "clientName", "agentName1");
              rtcApi.joinRoom(roomName, null, function (roomName) {

                console.log("I'm now in room " + roomName);

              }, function (errorCode, errorText, roomName) {

                console.log("had problems joining " + roomName);
              });
              _loginSuccess(rtcid);
            }, _loginFailure);
          }, _loginFailure
        );

        //rtcApi.onEmitEasyrtcMsg()

        rtcApi.setAcceptChecker(function (rtcid, acceptor) {
          // validate client is calling (check in list ?)
          if ($scope.me.dialogist.easyrtcid == rtcid) {
            console.log("accept call", rtcid);
            acceptor(true);
          } else {
            console.log("do not accept call", rtcid, $scope.me.dialogist.easyrtcid);
            acceptor(false);
          }
        });

        rtcApi.setStreamAcceptor(function (callerRtcid, stream) {
          // create self dialogist
          var _c = $scope.waitingClients[callerRtcid];
          var _d = {};
          _d.agent = _getMe();
          _d.agentid = _getMe().easyrtcid;
          _d.agentName = _getMe().name;
          _d.clientid = callerRtcid;

          var btnDrop = $compile("<div id='btnDrop'><button class='btn btn-default' ng-click='drop(me.dialogist)'>Drop</button></div>")($scope);
          var video = document.getElementById('caller');
          rtcApi.setRoomApiField(roomName, "dialogist", callerRtcid);
          rtcApi.setVideoObjectSrc(video, stream);
          // temporally
          angular.element(video).parent().append(btnDrop);
          $timeout(function () {
            // update fields
            $scope.ismeeting = true;
            $scope.me.dialogist = _d;
            $scope.processingList[callerRtcid] = _d;
            delete $scope.waitingClients[callerRtcid];
          });
        });

        rtcApi.setOnStreamClosed(function (callerRtcid) {
          rtcApi.setVideoObjectSrc(document.getElementById('caller'), "");
          var btnDrop = document.getElementById('btnDrop');
          angular.element(btnDrop).remove();
          delete $scope.me.dialogist;
        });


        function addToConversation(who, msgType, content, targeting) {
          // Escape html special characters, then add linefeeds.
          if (!content || !content.text) {
            //content = "**no body**";
            return;
          }
          var message = content.text;
          message = message.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
          message = message.replace(/\n/g, '<br />');
          var targetingStr = "";
          if (targeting) {
            if (targeting.targetEasyrtcid) {
              targetingStr += "user=" + targeting.targetEasyrtcid;
            }
            if (targeting.targetRoom) {
              targetingStr += " room=" + targeting.targetRoom;
            }
            if (targeting.targetGroup) {
              targetingStr += " group=" + targeting.targetGroup;
            }
          }
          //chatStorage.entries.push(new parseMessage(content));
          //$rootScope.$broadcast("new_chat_message", content);
          var client = $scope.waitingClients[who];
          if (client) {
            $scope.waitingClients[who].messages = $scope.waitingClients[who].messages || [];
            $scope.waitingClients[who].messages.push({message: message});
            $scope.$apply();
          }

        }

        function peerListener(who, msgType, content, targeting) {
          addToConversation(who, msgType, content, targeting);
        }

        rtcApi.setPeerListener(peerListener);

        // custom event
        rtcApi.setServerListener(function (msgType, msgData, targeting) {
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
        rtcApi.hangupAll();
        rtcApi.call(callId, function (easyrtcid) {
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

      $scope.chat = function (uid) {
        if (!$scope.chatClients[uid]) {
          $timeout(function () {
            var client = $scope.waitingClients[uid] || $scope.processingList[uid];
            $scope.chatClients[uid] = client;
          });
        }
      };

      $scope.closeChat = function (uid) {
        $timeout(function () {
          delete $scope.chatClients[uid];
        });
      };


      $scope.drop = function (callId) {
        var clientid = callId.clientid || callId;
        var roomName = _getMe().roomName;
        var data = {
          easyrtcid: clientid,
          roomName: roomName
        };
        rtcApi.setRoomApiField(roomName, "dialogist", null);
        rtcApi.hangup(clientid);
        rtcApi.sendServerMessage("callDrop", data, function (msgType, msgData) {
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
        rtcApi.hangup(callId);
        rtcApi.sendServerMessage("callDeny", data, function (msgType, msgData) {
          console.log("OK: ", msgData);
        }, function (errorCode, errorText) {
          console.log("error was " + errorText);
        });
      };

      $scope.getSocketCount = function (data) {
        data = data || {};
        rtcApi.sendServerMessage("socketCount", data, function (msgType, msgData) {
          console.log("Login users:" + msgData);
        }, function (errorCode, errorText) {
          console.log("error was " + errorText);
        });
      };

      // init
      initApp();
      initRtc();

    }]);
