/**
 * Created by Vunb on 4.7.2015.
 */
angular.module('fello.dashboard')
  .directive('chatbox',
  ["lodash", function (_) {
    return {
      templateUrl: "/templates/dashboard/chatbox.html",
      restrict: "E",
      replace: true,
      scope: {
        client: "=",
        myid: "=",
        chatClients: "=clients",
        close: "&onClose"
      },
      link: function (scope, element, attrs) {
        // Displays the popup based on the maximum number of popups
        // that can be displayed on the current viewport width
        var deWatcher = scope.$watch(function () {
          return Object.keys(scope.chatClients).length;
        }, function (newValue, oldValue) {
          var index = _.indexOf(Object.keys(scope.chatClients), scope.client.callId);
          var right = 320 * (1 + index);
          element.css({display: 'block', right: right + "px"});
          //deWatcher();
        });

        element.find(".popup-head")
          .css({cursor: "pointer"})
          .on("click", function (e) {
          var h = element.css('height');
          if(h != "30px") {
            element.css({height: "30px"});
          } else {
            element.css({height: "285px"});
          }
        });
      },
      controller: ["$scope", "rtcapi", function ($scope, rtcApi) {
        $scope.sendMessage = function () {
          var message = {
            timeSent: new Date(),
            timeReceived: new Date(),
            message: $scope.client.message,
            roomName: "demo",
            from: $scope.myid,
            fromClientId: $scope.myid, // TODO: delete this prop
            to: $scope.client.callId
          };

          $scope.client.message = "";
          $scope.client.messages.push(message);
          rtcApi.sendChatMessage(message);
        };

      }]
    }
  }]);
