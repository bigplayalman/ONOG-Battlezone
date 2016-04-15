
angular.module('ONOG.Controllers')

  .controller('MatchViewCtrl', MatchViewCtrl);

MatchViewCtrl.$inject = [
  '$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory',
  'Parse', 'LadderServices', 'MatchServices', 'QueueServices',
  'tournament', 'match', 'player'
];
function MatchViewCtrl(
  $scope, $state, $rootScope, $ionicPopup, $ionicHistory,
  Parse, LadderServices, MatchServices, QueueServices,
  tournament, match, player
) {
  $scope.match = match[0];
  $scope.tournament = tournament[0].tournament;
  $scope.player = player[0];
  $scope.user = Parse.User;
  $scope.end = {
    time: 0
  };


  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  
  if(window.ParsePushPlugin) {
    ParsePushPlugin.on('receivePN', function(pn){
      if(pn.title) {
        switch (pn.title) {
          case 'Opponent Found': 
            getMatch();
            break;
          case 'Opponent Confirmed':
            getMatch();
            break;
          case 'Results Entered':
            getMatch();
            break;
        }
      }
    });
  }

  $scope.record = function (record) {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      var username = null;
      $scope.match = matches[0];
      if($scope.match.get('status') === 'active') {
        switch (record) {
          case 'win':
            winMatch().then(function(res) {
              console.log(res);
              if(res) {
                $scope.match.set('winner', $scope.player);
                $scope.match.set('loser', $scope.opponent.user);
                username = $scope.opponent.username
                recordMatch($scope.match, username);
              }
            })
            break;
          case 'loss':
            loseMatch().then(function(res) {
              console.log(res);
              if(res) {
                $scope.match.set('winner', $scope.opponent.user);
                $scope.match.set('loser', $scope.player);
                username = $scope.opponent.username;
                recordMatch($scope.match, username);
              }
            });
            break;
        }
      }
    });
  };
  
  getMatchDetails();
  

  function loseMatch() {
    return $ionicPopup.show(
      {
        templateUrl: 'templates/popups/lose.match.html',
        title: 'Report a Loss',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function(e) {
              return true;
            }
          }
        ]
      });
  }
  
  function getMatch() {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      $scope.match = matches[0];
    })
  }

  function recordMatch(match, username) {

    match.set('status', 'completed');
    match.save().then(function (match) {
      $rootScope.$broadcast('show:loading');
      Parse.Cloud.run('matchResults', {username: username, match: match.id}).then(function (results) {
        $rootScope.$broadcast('hide:loading');
        $ionicPopup.alert({
          title: 'Match Submitted',
          template: '<div class="text-center">Thank you for submitting results</div>'
        }).then(function (res) {
          $state.go('app.dashboard');
        });
      });
    });
  }

  function winMatch () {
    $scope.image = null;

    return $ionicPopup.show(
      {
        templateUrl: 'templates/popups/win.match.html',
        title: 'Report a Win',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function(e) {
              if (!$scope.image) {
                e.preventDefault();
              } else {
                return $scope.image;
              }
            }
          }
        ]
      });
  }

  function getMatchDetails() {
    $scope.opponent = {
      hero: null,
      battleTag: null
    }
    if($scope.player.player === 'player1') {
      $scope.opponent.hero = $scope.match.hero2;
      $scope.opponent.username = $scope.match.username2;
      $scope.opponent.battleTag = $scope.match.battleTag2;
      $scope.opponent.user = $scope.match.player2;
    }
    if($scope.player.player === 'player2') {
      $scope.opponent.hero = $scope.match.hero1;
      $scope.opponent.username = $scope.match.username1;
      $scope.opponent.battleTag = $scope.match.battleTag1;
      $scope.opponent.user = $scope.match.player1;
    }
  }
};
