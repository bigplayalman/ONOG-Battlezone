angular.module('ONOG')
  .constant("moment", moment)
  .run(run);

function run ($ionicPlatform, $state, $rootScope, $ionicLoading, $ionicPopup, locationServices, $ionicHistory) {
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

    $rootScope.$on('show:loading', function() {
      $ionicLoading.show({template: '<ion-spinner icon="spiral" class="spinner-calm"></ion-spinner>', showBackdrop: true, animation: 'fade-in'});
    });

    $rootScope.$on('hide:loading', function() {
      $ionicLoading.hide();
    });

    if(window.ParsePushPlugin) {
      console.log('new version 1');
      ParsePushPlugin.on('receivePN', function(pn){
        console.log(pn);
        if(!pn.title) {
          $ionicPopup.alert({
            title: 'Announcement',
            template: '<div class="text-center">'+ pn.alert + '</div>'
          }).then(function(res) {

          });
        } else {
          switch (pn.title) {
            case 'Opponent Found':
              $rootScope.$broadcast('opponent:found');
              break;
            case 'Opponent Confirmed':
              $rootScope.$broadcast('opponent:confirmed');
              break;
            case 'Results Entered':
              $rootScope.$broadcast('results:entered');
              break;
          }
        }
      });
    }

    locationServices.getLocation().then(function (location) {
      locationServices.setLocation(location);
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $state.go('app.dashboard');
    });

  });
}
