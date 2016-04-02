
angular.module('ONOG.Controllers')

  .controller('RegisterCtrl', RegisterCtrl);

RegisterCtrl.$inject = ['$scope', '$state', 'Parse'];
function RegisterCtrl($scope, $state, Parse) {
  $scope.user = {};

  $scope.RegisterUser = function (user) {
    var register = new Parse.User();
    register.set(user);

    register.signUp(null, {
      success: function(user) {
        console.log(Parse.User.current());
        $state.go('app.dashboard');
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        alert("Error: " + error.code + " " + error.message);
      }
    });
  };
  $scope.$watch('user', function(newVal, oldVal){
    $scope.warning = null;
  }, true);
}
