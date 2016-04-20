angular.module('ONOG')
  .controller('LeaderBoardCtrl', LeaderBoardCtrl);

function LeaderBoardCtrl($scope, LadderServices, tournament) {
  
  getPlayers();
  
  $scope.doRefresh = function () {
    getPlayers();
  }
  
  function getPlayers() {
    LadderServices.getPlayers(tournament.tournament).then(function (players) {
      var rank = 1;
      angular.forEach(players, function (player) {
        player.rank = rank;
        rank++;
      });
      $scope.players = players;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
};
