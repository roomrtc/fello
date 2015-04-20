/**
 * Created by Vunb on 3/5/2015.
 */
var app = angular.module("fello.common");

app.factory("rtcapi", ["$rootScope", function ($rootScope) {
  var rtcApi = window.easyrtc;
  // send Message Peers
  //sendMessage(null, roomName); --> ROOM
  //sendMessage(easyrtcid, roomName); --> PRIVATE MESSAGE
  function sendMessage(destTargetId, destRoom, text) {
    if (text.replace(/\s/g, "").length === 0) { // Don't send just whitespace
      return;
    }
    var dest;
    var destGroup = null; //getGroupId();
    if (destRoom || destGroup) {
      dest = {};
      if (destRoom) {
        dest.targetRoom = destRoom;
      }
      if (destGroup) {
        dest.targetGroup = destGroup;
      }
      if (destTargetId) {
        dest.targetEasyrtcid = destTargetId;
      }
    } else if (destTargetId) {
      dest = destTargetId;
    } else {
      rtcApi.showError("user error", "no destination selected");
      return;
    }

    var msgData = {text: text, timestamp: new Date(), isOwnChatMessage: true}
      , avatar = ""; //"(avatarProvider && avatarProvider.getAvatar())";
    avatar && (msgData.avatar = avatar);

    rtcApi.sendDataWS(dest, "message", msgData, function (reply) {
      if (reply.msgType === "error") {
        rtcApi.showError(reply.msgData.errorCode, reply.msgData.errorText);
      } else {
        $rootScope.$broadcast("new_chat_message", msgData);
      }
    });

  }

  rtcApi.sendChatMessage = function(message) {
    //var msgData = {text: text}, avatar = avatarProvider.getAvatar();
    //avatar && (msgData.avatar = avatar);
    //serverSocket.emit(protocol.relay.CHAT_MESSAGE, msgData)
    var destTargetId = message.to
      , destRoom = message.roomName;
    sendMessage(destTargetId, destRoom, message.message);
  };

  $rootScope.$on('disconnectRtc', function (event, data) {
    // close socket
    if (rtcApi.webSocket) {
      rtcApi.disconnect();
    }
    // close media
    rtcApi.closeLocalMediaStream();
  });
  return rtcApi;
}]);
