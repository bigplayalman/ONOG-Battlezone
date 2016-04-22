
angular.module('ONOG.Controllers')

  .controller('LeaderBoardsCtrl', LeaderBoardsCtrl);

function LeaderBoardsCtrl($scope, LadderServices, tournament, Parse, $rootScope) {
  $scope.user = Parse.User;
  getPlayers();
  $scope.doRefresh = function () {
    getPlayers();
  };
  
  function getPlayers() {
    $rootScope.$broadcast('show:loading');
    LadderServices.getPlayers(tournament.tournament).then(function (players) {
      var rank = 1;
      angular.forEach(players, function (player) {
        player.rank = rank;
        rank++;
      });
      $scope.players = players;
      $rootScope.$broadcast('hide:loading');
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
}
