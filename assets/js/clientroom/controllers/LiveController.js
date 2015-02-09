/**
 * Created by Vunb on 3/2/2015.
 */

angular.module('fello.clientroom')
  .controller('LiveController', ['$scope', '$filter', function ($scope, $filter) {

    var initApp = function () {

      $scope.waitingClients = [];
      $scope.processingList = [];
      $scope.isDenied = false;
      $scope.me = {};
      $scope.agent = {};
      $scope.agentNameRequest = "";
      $scope.message = "";

      $scope.roomInfo = {};
      $scope.roomInfo.roomName = "fello.in_congtya";
      $scope.helper = {};
      $scope.helper.messageNotify = "Are you ready ? Automatically call an Agent in {{}} seconds";

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
    };

    function roomListener(roomName, otherPeers) {
      for (var i in otherPeers) {
        console.log('other_in_room: ' + i);
      }
    }

    var _loginSuccess = function (easyrtcid) {
      $scope.me.easyrtcid = easyrtcid;
      $scope.$apply();
    };

    var _loginFailure = function (errorCode, message) {
      console.log(errorCode + ": " + message);
      easyrtc.showError(errorCode, message);
      $scope.$apply();
    };

    function initRtc() {

      var roomName = $scope.roomInfo.roomName;

      easyrtc.setRoomOccupantListener(roomListener);
      easyrtc.initMediaSource(function () {       // success callback
          $scope.me.promptMessage = "AreYouReadyCall";
          var selfVideo = document.getElementById("self");
          easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
          easyrtc.connect("fello.serverApp", _loginSuccess, _loginFailure);
          $scope.$apply();
        }, _loginFailure
      );

      //easyrtc.easyApp("fello.instantMessaging", "self", ["caller"], function (myId) {
      //    console.log("My easyrtcid is " + myId);
      //});
      easyrtc.setAcceptChecker(function (easyrtcid, acceptor) {
        acceptor(true);
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
        var video = document.getElementById('caller');
        easyrtc.setVideoObjectSrc(video, stream);
        $scope.me.inconversation = true;
        $scope.agent.easyrtcid = callerEasyrtcid;
        $scope.$apply();
      });

      easyrtc.setOnStreamClosed(function (callerEasyrtcid) {
        if (document.getElementById('caller') != null) {
          easyrtc.setVideoObjectSrc(document.getElementById('caller'), "");
          $scope.me.inconversation = true;
          delete $scope.agent.easyrtcid;
          $scope.$apply();
        }
      });

      // custom event
      easyrtc.setServerListener(function (msgType, msgData, targeting) {
        switch (msgType) {
          case "clientDisconnect":
            console.log('Client disconnected');
            break;
          case "callAccept":
            console.log('You are accepted by Admin !', msgData);
            if (msgData.easyrtcid == $scope.me.easyrtcid) {
              alert("You are accepted by Admin !");
            }
            break;
          case "callDrop":
            if (msgData.easyrtcid == $scope.me.easyrtcid) {
              console.log('You are dropped by Admin !', msgData);
            }
            $scope.me.inconversation = false;
            $scope.me.promptMessage = "DoYouWantRecall";
            $scope.$apply();
            break;
          case "callDeny":
            if (msgData.easyrtcid == $scope.me.easyrtcid) {
              console.log('You are denied by Admin !', msgData);
              //alert("You are denied by Admin !");
            }
            $scope.me.inconversation = false;
            $scope.me.promptMessage = "YouAreDenied";
            $scope.$apply();

            break;
          case "callBlock":
            if (msgData.easyrtcid == $scope.me.easyrtcid) {
              console.log('You are kicked by Admin !', msgData);
              //alert("You are kicked by Admin !");
            }
            $scope.me.inconversation = false;
            $scope.me.promptMessage = "YouAreBlocked";
            $scope.$apply();
            break;
          case "test":
            alert("test ok");
            console.log('test ok');
            break;
        }
        console.log(msgType);
        console.log(msgData);
        console.log(targeting);
      });
    }

    $scope.call = function (agentNameRequest) {
      var roomName = $scope.roomInfo.roomName;
      // set the id is  not Agent
      easyrtc.setRoomApiField(roomName, "isAgent", false);
      easyrtc.setRoomApiField(roomName, "isDisplay", true);
      easyrtc.setRoomApiField(roomName, "agentName", agentNameRequest);
      easyrtc.joinRoom(roomName, null, function (roomName) {
        $scope.me.promptMessage = "PleaseWaitAccept";
        $scope.$apply();
        console.log("I'm now in room " + roomName);

      }, function (errorCode, errorText, roomName) {

        console.log("had problems joining " + roomName);
      });

    };


    $scope.recall = function (callId) {
      // make call
      easyrtc.call(callId, function (easyrtcid) {
          console.log("completed call to " + easyrtcid);
        }, function (errorMessage) {
          console.log("err:" + errorMessage);
        }, function (accepted, bywho) {
          console.log((accepted ? "accepted" : "rejected") + " by " + bywho);
        }
      );

    };

    $scope.chat = function () {

      var msgData = {
        fromClientId: $scope.me.easyrtcid,
        toAdminId: $scope.agent.easyrtcid,
        roomName: $scope.roomInfo.roomName,
        message: $scope.message
      };

      easyrtc.sendServerMessage("chatMessage", msgData, function (msgType, msgData) {
        console.log("OK: ", msgData);
      }, function (errorCode, errorText) {
        console.log("error was " + errorText);
      });
      $scope.message = "";
      $scope.$apply();
    };

    $scope.drop = function (callId) {
      // drop call
    };

    $scope.stopTimer = function () {
      $scope.$broadcast('timer-stop');
      $scope.timerRunning = false;
    };

    $scope.$on('timer-stopped', function (event, data) {
      console.log('Timer Stopped - data = ', data);
    });

    initApp();
    initRtc();

  }]);
