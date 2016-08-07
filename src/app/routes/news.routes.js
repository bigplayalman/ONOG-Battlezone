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
      templateUrl: 'views/news/news.html',
      controller: 'NewsCtrl'
    })
    .state('details', {
      url: '/:id',
      parent: 'news',
      templateUrl: 'views/news/details/newsDetails.html',
      controller: 'NewsDetailsCtrl'
    })
}
