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
    .state('create', {
      url: '/create',
      parent: 'admin',
      templateUrl: 'admin/create/create.html',
      controller: 'createCtrl'
    })
    .state('matches', {
      url: '/latest',
      parent: 'admin',
      templateUrl: 'news/news.html',
      controller: 'NewsCtrl'
    })
    .state('players', {
      url: '/players',
      parent: 'admin',
      templateUrl: 'news/details/newsDetails.html',
      controller: 'NewsDetailsCtrl'
    })
}
