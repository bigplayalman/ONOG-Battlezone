
angular.module('BattleZone')

  .controller('tournamentActionCtrl', tournamentActionCtrl);

function tournamentActionCtrl($scope, $state, $ionicPopup, ladderServices, playerServices, userServices, matchServices) {

  $scope.user = userServices.user;
  $scope.match = null;
  $scope.player = null;

  $scope.options = {
    text: 'LOGIN',
    class: 'button-clear button-light full-width',
    action: 'login'
  }

  $scope.input = {
    battleNet: null
}

  if($scope.user.current) {
    $scope.options.text = 'JOIN';
    $scope.options.action = 'join';

    ladderServices.getLadderStatus().then(function (disabled) {
      if(disabled) {
        $scope.options.text = 'UNAVAILABLE';
        $scope.options.action = 'unavailable';
        return;
      }

      return ladderServices.getActiveLadder().then(function (ladder) {
        if (ladder) {
          $scope.ladder = ladder;
          return playerServices.fetchPlayer($scope.user.current, ladder).then(function (player) {
            if (player) {
              $scope.player = player;
              $scope.options.text = 'PLAY';
              $scope.options.action = 'play';
              matchServices.fetchLatestMatch(player).then(function (matches) {
                if (matches.length && matches[0].status == 'active') {
                  $scope.match = matches[0];
                  $scope.options.text = 'Match Details';
                  $scope.options.action = 'match';
                }
              });
            }
          });
        } else {
          $scope.options.text = 'UNAVAILABLE';
          $scope.options.action = 'unavailable';
        }
      });
    });
  }

  $scope.process = function(action) {
    switch (action) {
      case 'play': $state.go('ladder.play'); break;
      case 'login': $state.go('login'); break;
      case 'join': register(); break;
      case 'match': $state.go('match.details', {id: $scope.match.id}); break;
      case 'unavailable': break;
    }
  }

  function register () {
    if($scope.user.current.get('battleTag')) {
      return playerServices.registerPlayer($scope.user.current.get('battleTag')).then(function (player) {
        $ionicPopup.alert({title: 'Player Registered'});
      });
    } else {
      return registerPopup().then(function (battleNet) {
        if(battleNet) {
          $scope.user.current.set('battleTag', battleNet);
          return $scope.user.current.save().then(function (user) {
            $scope.user.current = user;
            return playerServices.registerPlayer($scope.user.current.get('battleTag')).then(function (player) {
              if(player) {
                $scope.options.text = 'PLAY';
                $scope.options.action = 'play';
                $ionicPopup.alert({title: 'Player Registered'});
              } else {
                $ionicPopup.alert({title: 'Error! BattleNet Tag used by another player.'});
              }
            });
          });
        }
      });
    }
  }

  function registerPopup() {
    var popup = $ionicPopup.show({
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
          onTap: function(e) {
            e.preventDefault();
            $scope.message = null;
            playerServices.validateTag($scope.input.battleNet).then(function () {
              popup.close($scope.input.battleNet);
            }, function (message) {
              $scope.message = message;
            });
          }
        }
      ]
    });
    return popup;
  }

};
