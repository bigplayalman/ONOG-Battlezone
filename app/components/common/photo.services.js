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

  // function getDataUri (url, callback) {
  //   var image = new Image();
  //   image.onload = function () {
  //     var canvas = document.createElement('canvas');
  //     canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
  //     canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
  //
  //     canvas.getContext('2d').drawImage(this, 0, 0);
  //
  //     // Get raw image data
  //     callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
  //
  //     // ... or get as Data URI
  //     //callback(canvas.toDataURL('image/png'));
  //   };
  //   image.src = url;
  // }

}
