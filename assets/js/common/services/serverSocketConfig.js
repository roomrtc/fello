/**
 * Created by Vunb on 3.23.2015.
 */
angular.module('fello.common')
  .factory('serverSocketConfig', ['$location', function ($location) {
    var host = $location.protocol() + "://" + $location.host() + ":" + $location.port();
    return {
      host: host,
      timeout: 1e4,
      reconnectionLimit: 1 / 0,
      maxReconnectionAttempts: 10
    };
  }]);
