/**
 * Created by Vunb on 4.19.2015.
 */
angular.module("fello.clientroom").directive("embeddedchat", function () {
  return {
    templateUrl: "/templates/embed/chatbox.html",
    restrict: "E",
    replace: true,
    scope: {
      room: "=",
      clientInfo: "="
    }, link: function (scope, element, attrs) {
      var chatMsgDiv = angular.element("#chat-messages");
      scope.focusChatInputField = function () {
      }, scope.updateChatWindow = function (b) {
        var c = chatMsgDiv.height()
          , e = chatMsgDiv.scrollTop()
          , f = chatMsgDiv[0].scrollHeight
          , g = 14
          , msgHeight = 50;
        b && b.messageElemHeight && (msgHeight = b.messageHeight);
        var i = b && b.isOwnChatMessage
          , j = b && b.isHistoricalMessages
          , k = i || j || g + 2 * msgHeight > f - c - e;
        return k ? void scope.scrollToBottom() : void(scope.hasUnreadMessages = true)
      }, scope.scrollToBottom = function () {
        scope.hasUnreadMessages = false;
        chatMsgDiv.scrollTop(999999);
      };
    },
    controller: ["$scope", "ChatService", "$timeout", "$document", "$rootScope", "$window", "Event", "serverSocket", "rtcapi"
      , function ($scope, Chat, $timeout, $document, $rootScope, $window, Event, serverSocket, RtcApi) {
        var height = "3em", wrapperHeight = 140, wrapperWidth = 170;
        $scope.chatActive = false
          , $scope.hasClosedChat = false
          , $scope.numberOfUnreadMessages = 0
          , $scope.messages = Chat.entries
          , $scope.hasUnreadMessages = false;
        $scope.chatWrapperStyle = {height: height};

        $window.addEventListener("beforeunload", function (b) {
          if ($scope.message && $scope.message.length > 0) {
            var text = $window.i18n.t("You have not sent your last chat message yet.");
            return (b || $window.event).returnValue = text, text
          }
        });
        var q, eventType, s = 4, t = angular.element("#chat-message-notification")[0], msgCount = 0;
        "undefined" != typeof $document[0].hidden ? (q = "hidden", eventType = "visibilitychange") : "undefined" != typeof $document[0].webkitHidden && (q = "webkitHidden", eventType = "webkitvisibilitychange");
        var v = false, visibleChange = function () {
          v = $document[0][q], msgCount = 0, !v && $scope.chatActive && $scope.$apply(function () {
            $scope.numberOfUnreadMessages = 0
          })
        };
        $document[0].addEventListener(eventType, visibleChange);
        $scope.playNotificationSound = function () {
          (v || !$scope.chatActive) && s >= msgCount && (/*t.play(),*/ msgCount++)
        };
        var x = $document[0].title;
        $scope.$watch("numberOfUnreadMessages", function (newValue) {
          return 0 === newValue ? void($document[0].title = x) : void($document[0].title = "(" + newValue + ") " + x)
        });
        $rootScope.$on("new_chat_message", function (event, args) {
          $scope.playNotificationSound();
          $scope.hasClosedChat || $scope.chatActive || $timeout(function () {
            $scope.scrollToBottom();
          });
          (v || !$scope.chatActive) && $scope.numberOfUnreadMessages++;
          $timeout(function () {
            var b = angular.element("#chat-messages article.message").last().height();
            $scope.updateChatWindow({messageHeight: b, isOwnChatMessage: args.isOwnChatMessage})
          })
        });
        $rootScope.$on("chat_history_updated", function () {
          $timeout(function () {
            $scope.updateChatWindow({isHistoricalMessages: !0})
          })
        });
        $scope.handleChatInputClick = function () {
        };

        $scope.sendMessage = function () {
          Chat.sendMessage(this.message);
          this.message = "";
        };
        $scope.adjustChatHeight = function (b) {
          wrapperWidth += b, wrapperHeight > wrapperWidth || ($scope.$apply(function () {
            $scope.chatWrapperStyle.height = wrapperWidth + "px"
          }), $scope.updateChatWindow())
        };
        $scope.clearChatHistory = function () {
          Chat.clearHistory()
        };
        $scope.startMediaShare = function (a) {
          //$rootScope.$broadcast(Event.MEDIA_SHARE, {url: a}), serverSocket.emit(protocol.req.SHARE_MEDIA, {url: a})
        };
        $scope.isConnected = serverSocket.isConnected.bind(serverSocket);
        //$scope.isConnected = function () {
        //  return io.connect().socket.connected;
        //}


      }]
  }
});
