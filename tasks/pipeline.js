/**
 * grunt/pipeline.js
 *
 * The order in which your css, javascript, and template files should be
 * compiled and linked from your views and static HTML files.
 *
 * (Note that you can take advantage of Grunt-style wildcard/glob/splat expressions
 * for matching multiple files.)
 */



// CSS files to inject in order
//
// (if you're using LESS with the built-in default config, you'll want
//  to change `assets/styles/importer.less` instead.)
var cssFilesToInject = [
  'vendor/**/*.css',
  'styles/**/*.css'
];


// Client-side javascript files to inject in order
// (uses Grunt-style wildcard/glob/splat expressions)
var jsFilesToInject = [
  'vendor/**/*.js',

  // Load sails.io before everything else
  'js/dependencies/sails.io.js',

  // Dependencies like jQuery, or Angular are brought in here
  'js/dependencies/**/*.js',

  // All of the rest of your client-side js files
  // will be injected here in no particular order.
  'js/**/*.js'
];

var jsFilesToInjectDashboard = [
  // <!-- Mainly scripts -->
  '/vendor/jquery/jquery.js',
  '/vendor/bootstrap/bootstrap.js',
  '/js/plugins/metisMenu/jquery.metisMenu.js',
  '/js/plugins/slimscroll/jquery.slimscroll.min.js',
  '/js/plugins/pace/pace.min.js',
  // <!-- Custom and plugin scripts -->
  '/js/dashboard/inspinia.js',
  // <!-- Fello main scripts -->
  '/easyrtc/easyrtc.js',
  '/socket.io/socket.io.js',
  '/vendor/angular/angular.js',
  '/vendor/angular-ui-router/angular-ui-router.js',
  '/vendor/ng-elif/elif.js',
  <!-- Fello app scripts -->
  '/js/common/app.js',
  '/js/common/services/rtcapi.js',
  '/js/dashboard/app.js',
  '/js/dashboard/filters/TimeAgoFilter.js',
  '/js/dashboard/services/CallService.js',
  '/js/dashboard/directives/TimeAgoDirective.js',
  '/js/dashboard/controllers/LiveController.js'
];

var jsFilesToInjectClientRoom = [
  // <!-- Mainly scripts -->
  '/easyrtc/easyrtc.js',
  '/socket.io/socket.io.js',
  // <!-- Plugin scripts -->
  '/vendor/jquery/jquery.js',
  '/vendor/lodash/lodash.js',
  '/vendor/bootstrap/bootstrap.js',
  '/vendor/momentjs/moment.js',
  '/vendor/humanize-duration/humanize-duration.js',
  // <!-- Fello main scripts -->
  '/vendor/angular/angular.js',
  '/vendor/angular-ui-router/angular-ui-router.js',
  '/vendor/angular-timer/angular-timer.js',
  '/vendor/i18next/i18next.js',
  '/vendor/ng-i18next/ng-i18next.js',
  <!-- Fello app scripts -->
  '/js/common/app.js',
  '/js/common/services/rtcapi.js',
  '/js/clientroom/app.js',
  '/js/clientroom/services/EventService.js',
  '/js/clientroom/services/SnapshooterService.js',
  '/js/clientroom/services/AvatarProvider.js',
  '/js/clientroom/services/ChatService.js',
  '/js/clientroom/directives/ChatDirective.js',
  '/js/clientroom/controllers/LiveController.js'
];



// Client-side HTML templates are injected using the sources below
// The ordering of these templates shouldn't matter.
// (uses Grunt-style wildcard/glob/splat expressions)
//
// By default, Sails uses JST templates and precompiles them into
// functions for you.  If you want to use jade, handlebars, dust, etc.,
// with the linker, no problem-- you'll just want to make sure the precompiled
// templates get spit out to the same file.  Be sure and check out `tasks/README.md`
// for information on customizing and installing new tasks.
var templateFilesToInject = [
  'templates/**/*.html'
];



// Prefix relative paths to source files so they point to the proper locations
// (i.e. where the other Grunt tasks spit them out, or in some cases, where
// they reside in the first place)
module.exports.cssFilesToInject = cssFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToInject = jsFilesToInject.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToInjectDashboard = jsFilesToInjectDashboard.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.jsFilesToInjectClientRoom = jsFilesToInjectClientRoom.map(function(path) {
  return '.tmp/public/' + path;
});
module.exports.templateFilesToInject = templateFilesToInject.map(function(path) {
  return 'assets/' + path;
});
