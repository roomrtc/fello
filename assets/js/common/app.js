/**
 * Created by Vunb on 17/2/2015.
 */
var app = angular.module("fello.common", []);

app.filter("timestamp", function () {
  return function (time) {
    var b = 864e5, c = new Date(time);
    return (new Date).getTime() - c.getTime() > b ? c.toISOString().substring(0, 10) : c.toTimeString().substring(0, 5)
  }
});
