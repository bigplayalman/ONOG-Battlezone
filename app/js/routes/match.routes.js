angular.module('ONOG')
  .config(['$stateProvider', MatchRoutes]);

function MatchRoutes ($stateProvider) {

  $stateProvider
    .state('app.match', {
      url: '/match',
      abstract: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/match/match.html'
        }
      }
    })
    .state('app.match.view', {
      url: '/view',
      cache: false,
      templateUrl: 'templates/match/match.view.html',
      controller: 'MatchViewCtrl',
      resolve: {
        match: function (MatchServices, $state, $q) {
          var cb = $q.defer();
          MatchServices.getMatch('active').then(function (matches) {
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
}
