angular.module('BattleZone')
  .controller('MenuCtrl', MenuCtrl);

function MenuCtrl($scope, $state, userServices, menuConstants, $ionicHistory) {

  $scope.navigateTo = function(state) {
    if(state === 'latest') {
      $ionicHistory.nextViewOptions({disableBack: true});
    }
    $state.go(state);
  }

  $scope.user = userServices.user;

  $scope.$watch('user', function (newVal, oldVal) {
    if($scope.user.current) {
      if($scope.user.current.get('admin')) {
        $scope.menu = menuConstants().menu.admin;
      } else {
        $scope.menu = menuConstants().menu.authorized;
      }
    } else {
      $scope.menu = menuConstants().menu.normal;
    }
  }, true);
}
