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
      controller: ["$scope", function ($scope) {

      }]
    }
  }]);
