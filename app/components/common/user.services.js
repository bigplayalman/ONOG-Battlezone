
angular.module('BattleZone')

  .factory('userServices', userServices);

function userServices($http, Parse, $state, $ionicHistory, $ionicPopup) {
  var user = {current: null};

  user.current = Parse.User.current();

  return {
    user: user,
    isLoggedIn: isLoggedIn,
    logIn: logIn,
    logOut: logOut,
    assignUser: assignUser
  }

  function isLoggedIn() {
    user.current = Parse.User.current();
    if(user.current) {
      return;
    } else {
      $state.go('login');
    }
  }
  function logIn(params) {
    Parse.User.logIn(params.username, params.password).then(function () {
      $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
      });
      user.current = Parse.User.current();
      $state.go('latest');
    }, function (error, message) {
      $ionicPopup.alert({
        title: 'Login Error',
        template: error.message
      })
    });
  }
  function logOut() {
    Parse.User.logOut().then(function () {
      user.current = null;
    });
  }

  function assignUser() {
    user.current = Parse.User.current();
  }

}
