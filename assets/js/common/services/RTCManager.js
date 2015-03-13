/**
 * Created by Vunb on 18/2/2015.
 */
angular.module("videoconference").factory("RTCManager", ["$rootScope", "$timeout", "$log", "Analytics", "ConnectionStatus", "serverSocket", "features", "$interval", "webrtcProvider", function (a, b, c, d, e, f, g, h, webrtcProvider) {
  function j(a) {
    void 0 === F.peerConnections[a] && (F.peerConnections[a] = {
      iceServers: {},
      iceCandidates: {local: {}, remote: {}},
      pc: null,
      connectionType: null,
      connectionStatus: null,
      intervalId: null,
      stats: {totalSent: 0, totalRecv: 0}
    })
  }

  function k(a) {
    return a in F.peerConnections ? F.peerConnections[a].pc : null
  }

  function l(a) {
    return _.pick(a, "sdp", "type")
  }

  function m(b, c, d) {
    j(b);
    var k = g.disableIPv6ICE ? {} : {optional: [{googIPv6: !0}]}, l = new webrtcProvider.RTCPeerConnection(c, k);
    F.peerConnections[b].pc = l, l.onnegotiationneeded = function () {
      a.$broadcast(e.event.NEGOTIATING_PEER_CONNECTION, {pc: l, clientId: b}), "new" !== l.iceConnectionState && n(b)
    }, l.onicecandidate = function (a) {
      a.candidate && (p(b, "local", a.candidate.candidate), f.emit(protocol.relay.ICE_CANDIDATE, {
        receiverId: b,
        message: a.candidate
      }))
    }, l.onaddstream = function (c) {
      a.$apply(function () {
        a.$broadcast(e.event.STREAM_ADDED, {clientId: b, stream: c.stream})
      })
    }, l.oniceconnectionstatechange = function () {
      var a;
      switch (l.iceConnectionState) {
        case"checking":
          a = e.status.CONNECTING;
          break;
        case"connected":
        case"completed":
          a = e.status.CONNECTION_SUCCESSFUL, F.peerConnections[b].connectionType || r(b), F.peerConnections[b].intervalId || (F.peerConnections[b].intervalId = h(function () {
            y(b)
          }, E));
          break;
        case"failed":
          a = e.status.CONNECTION_FAILED;
          break;
        default:
          return
      }
      o(b, a)
    }, (d || void 0 === d) && Object.keys(F.localStreams).forEach(function (a) {
      l.addStream(F.localStreams[a])
    })
  }

  function n(a) {
    var b = k(a);
    return b ? void b.createOffer(function (e) {
      b.setLocalDescription(e, function () {
        f.emit(protocol.relay.SDP_OFFER, {receiverId: a, message: l(e)})
      }, function (a) {
        c.warn("RTCPeerConnection.setLocalDescription() failed with local offer", a), d.helpers.recordWebRTCError("set local offer", a)
      })
    }, function (a) {
      c.warn("RTCPeerConnection.createOffer() failed to create local offer", a), d.helpers.recordWebRTCError("create local offer", a)
    }, D) : void c.warn("No RTCPeerConnection in negotiatePeerConnection()", a)
  }

  function o(c, f) {
    var g = k(c), h = F.peerConnections[c].connectionStatus;
    h !== f && h !== e.status.CONNECTION_FAILED && (F.peerConnections[c].connectionStatus = f, d.helpers.recordConnectionStatus(e.analyticsText[f]), b(function () {
      a.$broadcast(e.event.CLIENT_CONNECTION_STATUS_CHANGED, {clientId: c, status: f, previous: h, pc: g})
    }))
  }

  function p(a, b, c) {
    var d = c.split(/\s+/), e = d[4];
    -1 !== e.indexOf(":") && (e = "[" + e + "]");
    var f = e + ":" + d[5], g = d[7], h = F.peerConnections[a].iceCandidates[b];
    h[f] = g, h[e] || (h[e] = g)
  }

  function q(a, b, c) {
    var d = c.split(/\n+/);
    d.forEach(function (c) {
      c.match(/^a=candidate:/) && p(a, b, c)
    })
  }

  function r(a) {
    var b = k(a);
    if (!b)return void c.warn("No RTCPeerConnection in determineConnectionType()", a);
    if (void 0 !== b.getStats)try {
      3 === b.getStats.length ? s(a, b) : 1 === b.getStats.length && u(a, b)
    } catch (d) {
      c.warn("Failed to get connection type, clientId =", a, d)
    }
  }

  function s(a, b) {
    b.getStats(null, function (b) {
      var c = null;
      b.forEach(function (a) {
        if ("candidatepair" === a.type) {
          var d = b.get(a.componentId);
          if (d.activeConnection && !c) {
            var e = b.get(a.localCandidateId), f = b.get(a.remoteCandidateId), g = t(e.candidateType), h = t(f.candidateType);
            c = w(g, h)
          }
        }
      }), x(a, c)
    }, function (b) {
      c.warn("RTCPeerConnection.getStats() failed, clientId =", a, b)
    })
  }

  function t(a, b, d) {
    switch (d.candidateType) {
      case"host":
      case"serverreflexive":
      case"peerreflexive":
        return "peer";
      case"relayed":
        return "relay(" + d.ipAddress + ")";
      default:
        return c.warn("Connection is using an unknown", b, "ICE candidate, clientId =", a, "candidate =", d), "unknown"
    }
  }

  function u(a, b) {
    b.getStats(function (b) {
      var c = b.result(), d = null;
      c.forEach(function (b) {
        if ("googCandidatePair" === b.type && "true" === b.stat("googActiveConnection") && !d) {
          var c = b.stat("googLocalAddress"), e = b.stat("googRemoteAddress"), f = "[" === c[0] ? 6 : 4, g = v(a, "local", c), h = v(a, "remote", e);
          d = w(g, h, f)
        }
      }), x(a, d)
    })
  }

  function v(a, b, d) {
    var e = F.peerConnections[a].iceCandidates[b], f = d.split(/:/)[0], g = e[d] || e[f];
    switch (g) {
      case"host":
      case"srflx":
      case"prflx":
        return "peer";
      case"relay":
        return "relay(" + f + ")";
      default:
        return c.warn("Connection is using an unknown", b, "ICE candidate, clientId =", a, "address =", d, "iceCandidates =", e), "unknown"
    }
  }

  function w(a, b, c) {
    return [a, b].sort().join("-to-") + (c && 4 !== c ? " (ipv" + c + ")" : "")
  }

  function x(a, b) {
    b || (b = "UNKNOWN (detection failed)"), c.info("Connection type to %s is %s", a, b), F.peerConnections[a].connectionType = b, d.helpers.recordConnectionType(b)
  }

  function y(a) {
    var b = k(a);
    if (!b)return void c.warn("No RTCPeerConnection in determineConnectionType()", a);
    try {
      var d = F.peerConnections[a].stats;
      3 === b.getStats.length ? z(a, b, d) : 1 === b.getStats.length && A(a, b, d)
    } catch (e) {
      c.warn("Unexpected error in checkConnectionActivity(), clientId =", a, e)
    }
  }

  function z(a, b, d) {
    b.getStats(null, function (b) {
      var c = 0, e = 0;
      b.forEach(function (a) {
        switch (a.type) {
          case"inboundrtp":
            a.isRemote || (e += a.bytesReceived);
            break;
          case"outboundrtp":
            a.isRemote || (c += a.bytesSent)
        }
      }), B(a, d, c, e)
    }, function (b) {
      c.warn("RTCPeerConnection.getStats() failed, clientId =", a, b)
    })
  }

  function A(a, b, c) {
    b.getStats(function (b) {
      var d = 0, e = 0;
      b.result().forEach(function (a) {
        switch (a.type) {
          case"googCandidatePair":
            "true" === a.stat("googWritable") && (d += +a.stat("bytesSent")), "true" === a.stat("googReadable") && (e += +a.stat("bytesReceived"))
        }
      }), B(a, c, d, e)
    })
  }

  function B(a, b, c, d) {
    var f = Math.max(0, c - b.totalSent), g = Math.max(0, d - b.totalRecv);
    b.totalSent = c, b.totalRecv = d;
    var h;
    h = f || g ? e.status.CONNECTION_SUCCESSFUL : e.status.CONNECTION_INACTIVE, o(a, h)
  }

  function C() {
    f.$on(protocol.relay.READY_TO_RECEIVE_OFFER, function (a) {
      F.connect(a.clientId, a.iceServers)
    }), f.$on(protocol.relay.ICE_CANDIDATE, function (a) {
      var b = k(a.clientId);
      return b ? (p(a.clientId, "remote", a.message.candidate), void b.addIceCandidate(new webrtcProvider.RTCIceCandidate(a.message))) : void c.warn("No RTCPeerConnection on ICE_CANDIDATE", a)
    }), f.$on(protocol.relay.SDP_OFFER, function (a) {
      var b = k(a.clientId);
      return b ? (q(a.clientId, "remote", a.message.sdp), void b.setRemoteDescription(new webrtcProvider.RTCSessionDescription(a.message), function () {
        b.createAnswer(function (e) {
          b.setLocalDescription(e, function () {
            f.emit(protocol.relay.SDP_ANSWER, {receiverId: a.clientId, message: l(e)})
          }, function (a) {
            c.warn("Could not set local description from local answer: ", a), d.helpers.recordWebRTCError("set local answer", a)
          })
        }, function (a) {
          c.warn("Could not create answer to remote offer: ", a), d.helpers.recordWebRTCError("create answer", a)
        }, D)
      }, function (a) {
        c.warn("Could not set remote description from remote offer: ", a), d.helpers.recordWebRTCError("set remote offer", a)
      })) : void c.warn("No RTCPeerConnection on SDP_OFFER", a)
    }), f.$on(protocol.relay.SDP_ANSWER, function (a) {
      var b = k(a.clientId);
      return b ? (q(a.clientId, "remote", a.message.sdp), void b.setRemoteDescription(new webrtcProvider.RTCSessionDescription(a.message), function () {
      }, function (a) {
        c.warn("Could not set remote description from remote answer: ", a), d.helpers.recordWebRTCError("set remote answer", a)
      })) : void c.warn("No RTCPeerConnection on SDP_ANSWER", a)
    })
  }

  var D = {mandatory: {OfferToReceiveAudio: !0, OfferToReceiveVideo: !0}}, E = 1e4, F = {};
  return F.peerConnections = {}, F.localStreams = {}, F.getPeerConnections = function () {
    return Object.keys(F.peerConnections).map(function (a) {
      return k(a)
    })
  }, F.addNewStream = function (a, b) {
    F.localStreams[a] = b, Object.keys(F.peerConnections).forEach(function (a) {
      var c = k(a);
      c && c.addStream(b)
    })
  }, F.removeStream = function (a, b) {
    delete F.localStreams[a], Object.keys(F.peerConnections).forEach(function (a) {
      var c = k(a);
      c && c.removeStream(b)
    })
  }, F.connect = function (a, b) {
    return k(a) ? void c.warn("RTCPeerConnection already exists on connect()", a) : (m(a, b), void n(a))
  }, F.accept = function (a, b, d) {
    return k(a) ? void c.warn("RTCPeerConnection already exists on accept()", a) : (m(a, b, d), void f.emit(protocol.relay.READY_TO_RECEIVE_OFFER, {
      receiverId: a,
      iceServers: b
    }))
  }, F.disconnect = function (b) {
    var d = k(b);
    if (!d)return void c.warn("No RTCPeerConnection in RTCManager.disconnect()", b);
    try {
      d.close()
    } catch (f) {
    }
    h.cancel(F.peerConnections[b].intervalId), delete F.peerConnections[b], a.$broadcast(e.event.DISCONNECTED_FROM_PEER, {
      clientId: b,
      pc: d
    })
  }, F.disconnectAll = function () {
    Object.keys(F.peerConnections).forEach(function (a) {
      F.disconnect(a)
    }), F.peerConnections = {}
  }, a.$on("connected", C), F
}])
