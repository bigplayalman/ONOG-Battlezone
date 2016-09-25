angular.module('BattleZone')

  .controller('playCtrl', playCtrl);

function playCtrl($scope, $stateParams, tournamentServices, matchServices, playerServices) {
  var id = $stateParams.id;
  $scope.player = playerServices.current;

  matchServices.getLatestMatch(id, $scope.player).then(function (matches) {
    if(matches.length) {
      $scope.match = matches[0];
      console.log('match found', $scope.match);
    } else {
      matchServices.createMatch(id, $scope.player).then(function (match) {
        $scope.match = match;
        console.log('new match', $scope.match);
      });
    }
  });
};
