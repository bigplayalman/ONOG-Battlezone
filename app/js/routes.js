angular.module('ONOG')
  .config(['$stateProvider', '$urlRouterProvider', routes]);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("app.dashboard");
  });

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      cache: false,
      templateUrl: 'templates/menu.html',
      controller: 'MenuCtrl'
    })
    .state('app.dashboard', {
      url: '/dashboard',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardCtrl'
        }
      }
    })
    .state('app.standings', {
      url: '/standings',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/standings.html',
          controller: 'StandingsCtrl'
        }
      }
    })
    .state('app.login', {
      url: '/login',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('app.register', {
      url: '/register',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })


}
