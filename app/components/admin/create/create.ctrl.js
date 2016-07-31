
angular.module('BattleZone')

  .controller('createCtrl', createCtrl);

function createCtrl($scope, $state, $ionicHistory, tournamentConstants, tournamentServices) {
  $scope.tournament = tournamentConstants().tournament;
  $scope.new = {
    name: null,
    date: null,
    game: $scope.tournament.games[0],
    type: $scope.tournament.types[0]
  };

  $scope.tournamentDetails = function () {
    var tournament = {
      name: $scope.new.name,
      date: $scope.new.date,
      game: $scope.new.game.id,
      type: $scope.new.type.id
    }
    tournamentServices.createTournament(tournament).then(function (tourney) {
      $ionicHistory.nextViewOptions({disableBack: true});
      var path = $scope.new.type.id + '.details';
      $state.go(path, {id: tourney.id});
    });
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
