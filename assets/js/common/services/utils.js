/**
 * Created by Vunb on 3.17.2015.
 */

angular.module('fello.common')
  .factory('utils', ['$sce', '$timeout', '$q', '$window', function ($sce, $timeout, $q, $window) {
    var utils = {};

    utils.getStreamAsUrl = function (stream) {
      var url = URL.createObjectURL(stream); //URL.revokeObjectURL(url);
      return $sce.trustAsResourceUrl(url);
    };

    utils.revokeObjectURL = function (url) {
      URL.revokeObjectURL(url);
    };

    utils.getFieldValue = function (field, fieldName) {
      return field && field[fieldName] && field[fieldName].fieldValue;
    };

    utils.isRoomExists = function (roomName) {
      var deferred = $q.defer();
      $timeout(function () {
        if (roomName == "test") {
          deferred.reject("Room not exists: " + roomName);
        } else {
          deferred.resolve(roomName);
        }
      }, 1000);
      return deferred.promise;
    };

    utils.empty = function () {
      return undefined;
    };

    utils.postMessage = function (message, domain) {
      $window.parent.postMessage(message, domain || "*");
    };

    return utils;
  }])
;

