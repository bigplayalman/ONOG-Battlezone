angular.module('BattleZone')

  .controller('playCtrl', playCtrl);

function playCtrl(
  $scope, $state, $stateParams, $ionicPopup, $timeout, $cordovaClipboard, $ionicPopover,
  tournamentServices, matchServices, playerServices, userServices
) {
  $scope.id = $stateParams.id;
  $scope.current = playerServices.current;
  $scope.user = userServices.user;

  if(!$scope.current.player) {
    playerServices.fetchPlayer().then(function () {
      getLatestMatch();
    });
  } else {
    getLatestMatch();
  }

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
      $state.go('tournament.list');
    });
  }

  function getLatestMatch() {
    matchServices.getLatestMatch($scope.id, $scope.current.player).then(function (matches) {
      if(matches.length) {
        $scope.match = matches[0];
        console.log('match found', $scope.match);
        if(!$scope.match.opponent) {
          findOpponent();
        }
      } else {
        matchServices.createMatch($scope.id, $scope.current.player).then(function (match) {
          $scope.match = match;
          console.log('new match', $scope.match);
          findOpponent();
        });
      }
    });
  }

  function findOpponent() {
    if($scope.user.current) {
      matchServices.findOpponent($scope.match).then(function (found) {
        console.log(found);
        if(found) {

        } else {
          $timeout(findOpponent, 15000);
        }
      });
    }
  }
};
