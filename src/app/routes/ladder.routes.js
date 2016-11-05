angular.module('BattleZone').config(tournamentRoutes);

function tournamentRoutes ($stateProvider, $urlRouterProvider) {

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

    .state('ladder.standings', {
      url: '/standings/:id',
      templateUrl: 'views/ladder/standings/standings.html',
      controller: 'ladderStandingsCtrl',
      cache: false
    })
    .state('ladder.play', {
      url: '/play/:id',
      templateUrl: 'views/ladder/play/play.html',
      controller: 'playCtrl',
      cache: false
    });

}
