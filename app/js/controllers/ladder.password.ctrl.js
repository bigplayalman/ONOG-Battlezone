
angular.module('ONOG.Controllers')

  .controller('ResetPasswordCtrl', ResetPasswordCtrl);

function ResetPasswordCtrl
($scope, $ionicPopup, $state, $ionicHistory, Parse) {

  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $scope.email = {};
  
  $scope.resetPassword = function (email) {
    Parse.User.requestPasswordReset(email.text, {
      success: function() {
        SuccessPopup();
      },
      error: function(error) {
        // Show the error message somewhere
        ErrorPopup(error.message);
      }
    });
  };
  
  function ErrorPopup (message) {
    return $ionicPopup.alert({
      title: 'Update Error',
      template: message
    });
  }

  function SuccessPopup () {
    return $ionicPopup.alert({
      title: 'Password Reset',
      template: 'An Email has been sent to reset your password'
    }).then(function (res) {
      $state.go('app.dashboard');
    })
  }
}
