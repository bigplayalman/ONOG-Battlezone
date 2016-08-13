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
    .state('admin.create', {
      url: '/create',
      templateUrl: 'views/admin/create/create.html',
      controller: 'createCtrl'
    })
}
