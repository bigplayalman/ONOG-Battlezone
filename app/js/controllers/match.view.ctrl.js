
angular.module('ONOG.Controllers')

  .controller('MatchViewCtrl', MatchViewCtrl);

MatchViewCtrl.$inject = [
  '$scope', '$state', '$timeout', '$ionicPopup', '$ionicHistory', 'Parse', 'LadderServices', 'MatchServices', 'QueueServices', 'tournament', 'match'
];
function MatchViewCtrl($scope, $state, $timeout, $ionicPopup, $ionicHistory, Parse, LadderServices, MatchServices, QueueServices, tournament, match) {
  $scope.count = 0;
  $scope.match = match[0];
  $scope.tournament = tournament[0].tournament;
  $scope.user = Parse.User;
  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  if(window.ParsePushPlugin){
    ParsePushPlugin.on('receivePN', function(pn){
      if(pn.title) {
        switch (pn.title) {
          case 'match:results':
            showResultsPopup();
            break;
        }
      }
    });
  }

  LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
    $scope.player = players[0];
    if ($scope.player) {
      getMatchDetails();
    }
  });
  function showResultsPopup() {
    $ionicPopup.alert({
      title: 'Match Results',
      template: '<div class="text-center">Your Opponent has updated the results!</div>'
    }).then(function(res) {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $scope.player.set('status', 'open');
      $scope.player.save().then(function () {
        $state.go('app.dashboard');
      });
    });
  }

  $scope.record = function (record) {
    MatchServices.getMatch('active').then(function (matches) {
      var username = null;
      if(matches.length) {
        var match = matches[0];
        switch (record) {
          case 'win':
            match.set('winner', $scope.user.current());
            match.set('loser', $scope.opponent.user);
            username = $scope.opponent.username
            break;
          case 'loss':
            match.set('winner', $scope.opponent.user);
            match.set('loser', $scope.user.current());
            username = $scope.user.current().username
            break;
        }
        match.set('status', 'completed');
        match.save().then(function () {
          $scope.player.set('status', 'open');
          $scope.player.save().then(function () {
            $ionicPopup.alert({
              title: 'Match Submitted',
              template: '<div class="text-center">Thank you for submitting results</div>'
            }).then(function (res) {
              Parse.Cloud.run('matchResults', {username: username}).then(function (results) {
                console.log(results);
                $state.go('app.dashboard');
              });
            });
          });
        });
      }
    });
  };

  function getMatchDetails() {
    $scope.opponent = {
      hero: null,
      battleTag: null
    }
    if($scope.player.player === 'player1') {
      $scope.opponent.hero = $scope.match.hero2;
      $scope.opponent.username = $scope.match.username2;
      $scope.opponent.battleTag = $scope.match.battleTag2;
      $scope.opponent.user = $scope.match.user2;
    }
    if($scope.player.player === 'player2') {
      $scope.opponent.hero = $scope.match.hero1;
      $scope.opponent.username = $scope.match.username1;
      $scope.opponent.battleTag = $scope.match.battleTag1;
      $scope.opponent.user = $scope.match.user1;
    }
  }
};
