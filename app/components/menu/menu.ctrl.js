angular.module('BattleZone')
  .controller('MenuCtrl', MenuCtrl);

function MenuCtrl($scope, $state, userServices, menuConstants) {

  $scope.navigateTo = function(state) {
    $state.go(state);
  }

  $scope.user = userServices.user;

  $scope.$watch('user', function (newVal, oldVal) {
    if($scope.user.current) {
      if($scope.user.current.admin) {
        $scope.menu = menuConstants.menu.admin;
      } else {
        $scope.menu = menuConstants.menu.authorized;
      }
    } else {
      $scope.menu = menuConstants.menu.normal;
    }
  }, true);
}
