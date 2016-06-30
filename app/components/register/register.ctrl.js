
angular.module('BattleZone')

  .controller('RegisterCtrl', RegisterCtrl);

function RegisterCtrl($scope, $state, Parse, $ionicPopup, $rootScope) {

  $scope.user = {};

  $scope.RegisterUser = function (user) {
    $rootScope.$broadcast('show:loading');
    var register = new Parse.User();
    register.set(user);
    register.signUp(null, {
      success: function(user) {
        $rootScope.$broadcast('hide:loading');
        $state.go('app.dashboard');
      },
      error: function(user, error) {
        $rootScope.$broadcast('show:loading');
        ErrorPopup(error.message);
      }
    });
  };
  $scope.$watch('user', function(newVal, oldVal){
    $scope.warning = null;
  }, true);

  function ErrorPopup (message) {
    return $ionicPopup.alert({
      title: 'Registration Error',
      template: message
    });
  }
}
