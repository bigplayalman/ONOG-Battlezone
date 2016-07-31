
angular.module('BattleZone')

  .controller('tournamentJoinCtrl', tournamentJoinCtrl);

function tournamentJoinCtrl($scope, tournamentServices) {
  $scope.tournaments = {};
  tournamentServices.getActiveTournaments().then(function (tournaments) {
    $scope.tournaments = tournaments;
  });

  $scope.tournamentRegister = function () {

  }
};
