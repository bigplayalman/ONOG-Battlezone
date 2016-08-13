
angular.module('BattleZone')

  .controller('tournamentActionCtrl', tournamentActionCtrl);

function tournamentActionCtrl($scope, $state, Parse, $ionicPopup, playerServices, userServices) {
  $scope.options = {
    text: 'LOGIN',
    class: 'button-positive button-small full-width',
    action: 'join'
  }
  $scope.input = {
    battleNetId: null
  }

  if(Parse.User.current()) {
    $scope.options.text = 'JOIN';
    angular.forEach($scope.players, function(player) {
      if($scope.tournament.id === player.get('tournament').id) {
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
    $state.go('tournament.play', {id: $scope.tournament.id});
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
      if(input) {
        playerServices.registerPlayer(input, $scope.tournament).then(function (player) {
          $ionicPopup.alert({
            title: 'Player Registered'
          }).then(function () {
            $scope.input.id = null;
            tournamentDetails();
          });
        });
      }
    });
  }

  function tournamentDetails() {
    switch($scope.tournament.type) {
      case 'ladder': $state.go('tournament.ladder', {id: $scope.tournament.id}); break;
    }
  }

  function registerPopup() {
    return $ionicPopup.show({
      templateUrl: 'directives/tournament-action/register.popup.html',
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
            var player = $scope.input;
            switch($scope.tournament.type) {
              case 'ladder': player.points = 0; player.wins = 0; player.losses = 0; break;
            }
            return player;
          }
        }
      ]
    })
  }

};
