
angular.module('ONOG.Controllers')

  .controller('MatchListCtrl', MatchListCtrl);

MatchListCtrl.$inject = [
  '$scope', '$state', '$ionicPopup', '$rootScope', 'Parse', 'MatchServices', 'player'
];
function MatchListCtrl(
  $scope, $state, $ionicPopup, $rootScope, Parse, MatchServices, player
) {
  $scope.matches = [];
  $scope.player = player[0];

  if($scope.player) {
    $rootScope.$broadcast('show:loading');
    MatchServices.getPlayerMatches($scope.player, 'completed').then(function (matches) {
      console.log('matches fetched');
      $scope.matches = matches;
      MatchServices.getPlayerMatches($scope.player, 'reported').then(function (reported) {
        $scope.reported = reported;
        $rootScope.$broadcast('hide:loading');
      });
    });

  }

  $scope.processMatch = function (match) {
    if(match.winner.id === $scope.player.id) {
      return;
    }
    if(match.loser.id === $scope.player.id) {
      if(match.reportReason){
        return;
      }
    }
    if($scope.reported.length) {
      showReported();
      return;
    }
    $state.go('app.match.report', {id: match.id});
  }

  function showReported() {
    $ionicPopup.alert({
      title: 'Too Many Reports',
      template: '<div class="text-center">You have too many pending reports. Please wait.</div>'
    }).then(function () {

    })
  }
};
