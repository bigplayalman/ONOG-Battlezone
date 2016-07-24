
angular.module('BattleZone')

  .controller('createCtrl', createCtrl);

function createCtrl($scope, tournamentConstants) {
  $scope.tournament = tournamentConstants().tournament;
  $scope.new = {
    name: null,
    date: null,
    game: $scope.tournament.games[0],
    type: $scope.tournament.types[0]
  };

  $scope.tournamentDetails = function () {
    console.log($scope.new);
  }

  $scope.validate = function (params) {
    if(!params.name) {
      return true;
    }
    if(!params.date) {
      return true;
    }
    return false;
  }
};
