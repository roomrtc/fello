/**
 * Created by Vunb on 16/2/2015.
 */
angular.module("videoconference").factory("RoomState", [function () {
  var roomState = function () {
    this.resetState();
  };
  roomState.prototype.resetClaimState = function () {
    this.isSelfOwner = false, this.isClaimed = false, this.hasOwnerId = false;
  };
  roomState.prototype.resetState = function () {
    this.selfId = "",
    this.clients = [],
    this.knockers = [],
    this.roomData = {},
    this.roomName = "",
    this.selfStream = void 0,
    this.backgroundImageUrl = void 0,
    this.isSelfMember = !1,
    this.isMigrated = !1,
    this.localClient = void 0,
    this.resetClaimState();
  };
  return new roomState();
}]);
