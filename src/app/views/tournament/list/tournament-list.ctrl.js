
angular.module('BattleZone')

  .controller('tournamentListCtrl', tournamentListCtrl);

function tournamentListCtrl($scope, $state, tournamentServices, $ionicPopup, playerServices) {

  $scope.tournaments = {};
  $scope.players = [];
  $scope.input = {
    id: null
  }

  getActive();


  function getActive() {
    tournamentServices.getActiveTournaments().then(function (tournaments) {
      playerServices.fetchPlayer().then(function (players) {
        $scope.tournaments = tournaments;
        $scope.players = players;
      });

    });
  }
};
