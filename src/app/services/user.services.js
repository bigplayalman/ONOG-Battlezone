
angular.module('BattleZone')

  .factory('userServices', userServices);

function userServices($http, Parse, $state, $ionicHistory, $ionicPopup) {
  var user = {current: null};
  var state = {last: null};

  user.current = Parse.User.current();

  return {
    user: user,
    state: state,
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
    return Parse.User.logIn(params.username, params.password).then(function (loggedIn) {
      $ionicHistory.nextViewOptions({
        disableBack: true,
        historyRoot: true
      });
      user.current = Parse.User.current();
      return loggedIn;
    }, function (error) {
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
