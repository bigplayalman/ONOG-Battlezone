angular.module('ONOG.Services')

  .service('locationServices', ['Parse', '$cordovaGeolocation', '$q', locationServices]);

function locationServices (Parse, $cordovaGeolocation, $q) {

  var location = {coords: new Parse.GeoPoint()};
  return {
    location: location,
    getLocation: getLocation,
    setLocation: setLocation
  }
  
  function setLocation (coords) {
    location.coords = new Parse.GeoPoint({latitude: coords.latitude, longitude: coords.longitude})
  }

  function getLocation () {
    var cb = $q.defer();
    var posOptions = {enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        cb.resolve(position.coords);
      }, function(err) {
        console.log(err);
        cb.reject(err);
      });
    return cb.promise;
  }
}
