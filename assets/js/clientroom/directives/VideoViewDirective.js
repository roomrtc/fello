/**
 * Created by Vunb on 18/2/2015.
 */
angular.module("fello.clientroom").directive("videoView", ["$timeout", function ($timeout) {
  return {
    templateUrl: "/templates/partials/video-view.html",
    restrict: "E",
    scope: {client: "=client", fillmode: "@fillmode"},
    controller: ["RoomState", "RoomService", "$scope", "Analytics", "features", function (RoomState, RoomService, $scope, Analytics, features) {
      $scope.isVideoEnabled = $scope.client.capabilities.video, $scope.isAudioEnabled = $scope.client.capabilities.audio, $scope.isScreenshareEnabled = !1, $scope.features = features, $scope.isLocalClient = RoomState.selfId === $scope.client.id, $scope.canKick = function () {
        return RoomState.isSelfOwner || RoomState.isSelfMember
      }, $scope.kick = function (e) {
        if ($scope.canKick()) {
          RoomService.kick(e);
          var f = RoomService.getClientType(e);
          Analytics.helpers.recordKickedUser(f, RoomState.isSelfOwner)
        }
      }, $scope.showToolbar = function () {
        return $scope.client.isLocalClient && ($scope.client.capabilities.video || $scope.client.capabilities.audio || $scope.client.capabilities.screen_sharing)
      }, $scope.toggleShareScreen = function () {
        RoomService.setLocalScreenShareEnabled(!$scope.client.isScreenSharingEnabled())
      }, $scope.enableAudio = function () {
        RoomService.setLocalAudioEnabled(!0)
      }, $scope.toggleAudioEnabled = function () {
        RoomService.setLocalAudioEnabled(!$scope.client.isAudioEnabled)
      }, $scope.toggleVideoEnabled = function () {
        RoomService.setLocalVideoEnabledByUser(!$scope.client.isVideoEnabled)
      }, $scope.isScreenShareSupported = RoomService.isScreenShareSupported.bind(RoomService)
    }],
    link: function (scope, element) {
      var d, e, f = element.find(".video-box .toolbar"), g = function () {
        var a = e.height(), b = d.height(), c = a - b, f = e.width(), g = d.width(), h = f - g;
        h > c ? (d.removeClass("height-first"), d.css({
          top: c / 2,
          left: 0
        })) : (d.addClass("height-first"), d.css({top: 0, left: (e.width() - d.width()) / 2}))
      }, h = function () {
        $timeout(function () {
          d = angular.element("#" + scope.client.id), e = d.parent(), d.on("play", function () {
            d.off("play"), g()
          })
        }), $(window).on("resize", g)
      };
      if ($timeout(function () {
          element.find(".video-box").removeClass("loading")
        }, 0), $timeout(function () {
          f.removeClass("visible")
        }, 5e3), scope.fillmode)switch (scope.fillmode) {
        case"fit":
          scope.$watch("client", function () {
            h()
          }), scope.$watch(scope.client.isScreenSharingEnabled, function () {
            $timeout(function () {
              g()
            })
          }), h()
      }
    }
  }
}])
