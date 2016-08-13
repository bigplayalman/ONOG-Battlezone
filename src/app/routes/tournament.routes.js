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

    .state('tournament.list', {
      url: '/list',
      templateUrl: 'views/tournament/list/tournament.list.html',
      controller: 'tournamentListCtrl',
      cache: false
    })

    .state('tournament.ladder', {
      url: '/ladder/:id',
      templateUrl: 'views/tournament/ladder/ladder.html',
      controller: 'ladderCtrl',
      cache: false
    })
    .state('tournament.play', {
      url: '/play/:id',
      templateUrl: 'views/tournament/play/play.html',
      controller: 'playCtrl',
      cache: false
    });

}
