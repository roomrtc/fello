/**
 * Created by Vunb on 18/2/2015.
 */

angular.module("videoconference").factory("webrtcProvider", ["$window", "$rootScope", function (a, b) {
  var c = null, d = null, e = null, f = null, g = null;
  return a.navigator.mozGetUserMedia ? (c = "firefox", d = a.navigator.mozGetUserMedia.bind(a.navigator), e = a.mozRTCPeerConnection.bind(a), f = a.mozRTCSessionDescription, g = a.mozRTCIceCandidate) : a.navigator.webkitGetUserMedia ? (c = "chrome", d = a.navigator.webkitGetUserMedia.bind(a.navigator), e = a.webkitRTCPeerConnection.bind(a), f = a.RTCSessionDescription, g = a.RTCIceCandidate) : a.navigator.getUserMedia && (c = "unprefixed browser", d = a.navigator.getUserMedia.bind(a.navigator), e = a.RTCPeerConnection.bind(a), f = a.RTCSessionDescription, g = a.RTCIceCandidate), {
    webRtcDetectedBrowser: c,
    getUserMedia: function (a, c, e) {
      if (!c || !e)throw"getUserMedia success and error callbacks are required.";
      return d(a, function () {
        var a = this, d = arguments;
        b.$apply(function () {
          c.apply(a, d)
        })
      }, function () {
        var a = this, c = arguments;
        b.$apply(function () {
          e.apply(a, c)
        })
      })
    },
    RTCPeerConnection: e,
    RTCSessionDescription: f,
    RTCIceCandidate: g,
    isWebRtcEnabled: function () {
      return !(!d || !e)
    }
  }
}])
