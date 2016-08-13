
angular.module('BattleZone')

  .controller('ladderCtrl', ladderCtrl);

function ladderCtrl($scope, $stateParams, playerServices) {
  $scope.players = {};
  playerServices.getPlayers($stateParams.id).then(function (players) {
    $scope.players = players;
  });
};
