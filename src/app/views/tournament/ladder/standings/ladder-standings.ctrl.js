
angular.module('BattleZone')

  .controller('ladderStandingsCtrl', ladderStandingsCtrl);

function ladderStandingsCtrl($scope, $stateParams, ladderServices) {
  $scope.players = {};
  ladderServices.getStandings($stateParams.id).then(function (players) {
    $scope.players = players;
  });
};
