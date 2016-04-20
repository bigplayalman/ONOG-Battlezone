angular.module('ONOG')
  .config(routes);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state('leaderboard', {
      url: '/',
      templateUrl: 'templates/leaderboard.html',
      controller: 'LeaderBoardCtrl',
      resolve: {
        tournament: function (TournamentServices, $q, Parse, $state) {
          var cb = $q.defer();
          TournamentServices.getTournament().then(function (tournaments) {
            if(tournaments.length) {
              cb.resolve(tournaments[0]);
            }
          });
          return cb.promise;
        }
      }
    });
}
