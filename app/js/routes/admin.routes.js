angular.module('ONOG.routes.admin', [])
  .config(AdminRoutes);

function AdminRoutes ($stateProvider) {

  $stateProvider
    .state('app.admin', {
      url: '/admin',
      abstract: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/admin/admin.html',
        }
      }
    })
    .state('app.admin.settings', {
      url: '/settings',
      cache: false,
      templateUrl: 'templates/admin/admin.settings.html',
      controller: 'AdminSettingsCtrl',
      resolve: {
        tourney: function (TournamentServices) {
          return TournamentServices.getTournament();
        },
        newTournament: function (TournamentServices, tourney) {
          if(tourney.length) {
            return tourney[0];
          } else {
            return TournamentServices.createTournament();
          }
        }
      }
    })
    .state('app.admin.matches', {
      url: '/matches',
      cache: false,
      templateUrl: 'templates/admin/admin.matches.html',
      controller: 'AdminMatchesCtrl'
    })
    .state('app.admin.match', {
      url: '/match/:id',
      cache: false,
      templateUrl: 'templates/admin/admin.match.html',
      controller: 'AdminMatchCtrl',
      resolve: {
        match: function (MatchServices, $stateParams) {
          return MatchServices.getMatchDetails($stateParams.id);
        }
      }
    })
    .state('app.admin.players', {
      url: '/players',
      cache: false,
      templateUrl: 'templates/admin/admin.players.html',
      controller: 'AdminPlayersCtrl'
    });
  
}
