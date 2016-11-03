
angular.module('BattleZone')

  .controller('ladderStandingsCtrl', ladderStandingsCtrl);

function ladderStandingsCtrl($scope, $stateParams, playerServices) {
  $scope.players = {};
  playerServices.getPlayers($stateParams.id).then(function (players) {
    $scope.players = players;
  });
};
