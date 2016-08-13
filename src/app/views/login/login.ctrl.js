
angular.module('BattleZone')

  .controller('LoginCtrl', LoginCtrl);

function LoginCtrl($scope, $state, $ionicHistory, userServices) {
  $scope.user = {};
  userServices.logOut();

  $scope.loginUser = function () {
    userServices.logIn($scope.user).then(function (user) {
      if(user) {
        userServices.state.last ? $state.go(userServices.state.last) : $state.go('latest');
      }
    });
  };
};
