
angular.module('BattleZone')

  .controller('RegisterCtrl', RegisterCtrl);

function RegisterCtrl($scope, $state, Parse, $ionicPopup, $rootScope, $ionicHistory, userServices) {

  $scope.user = {};

  $scope.RegisterUser = function (user) {
    userServices.registerUser(user).then(function (user) {
      if(user) {
        userServices.state.last ? $state.go(userServices.state.last) : $state.go('latest');
      }
    });
  };
}
