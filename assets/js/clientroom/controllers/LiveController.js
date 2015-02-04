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

      $scope.roomInfo = {};
      $scope.roomInfo.roomName = "fello.in_congtya";

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
      $scope.me.easyRtcId = easyrtcid;
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
          var selfVideo = document.getElementById("self");
          easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
          easyrtc.connect("fello.serverApp", _loginSuccess, _loginFailure);
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
        $scope.ismeeting = true;
        $scope.$apply();
      });

      easyrtc.setOnStreamClosed(function (callerEasyrtcid) {
        easyrtc.setVideoObjectSrc(document.getElementById('caller'), "");
      });

      // set the id is  not Agent
      easyrtc.setRoomApiField(roomName, "isAgent", false);
      // set the id is need show
      easyrtc.setRoomApiField(roomName, "isDisplay", true);
      easyrtc.joinRoom("fello.in_congtya", null, function(roomName) {

          console.log("I'm now in room " + roomName);

        }, function(errorCode, errorText, roomName) {

          console.log("had problems joining " + roomName);
        });

      // custom event
      easyrtc.setServerListener(function (msgType, msgData, targeting) {
        switch (msgType) {
          case "clientDisconnect":
            console.log('Client disconnected');
            break;
          case "ban":
            alert("You are kicked by Admin !");
            console.log('You are kicked by Admin !');
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

    $scope.chat = function (callId) {
      // make call
    };

    $scope.deny = function (callId) {
      // make call
    };

    initApp();
    initRtc();

  }]);
