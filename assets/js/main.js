/**
 * Created by Vunb on 24/1/2015.
 */

require.config({
  urlArgs: "fello=" + (new Date()).getTime(),
  paths: {
    'angular': '../vendor/angular/angular'
    , 'jquery': '../vendor/jquery/jquery'
    , 'bootstrapJs': '../vendor/bootstrap/bootstrap'
  },
  shim: {
    'bootstrapJs': ['jquery']
    , 'angular': {'exports': 'angular'}
  }
});

window.name = "NG_DEFER_BOOTSTRAP!";

require(['angular', 'app', 'bootstrapJs'], function (ng, app) {
  'use strict';
  //var $html = angular.element(document.getElementsByTagName('html')[0]);
  ng.element(document).ready(function () {
    ng.bootstrap(document, [app.name]);
    ng.resumeBootstrap();
  });
});
