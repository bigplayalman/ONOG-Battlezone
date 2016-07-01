
angular.module('BattleZone')

  .controller('AdminPlayersCtrl', AdminPlayersCtrl);

function AdminPlayersCtrl($scope, Parse, LadderServices) {
  $scope.search = {
    input: null
  }
  
  $scope.searchPlayer = function () {
    LadderServices.searchPlayers($scope.search.input).then(function (players) {
      $scope.players = players;
    });
  }
};
