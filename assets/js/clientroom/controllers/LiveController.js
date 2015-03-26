/**
 * Created by Vunb on 3/2/2015.
 */

angular.module('fello.clientroom')
  .controller('LiveController',
  ["$rootScope",
    '$scope',
    '$state',
    '$stateParams',
    '$filter',
    '$window',
    'rtcapi',
    'lodash',
    'utils',
    'memo',
    'fluidGrid',
    'State',
    'serverSocket',
    'RoomState',
    function ($rootScope, $scope, $state, $stateParams, $filter, $window, RtcApi, _, utils, memo, fluidGrid, State, serverSocket, RoomState) {
      var $ = angular.element;
      var roomName = RoomState.roomName; //"fello.in_congtya";
      // check name exists !!

      var initApp = function () {

        $scope.RoomService = {};
        $scope.waitingClients = [];
        $scope.processingList = [];
        $scope.isDenied = false;
        $scope.me = {};
        $scope.me.name = memo.getUsername() || "";
        $scope.me.email = memo.getUserEmail() || "";
        $scope.agent = {};
        $scope.agentCallId = "";
        $scope.streams = {};
        $scope.shuffle = fluidGrid('#remotes >');
        //$scope.roomInfo = {};
        //$scope.roomInfo.roomName = "fello.in_congtya";
        $scope.helper = {};
        $scope.helper.messageNotify = "Are you ready ? Automatically call an Agent in {{}} seconds";
        $scope.state = "ready";
        $scope.roomState = "";

        $scope.addStream = function (id, stream) {
          $scope.streams[id] = utils.getStreamAsUrl(stream);
          $scope.me.inconversation = true;
          $scope.$apply();
          $scope.shuffle();
        };

        $scope.handleVideoClick = function (e) {
          //if (e.target.id == 'localVideo') return;
          if (_.size($scope.streams) == 1) return;

          // e.target is the video element, we want the container #remotes > div > div
          var container = angular.element(e.target).parent().parent();
          var alreadyFocused = container.hasClass('focused');
          angular.element(container).removeClass('focused');

          if (!alreadyFocused) {
            container.addClass('focused');
            $scope.shuffle(container.get(0));
          } else {
            // clicking on the focused element removes focus
            $scope.shuffle();
          }
        };

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
        $($window).bind('resize', function () {
          $scope.shuffle();
        });
      };


      var requestAccessMedia = function () {
        $scope.roomState = State.PLEASE_GRANT_ACCESS;
        //k.getUserMedia({
        //  video: !O,
        //  audio: !0
        //}, function (stream) {
        //  k.localStorageAdapter("client", "cameraAccessGranted", !0), d(function () {
        //    g.selfStream = stream, $scope.roomState = State.WAITING_FOR_ROOM_INFORMATION
        //  })
        //}, function () {
        //  d(function () {
        //    a.roomState = State.CAMERA_ACCESS_DENIED
        //  })
        //})
      };

      function roomListener(roomName, otherPeers) {
        for (var i in otherPeers) {
          console.log('other_in_room: ' + i);
        }
      }

      var _loginSuccess = function (rtcid) {
        $scope.me.easyrtcid = rtcid;
        $scope.$apply();
      };

      var _loginFailure = function (errorCode, message) {
        console.log(errorCode + ": " + message);
        RtcApi.showError(errorCode, message);
        $scope.$apply();
      };

      function initRtc() {

        $scope.IsNotAllowAccessMedia = true;

        RtcApi.setRoomOccupantListener(roomListener);
        RtcApi.initMediaSource(function () {       // success callback
          $scope.IsNotAllowAccessMedia = false;
          $scope.me.promptMessage = "AreYouReadyCall";
          //var selfVideo = document.getElementById("self");
          //RtcApi.setVideoObjectSrc(selfVideo, RtcApi.getLocalStream());
          $scope.addStream('localVideo', RtcApi.getLocalStream());
          RtcApi.connect("fello.serverApp", function (rtcid) {
            _loginSuccess(rtcid);
            $scope.roomState = State.WAITING_FOR_CONNECTION;
          }, _loginFailure);
          $scope.$apply();
        }, function (errorCode, errorText) {

        });

        //rtcApi.easyApp("fello.instantMessaging", "self", ["caller"], function (myId) {
        //    console.log("My rtcid is " + myId);
        //});
        RtcApi.setAcceptChecker(function (rtcid, acceptor) {
          acceptor(true);
          //if( rtcApi.idToName(rtcid) === 'Fred' ){
          //  acceptor(true);
          //} else if( rtcApi.idToName(rtcid) === 'Barney' ){
          //  setTimeout( function() {
          //    acceptor(true, ['myOtherCam']); // myOtherCam presumed to a streamName
          //  }, 10000);
          //} else{
          //  acceptor(false);
          //}
        });
        RtcApi.setStreamAcceptor(function (acceptorRtcid, stream) {
          //var video = document.getElementById('caller');
          // rtcApi.setVideoObjectSrc(video, stream);
          // use objectURL to manage stream
          var id = acceptorRtcid;
          RoomState.agentId = id;
          $scope.addStream(id, stream);
          $scope.me.inconversation = true;
          $scope.agent.easyrtcid = id;
          $scope.$apply();
        });

        RtcApi.setOnStreamClosed(function (acceptorRtcid) {
          var id = acceptorRtcid;
          var url = $scope.streams[id];
          URL.revokeObjectURL(url);
          $scope.me.inconversation = true;
          delete $scope.agent.easyrtcid;
          delete $scope.streams[id];
          if (_.size($scope.streams) == 1) {
            angular.element('.videocontainer').removeClass('focused');
          }
          $scope.shuffle();
          $scope.$apply();
        });

        // custom event
        RtcApi.setServerListener(function (msgType, msgData, targeting) {
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
                RtcApi.leaveRoom(msgData.roomName, function (roomName) {
                  $scope.me.inconversation = false;
                  $scope.me.promptMessage = "DoYouWantRecall";
                  $scope.$apply();
                });
              }
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
            case "clientJoin":
              console.log('clientJoin: ', msgData);
              break;
          }
        });
      }

      $scope.readyInfo = function () {
        return !!($scope.me.name && $scope.me.email);
      };

      $scope.call = function (agentCallId) {
        // set the id is  not Agent
        // RtcApi.setRoomApiField(roomName, "isAgent", false);  // DONT NEED
        // RtcApi.setRoomApiField(roomName, "isDisplay", true); // DONT NEED

        if (!$scope.readyInfo()) {
          return;
        }

        var rooms = RtcApi.getRoomsJoined();
        var joinRoom = function () {
          var clientName = $scope.me.name;
          var clientEmail = $scope.me.email;
          RtcApi.setRoomApiField(roomName, "agentName", agentCallId);
          RtcApi.setRoomApiField(roomName, "clientName", clientName);
          RtcApi.setRoomApiField(roomName, "clientEmail", clientEmail);
          RtcApi.joinRoom(roomName, null, function (roomName) {
            $scope.me.promptMessage = "PleaseWaitAccept";
            $scope.me.inconversation = false;
            $scope.$apply();

            // save user info
            memo.saveUsername(clientName);
            memo.saveUserEmail(clientEmail);
            console.log("I'm now in room " + roomName);

          }, function (errorCode, errorText, roomName) {

            console.log("had problems joining ", roomName, errorText);
          });
        };
        if (!rooms[roomName]) {
          joinRoom();
        } else {
          // leaveRoom
          RtcApi.leaveRoom(roomName, function (roomName) {
            joinRoom();
          }, function (errorCode, errorText, roomName) {
            console.log("had problems joining ", roomName, errorText);
          });
        }

      };


      $scope.recall = function (callId) {
        // make call
        RtcApi.call(callId, function (rtcid) {
            console.log("completed call to " + rtcid);
          }, function (errorMessage) {
            console.log("err:" + errorMessage);
          }, function (accepted, bywho) {
            console.log((accepted ? "accepted" : "rejected") + " by " + bywho);
          }
        );

      };

      $scope.chat = function (message) {

        if(_.isEmpty(message)) return;
        var msgData = {
          fromClientId: $scope.me.easyrtcid,
          toAdminId: $scope.agent.easyrtcid,
          roomName: roomName,
          message: message
        };

        RtcApi.sendServerMessage("chatMessage", msgData, function (msgType, msgData) {
          console.log("OK: ", msgData);
        }, function (errorCode, errorText) {
          console.log("error was " + errorText);
        });
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

      $scope.roomName = roomName;
      utils.isRoomExists(roomName).then(function (roomName) {
        initApp();
        initRtc();
      }, function (err) {
        alert(err);
        $state.go("public.404");
      });

      // $scope event
      $scope.$watch("roomState", function(newVal) {
        switch (newVal) {
          case State.WAITING_FOR_CONNECTION:
            serverSocket.connect();
            var socket = $rootScope.$on("connected", function() {
              $scope.roomState = State.WAITING_FOR_ACCESS, socket()
            });
            break;
          case State.WAITING_FOR_ACCESS:
            requestAccessMedia();
            break;
          case State.WAITING_FOR_ROOM_INFORMATION:
            //g.getRoomInformation();
            break;
          case State.READY:

        }
      });

    }]);
