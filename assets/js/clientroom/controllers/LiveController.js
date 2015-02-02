/**
 * Created by Vunb on 3/2/2015.
 */

angular.module('fello.clientroom')
  .controller('LiveController', ['$scope', '$filter', function ($scope, $filter) {

    var _init = function () {

      $scope.waitingClients = [];
      $scope.processingList = [];

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
      var otherClientDiv = document.getElementById('otherClients');
      while (otherClientDiv.hasChildNodes()) {
        otherClientDiv.removeChild(otherClientDiv.lastChild);
      }
      for (var i in otherPeers) {
        var button = document.createElement('button');
        button.onclick = function (easyrtcid) {
          return function () {
            performCall(easyrtcid);
          }
        }(i);

        var label = document.createTextNode(i);
        button.appendChild(label);
        otherClientDiv.appendChild(button);
      }
    }


    function my_init() {
      easyrtc.setRoomOccupantListener(roomListener);
      easyrtc.initMediaSource(function () {       // success callback
          var selfVideo = document.getElementById("self");
          easyrtc.setVideoObjectSrc(selfVideo, easyrtc.getLocalStream());
          easyrtc.connect("fello.instantMessaging", function (myId) {
            console.log("My easyrtcid is " + myId);
          }, function (errmesg) {
            console.log(errmesg);
          });
        }, function (errmesg) {
          console.log(errmesg);
        }
      );
      //easyrtc.easyApp("Company_Chat_Line", "self", ["caller"],
      //  function (myId) {
      //    console.log("My easyrtcid is " + myId);
      //  }
      //);
    }


    $scope.call = function (callId) {
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

    _init();
    my_init();

  }]);
