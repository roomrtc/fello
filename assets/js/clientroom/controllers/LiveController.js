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
      var clientInfo = {};
      clientInfo.name = memo.getUsername() || "";
      clientInfo.email = memo.getUserEmail() || "";
      // check name exists !!

      var initApp = function () {

        $scope.RoomService = {};
        $scope.waitingClients = [];
        $scope.processingList = [];
        $scope.isDenied = false;
        $scope.agent = {};
        $scope.agentCallId = "";
        $scope.peers = {};
        $scope.shuffle = fluidGrid('#remotes >') || utils.empty;
        $scope.state = "ready";
        $scope.roomState = "";

        $scope.addStream = function (id, stream) {
          var streamUrl = utils.getStreamAsUrl(stream);
          if (id == 'localVideo') {
            $scope.localVideo = streamUrl;
          } else {
            $scope.peers[id] = streamUrl;
          }
          $scope.clientInfo.inconversation = true;
          $scope.$apply();
          $scope.shuffle();
        };

        $scope.handleVideoClick = function (e) {
          //if (e.target.id == 'localVideo') return;
          if (_.size($scope.peers) == 0) return;

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
        RtcApi.initMediaSource(function () {       // success callback
          $scope.IsNotAllowAccessMedia = false;
          $scope.clientInfo.promptMessage = "AreYouReadyCall";
          //var selfVideo = document.getElementById("self");
          //RtcApi.setVideoObjectSrc(selfVideo, RtcApi.getLocalStream());
          $scope.addStream('localVideo', RtcApi.getLocalStream());
          $scope.$apply();
        }, function (errorCode, errorText) {
          console.log(errorCode, errorText);
        });
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

      var connectServer = function () {
        RtcApi.connect("fello.serverApp", function (rtcid) {
          _loginSuccess(rtcid);
          $scope.roomState = State.WAITING_FOR_CONNECTION;
          $scope.$apply();
        }, _loginFailure);

      };

      function roomListener(roomName, otherPeers) {
        for (var i in otherPeers) {
          console.log('other_in_room: ' + i);
        }
      }

      var _loginSuccess = function (rtcid) {
        $scope.clientInfo.easyrtcid = rtcid;
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
        connectServer();

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
          var id = acceptorRtcid;

          RoomState.agentId = id;

          $scope.addStream(id, stream);
          $scope.clientInfo.inconversation = true;
          $scope.agent.easyrtcid = id;
          $scope.$apply();
        });

        RtcApi.setOnStreamClosed(function (acceptorRtcid) {
          var id = acceptorRtcid;
          var url = $scope.peers[id];

          utils.revokeObjectURL(url);
          $scope.clientInfo.inconversation = true;
          delete $scope.agent.easyrtcid;
          delete $scope.peers[id];
          if (_.size($scope.peers) == 0) {
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
              if (msgData.easyrtcid == $scope.clientInfo.easyrtcid) {
                alert("You are accepted by Admin !");
              }
              break;
            case "callDrop":
              if (msgData.easyrtcid == $scope.clientInfo.easyrtcid) {
                console.log('You are dropped by Admin !', msgData);
                RtcApi.leaveRoom(msgData.roomName, function (roomName) {
                  $scope.clientInfo.inconversation = false;
                  $scope.clientInfo.promptMessage = "DoYouWantRecall";
                  $scope.$apply();
                });
              }
              break;
            case "callDeny":
              if (msgData.easyrtcid == $scope.clientInfo.easyrtcid) {
                console.log('You are denied by Admin !', msgData);
                //alert("You are denied by Admin !");
              }
              $scope.clientInfo.inconversation = false;
              $scope.clientInfo.promptMessage = "YouAreDenied";
              $scope.$apply();

              break;
            case "callBlock":
              if (msgData.easyrtcid == $scope.clientInfo.easyrtcid) {
                console.log('You are kicked by Admin !', msgData);
                //alert("You are kicked by Admin !");
              }
              $scope.clientInfo.inconversation = false;
              $scope.clientInfo.promptMessage = "YouAreBlocked";
              $scope.$apply();
              break;
            case "clientJoin":
              console.log('clientJoin: ', msgData);
              break;
          }
        });
      }

      $scope.readyInfo = function () {
        return !!($scope.clientInfo.name && $scope.clientInfo.email);
      };

      $scope.call = function (agentCallId) {

        if (!$scope.readyInfo()) {
          return;
        }

        var rooms = RtcApi.getRoomsJoined();
        var joinRoom = function () {
          var clientName = $scope.clientInfo.name;
          var clientEmail = $scope.clientInfo.email;
          RtcApi.setRoomApiField(roomName, "agentName", agentCallId);
          RtcApi.setRoomApiField(roomName, "clientName", clientName);
          RtcApi.setRoomApiField(roomName, "clientEmail", clientEmail);
          RtcApi.joinRoom(roomName, null, function (roomName) {
            $scope.clientInfo.promptMessage = "PleaseWaitAccept";
            $scope.clientInfo.inconversation = false;
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
        RtcApi.connect("fello.serverApp", function (rtcid) {
          _loginSuccess(rtcid);
          $scope.roomState = State.WAITING_FOR_CONNECTION;
          $scope.call(RoomState.agentId);
        }, _loginFailure);
        //RtcApi.call(callId, function (rtcid) {
        //    console.log("completed call to " + rtcid);
        //  }, function (errorMessage) {
        //    console.log("err:" + errorMessage);
        //  }, function (accepted, bywho) {
        //    console.log((accepted ? "accepted" : "rejected") + " by " + bywho);
        //  }
        //);

      };

      $scope.chat = function (message) {

        if (_.isEmpty(message)) return;
        var msgData = {
          fromClientId: $scope.clientInfo.easyrtcid,
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

      $scope.closeDrawer = function () {
        $scope.clientInfo.promptMessage = "DoYouWantRecall";
        $rootScope.$broadcast('disconnectRtc');

        delete $scope.localVideo;

        utils.postMessage("close");
      };

      $scope.minDrawer = function () {
        utils.postMessage("close");
      };

      $scope.stopTimer = function () {
        $scope.$broadcast('timer-stop');
        $scope.timerRunning = false;
      };

      $scope.$on('timer-stopped', function (event, data) {
        console.log('Timer Stopped - data = ', data);
      });

      $scope.roomName = roomName;
      $scope.clientInfo = clientInfo;
      $scope.clientStream = "";
      // $scope event
      $scope.$watch("roomState", function (newVal) {
        switch (newVal) {
          case State.WAITING_FOR_CONNECTION:
            if (serverSocket.isConnected()) {
              $scope.roomState = State.WAITING_FOR_ACCESS;
            } else {
              serverSocket.connect();
            }
            var socket = $rootScope.$on("connected", function () {
              $scope.roomState = State.WAITING_FOR_ACCESS, socket()
            });
            break;
          case State.WAITING_FOR_ACCESS:
            $scope.roomState = State.PLEASE_GRANT_ACCESS;
            requestAccessMedia();
            break;
          case State.WAITING_FOR_ROOM_INFORMATION:
            //g.getRoomInformation();
            break;
          case State.READY:

        }
      });
      utils.isRoomExists(roomName).then(function (roomName) {
        initApp();
        initRtc();
      }, function (err) {
        alert(err);
        $state.go("public.404");
      });


    }]);
