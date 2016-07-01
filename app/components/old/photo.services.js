angular.module('BattleZone')

  .service('cameraServices', cameraServices);

function cameraServices ($window) {

  var camera = {
    quality: 90,
    targetWidth: 320,
    targetHeight: 500,
    allowEdit: true,
    sourceType: 0,
  }
  if($window.Camera) {
    camera.destinationType = Camera.DestinationType.DATA_URL;
    camera.encodingType = Camera.EncodingType.JPEG;
  }

  return {
    camera: camera
  };

}
