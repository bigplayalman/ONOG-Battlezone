
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$scope', 'Parse', 'LadderServices', 'tournament', '$interval'];
function DashboardCtrl($scope, Parse, LadderServices, tournament, $interval) {
  var promise;
  
  $scope.tournament = tournament[0].tournament;
  $scope.user = Parse.User;
  $scope.opponent = LadderServices.opponent;
  
  LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
    if(players.length) {
      $scope.player = players[0];
      $scope.myOpponent = {name:'PAX Attendee'};
    }
  })
  
  $scope.stop = function() {
    $scope.opponent.search = false;
    $interval.cancel(promise);
  };

  $scope.startSearch = function() {
    $scope.stop();
    $scope.opponent.search = true;
    promise = $interval(function () {changeWord()}, 2000);
  };
  
  $scope.$on('$destroy', function() {
    $scope.stop();
  });

  function changeWord () {
    $scope.myOpponent.name = $scope.opponents[Math.floor(Math.random()*$scope.opponents.length)];

  }
}
