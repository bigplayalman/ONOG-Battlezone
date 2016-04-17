
angular.module('ONOG.Controllers')

  .controller('LeaderBoardsCtrl', LeaderBoardsCtrl);

function LeaderBoardsCtrl($scope, LadderServices, tournament, Parse, $filter, $ionicPopup) {
  $scope.user = Parse.User;
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
