
angular.module('BattleZone')

  .controller('ladderStandingsCtrl', ladderStandingsCtrl);

function ladderStandingsCtrl($scope, $stateParams, ladderServices) {
  $scope.ladder = {};
  ladderServices.getLadder($stateParams.id).then(function (ladder) {
    $scope.ladder = ladder.toJSON();
  });
};
