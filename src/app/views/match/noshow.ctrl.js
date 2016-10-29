angular.module('BattleZone')

  .controller('matchNoShowCtrl', matchNoShowCtrl);

function matchNoShowCtrl($scope, $state, $stateParams, reportServices, cameraServices, $ionicPopup) {
  var parseFile = new Parse.File();
  var imgString = null;

  $scope.report = {
    reason: 'No Show',
    screenshot: null,
    matchId: $stateParams.id,
  };

  $scope.addScreenshot = function () {
    if(cameraServices.camera) {
      var options = cameraServices.camera;
      navigator.camera.getPicture(onSuccess,onFail,options);
    }
  }

  function onSuccess(imageData) {
    $scope.report.screenshot = imageData;
    $scope.$apply();
  };
  function onFail(e) {
    $ionicPopup.alert({
      template: 'An Error has occurred, try again later'
    });
  };

  $scope.submitReport = function () {
    if($scope.report.reason && $scope.report.screenshot) {
      reportServices.reportMatch($scope.report).then(function (report){
        $ionicPopup.alert({
          template: 'Match Report has been submitted'
        });
        $state.go('latest');
      });
    }
  }
};
