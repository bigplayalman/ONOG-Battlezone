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
          templateUrl: 'templates/match/match.html',
          controller: 'MatchCtrl'
        }
      }
    })
    .state('app.match.find', {
      url: '/find',
      cache: false,
      templateUrl: 'templates/match/find.html',
      controller: 'MatchFindCtrl'
    })
}
