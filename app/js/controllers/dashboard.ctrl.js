
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl',
    [
      '$scope', '$state', '$filter', '$timeout', '$interval', '$ionicPopup', '$rootScope',
      'Parse', 'tournament', 'MatchServices', 'QueueServices', 'LadderServices', 'player',
      DashboardCtrl
    ]);

function DashboardCtrl(
  $scope, $state, $filter, $timeout, $interval, $ionicPopup, $rootScope,
  Parse, tournament, MatchServices, QueueServices, LadderServices, player) {

  var promise = null;
  $scope.foundCount = 0;
  $scope.user = Parse.User;
  $scope.player = player[0];
  $scope.tournament = tournament[0].tournament;
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};
  $scope.end = {
    canPlay: true,
    time: parseInt(moment().format('x'))
  }

  if(window.ParsePushPlugin) {
    ParsePushPlugin.on('receivePN', function(pn){
      if(pn.title) {
        switch (pn.title) {
          case 'opponent:found':
            getCurrentStatus(false);
            break;
          case 'opponent:confirmed':
            opponentConfirmed();
            break;
          case 'resultsUpdated':
            matchPlayed();
            break;
        }
      }
    });
  }

  $scope.doRefresh = function() {
    getCurrentStatus(true);
  };

  $scope.startQueue = function () {
    sub();
    $scope.player.set('status', 'queue');
    savePlayer();
  };

  $scope.cancelQueue = function () {
    $scope.player.set('status', 'open');
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
  $scope.finished = function () {
    $timeout(timer, 1500);
  }

  status();

  function matchTime() {
    if(!$scope.match) {
      MatchServices.getLatestMatch($scope.player).then(function (matches) {
        if (matches.length) {
          $scope.match = matches[0];
          timer();
        }
      });
    } else {
      timer();
    }
  }

  function timer () {
    var now = moment();
    var matchTime = moment($scope.match.get('activeDate'));
    var fiveMinutes = matchTime.add(1, 'minutes');
    $scope.end.time = parseFloat(fiveMinutes.format('x'));
    $scope.end.canPlay = now.isAfter(fiveMinutes, 'seconds');
    console.log('timer is ' + $scope.end.canPlay);
  }

  function savePlayer () {
    $scope.player.save().then(function (player) {
      $scope.player = player;
      status();
    });
  }

  function status () {
    switch ($scope.player.status) {
      case 'open':
        $scope.foundCount = 0;
        break;
      case 'queue':
        $scope.showOpponents();
        matchMaking();
        break;
      case 'found':
        if($scope.foundCount === 0) {
          $scope.foundCount++;
          playerFound();
        }
        break;
      case 'confirmed':
        waitingForOpponent();
        break;
      case 'noOpponent':
        noOpponent();
        break;
      case 'playing':
        getLastMatch();
        break;
      case 'cancelled':
        playerCancelled();
        break;
    }
    matchTime();
  }

  function getCurrentStatus(refresh) {
    var refresh = refresh;
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      if ($scope.player) {
        status();
        if(refresh) {
          $scope.$broadcast('scroll.refreshComplete');
        }
      }
    });
  }
  function getLastMatch() {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      if(matches.length) {
        $scope.match = matches[0];
        if($scope.match.get('status') === 'completed') {
          $scope.player.set('status', 'open');
          savePlayer();
        }
      } else {
        $scope.player.set('status', 'open');
        savePlayer();
      }
    })
  }

  function matchMaking() {
    $timeout(function () {
      Parse.Cloud.run('matchmaking').then(function () {
        getCurrentStatus(false);
      });
    }, 5000);

  }

  function playerFound() {
    $scope.stop();
    var popup = $ionicPopup.show({
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
    }).then(function(res) {
      if(res) {
        MatchServices.getLatestMatch($scope.player).then(function (matches) {
          $scope.match = matches[0];
          if($scope.match.get('status') === 'pending') {
            if($scope.player.player === 'player1') {
              $scope.match.set('confirm1', true);
            } else {
              $scope.match.set('confirm2', true);
            }
            $scope.match.save().then(function () {
              $scope.player.set('status', 'confirmed');
              savePlayer();
            });
          }
        });
      } else {
        playerCancelled();
      }
    });

    $timeout(function () {
      if($scope.player.get('status') === 'found') {
        popup.close(false);
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
    if($scope.player.get('status') === 'confirmed') {
      $scope.player.set('status', 'playing');
      $scope.player.save().then(function () {
        $state.go('app.match.view');
      });
    } else if ($scope.player.get('status') === 'playing'){
      $state.go('app.match.view');
    }
  }

  function waitingForOpponent () {
    Parse.Cloud.run('confirmMatch').then(function (num) {
      MatchServices.getConfirmedMatch($scope.player).then(function (matches) {
        if (matches.length) {
          $scope.player.set('status', 'playing');
          $rootScope.$broadcast('show:loading');
          $scope.player.save().then(function () {
            $rootScope.$broadcast('hide:loading');
            $state.go('app.match.view');
          });
        }
      });
      if(!num) {
        $timeout(function () {
          if($scope.player.get('status') === 'confirmed') {
            MatchServices.getConfirmedMatch($scope.player).then(function (matches) {
              if(!matches.length) {
                $scope.player.set('status', 'noOpponent');
                savePlayer();
              } else {
                $scope.player.set('status', 'playing');
                $scope.player.save().then(function () {
                  $state.go('app.match.view');
                });
              }
            });
          } else {
            status();
          }
        }, 60000);
      }
    });
  }
  function matchPlayed() {
    if($scope.player.get('status') !== 'open') {
      $scope.player.set('status', 'open');
      $scope.player.save().then(function () {
        status();
      });
    }
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
// function joinQueuePopup () {
//   sub();
//   $scope.selected = {status: true};
//   $scope.selectHero = function (hero) {
//     $scope.image = angular.element(document.querySelector('.heroClass'))[0].clientWidth;
//
//     if(hero.checked) {
//       hero.checked = !hero.checked;
//       $scope.selected.status = true;
//       return;
//     }
//
//     if(!hero.checked && $scope.selected.status) {
//       hero.checked = !hero.checked;
//       $scope.selected.status = false;
//       return;
//     }
//   };
//   return $ionicPopup.show(
//     {
//       templateUrl: 'templates/popups/select.hero.html',
//       title: 'Select Hero Class',
//       scope: $scope,
//       buttons: [
//         { text: 'Cancel'},
//         { text: '<b>Queue</b>',
//           type: 'button-positive',
//           onTap: function(e) {
//             var hero = $filter('filter')($scope.heroList, {checked: true}, true);
//             if (!hero.length) {
//               e.preventDefault();
//             } else {
//               return hero[0];
//             }
//           }
//         }
//       ]
//     });
// };
