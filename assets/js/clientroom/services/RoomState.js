/**
 * Created by Vunb on 16/2/2015.
 */
angular.module("fello.clientroom").factory("RoomState", [
  '$state',
  '$stateParams',
  function ($state, $stateParams) {
    var roomState = {};
    roomState.resetClaimState = function () {
      this.isSelfOwner = false;
      this.isClaimed = false;
      this.hasOwnerId = false;
    };
    roomState.resetState = function () {
      this.selfId = "",
        this.agentId = "",
        this.clients = [],
        this.knockers = [],
        this.roomData = {},
        this.roomName = "",
        this.serverApp = "",
        this.selfStream = void 0,
        this.backgroundImageUrl = void 0,
        this.isSelfMember = false,
        this.isMigrated = false,
        this.localClient = void 0,
        this.resetClaimState();
    };

    // reset state
    roomState.resetState();
    return roomState;
  }]);
