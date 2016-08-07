angular.module('BattleZone').config(ladderRoutes);

function ladderRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('ladder', {
      url: '/ladder',
      parent: 'tournament',
      abstract: true,
      template: '<ion-nav-view name="ladder"></ion-nav-view>'
    })
    .state('ladder.details', {
      url: '/details/:id',
      views: {
        'ladder': {
          templateUrl: 'views/tournament/ladder/details/ladder-details.html',
          controller: 'ladderDetailsCtrl'
        }
      }
    })
    .state('ladder.standings', {
      url: '/standings/:id',
      views: {
        'ladder': {
          templateUrl: 'views/tournament/ladder/standings/ladder-standings.html',
          controller: 'ladderStandingsCtrl'
        }
      }
    });
}
