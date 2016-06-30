
angular.module('BattleZone')

  .controller('AdminMatchCtrl', AdminMatchCtrl);

function AdminMatchCtrl($scope, Parse, MatchServices, match, $ionicPopup) {
  $scope.match = match;
  console.log($scope.match);

  $scope.showDate = function (date) {
    return moment(date).format('MM/DD hh:mm A');
  }
  $scope.changeWinner = function () {
    $ionicPopup.show(
      {
        templateUrl:'templates/popups/change.match.html',
        title: 'Confirm',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function(e) {
              if(!$scope.match.adminNote) {
                e.preventDefault();
              }
              return true;
            }
          }
        ]
      }).then(function (res) {
      if(res) {
        var winner = $scope.match.winner;
        var loser = $scope.match.loser;
        var winPoints = winner.get('points') - 450;
        var losePoints = loser.get('points') + 450;
        var winCount = winner.get('wins') - 1;
        var loseCount = loser.get('losses') - 1;
        winner.set('points', winPoints);
        loser.set('points', losePoints);
        winner.set('wins', winCount);
        loser.set('losses', loseCount);
        loser.increment('wins');
        winner.increment('losses');
        $scope.match.set('status', 'resolved')
        $scope.match.set('winner', loser);
        $scope.match.set('loser', winner);
        $scope.match.save().then(function () {
          $scope.match = match;
        })
      }
    });
  }
  
  $scope.keepWinner = function () {
    $ionicPopup.show(
      {
        templateUrl:'templates/popups/change.match.html',
        title: 'Confirm',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function(e) {
              if(!$scope.match.adminNote) {
                e.preventDefault();
              }
              return true;
            }
          }
        ]
      }).then(function (res) {
      if(res) {
        $scope.match.set('status', 'resolved')
        $scope.match.save().then(function () {
          $scope.match = match;
        });
      }
    });
  }
};
