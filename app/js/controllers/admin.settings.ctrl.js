
angular.module('ONOG.Controllers')

  .controller('AdminSettingsCtrl', AdminSettingsCtrl);

AdminSettingsCtrl.$inject = ['$scope', 'TournamentServices', 'newTournament'];

function AdminSettingsCtrl($scope, TournamentServices, newTournament) {
  $scope.tournament = newTournament;
  
  TournamentServices.getLadder($scope.tournament.tournament).then(function (ladder) {
    $scope.ladder = ladder;
  });
  
}
