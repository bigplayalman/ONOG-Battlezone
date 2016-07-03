angular.module('BattleZone').config(newsRoutes);

function newsRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('news', {
      url: '/news',
      parent: 'app',
      abstract: true,
      views: {
        'content': {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })
    .state('latest', {
      url: '/latest',
      parent: 'news',
      templateUrl: 'news/news.html',
      controller: 'NewsCtrl'
    })
    .state('details', {
      url: '/:id',
      parent: 'news',
      templateUrl: 'news/details/newsDetails.html',
      controller: 'NewsDetailsCtrl'
    })
}
