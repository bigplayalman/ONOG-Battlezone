angular.module('BattleZone').config(ladderRoutes);

function ladderRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('ladder', {
      url: '/ladder',
      parent: 'app',
      abstract: true,
      views: {
        'content': {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })
    .state('ladder.list', {
      url: '/list',
      templateUrl: 'ladder/list/ladder-list.html',
      controller: 'ladderListCtrl'
    })
}
