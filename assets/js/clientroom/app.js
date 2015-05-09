/**
 * Created by Vunb on 31/1/2015.
 */

/**
 * Created by Vunb on 26/8/2014.
 */

angular.module('jm.i18next').config(['$i18nextProvider', function ($i18nextProvider) {
  $i18nextProvider.options = {
    lng: 'de',
    useCookie: false,
    useLocalStorage: false,
    fallbackLng: 'dev',
    resGetPath: '../locales/__lng__/__ns__.json',
    defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
  };
}]);

angular
  .module('fello.clientroom', [
    'fello.common',
    'jm.i18next',
    'ui.router',
    'timer',
    'ngSanitize',
    //'youtube-embed',
    'angular-bind-html-compile'
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
          url: '/404',
          templateUrl: '/templates/public/404.html'
        });

      // Live routes
      $stateProvider
        .state('clientroom', {
          url: '/:roomName',
          templateUrl: '/templates/clientroom/live.html',
          controller: 'LiveController',
          resolve: {
            dummy1: ['$stateParams', 'RoomState', function ($stateParams, RoomState) {
              RoomState.roomName = $stateParams.roomName;
              RoomState.serverApp = $stateParams.roomName;
            }]
          }
        });

      // Embed Room
      $stateProvider
        .state('embedroom', {
          url: '/embed/:roomName',
          templateUrl: '/templates/embed/drawer.html',
          controller: 'LiveController'
        });

      // Default route to client room
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
  .run(['$rootScope', '$state', '$location', '$window', 'rtcapi', 'lodash', 'RoomState', function ($rootScope, $state, $location, $window, rtcApi, _, RoomState) {
    $rootScope._ = _;
    $rootScope.$on("$locationChangeStart", function (event, next, current) {
      //if (rtcApi.webSocket) {
      //  rtcApi.disconnect();
      //}
      $rootScope.$broadcast('disconnectRtc');
    });

    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

    });
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
      RoomState.roomName = toParams.roomName;

      // Setup _ga:  http://www.arnaldocapo.com/blog/post/google-analytics-and-angularjs-with-ui-router/72
      if (!$window.ga) return;
      //$window.ga('send', 'pageview', { page: $location.path() });
    });
    // Bussiness
    //$state.go('live'); default --> do not needed statement here ;)
    // check roomName is exists
    var roomExists = true;
    if(!roomExists) {
      $state.go('public.404');
    }
  }])
;
