angular.module('ONOG')

  .run(['$ionicPlatform', run]);

function run ($ionicPlatform) {
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

    if(window.cordova) {
      window.parsePlugin.subscribe('SampleChannel', function() {
        console.log('Successfully subscribed to SampleChannel.');


        window.parsePlugin.getInstallationId(function(id) {
          // update the view to show that we have the install ID
          console.log('Retrieved install id: ' + id);

          /**
           * Now you can construct an object and save it to your own services, or Parse, and corrilate users to parse installations
           *
           var install_data = {
                  installation_id: id,
                  channels: ['SampleChannel']
               }
           *
           */

        }, function(e) {
          console.log('Failure to retrieve install id.');
        });

      }, function(e) {
        console.log('Failed trying to subscribe to SampleChannel.');
      });
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
}
