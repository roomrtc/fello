/**
 * Created by Vunb on 18/2/2015.
 */
angular.module("videoconference")
  .factory("RoomService", ["RoomState",
    "RTCManager",
    "serverSocket",
    "Event",
    "Client",
    "Stream",
    "$window",
    "$location",
    "$rootScope",
    "$q",
    "$http",
    "$log",
    "Analytics",
    "webrtcProvider",
    "ConnectionStatus",
    "inRoomNotificationService",
    "Knocker",
    "screenShareExtension",
    "tokenStore",
    "features",
    "User",
    "appearinApi",
    "callstats",
    function (RoomState, RTCManager, c, d, e, f, g, h, i, j, k, l, m, n, o, p, q, r, s, t, u, v, callstats) {
  function x() {
    RoomState.resetState(), z.sessionKey = void 0, z.isReclaiming = !1
  }

  function y() {
    RoomState.resetClaimState()
  }

  var z = {}, A = function () {
    if (u.isLoggedIn) {
      var b = {
        type: "UserData",
        payload: {clientId: RoomState.selfId, displayName: u.data.displayName, avatarUrl: u.data.avatarUrl}
      };
      c.emit(protocol.req.SEND_CLIENT_METADATA, b)
    }
  };
  x(), z.getClientType = function (a) {
    var b = z.getClient(a);
    return b.isOwner ? "owner" : b.isMember ? "member" : "client"
  }, z.setRoomMembers = function (a) {
    c.emit(protocol.req.SET_MEMBERS, {members: a})
  }, z.getRoomMembers = function () {
    return RoomState.roomData.members ? RoomState.roomData.members.join(", ") : ""
  }, z.hasChatOnlyClients = function () {
    return _.find(RoomState.clients, function (a) {
      return a.isChatOnly
    })
  }, z.hasWatchersOtherThan = function (b) {
    return !!RoomState.roomData.subscriberCount || !!RoomState.roomData.watchers && RoomState.roomData.watchers.some(function (a) {
        return a !== b
      })
  }, z.shareScreen = function (d) {
    z.setLocalVideoEnabled(!1), RoomState.localClient.newStream(f.type.SCREEN_SHARE, d.id).setup(d), d.onended = function () {
      i.$apply(function () {
        c.emit(protocol.req.END_STREAM, {endedStream: d.id}), RoomState.localClient.removeStreamByType(f.type.SCREEN_SHARE), RTCManager.removeStream(d.id, d), RoomState.localClient.userHasExplicitlyDisabledVideo || z.setLocalVideoEnabled(!0)
      })
    }, c.emit(protocol.req.START_NEW_STREAM, {streamId: d.id}), RTCManager.addNewStream(d.id, d)
  }, z.setLocalAudioEnabled = function (d) {
    c.emitIfConnected(protocol.req.ENABLE_AUDIO, {enabled: d}), RoomState.localClient.setAudioEnabled(d), m.helpers.recordAudioEnabled(d), g.sessionStorageAdapter("muteStatus", "localAudioMuted", !d), t.callstats && RTCManager.getPeerConnections().forEach(function (b) {
      callstats.client.sendFabricEvent(b, d ? "audioUnmute" : "audioMute", RoomState.roomName)
    })
  };
  var B = function (d, e) {
    RoomState.localClient.isScreenSharingEnabled() || (c.emitIfConnected(protocol.req.ENABLE_VIDEO, {enabled: d}), RoomState.localClient.setVideoEnabled(d), m.helpers.recordVideoEnabled(d), t.callstats && RTCManager.getPeerConnections().forEach(function (b) {
      callstats.client.sendFabricEvent(b, d ? "videoResume" : "videoPause", RoomState.roomName)
    }), e && (g.sessionStorageAdapter("muteStatus", "localVideoMuted", !d), RoomState.localClient.userHasExplicitlyDisabledVideo = !d))
  };
  z.setLocalVideoEnabledByUser = function (a) {
    B(a, !0)
  }, z.setLocalVideoEnabled = function (a) {
    B(a, !1)
  }, z.isScreenShareSupported = function () {
    return RoomState.localClient && RoomState.localClient.capabilities.screen_share && r.canInstall() ? !0 : !1
  }, z.setLocalScreenShareEnabled = function (b) {
    return RoomState.localClient.capabilities.screen_share ? (m.hasSharedScreen || (m.sendEvent(m.events.USED_SCREEN_SHARE), m.hasSharedScreen = !0), b ? r.hasExtension ? void r.shareScreen() : !r.hasExtension && r.canInstall() ? void r.triggerInstall({reason: "screenShare"}) : void 0 : void RoomState.localClient.stopScreenShare()) : void 0
  }, i.$on(o.event.NEGOTIATING_PEER_CONNECTION, function (b, c) {
    if (t.callstats) {
      var d = z.getClient(c.clientId).deviceId;
      callstats.client.addNewFabric(c.pc, d, "multiplex", RoomState.roomName, function (a) {
        l.info("Added new fabric:", a)
      })
    }
  }), i.$on(o.event.DISCONNECTED_FROM_PEER, function (b, c) {
    t.callstats && callstats.client.sendFabricEvent(c.pc, "fabricTerminated", RoomState.roomName, function (a) {
      l.info("Sent fabricTerminated event:", a)
    })
  }), i.$on(o.event.CLIENT_CONNECTION_STATUS_CHANGED, function (b, c) {
    var d = z.getClient(c.clientId);
    if (d) {
      if (d.isLocalClient)return void l.error("CLIENT_CONNECTION_STATUS_CHANGED events should not go to the local client!");
      d.setStatus(c), t.callstats && c.status === o.status.CONNECTION_FAILED && callstats.client.sendFabricEvent(c.pc, "fabricFailed", RoomState.roomName, function (a) {
        l.info("Sent fabricFailed event:", a)
      })
    }
  }), i.$on(o.event.CLIENT_CONNECTION_STATUS_CHANGED, function (a, b) {
    var c = E(b.clientId);
    c && (c.setStatus(b), i.$broadcast(d.KNOCKER_STATUS_CHANGED, {knocker: c, status: b.status, previous: b.previous}))
  }), i.$on(o.event.STREAM_ADDED, function (a, b) {
    var c = E(b.clientId);
    c && c.newStream().setup(b.stream).setAudioEnabled(!1)
  }), i.$on(o.event.STREAM_ADDED, function (a, b) {
    var c = z.getClient(b.clientId);
    c && c.updateStreamWithMedia(b.stream)
  }), z.claimRoom = function (b) {
    return v({method: "POST", url: "/room/claim", data: {roomName: b}}).then(function () {
      m.helpers.recordRoomClaimed(!0, RoomState.roomName), RoomState.isClaimed && m.sendEvent(m.events.CLIENT_BECAME_OWNER)
    })
  }, z.sendResetEmail = function () {
    c.emit(protocol.req.SEND_RESET_EMAIL, {roomName: RoomState.roomName})
  }, z.setAndBroadcastNewRoomLockStatus = function () {
    if (z.isAllowedToLock()) {
      var b = !RoomState.isLocked;
      c.emit(protocol.req.SET_LOCK, {locked: b});
      var d = angular.copy(m.events.SET_LOCK);
      d.kissmetrics += b ? "locked" : "unlocked", m.sendEvent(d)
    }
  }, z.submitBackgroundImage = function (b) {
    var c = btoa(unescape(encodeURIComponent(JSON.stringify(z.getRoomToken()))));
    m.sendEvent(m.events.BACKGROUND_IMAGE_SUBMITTED), i.$broadcast("backgroundSent");
    var d = u.isLoggedIn ? "/room/background-image" : "/set-background-image";
    return v({
      method: "POST",
      url: d,
      data: {image: b, roomName: RoomState.roomName, roomKey: c},
      transformRequest: function (a) {
        var b = new FormData;
        return angular.forEach(a, function (a, c) {
          b.append(c, a)
        }), b
      },
      headers: {"Content-Type": void 0}
    })
  }, z.resetBackgroundImage = function () {
    c.emit(protocol.req.RESET_BACKGROUND_IMAGE)
  }, z.getRoomToken = function () {
    var b = s.fetchRoomToken(RoomState.roomName);
    return z.isReclaiming = z.isReclaiming || b && b.key && "recover" === b.key.type, b
  }, z.setRoomToken = function (b) {
    s.storeRoomToken(RoomState.roomName, b)
  }, z.getRoomInformation = function () {
    if (RoomState.roomName) {
      var b = !!RoomState.localClient && RoomState.localClient.streams[0], c = {
        isAudioEnabled: b ? RoomState.localClient.streams[0].isAudioEnabled : RoomState.selfStream && RoomState.selfStream.getAudioTracks().length > 0,
        isVideoEnabled: b ? RoomState.localClient.streams[0].isVideoEnabled : RoomState.selfStream && RoomState.selfStream.getVideoTracks().length > 0
      }, d = {roomName: RoomState.roomName, token: z.getRoomToken(), sessionKey: z.sessionKey, config: c};
      z.joinRoom(d)
    }
  }, z.joinRoom = function (e) {
    RoomState.selfId && (e.selfId = RoomState.selfId), c.emit(protocol.req.JOIN_ROOM, e).$on(protocol.res.RESET_EMAIL_SENT, function (a) {
      i.$broadcast("reset_email_sent", a)
    }).$once(protocol.res.ROOM_JOINED, function (c) {
      if (RoomState.hasOwnerId = !!c.hasOwnerId, c.isMigrated && (RoomState.isMigrated = c.isMigrated), c.error)return void i.$broadcast(d.ROOM_JOINED, c);
      RoomState.selfStream && RTCManager.addNewStream("0", RoomState.selfStream), RoomState.roomData = c.room, RoomState.isLocked = c.room.isLocked;
      var e = RoomState.selfId === c.selfId;
      RoomState.selfId = c.selfId, RoomState.isClaimed = c.room.isClaimed, z.addKnockers(c.room.knockers), c.room.backgroundImageUrl && (RoomState.backgroundImageUrl = c.room.backgroundImageUrl), c.token && (z.setRoomToken(c.token), u.isLoggedIn && u.migrateRoomKeys());
      var g = function (b) {
        b.isLocalClient = !0, b.setStatus({status: o.status.CONNECTION_SUCCESSFUL}), b.capabilities.video = !(!RoomState.selfStream || 0 === RoomState.selfStream.getVideoTracks().length), b.isVideoEnabled = b.capabilities.video, b.capabilities.audio = !(!RoomState.selfStream || 0 === RoomState.selfStream.getAudioTracks().length), b.isAudioEnabled = b.capabilities.audio, "chrome" === n.webRtcDetectedBrowser && -1 === window.navigator.userAgent.indexOf("Android") && (b.capabilities.screen_share = !0), RoomState.localClient = b, RoomState.isSelfOwner = RoomState.localClient.isOwner, RoomState.isSelfOwner && i.$broadcast(d.OWNERS_CHANGED), RoomState.isSelfMember = RoomState.localClient.isMember, t.callstats && (l.info("Initializing callstats instrumentation for deviceId:", RoomState.localClient.deviceId), callstats.initialize(RoomState.localClient.deviceId))
      };
      return RoomState.roomData.clients.forEach(function (a) {
        var b = H(a);
        if (!e)return a.id === c.selfId ? void g(b) : void a.streams.forEach(function (a) {
          var c = 0 === a ? f.type.CAMERA : f.type.SCREEN_SHARE;
          b.newStream(c, a)
        })
      }), e ? void m.sendEvent(m.events.RECONNECT_TO_ROOM) : (m.helpers.recordEnteredRoom(RoomState.clients.length), I(), M(), C(), A(), void i.$broadcast(d.ROOM_JOINED))
    })
  }, z.addKnockers = function (c) {
    function d(c) {
      var d = new q(c.clientId, c.imageUrl, c.liveVideo);
      c.iceServers && RTCManager.accept(c.clientId, c.iceServers, !1), RoomState.knockers.push(d)
    }

    _.each(c, d)
  }, z.removeKnocker = function (c) {
    RoomState.knockers = _.reject(RoomState.knockers, function (a) {
      return c === a.clientId
    }), RTCManager.disconnect(c)
  };
  var C = function () {
    c.$on(protocol.res.DEVICE_IDENTIFIED, function () {
      u.isLoggedIn && (RoomState.localClient.userId = u.data.userId)
    }).$on(protocol.res.CLIENT_USER_ID_CHANGED, function (a) {
      var b = z.getClient(a.client.id);
      return b ? void G(b, a.client) : void 0
    }).$on(protocol.res.NEW_CLIENT, function (a) {
      m.sendEvent(m.events.NEW_CLIENT_JOINED);
      var b = z.getClient(a.client.id);
      return b ? void G(b, a.client) : (b = new e(a.client), F(b), b.isChatOnly || b.newStream(f.type.CAMERA), A(), void i.$broadcast(d.NEW_CLIENT))
    }).$on(protocol.res.CLIENT_READY, function (a) {
      function c(a) {
        return a && a.url && a.url.indexOf("turn:") >= 0
      }

      a.iceServers && a.iceServers.iceServers && !a.iceServers.iceServers.some(c) && m.sendEvent(m.events.TURN_SERVER_NOT_SUPPLIED), RTCManager.accept(a.clientId, a.iceServers)
    }).$once(protocol.res.CLIENT_KICKED, function (a) {
      return m.sendEvent(m.events.CLIENT_KICKED), z.handleRoomExit(), a.error ? void 0 : void i.$broadcast(d.CLIENT_KICKED, a)
    }).$on(protocol.res.CLIENT_LEFT, function (c) {
      var e;
      RoomState.clients.forEach(function (a, d) {
        a.id === c.clientId && (RTCManager.disconnect(a.id), e = d)
      }), void 0 !== e && RoomState.clients.splice(e, 1), i.$broadcast(d.CLIENT_LEFT, c)
    }).$on(protocol.res.NEW_STREAM_STARTED, function (a) {
      var b = z.getClient(a.clientId);
      if (!b)return void l.error("Client does not exist: " + a.clientId);
      var c = 0 === a.streamId ? f.type.CAMERA : f.type.SCREEN_SHARE;
      b.newStream(c, a.streamId)
    }).$on(protocol.res.STREAM_ENDED, function (a) {
      var b = z.getClient(a.clientId);
      return b ? void b.removeStream(a.streamId) : void l.error("Client does not exist: " + a.clientId)
    }).$on(protocol.res.AUDIO_ENABLED, function (a) {
      var b = z.getClient(a.clientId);
      return b ? void b.setAudioEnabled(a.isAudioEnabled) : void l.error("Client does not exist: " + a.clientId)
    }).$on(protocol.res.VIDEO_ENABLED, function (a) {
      var b = z.getClient(a.clientId);
      return b ? (b.setVideoEnabled(a.isVideoEnabled), void window.playVideoHack()) : void l.error("Client does not exist: " + a.clientId)
    }).$on(protocol.res.OWNERS_CHANGED, function (b) {
      function c() {
        function c(b) {
          RoomState.isClaimed && b === RoomState.localClient && m.sendEvent(m.events.CLIENT_BECAME_OWNER)
        }

        if (!b.error) {
          if (b.deviceId) {
            var d = z.getClientsByDeviceId(b.deviceId);
            d.forEach(function (a) {
              a.isOwner = !0, c(a)
            }), RoomState.isSelfOwner = RoomState.localClient.isOwner
          }
          b.token && z.setRoomToken(b.token), !RoomState.isClaimed && b.token && m.helpers.recordRoomClaimed(!!b.token, RoomState.roomName), RoomState.isClaimed = !0, RoomState.hasOwnerId = !!b.userId
        }
      }

      b.userId ? c() : y(), i.$broadcast(d.OWNERS_CHANGED, b)
    }).$on(protocol.res.ROOM_LOCKED, function (b) {
      return b.error && i.$broadcast("room_locked:error", b), void 0 !== b.isLocked && (RoomState.isLocked = b.isLocked), RoomState.isLocked ? void p.setNotification({
        type: "info",
        text: "This room is locked. Guests need to knock to enter.",
        displayDurationMillis: 6e3
      }) : void p.setNotification({type: "info", text: "This room is now unlocked."})
    }).$on(protocol.res.ROOM_KNOCKED, function (a) {
      a.error || z.addKnockers([a])
    }).$on(protocol.res.KNOCKER_LEFT, function (a) {
      z.removeKnocker(a.clientId)
    }).$on(protocol.res.BACKGROUND_IMAGE_CHANGED, function (b) {
      b.error || (m.sendEvent(m.events.BACKGROUND_IMAGE_CHANGED), RoomState.backgroundImageUrl = b.image)
    }).$on(protocol.res.SCREEN_ROTATED, function (a) {
      var b = z.getClient(a.clientId);
      return b ? void(b.rotation = a.rotation) : void l.error("Client does not exist: " + a.clientId)
    }).$on("reconnect", function () {
      m.helpers.recordSocketConnection("reconnect", c.getTransport());
      var a = i.$on("connected", function () {
        z.getRoomInformation(), a()
      })
    }).$on(protocol.res.MEMBERS_SET, function (b) {
      b.error || (RoomState.roomData.members = b.members)
    })
  };
  z.getClient = function (b) {
    return _.findWhere(RoomState.clients, {id: b})
  }, z.getClientsByDeviceId = function (b) {
    return _.where(RoomState.clients, {deviceId: b})
  };
  var D = function () {
    return _.findWhere(RoomState.clients, {isOwner: !0})
  }, E = function (b) {
    return _.findWhere(RoomState.knockers, {clientId: b})
  }, F = function (b) {
    RoomState.clients.push(b)
  }, G = function (b, c) {
    b.setAudioEnabled(!!c.isAudioEnabled), b.setVideoEnabled(!!c.isVideoEnabled), b.name = c.name, b.isOwner = c.isOwner, b.isMember = c.isMember, b.userId = c.userId, b === RoomState.localClient && (RoomState.isSelfOwner = b.isOwner, RoomState.isSelfMember = b.isSelfMember, b.userId !== u.data.userId && u.setUserId(b.userId ? b.userId : null)), b.isOwner && (RoomState.isClaimed = !0, RoomState.hasOwnerId = RoomState.hasOwnerId || null !== b.userId)
  }, H = function (b) {
    var c = z.getClient(b.id);
    return c ? c.id !== RoomState.selfId && (c = G(c, b)) : (c = new e(b), F(c)), c
  }, I = function () {
    RoomState.selfStream && RoomState.localClient.newStream(f.type.CAMERA).setup(RoomState.selfStream), RoomState.localClient.userData = u.data
  }, J = 60, K = null, L = !1, M = function () {
    K = window.setTimeout(function () {
      var b = RoomState.clients.length;
      m.helpers.recordMinuteElapsed(b), !L && b >= 2 && (m.sendEvent(m.events.IN_A_CONVERSATION), L = !0), M()
    }, 1e3 * J)
  }, N = function () {
    null !== K && window.clearTimeout(K)
  };
  return z.kick = function (a) {
    c.emit(protocol.req.KICK_CLIENT, {clientId: a})
  }, z.handleRoomExit = function () {
    N(), c.disconnect(), RTCManager.disconnectAll(), RoomState.selfStream && RoomState.selfStream.stop(), x()
  }, z.leaveRoom = function (b) {
    var e = RoomState.roomName;
    RoomState.selfId && (b && b.analyticsEvent && m.sendEvent(b.analyticsEvent), c.emit(protocol.req.LEAVE_ROOM), z.handleRoomExit(), i.$broadcast(d.LEAVE_ROOM, {roomName: e}))
  }, z.goToSessionFeedback = function (a) {
    h.path("/i/feedback").search("roomName", a)
  }, z.summonOwner = function () {
    return z.isAllowedToSummonOwner() ? (m.helpers.recordSummonOwner(), v({
      url: "/room" + RoomState.roomName + "/invite-owner",
      method: "POST"
    })) : void 0
  }, z.shouldShowSummonPopup = function () {
    return RoomState.clients.length <= 1 && !RoomState.isSelfOwner && RoomState.isClaimed && RoomState.hasOwnerId && !D()
  }, z.isAllowedToSummonOwner = z.shouldShowSummonPopup, z.sendClientMetadata = function (a) {
    c.emit(protocol.req.SEND_CLIENT_METADATA, a)
  }, z.isAllowedToLock = function () {
    return !RoomState.isClaimed || RoomState.isSelfOwner || RoomState.isSelfMember
  }, z.isAllowedToChangeBackground = function () {
    return RoomState.isSelfOwner || RoomState.isSelfMember
  }, c.$on(protocol.res.CLIENT_METADATA_RECEIVED, function (a) {
    return a && a.type && a.payload ? void i.$broadcast(d.CLIENT_METADATA_RECEIVED, a) : void l.error("Received malformed data.")
  }), z
}])
