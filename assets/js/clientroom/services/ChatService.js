/**
 * Created by Vunb on 16/2/2015.
 */

angular.module("fello.clientroom").factory("ChatService", ["$rootScope", "$document", "avatarProvider", "Event",
  function ($rootScope, $document, avatarProvider, Event) {
    var colors = ["#5E71B6", "#90D2B6", "#1C1638", "#FEFFB8", "#4C806D"], g = {}, h = function (a) {
      if (!(a in g)) {
        var b = Object.keys(g).length, c = b % colors.length, d = colors[c];
        g[a] = d
      }
      return g[a]
    }, i = function (a) {
      this.type = "historyMarker", this.historyLength = a
    }, j = function (a) {
      if (a) {
        //var b = a.senderId || serverSocket.getSelfId();
        //this.type = "message", this.timestamp = a.timestamp, this.text = a.text, this.avatar = a.avatar, this.color = h(b)
      }
    };
    var chatStorage = {};
    chatStorage.entries = [], chatStorage.clearEntries = function () {
      chatStorage.entries.splice(0, chatStorage.entries.length)
    }, chatStorage.clearHistory = function () {
      //serverSocket.emit(protocol.req.CLEAR_CHAT_HISTORY)
    }, chatStorage.sendMessage = function (text) {
      //var msgData = {text: text}, e = avatarProvider.getAvatar();
      //e && (msgData.avatar = e), serverSocket.emit(protocol.relay.CHAT_MESSAGE, msgData)
    };
    //serverSocket.$on(protocol.relay.CHAT_MESSAGE, function (b) {
    //  b && !b.error && (chatStorage.entries.push(new j(b)), $rootScope.$broadcast("new_chat_message", b))
    //}), serverSocket.$on(protocol.res.CHAT_HISTORY, function (b) {
    //  if (b && 0 !== b.length) {
    //    chatStorage.clearEntries();
    //    for (var c in b)chatStorage.entries.push(new j(b[c]));
    //    chatStorage.entries.push(new i(b.length)), $rootScope.$broadcast("chat_history_updated")
    //  }
    //}), serverSocket.$on(protocol.res.CHAT_HISTORY_CLEARED, function () {
    //  chatStorage.clearEntries(), chatStorage.entries.push(new i(0)), $rootScope.$broadcast("chat_history_updated")
    //}),
    //  serverSocket.emit(protocol.req.GET_CHAT_HISTORY), chatStorage.entries.push(new i(0));
    $rootScope.$on(Event.LEAVE_ROOM, function () {
      chatStorage.clearEntries()
    });
    return chatStorage;
  }]);
