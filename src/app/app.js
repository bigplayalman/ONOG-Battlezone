angular.module('BattleZone', [
  'ionic',
  'ngParse',
  'timer',
  'ngCordova',
  'ngAnimate',
  'BattleZone.Parse',
  'BattleZone.templates'
])
  .config(config)
  .filter("sanitize", sanitize);

function sanitize ($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}

function config ($ionicConfigProvider, $compileProvider, ParseProvider) {

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

  ParseProvider.initialize('7mjcxnkWEfLMd72zuxOKUtXtRsrfwb7rZiC2VrnT', '4cePbSJoRdj9M2OBrTcPJVoi6fAEedLalrXi5oFS');

  if (ionic.Platform.isIOS()) {
    $ionicConfigProvider.scrolling.jsScrolling(true);
  }
}
