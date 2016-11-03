angular.module('BattleZone').config(adminRoutes);

function adminRoutes ($stateProvider, $urlRouterProvider) {

  $stateProvider

    .state('admin', {
      url: '/admin',
      parent: 'app',
      abstract: true,
      views: {
        'content': {
          template: '<ion-nav-view></ion-nav-view>'
        }
      }
    })
    .state('admin.settings', {
      url: '/settings',
      templateUrl: 'views/admin/settings/settings.html',
      controller: 'settingsCtrl'
    })
}
