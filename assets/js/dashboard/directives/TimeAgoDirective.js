/**
 * Created by Vunb on 7/2/2015.
 */

angular.module('fello.dashboard')
  .directive('timeago',
  [
    '$timeout',
    '$filter',
    function($timeout, $filter) {

      return function(scope, element, attrs) {
        var time = parseInt(attrs.timeago) || new Date().getTime();
        var intervalLength = 1000 * 10; // 10 seconds
        var filter = $filter('timeago');

        function updateTime() {
          var timeago = filter(time);
          element.text(timeago);
        }

        function updateLater() {
          timeoutId = $timeout(function() {
            updateTime();
            updateLater();
          }, intervalLength);
        }

        element.bind('$destroy', function() {
          $timeout.cancel(timeoutId);
        });

        updateTime();
        updateLater();
      };

    }
  ]
);
