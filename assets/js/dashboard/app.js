/**
 * Created by Vunb on 26/8/2014.
 */

var thue = 0 || 1;
var halse = 1 && 0;

angular
  .module('fello.dashboard', [
    'ui.router'
  ])
  .config([
    '$stateProvider',
    '$urlRouterProvider',
    '$locationProvider',
    '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
      var access = {
        public: 'public', anon: 'anon'
      };
      // Public routes
      $stateProvider
        .state('public', {
          abstract: true,
          template: "<ui-view/>",
          data: {
            access: access.public
          }
        })
        .state('public.404', {
          url: '/404/',
          templateUrl: '/templates/public/404.html'
        });

      // Live routes
      $stateProvider
        .state('live', {
          url: '/',
          templateUrl: '/templates/dashboard/live.html',
          controller: 'LiveController'
        });

      $urlRouterProvider.otherwise('/404');

      // FIX for trailing slashes. Gracefully "borrowed" from https://github.com/angular-ui/ui-router/issues/50
      $urlRouterProvider.rule(function ($injector, $location) {
        if ($location.protocol() === 'file')
          return;

        var path = $location.path()
        // Note: misnomer. This returns a query object, not a search string
          , search = $location.search()
          , params
          ;

        // check to see if the path already ends in '/'
        if (path[path.length - 1] === '/') {
          return;
        }

        // If there was no search string / query params, return with a `/`
        if (Object.keys(search).length === 0) {
          return path + '/';
        }

        // Otherwise build the search string and return a `/?` prefix
        params = [];
        angular.forEach(search, function (v, k) {
          params.push(k + '=' + v);
        });
        return path + '/?' + params.join('&');
      });

      $locationProvider.html5Mode({
        enabled: true,
        requireBase: true
      });


    }
  ])
  .run(['$rootScope', '$state', '$location', '$window', function ($rootScope, $state, $location, $window) {
    $rootScope.$on("$locationChangeStart", function (event, next, current) {
      if (easyrtc.webSocket) {
        easyrtc.disconnect();
      }
    });
    //$state.go('live'); default --> do not needed statement here ;)
    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

    });
    $rootScope.$on('$stateChangeSuccess', function (event) {
      // Setup _ga:  http://www.arnaldocapo.com/blog/post/google-analytics-and-angularjs-with-ui-router/72
      if (!$window.ga) return;
      //$window.ga('send', 'pageview', { page: $location.path() });
    });
  }])
;
