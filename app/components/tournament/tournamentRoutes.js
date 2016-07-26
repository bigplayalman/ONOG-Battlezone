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
    .state('tournament.details', {
      url: '/:id/:details',
      templateUrl: 'tournament/details/tournament-details.html',
      controller: 'tournamentDetailsCtrl'
    });
}
