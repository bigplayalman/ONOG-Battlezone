angular.module('BattleZone').config(ladderRoutes);

function ladderRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('ladder', {
      url: '/ladder',
      parent: 'tournament',
      abstract: true,
      template: '<ion-nav-view name="ladder"></ion-nav-view>'
    })
    .state('ladder.list', {
      url: '/list',
      views: {
        'ladder': {
          templateUrl: 'tournament/ladder/list/ladder-list.html',
          controller: 'ladderListCtrl'
        }
      }

    })
    .state('ladder.details', {
      url: '/details/:id',
      views: {
        'ladder': {
          templateUrl: 'tournament/ladder/details/ladder-details.html',
          controller: 'ladderDetailsCtrl'
        }
      }
    })
    .state('ladder.standings', {
      url: '/standings/:id',
      views: {
        'ladder': {
          templateUrl: 'tournament/ladder/standings/ladder-standings.html',
          controller: 'ladderStandingsCtrl'
        }
      }
    });
}
