angular.module('ONOG')
  .config(['$ionicConfigProvider', '$compileProvider', config]);

function config ($ionicConfigProvider, $compileProvider) {

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

  if (ionic.Platform.isIOS()) {
    $ionicConfigProvider.scrolling.jsScrolling(true);
  }
}
