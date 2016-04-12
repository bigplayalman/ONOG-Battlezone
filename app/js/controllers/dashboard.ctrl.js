
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl',
    [
      '$scope', '$state', '$filter', '$timeout', '$interval', '$ionicPopup',
      'Parse', 'tournament', 'MatchServices', 'QueueServices', 'LadderServices',
      DashboardCtrl
    ]);

function DashboardCtrl(
  $scope, $state, $filter, $timeout, $interval, $ionicPopup,
  Parse, tournament, MatchServices, QueueServices, LadderServices) {

  var promise = null;
  $scope.user = Parse.User;
  $scope.tournament = tournament[0].tournament;
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};

  if(window.ParsePushPlugin) {
    ParsePushPlugin.on('receivePN', function(pn){
      if(pn.title) {
        switch (pn.title) {
          case 'opponent:found': opponentFound(); break;
          case 'opponent:confirmed': opponentConfirmed(); break;
        }
      }
    });
  }
  getCurrentStatus(false);

  $scope.doRefresh = function() {
    getCurrentStatus(true);
  };

  $scope.startQueue = function () {
    var hero = $filter('filter')($scope.heroList, {checked: true}, true);
    if(hero.length) {
      hero[0].checked = false;
    }
    joinQueuePopup().then(function (res) {
      if(res) {
        $scope.player.set('hero', res.text);
        $scope.player.set('status', 'queue');
        savePlayer();
      }
    });
  };

  $scope.cancelQueue = function () {
    $scope.player.set('status', 'open');
    $scope.player.unset('hero');
    $scope.stop();
    savePlayer();
  };

  $scope.stop = function() {
    $interval.cancel(promise);
  };

  $scope.showOpponents = function() {
    $scope.stop();
    promise = $interval(function () {changeWord()}, 2000);
  };

  $scope.$on('$destroy', function() {
    $scope.stop();
  });


  function savePlayer () {
    $scope.player.save().then(function (player) {
      $scope.player = player;
      status();
    });
  }

  function joinQueuePopup () {
    sub();
    $scope.selected = {status: true};
    $scope.selectHero = function (hero) {
      $scope.image = angular.element(document.querySelector('.heroClass'))[0].clientWidth;

      if(hero.checked) {
        hero.checked = !hero.checked;
        $scope.selected.status = true;
        return;
      }

      if(!hero.checked && $scope.selected.status) {
        hero.checked = !hero.checked;
        $scope.selected.status = false;
        return;
      }
    };
    return $ionicPopup.show(
      {
        templateUrl: 'templates/popups/select.hero.html',
        title: 'Select Hero Class',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Queue</b>',
            type: 'button-positive',
            onTap: function(e) {
              var hero = $filter('filter')($scope.heroList, {checked: true}, true);
              if (!hero.length) {
                e.preventDefault();
              } else {
                return hero[0];
              }
            }
          }
        ]
      });
  };

  function status () {
    switch ($scope.player.status) {
      case 'open':
        break;
      case 'queue':
        $scope.showOpponents();
        matchMaking();
        break;
      case 'found':
        playerFound();
        break;
      case 'confirmed':
        waitingForOpponent();
        break;
      case 'noOpponent':
        noOpponent();
        break;
      case 'playing':
        break;
      case 'cancelled':
        playerCancelled();
        break;
    }
  }

  function getCurrentStatus(refresh) {
    var refresh = refresh;
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      if ($scope.player) {
        status();
      }
      if(refresh) {
        $scope.$broadcast('scroll.refreshComplete');
      }
    });
  }

  function matchMaking() {
    $timeout(function () {
      Parse.Cloud.run('matchmaking').then(function (status) {
        if(status) {
          getCurrentStatus(false);
        } else {
          $scope.cancelQueue();
          showEmptyQueue();
        }
      });
    }, 7000);
  }

  function showEmptyQueue() {
    $ionicPopup.alert({
      title: 'Please try again',
      template: '<div class="text-center">No Opponents have been found at this time.</div>'
    });
  }
  function opponentFound() {
    $scope.player.set('status', 'found');
    savePlayer();
  }

  function playerFound() {
    $scope.stop();
    var opponentFound = $ionicPopup.show({
      title: 'Matchmaking',
      template: '<div class="text-center"><strong>A Worthy Opponent</strong><br> has been found!</div>',
      buttons: [
        {
          text: '<b>Cancel</b>',
          type: 'button-assertive',
          onTap: function(e) {
            return false;
          }
        },
        {
          text: '<b>Confirm</b>',
          type: 'button-positive',
          onTap: function(e) {
            return true;
          }
        }
      ]
    })

    opponentFound.then(function(res) {
      if(res) {
        MatchServices.getMatch('pending').then(function (matches) {
          if(matches.length) {
            $scope.player.set('status', 'confirmed');
            if($scope.player.player === 'player1') {
              matches[0].set('confirm1', true);
            } else {
              matches[0].set('confirm2', true);
            }
            matches[0].save().then(function () {
              savePlayer();
            });
          }
        });
      } else {
        playerCancelled();
      }
    });

    $timeout(function () {
      if($scope.player.get('status') !== 'confirmed') {
        playerFound.close(false);
      }
    }, 60000);
  }

  function playerCancelled() {
    if($scope.player.get('cancelTimer')) {
      if(moment($scope.player.get('cancelTimer')).isAfter()) {
        $scope.player.set('status', 'open');
        $scope.player.unset('cancelTimer');
        savePlayer();
      } else {
        startTimer();
      }
    } else {
      var time = moment().add('2', 'minutes').format();
      $scope.player.set('status', 'cancelled');
      $scope.player.set('cancelTimer', time);
      savePlayer();
    }
  }

  function startTimer() {
    //TODO do timer
  }

  function opponentConfirmed () {
    $scope.player.set('status', 'playing');
    $scope.player.save().then(function () {
      $state.go('app.match.view');
    });
  }

  function waitingForOpponent () {
    Parse.Cloud.run('confirmMatch');
    $timeout(function () {
      MatchServices.getConfirmedMatch().then(function (matches) {
        if(!matches.length) {
          $scope.player.set('status', 'noOpponent');
          savePlayer();
        }
      });
    }, 70000);
  }

  function noOpponent () {
    $ionicPopup.show({
      title: 'Match Error',
      template: '<div class="text-center"><strong>Your Opponent</strong><br> failed to confirm!</div>',
      buttons: [
        {
          text: '<b>Back</b>',
          type: 'button-assertive',
          onTap: function(e) {
            return false;
          }
        },
        {
          text: '<b>Queue Again</b>',
          type: 'button-positive',
          onTap: function(e) {
            return true;
          }
        }
      ]
    }).then(function(res) {
      if(res) {
        $scope.player.set('status', 'queue');
        MatchServices.cancelMatch($scope.user.current(), $scope.player.player).then(function () {
          savePlayer();
        });
      } else {
        $scope.player.set('status', 'open');
        savePlayer();
      }
    });
  }

  function sub () {
    if(window.ParsePushPlugin) {
      ParsePushPlugin.subscribe($scope.player.username, function(msg) {
        console.log('subbed');
      }, function(e) {
        console.log('failed to sub');
      });
    }
  }

  function changeWord () {
    $scope.myOpponent.name = $scope.opponent.list[Math.floor(Math.random()*$scope.opponent.list.length)];
  };
};
