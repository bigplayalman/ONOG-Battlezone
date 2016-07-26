
angular.module('BattleZone')

  .controller('ladderDetailsCtrl', ladderDetailsCtrl);

function ladderDetailsCtrl($scope, $stateParams, ladderServices, $ionicPopup) {
  ladderServices.getLadder($stateParams.id).then(function (ladder) {
    $scope.ladder = ladder.toJSON();
    console.log($scope.ladder);
  });

  $scope.save = function () {
    ladderServices.saveLadder($scope.ladder).then(function () {
      $ionicPopup.alert({title:'Ladder Updated'});
    })
  }
};
