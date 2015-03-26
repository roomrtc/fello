/**
 * Created by Vunb on 3.23.2015.
 */
angular.module('fello.common')
  .factory("serverSocket", ["$rootScope", "$q", "serverSocketConfig", "protocol"
    , function ($rootScope, $q, serverSocketConfig, protocol) {
      var selfId, socket = io.connect(serverSocketConfig.host, {
        "connect timeout": serverSocketConfig.timeout,
        "try multiple transports": !1,
        reconnect: !0,
        "reconnection limit": serverSocketConfig.reconnectionLimit,
        "max reconnection attempts": serverSocketConfig.maxReconnectionAttempts,
        "auto connect": !1
      });

      socket.getSelfId = function () {
        return selfId
      };

      //socket.identify = function () {
      //  var a = $q.defer();
      //  return Credentials.getCredentials().then(function (b) {
      //    var c = {
      //      deviceCredentials: b
      //    };
      //    socket.emit(protocol.req.IDENTIFY_DEVICE, c), socket.$once(protocol.res.DEVICE_IDENTIFIED, function (c) {
      //      return c.error ? void a.reject(c.error) : void a.resolve(b)
      //    })
      //  }).catch(a.reject), a.promise
      //};

      socket.disconnectOnConnect = function () {
        socket.once("connect", function () {
          socket.disconnect()
        })
      };

      socket.getTransport = function () {
        return socket && socket.socket && socket.socket.transport && socket.socket.transport.name
      };

      socket.isConnected = function () {
        return socket.socket.connected
      };

      socket.$on = function (event, listener) {
        return socket.on(event, function (a, d) {
          $rootScope.$apply(listener(a, d))
        }), socket
      };

      socket.$once = function (event, c) {
        return socket.once(event, function (a, d) {
          $rootScope.$apply(c(a, d))
        }), socket
      };

      socket.emitIfConnected = function (a, b) {
        socket.isConnected() && socket.emit(a, b)
      };

      socket.promiseEmit = function (a, b, c) {
        var d = $q.defer();
        return socket.emit(a, c), socket.once(b, function (a) {
          a.error ? d.reject(new Error(a.error)) : d.resolve(a)
        }), d.promise
      };

      socket.connect = function () {
        socket.socket.connect()
      };

      socket.$on(protocol.res.ROOM_JOINED, function (a) {
        selfId = a.selfId
      });

      socket.$on("connect", function () {
        //socket.identify().then(function () {
        $rootScope.$broadcast("connected");
        //}, function () {
        //  socket.disconnect();
        //});
      });

      socket.$on("disconnect", function () {
        $rootScope.$broadcast("disconnected")
      });
      return socket;
    }]);
