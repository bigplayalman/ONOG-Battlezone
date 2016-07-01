angular.module('BattleZone').config(routes);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/app/news');

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'menu/menu.html',
      controller: 'MenuCtrl',
    })
    
    .state('news', {
      url: '/news',
      parent: 'app',
      views: {
        'content': {
          templateUrl: 'news/news.html',
          controller: 'NewsCtrl'
        }
      }
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
