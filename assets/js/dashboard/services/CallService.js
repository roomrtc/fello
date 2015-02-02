/**
 * Created by Vunb on 2/2/2015.
 */

angular.module("fello.dashboard")
  .factory("CallService", [function () {
    var rtc = easyrtc;

    return {
      init: function (roomName, callback) {
        rtc.enableAudio(true);
        rtc.enableVideo(true);

        // callback(err)

      }, changeStateListener: function (callback) {
        // callback(waitingClient, all)

      }, call: function (callId, callback) {
        // callback(accepted, stream);

      }, drop: function (callId, callback) {
        // callback(err)
      }, setHangoutListener: function (callback) {
        // callback(callId)

      }

    };
  }]);
