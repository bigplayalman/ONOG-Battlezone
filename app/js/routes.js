angular.module('ONOG')
  .config(['$stateProvider', '$urlRouterProvider', routes]);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("app.dashboard");
  });

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      cache: false,
      templateUrl: 'templates/menu.html',
      controller: 'MenuCtrl',
      resolve: {
        tournament: function (TournamentServices) {
          return TournamentServices.getTournament();
        }
      }
    })
    .state('app.dashboard', {
      url: '/dashboard',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardCtrl'
        }
      },
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament[0].tournament, Parse.User.current());
        },
        queue: function (Parse, QueueServices, tournament) {
          return QueueServices.checkStatus(tournament[0].tournament, Parse.User.current());
        },
        match: function (MatchServices, player) {
          if(player.length) {
            return MatchServices.getMatch();
          } else {
            return [];
          }
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


}
