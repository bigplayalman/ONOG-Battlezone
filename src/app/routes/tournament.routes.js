angular.module('BattleZone').config(tournamentRoutes);

function tournamentRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('tournament', {
      url: '/tournament',
      parent: 'app',
      abstract: true,
      views: {
        'content': {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })

    .state('list', {
      url: '/list',
      parent: 'tournament',
      templateUrl: 'tournament/list/tournament-list.html',
      controller: 'tournamentListCtrl'
    });

}
