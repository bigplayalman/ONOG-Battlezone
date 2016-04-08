
angular.module('ONOG.Controllers')

  .controller('MatchViewCtrl', MatchViewCtrl);

MatchViewCtrl.$inject = ['$scope', '$state', '$timeout', '$ionicPopup', '$ionicHistory', 'match', 'Parse', 'LadderServices', 'MatchServices', 'QueueServices'];
function MatchViewCtrl($scope, $state, $timeout, $ionicPopup, $ionicHistory, match, Parse, LadderServices, MatchServices, QueueServices) {
  console.log(match);
  $scope.count = 0;
  $scope.user = Parse.User.current();
  $scope.match = match;
  $scope.opponent = {
    hero: null,
    battleTag: null
  }
  if($scope.match.player1.id === $scope.user.id) {
    $scope.opponent.hero = $scope.match.hero2;
    $scope.opponent.username = $scope.match.username2;
    $scope.opponent.battleTag = $scope.match.battleTag2;
    $scope.opponent.user = $scope.match.player2;
  }
  if($scope.match.player2.id === $scope.user.id) {
    $scope.opponent.hero = $scope.match.hero1;
    $scope.opponent.username = $scope.match.username1;
    $scope.opponent.battleTag = $scope.match.battleTag1;
    $scope.opponent.user = $scope.match.player1;
  }
  opponentFound();

  $scope.record = function (record) {
    MatchServices.getMatch().then(function (matches) {
      if(matches.length) {
        var match = matches[0];
        if(match.get('status') === 'active') {
          switch (record) {
            case 'win':
              match.set('winner', $scope.user);
              match.set('loser', $scope.opponent.user);
              break;
            case 'loss':
              match.set('winner', $scope.opponent.user);
              match.set('loser', $scope.user);
              break;
          }
          match.set('status', 'completed');
          match.save().then(function () {
            $ionicPopup.alert({
              title: 'Match Submitted',
              template: '<div class="text-center">Thank you for submitting results</div>'
            }).then(function (res) {
              $ionicHistory.nextViewOptions({
                disableBack: true
              });
              $state.go('app.dashboard');
            });
          })
        }
      } else {
        $ionicPopup.alert({
          title: 'Match Error',
          template: '<div class="text-center">Your Opponent has already updated results!</div>'
        }).then(function(res) {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go('app.dashboard');
        });
      }

    });
  }
  function opponentFound() {
    QueueServices.opponentHasConfirmed($scope.opponent.user).then(function (queue) {
      if(queue.length) {
        $scope.noOpponent = true;
        if($scope.count < 2) {
          $scope.count++;
        } else {
          queue[0].destroy().then(function () {
            $scope.match.destroy().then(function () {
              $ionicPopup.alert({
                title: 'Match Error',
                template: '<div class="text-center">Your Opponent never confirmed!</div>'
              }).then(function(res) {
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                $state.go('app.dashboard');
              });
            });
          });
        }
      } else {
        $scope.noOpponent = false;
        return;
      }
      $timeout(opponentFound, 15000);
    });
  }
}
