
angular.module('BattleZone')

  .controller('ladderDetailsCtrl', ladderDetailsCtrl);

function ladderDetailsCtrl($scope, $stateParams, ladderServices, $ionicPopup, tournamentConstants) {
  $scope.ladder = {};
  $scope.tournament = tournamentConstants().tournament;
  ladderServices.getLadder($stateParams.id).then(function (ladder) {
    $scope.ladder = ladder;
  });

  $scope.save = function () {
    ladderServices.saveLadder($scope.ladder).then(function () {
      $ionicPopup.alert({title:'Ladder Updated'});
    });
  }
};
