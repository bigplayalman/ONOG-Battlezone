angular.module('ONOG')
  .config(['$stateProvider', '$urlRouterProvider', routes]);

function routes ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: "/home",
      templateUrl: "templates/home.html",
      controller: 'HomeController'
    });

  $urlRouterProvider.otherwise(function ($injector, $location) {
    var $state = $injector.get("$state");
    $state.go("home");
  });
}
