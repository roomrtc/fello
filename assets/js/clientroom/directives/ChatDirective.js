/**
 * Created by Vunb on 16/2/2015.
 */
angular.module("fello.clientroom").directive("chat", function () {
  return {
    templateUrl: "/templates/clientroom/chat.html",
    restrict: "E",
    replace: true,
    scope: {room: "="},
    link: function (scope, element, attrs) {
      var chatMsgDiv = angular.element("#chat-messages");
      scope.isAdjustable = true;
      scope.$watch(attrs.adjustable, function (newValue) {
        scope.isAdjustable = newValue, newValue || (scope.chatActive = true);
      });
      scope.focusChatInputField = function () {
        "Range" !== window.getSelection().type && element.find("#chatInputField").focus()
      }, scope.updateChatWindow = function (b) {
        var c = chatMsgDiv.height(), e = chatMsgDiv.scrollTop(), f = chatMsgDiv[0].scrollHeight, g = 14, msgHeight = 50;
        b && b.messageElemHeight && (msgHeight = b.messageHeight);
        var i = b && b.isOwnChatMessage, j = b && b.isHistoricalMessages, k = i || j || g + 2 * msgHeight > f - c - e;
        return k ? void scope.scrollToBottom() : void(scope.hasUnreadMessages = !0)
      }, scope.scrollToBottom = function () {
        scope.hasUnreadMessages = false;
        chatMsgDiv.scrollTop(999999);
      };
      var e = _.throttle(function () {
        chatMsgDiv.scrollTop() + chatMsgDiv.height() === chatMsgDiv[0].scrollHeight && scope.$apply(function () {
          scope.hasUnreadMessages = !1
        })
      }, 150);
      chatMsgDiv.scroll(e)
    },
    controller: ["$scope", "ChatService", "$timeout", "$document", "$rootScope", "$window", "Event",
      function ($scope, Chat, $timeout, $document, $rootScope, $window, Event) {
        function l() {
          var b;
          $scope.chatActive && (b = "calc(" + angular.element(".video-wrapper").css("height") + " - 20px)"), $scope.chatWrapperStyle["max-height"] = b
        }

        function m() {
          $scope.chatActive = !$scope.chatActive, $scope.chatWrapperStyle.height = $scope.chatActive ? wrapperWidth : height, l()
        }

        $scope.chatActive = false
          , $scope.hasClosedChat = false
          , $scope.numberOfUnreadMessages = 0
          , $scope.messages = Chat.entries
          , $scope.hasUnreadMessages = false;
        var height = "3em", wrapperHeight = 140, wrapperWidth = 170;
        $scope.chatWrapperStyle = {height: height}, $scope.$watch("windowHeight", function () {
          l()
        }), $window.addEventListener("beforeunload", function (b) {
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
          (v || !$scope.chatActive) && s >= msgCount && (t.play(), msgCount++)
        };
        var x = $document[0].title;
        $scope.$watch("numberOfUnreadMessages", function (newValue) {
          return 0 === newValue ? void($document[0].title = x) : void($document[0].title = "(" + newValue + ") " + x)
        });
        $rootScope.$on("new_chat_message", function () {
          $scope.playNotificationSound(), $scope.hasClosedChat || $scope.chatActive || (m(), $timeout(function () {
            $scope.scrollToBottom()
          })), (v || !$scope.chatActive) && $scope.numberOfUnreadMessages++, $timeout(function () {
            var b = angular.element("#chat-messages article.message").last().height();
            $scope.updateChatWindow({messageHeight: b})
          })
        });
        $rootScope.$on("chat_history_updated", function () {
          $scope.chatActive || m(), $timeout(function () {
            $scope.updateChatWindow({isHistoricalMessages: !0})
          })
        });
        $scope.handleChatToggleButtonClick = function () {
          //Analytics.helpers.recordChatHistoryButtonClick(!!$scope.chatActive);
          $scope.handleManualChatToggle();
        };
        $scope.handleKeydownEvent = function (event) {
          27 === event.which && m()
        };
        $scope.handleManualChatToggle = function () {
          !$scope.hasClosedChat && $scope.chatActive && ($scope.hasClosedChat = !0);
          $scope.chatActive ? angular.element("#chat-message-box-input").blur() : ($scope.numberOfUnreadMessages = 0, $scope.updateChatWindow(), angular.element("#chat-message-box-input").focus());
          m();
          $timeout(function () {
            $scope.scrollToBottom()
          })
        };
        $scope.handleChatInputClick = function () {
          // $scope.messages.length > 0 &&
          !$scope.chatActive && $scope.handleManualChatToggle();
        };
        $scope.sendMessage = function () {
          $scope.chatActive || m(), Chat.sendMessage(this.message), this.message = "", $timeout(function () {
            $scope.updateChatWindow({isOwnChatMessage: !0})
          }, 0)
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
        //$scope.isConnected = serverSocket.isConnected.bind(serverSocket)
        $scope.isConnected = function () {
          return true;
        }
      }]
  }
});
