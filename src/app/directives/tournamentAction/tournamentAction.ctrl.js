
angular.module('BattleZone')

  .controller('tournamentActionCtrl', tournamentActionCtrl);

function tournamentActionCtrl($scope, $state, Parse, $ionicPopup, playerServices) {
  $scope.options = {
    text: 'LOGIN',
    class: 'button-positive',
    action: 'login'
  }

  if(Parse.User.current()) {

    $scope.options.text = 'JOIN';
    $scope.options.action = 'join';

    angular.forEach($scope.players, function(player) {
      if(tournament.id === player.get('tournament').id) {
        $scope.options.text = 'PLAY';
        $scope.options.action = 'play';
      }
    });
  }

  $scope.process = function(action) {
    switch (action) {
      case 'login': $state.go('login'); break;
      case 'play': $state.go('play', {id: $scope.tournament.id}); break;
      case 'join': tournamentRegister(); break;
    }
  }

  function tournamentRegister () {
    registerPopup().then(function (input) {
      playerServices.registerPlayer(input, $scope.tournament).then(function (player) {
        $ionicPopup.alert({
          title: 'Player Registered'
        }).then(function () {
          tournamentDetails();
        })
      });
    });
  }

  function tournamentDetails() {
    switch($scope.tournament.type) {
      case 'ladder': $state.go('standings', {id: $scope.tournament.id}); break;
    }
  }

  function registerPopup() {
    return $ionicPopup.show({
      templateUrl: 'directives/tournamentAction/register-popup.html',
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
