
angular.module('BattleZone')

  .controller('settingsCtrl', settingsCtrl);

function settingsCtrl($scope, $state, $ionicHistory, ladderServices, $ionicPopup) {
  $scope.settings = {};
  $scope.ladder = {};

  ladderServices.getLadderSettings().then(function (settings) {
    $scope.settings = settings;
    ladderServices.getCurrentLadder().then(function (ladder) {
      $scope.ladder = ladder;
    });
  });

  $scope.startLadder = function () {
    ladderServices.createNewLadder().then(function (ladder) {
      $scope.ladder = ladder;
      $ionicPopup.alert({title: 'Ladder Created'});
    });
  }

  $scope.endLadder = function () {
    $scope.ladder.set('active', false);
    $scope.ladder.save().then(function(ladder) {
      $scope.ladder = ladder;
      $ionicPopup.alert({title: 'Ladder Ended'});
    });
  }

  $scope.saveSettings = function () {
    $scope.settings.save().then(function (settings) {
      $scope.settings = settings;
      $ionicPopup.alert({title: 'Settings Saved'});
    });
  }

};
