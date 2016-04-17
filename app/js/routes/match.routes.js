angular.module('ONOG.routes.matches', [])
  .config(['$stateProvider', MatchRoutes]);

function MatchRoutes ($stateProvider) {

  $stateProvider
    .state('app.match', {
      url: '/match',
      abstract: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/match/match.html'
        }
      }
    })
    .state('app.match.list', {
      url: '/view',
      templateUrl: 'templates/match/match.list.html',
      controller: 'MatchListCtrl',
      cache: false,
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament.tournament, Parse.User.current());
        }
      }
    })
    .state('app.match.view', {
      url: '/view',
      templateUrl: 'templates/match/match.view.html',
      controller: 'MatchViewCtrl',
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament.tournament, Parse.User.current());
        },
        match: function (MatchServices, $state, $q, player) {
          var cb = $q.defer();
          MatchServices.getLatestMatch(player[0]).then(function (matches) {
            if(!matches.length) {
              cb.reject();
              $state.go('app.dashboard');
            } else {
              cb.resolve(matches);
            }
          });
          return cb.promise;
        }
      }
    })
    .state('app.match.report', {
      url: '/report/:id',
      cache: false,
      templateUrl: 'templates/match/match.report.html',
      controller: 'MatchReportCtrl',
      resolve: {
        report: function (MatchServices, $stateParams) {
          return MatchServices.getMatch($stateParams.id);
        }
      }
    })
}
