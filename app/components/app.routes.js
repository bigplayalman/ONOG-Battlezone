angular.module('BattleZone.routes', [
  'BattleZone.routes.matches',
  'BattleZone.routes.ladder',
  'BattleZone.routes.admin'
])
  .config(routes);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('app/loading');

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      cache: false,
      templateUrl: 'templates/menu.html',
      controller: 'MenuCtrl',
      resolve: {
        tournament: function (TournamentServices, $q, Parse, $state) {
          var cb = $q.defer();
          TournamentServices.getTournament().then(function (tournaments) {
            if(tournaments.length) {
              cb.resolve(tournaments[0]);
            }
          },
          function (error) {
            ionic.Platform.exitApp();
          });
          return cb.promise;
        }
      }
    })
    .state('app.prizes', {
      url: '/prizes',
      views: {
        'menuContent': {
          templateUrl: 'templates/prizes.html'
        }
      }
    })
    .state('app.loading', {
      url: '/loading',
      views: {
        'menuContent': {
          templateUrl: 'templates/loading.html'
        }
      }
    })
    .state('app.dashboard', {
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardCtrl'
        }
      }
    })
    .state('app.login', {
      url: '/login',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('app.register', {
      url: '/register',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })
    .state('app.reset', {
      url: '/password',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/password.html',
          controller: 'ResetPasswordCtrl'
        }
      }
    });
}
