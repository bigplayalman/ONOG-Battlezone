angular.module('BattleZone').config(routes);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/app/dashboard');

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'menu/menu.html',
      controller: 'MenuCtrl',
    })
    
    .state('app.dashboard', {
      url: '/dashboard',
      views: {
        'content': {
          templateUrl: 'dashboard/dashboard.html',
          controller: 'DashboardCtrl'
        }
      }
    })
    
    .state('app.login', {
      url: '/login',
      views: {
        'content': {
          templateUrl: 'login/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('app.register', {
      url: '/register',
      views: {
        'content': {
          templateUrl: 'register/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })
    .state('app.reset', {
      url: '/password',
      views: {
        'content': {
          templateUrl: 'settings/password.html',
          controller: 'ResetPasswordCtrl'
        }
      }
    });
}
