angular.module('BattleZone').config(adminRoutes);

function adminRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('admin', {
      url: '/admin',
      parent: 'app',
      abstract: true,
      views: {
        'content': {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })
    .state('matches', {
      url: '/latest',
      parent: 'news',
      templateUrl: 'news/news.html',
      controller: 'NewsCtrl'
    })
    .state('players', {
      url: '/players',
      parent: 'news',
      templateUrl: 'news/details/newsDetails.html',
      controller: 'NewsDetailsCtrl'
    })
}
