/**
 * Created by Vunb on 1/2/2015.
 */
angular.module('fello.dashboard').controller('LiveController', ['$scope', '$filter', '$timeout', 'CallService', function ($scope, $filter, $timeout, callService) {

  var initApp = function () {

    $scope.waitingClients = {};
    $scope.processingList = {};
    $scope.me = {};
    $scope.me.easyRtcId = "fetching ...";

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
    $scope.waitingClients[client1.callId] = (client1);

  };

  function _roomListener(roomName, otherPeers) {
    console.log(JSON.stringify(otherPeers));
    _parsePeers(roomName, otherPeers);

  }

  var _parsePeers = function (roomName, peers) {

    var agents = {};
    var clients = {};

    for (var prop in peers) {
      var peer = peers[prop];
      var callId = peer.easyrtcid;
      var client = {};
      client.name = callId;
      client.email = callId;
      client.callId = callId;
      client.easyrtcid = callId;
      client.timeJoined = peer.roomJoinTime;
      client.isAgent = peer["apiField"] && peer["apiField"]["isAgent"] && peer["apiField"]["isAgent"]["fieldValue"];

      if (client.isAgent) {
        agents[prop] = client;
      } else {
        clients[prop] = client;
      }
    }
    console.log("room: " + roomName + ", agents: " + JSON.stringify(agents));
    console.log("room: " + roomName + ", clients: " + JSON.stringify(clients));

    $timeout(function () {
      $scope.waitingClients = clients;
    });

  };

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
      $scope.ismeeting = true;
      var video = document.getElementById('caller');
      easyrtc.setVideoObjectSrc(video, stream);
    });

    easyrtc.setOnStreamClosed(function (callerEasyrtcid) {
      easyrtc.setVideoObjectSrc(document.getElementById('caller'), "");
    });

    // set the id is  not Agent
    easyrtc.setRoomApiField(roomName, "isAgent", true);
    // set the id is need show
    easyrtc.setRoomApiField(roomName, "isDisplay", true);
    easyrtc.joinRoom(roomName, null, function (roomName) {

      console.log("I'm now in room " + roomName);

    }, function (errorCode, errorText, roomName) {

      console.log("had problems joining " + roomName);
    });

    // custom event
    easyrtc.setServerListener(function (msgType, msgData, targeting) {
      switch (msgType) {
        case "clientDisconnect":
          console.log('Client disconnected');
          break;
        case "test":
          console.log('test ok');
          break;
        case "clientJoin":
          console.log('new client joined !, msgData: ', msgData);
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

  $scope.deny = function (callId) {
    // make call
    easyrtc.hangup(callId);
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
