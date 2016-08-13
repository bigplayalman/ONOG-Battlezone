
angular.module('BattleZone')

  .controller('tournamentActionCtrl', tournamentActionCtrl);

function tournamentActionCtrl($scope, $state, Parse, $ionicPopup, playerServices, userServices) {
  $scope.options = {
    text: 'JOIN',
    class: 'button-positive',
    action: 'join'
  }

  if(Parse.User.current()) {

    angular.forEach($scope.players, function(player) {
      if(tournament.id === player.get('tournament').id) {
        $scope.options.text = 'PLAY';
        $scope.options.action = 'play';
      }
    });
  }

  $scope.process = function(action) {
    switch (action) {
      case 'play': tournamentPlay(); break;
      case 'join': tournamentRegister(); break;
    }
  }

  function tournamentPlay () {
    $state.go('play', {id: $scope.tournament.id});
  }

  function tournamentRegister () {
    var user = Parse.User.current();

    if(user) {
      registerPlayer();
    } else {
      userServices.state.last = $state.current.name;
      $state.go('login');
    }
  }

  function registerPlayer() {
    registerPopup().then(function (input) {
      playerServices.registerPlayer(input, $scope.tournament).then(function (player) {
        $ionicPopup.alert({
          title: 'Player Registered'
        }).then(function () {
          tournamentDetails();
        });
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
