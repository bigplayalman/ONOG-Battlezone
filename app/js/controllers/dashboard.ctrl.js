
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$scope', 'Parse', 'LadderServices', 'tournament'];
function DashboardCtrl($scope, Parse, LadderServices, tournament) {
  $scope.tournament = tournament[0].tournament;
  $scope.user = Parse.User;
  LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
    if(players.length) {
      $scope.player = players[0];
    }
  })
}
