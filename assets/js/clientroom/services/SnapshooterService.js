/**
 * Created by Vunb on 16/2/2015.
 */
angular.module("fello.clientroom").factory("Snapshooter", [function () {
  var shoot = function (video, width, height, max) {
    var factor = 2, f = factor * width, g = factor * height, h = angular.element('<canvas width="' + f + '" height="' + g + '" />')[0], i = h.getContext("2d");
    i.drawImage(video, 0, 0, f, g);
    for (var j = angular.element('<canvas width="' + width + '" height="' + height + '" />')[0], k = j.getContext("2d"), l = i.getImageData(0, 0, f, g), m = k.getImageData(0, 0, width, height), n = function (a, b) {
      return [l.data[4 * (a + b * f) + 0], l.data[4 * (a + b * f) + 1], l.data[4 * (a + b * f) + 2]]
    }, o = function (a, c, d) {
      m.data[4 * (a + c * width) + 0] = d[0], m.data[4 * (a + c * width) + 1] = d[1], m.data[4 * (a + c * width) + 2] = d[2], m.data[4 * (a + c * width) + 3] = 255
    }, p = function (a) {
      var b = [0, 0, 0];
      for (var c in a) {
        var d = a[c];
        b[0] += d[0], b[1] += d[1], b[2] += d[2]
      }
      return b[0] /= a.length, b[1] /= a.length, b[2] /= a.length, b
    }, q = 0; width > q; q++)for (var r = 0; height > r; r++) {
      for (var s = [], t = q * factor; (q + 1) * factor > t; t++)for (var u = r * factor; (r + 1) * factor > u; u++)s.push(n(t, u));
      o(q, r, p(s))
    }
    k.putImageData(m, 0, 0);
    var v = function (a) {
      var b = a.substring(a.indexOf(",") + 1), c = 6 * b.length;
      return Math.ceil(c / 8)
    }, w = 1, x = null;
    do x = j.toDataURL("image/jpeg", w), w -= .1; while (v(x) > max && w > 0);
    return x;
  };
  return {takeSnapshot: shoot}
}]);
