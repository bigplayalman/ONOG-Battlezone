
angular.module('BattleZone')

  .controller('tournamentJoinCtrl', tournamentJoinCtrl);

function tournamentJoinCtrl($scope, tournamentServices) {
  $scope.tournaments = {};
  tournamentServices.getTournaments().then(function (tournaments) {
    $scope.tournaments = tournaments;
  });
};
