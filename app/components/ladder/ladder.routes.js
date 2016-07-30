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
          templateUrl: 'ladder/list/ladder-list.html',
          controller: 'ladderListCtrl'
        }
      }

    })
    .state('ladder.details', {
      url: '/details/:id',
      views: {
        'ladder': {
          templateUrl: 'ladder/details/ladder-details.html',
          controller: 'ladderDetailsCtrl'
        }
      }
    })
    .state('ladder.standings', {
      url: '/standings/:id',
      views: {
        'ladder': {
          templateUrl: 'ladder/standings/ladder-standings.html',
          controller: 'ladderStandingsCtrl'
        }
      }
    });
}
