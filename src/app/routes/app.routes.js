angular.module('BattleZone').config(routes);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/app/news/latest');

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'views/menu/menu.html',
      controller: 'MenuCtrl',
    })

    .state('login', {
      url: '/login',
      parent: 'app',
      cache: false,
      views: {
        'content': {
          templateUrl: 'views/login/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('register', {
      url: '/register',
      parent: 'app',
      views: {
        'content': {
          templateUrl: 'views/register/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })
}
