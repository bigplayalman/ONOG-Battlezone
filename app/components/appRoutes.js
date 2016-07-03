angular.module('BattleZone').config(routes);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/app/news/latest');

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'menu/menu.html',
      controller: 'MenuCtrl',
    })
    
    .state('login', {
      url: '/login',
      parent: 'app',
      views: {
        'content': {
          templateUrl: 'login/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
}
