
angular.module('BattleZone')

  .controller('ladderStandingsCtrl', ladderStandingsCtrl);

function ladderStandingsCtrl($scope, $stateParams, playerServices, ladderServices) {
  $scope.players = {};

  ladderServices.getLadder($stateParams.id).then(function(ladder) {
    $scope.ladder = ladder;
    return playerServices.getPlayers(ladder).then(function (players) {
      $scope.players = players;
    });
  });


};
