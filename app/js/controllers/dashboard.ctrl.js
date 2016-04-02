
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$scope', 'Parse'];
function DashboardCtrl($scope, Parse) {
  $scope.user = Parse.User.current();
  $scope.player;
}
