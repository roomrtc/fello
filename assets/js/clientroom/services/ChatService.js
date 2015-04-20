/**
 * Created by Vunb on 16/2/2015.
 */

angular.module("fello.clientroom").factory("ChatService", ["$rootScope", "$document", "avatarProvider", "Event", "serverSocket", "protocol", "rtcapi", "RoomState"
  , function ($rootScope, $document, avatarProvider, Event, serverSocket, protocol, RtcApi, RoomState) {
    var colors = ["#5E71B6", "#90D2B6", "#1C1638", "#FEFFB8", "#4C806D"]
      , userColors = {}
      , getColor = function (userId) {
        if (!(userId in userColors)) {
          var colorUsedLength = Object.keys(userColors).length
            , colorIndex = colorUsedLength % colors.length
            , colorCode = colors[colorIndex];
          userColors[userId] = colorCode
        }
        return userColors[userId]
      }, getHistoryMarkerLength = function (length) {
        this.type = "historyMarker";
        this.historyLength = length;
      }, parseMessage = function (data) {
        if (data) {
          var senderId = data.senderId || serverSocket.getSelfId();
          this.type = "message";
          this.timestamp = data.timestamp;
          this.text = data.text;
          this.avatar = data.avatar;
          this.color = getColor(senderId);
          this.timeSent = new Date();
          this.timeReceived = new Date();
          this.roomName = RoomState.roomName;
          this.from = senderId;
        }
      };

    var chatStorage = {};
    chatStorage.entries = []
      , chatStorage.clearEntries = function () {
      chatStorage.entries.splice(0, chatStorage.entries.length)
    }, chatStorage.clearHistory = function () {
      serverSocket.emit(protocol.req.CLEAR_CHAT_HISTORY);
    }, chatStorage.sendMessage = function (text) {
      //var msgData = {text: text}, avatar = avatarProvider.getAvatar();
      //avatar && (msgData.avatar = avatar);
      //serverSocket.emit(protocol.relay.CHAT_MESSAGE, msgData)
      var destTargetId = RoomState.agentId
        , destRoom = RoomState.roomName;
      sendMessage(destTargetId, destRoom, text);
    };

    serverSocket.$on(protocol.relay.CHAT_MESSAGE, function (data) {
      if (data && !data.error) {
        chatStorage.entries.push(new parseMessage(data));
        $rootScope.$broadcast("new_chat_message", data);
      }
    });

    serverSocket.$on(protocol.res.CHAT_HISTORY, function (data) {
      if (data && 0 !== data.length) {
        chatStorage.clearEntries();
        for (var messageId in data) {
          chatStorage.entries.push(new parseMessage(data[messageId]));
        }
        chatStorage.entries.push(new getHistoryMarkerLength(data.length));
        $rootScope.$broadcast("chat_history_updated")
      }
    });

    serverSocket.$on(protocol.res.CHAT_HISTORY_CLEARED, function () {
      chatStorage.clearEntries();
      chatStorage.entries.push(new getHistoryMarkerLength(0));
      $rootScope.$broadcast("chat_history_updated");
    }),
      //  serverSocket.emit(protocol.req.GET_CHAT_HISTORY), chatStorage.entries.push(new i(0));
      $rootScope.$on(Event.LEAVE_ROOM, function () {
        chatStorage.clearEntries()
      });


    // send Message Peers
    //sendMessage(null, roomName); --> ROOM
    //sendMessage(easyrtcid, roomName); --> PRIVATE MESSAGE
    function sendMessage(destTargetId, destRoom, text, senderId) {
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
        RtcApi.showError("user error", "no destination selected");
        return;
      }

      var msgData = {text: text, timestamp: new Date(), isOwnChatMessage: true, senderId : senderId}
        , avatar = avatarProvider.getAvatar();
      avatar && (msgData.avatar = avatar);

      RtcApi.sendDataWS(dest, "message", msgData, function (reply) {
        if (reply.msgType === "error") {
          RtcApi.showError(reply.msgData.errorCode, reply.msgData.errorText);
        } else {
          chatStorage.entries.push(new parseMessage(msgData));
          $rootScope.$broadcast("new_chat_message", msgData);
        }
      });

    }

    function addToConversation(who, msgType, content, targeting) {
      // Escape html special characters, then add linefeeds.
      if (!content) {
        //content = "**no body**";
        return;
      }
      var text = content && content.text;
      text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      text = text.replace(/\n/g, '<br />');
      content.text = text;
      content.senderId = who;
      var targetingStr = "";
      if (targeting) {
        if (targeting.targetEasyrtcid) {
          targetingStr += "user=" + targeting.targetEasyrtcid;
        }
        if (targeting.targetRoom) {
          targetingStr += " room=" + targeting.targetRoom;
        }
        if (targeting.targetGroup) {
          targetingStr += " group=" + targeting.targetGroup;
        }
      }
      chatStorage.entries.push(new parseMessage(content));
      $rootScope.$broadcast("new_chat_message", content);
    }

    function peerListener(who, msgType, content, targeting) {
      addToConversation(who, msgType, content, targeting);
    }

    RtcApi.setPeerListener(peerListener);
    return chatStorage;
  }]);
