angular.module('ONOG')
  .config(['$stateProvider', LadderRoutes]);

function LadderRoutes ($stateProvider) {

  $stateProvider
    .state('app.ladder', {
      url: '/ladder',
      abstract: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/ladder/ladder.html',
        }
      }
    })
    .state('app.ladder.leaderboard', {
      url: '/leaderboards',
      cache: false,
      templateUrl: 'templates/ladder/leaderboard.html',
      controller: 'LeaderBoardsCtrl'
    })
    .state('app.ladder.join', {
      url: '/join',
      cache: false,
      templateUrl: 'templates/ladder/join.html',
      controller: 'LadderJoinCtrl'
    })
    .state('app.ladder.profile', {
      url: '/profile',
      cache: false,
      templateUrl: 'templates/ladder/profile.html',
      controller: 'LadderProfileCtrl',
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament.tournament, Parse.User.current());
        }
      }
    });
}
