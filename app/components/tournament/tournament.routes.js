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

    .state('join', {
      url: '/join',
      parent: 'tournament',
      templateUrl: 'tournament/join/tournament-join.html',
      controller: 'tournamentJoinCtrl'
    });

}
