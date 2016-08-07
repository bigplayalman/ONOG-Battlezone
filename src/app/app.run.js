angular.module('BattleZone')
  .run(run);

function run ($ionicPlatform, $rootScope, $ionicLoading, userServices) {

  $ionicPlatform.ready(function() {

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }

    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
  $rootScope.$on('loading:show', function() {
    $ionicLoading.show({template: '<ion-spinner icon="spiral" class="spinner-calm"></ion-spinner>', showBackdrop: true, animation: 'fade-in'});
  });

  $rootScope.$on('loading:hide', function() {
    $ionicLoading.hide();
  });

  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    var requireLogin = toState.data;
    var name = toState.name;
    if(requireLogin && requireLogin.data.requireLogin) {
      userServices.isLoggedIn();
    }
  });
}
