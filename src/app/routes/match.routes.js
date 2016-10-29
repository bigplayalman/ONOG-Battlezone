angular.module('BattleZone').config(matchRoutes);

function matchRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('match', {
      url: '/match',
      parent: 'app',
      abstract: true,
      views: {
        'content': {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })

    .state('match.result', {
      url: '/result/:id/:result',
      templateUrl: 'views/match/result.html',
      controller: 'matchResultCtrl',
      cache: false
    })
    .state('match.report', {
      url: '/report/:id',
      templateUrl: 'views/match/report.html',
      controller: 'matchReportCtrl',
      cache: false
    })
    .state('match.noShow', {
      url: '/noshow/:id',
      templateUrl: 'views/match/noshow.html',
      controller: 'matchNoShowCtrl',
      cache: false
    })

}
