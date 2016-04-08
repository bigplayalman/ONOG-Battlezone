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
      url: '',
      cache: false,
      templateUrl: 'templates/match/match.view.html',
      controller: 'MatchViewCtrl',
      resolve: {
        match: function (MatchServices, $q, $state) {
          var cb = $q.defer();
          MatchServices.getMatch().then(function (matches) {
            if(!matches.length) {
              $state.go('app.dashboard');
              cb.reject();
            } else {
              cb.resolve(matches[0]);
            }
          });
          return cb.promise;
        }
      }
    })
}
