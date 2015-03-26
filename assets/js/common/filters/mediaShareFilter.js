/**
 * Created by Vunb on 3.25.2015.
 */
angular.module("fello.common").filter("mediaShareFilter", ["youtubeEmbedUtils", "$sce", "$sanitize", function (youtubeEmbedUtils, $sce, $sanitize) {
  return function (d) {
    var e = document.createElement("p");
    e.innerHTML = $sanitize(d);
    for (var f = e.getElementsByTagName("a"), g = 0; g < f.length; g++) {
      var h = f[g];
      youtubeEmbedUtils.getIdFromURL(h.href) !== h.href && (h.setAttribute("shareable-media-url", h.href), $sce.trustAsHtml(h.outerHTML))
    }
    return e.innerHTML
  }
}]);
