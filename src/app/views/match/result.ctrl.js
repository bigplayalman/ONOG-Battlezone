angular.module('BattleZone')

  .controller('matchResultCtrl', matchResultCtrl);

function matchResultCtrl($scope, $state, $stateParams, matchParse, matchServices, cameraServices, $ionicPopup) {
  $scope.match = new matchParse.model();
  $scope.match.id = $stateParams.id;
  $scope.result = $stateParams.result === 'true';

  $scope.match.fetch().then(function () {
    if(!$scope.result && $scope.match.status == 'active') {
      matchServices.recordMatch(null, $scope.match);
    }

  });

  $scope.addScreenshot = function () {
    if(cameraServices.camera) {
      var options = cameraServices.camera;
      navigator.camera.getPicture(onSuccess,onFail,options);
    }
  }

  function onSuccess(imageData) {
    $scope.image = imageData;
    var parseFile = new Parse.File('win.png', {base64:imageData});
    $scope.match.image = parseFile;
    $scope.$apply();
  };
  function onFail(e) {
    $ionicPopup.alert({
      template: 'An Error has occurred, try again later'
    });
  };

  $scope.submitWin = function () {
    if($scope.match.image) {
      $scope.match.save().then(function (match) {
        matchServices.recordMatch($scope.result, match).then(function () {
          $ionicPopup.alert({
            template: 'Match Results has been submitted'
          });
          $state.go('latest');
        })
      })
    }
  }
};
