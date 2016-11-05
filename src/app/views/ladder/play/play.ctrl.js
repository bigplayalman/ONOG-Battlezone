angular.module('BattleZone')

  .controller('playCtrl', playCtrl);

function playCtrl(
  $scope, $state, $stateParams, $ionicPopup, $timeout, $cordovaClipboard,
  tournamentServices, matchServices, playerServices, userServices, ladderParse
) {

  $scope.ladder = new ladderParse.model();
  $scope.ladder.id = $stateParams.id;
  $scope.current = playerServices.current;
  $scope.ladder.fetch().then(function (ladder) {
    $scope.ladder = ladder;
    $scope.user = userServices.user;

    if(!$scope.current.player.id) {
      playerServices.fetchPlayer($scope.user.current, $scope.ladder).then(function (player) {
        $scope.current.player = player;
        getLatestMatch();
      });
    } else {
      getLatestMatch();
    }
  });



  $scope.recordMatch = function (result) {
    $state.go('match.result', {id: $scope.match.id, result: result});
  }

  $scope.copyId = function () {
    $cordovaClipboard.copy($scope.match.opponent.battleNetId).then(function () {
      $ionicPopup.alert({title:'ID Copied'});
    });
  }

  $scope.cancelMatch = function () {
    $scope.match.set('status', 'cancelled');
    $scope.match.save().then(function () {
      $state.go('latest');
    });
  }

  $scope.noShow = function () {
    if(moment().isAfter(moment($scope.match.get('createdAt')).add(5, 'minutes'))) {
      $state.go('match.noShow', {id: $scope.match.id});
    } else {
      $ionicPopup.alert({title:'Please wait 5 minutes before reporting no show.'});
    }
  }

  function getLatestMatch() {
    matchServices.getLatestMatch($scope.ladder, $scope.current.player).then(function (match) {
      if(match) {
        $scope.match = match;
        if(!$scope.match.opponent) {
          findOpponent();
        }
      } else {
        matchServices.createMatch($scope.ladder, $scope.current.player).then(function (match) {
          $scope.match = match;
          findOpponent();
        });
      }
    });
  }

  function findOpponent() {
    matchServices.findOpponent($scope.match, $scope.ladder).then(function (found) {
      if(!found) {
        $timeout(findOpponent, 15000);
      }
    });
  }
};
