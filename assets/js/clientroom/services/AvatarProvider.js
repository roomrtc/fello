/**
 * Created by Vunb on 16/2/2015.
 */
angular.module("fello.clientroom").factory("avatarProvider",
  ["$document", "Snapshooter", function ($document, Snapshooter) {
    return {
      getAvatar: function (selfVideoId) {
        if (!selfVideoId) return null;
        var video = $document[0].getElementById(selfVideoId)
          , jpgbase64 = Snapshooter.takeSnapshot(video, 80, 60, 1500);
        return jpgbase64;
      }, setAvatar: function () {
      }
    }
  }]);
