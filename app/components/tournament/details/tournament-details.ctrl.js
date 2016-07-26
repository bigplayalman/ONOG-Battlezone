
angular.module('BattleZone')

  .controller('tournamentDetailsCtrl', tournamentDetailsCtrl);

function tournamentDetailsCtrl($scope, $stateParams, tournamentServices, $ionicPopup) {
  tournamentServices.getTournament($stateParams.id).then(function (tourney) {
    $scope.tournament = tourney.toJSON();
    console.log($scope.tournament);
  });

  $scope.save = function () {
    tournamentServices.saveTournament($scope.tournament).then(function () {
      $ionicPopup.alert({title:'Tournament Updated'});
    })
  }
};
