
angular.module('ONOG.Controllers')

  .controller('LeaderBoardsCtrl', LeaderBoardsCtrl);

LeaderBoardsCtrl.$inject = ['$scope', 'LadderServices', 'tournament', 'Parse', '$filter', '$ionicPopup'];
function LeaderBoardsCtrl($scope, LadderServices, tournament, Parse, $filter, $ionicPopup) {
  $scope.user = Parse.User;
  LadderServices.getPlayers(tournament[0].tournament).then(function (players) {
    var rank = 1;
    angular.forEach(players, function (player) {
      player.rank = rank;
      rank++;
    });
    $scope.players = players;
  });

  $scope.showDetails = function (player) {
    $scope.heroes = player.heroes;
    $ionicPopup.alert({
      title: player.username + ' Heroes',
      scope: $scope,
      template:
        '<div class="row">' +
        '<div class="col text-center" ng-repeat="hero in heroes">' +
        '<img ng-src="img/icons/{{hero}}.png" class="responsive-img">{{hero}}' +
        '</div>' +
        '</div>'
    });
  }
}
