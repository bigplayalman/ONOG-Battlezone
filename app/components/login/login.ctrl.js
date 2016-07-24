
angular.module('BattleZone')

  .controller('LoginCtrl', LoginCtrl);

function LoginCtrl($scope, $state, $ionicHistory, userServices) {
  $scope.user = {};
  userServices.logOut();

  $scope.loginUser = function () {
    userServices.logIn($scope.user);
  };
};
