
angular.module('BattleZone')

  .controller('tournamentJoinCtrl', tournamentJoinCtrl);

function tournamentJoinCtrl($scope, $state, tournamentServices, $ionicPopup, playerServices) {
  $scope.tournaments = {};
  $scope.players = [];
  $scope.input = {
    id: null
  }

  getActive();


  $scope.tournamentRegister = function (tournament) {
    registerPopup().then(function (input) {
      playerServices.registerPlayer(input, tournament).then(function (player) {
        $ionicPopup.alert({
          title: 'Player Registered'
        }).then(function () {
          tournamentDetails(tournament);
        })
      });
    });
  }

  $scope.showButton = function (tournament) {
    var show = {param: true};
    if($scope.players.length) {
      for(var i = 0; i < $scope.players.length; i ++) {
        if(tournament.id === $scope.players[i].get('tournament').id) {
          show.param = false;
        }
      }
    }
    return show;
  }

  function getActive() {
    tournamentServices.getActiveTournaments().then(function (tournaments) {
      $scope.tournaments = tournaments;
    });
    playerServices.fetchPlayer().then(function (players) {
      $scope.players = players;
    });
  }

  function tournamentDetails(tournament) {
    switch(tournament.type) {
      case 'ladder': $state.go('ladder.standings', {id: tournament.id}); break;
    }

  }

  function registerPopup() {
    return $ionicPopup.show({
      templateUrl: 'tournament/join/register-popup.html',
      title: 'Please enter your in-game id',
      scope: $scope,
      buttons: [
        {
          text: 'Cancel'
        },
        {
          text: 'Submit',
          type: 'button-positive',
          onTap: function() {
            return $scope.input.id;
          }
        }
      ]
    })
  }
};
