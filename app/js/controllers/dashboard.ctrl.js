
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl',
    [
      '$scope', '$state', '$filter', '$timeout', '$interval', '$ionicPopup', '$rootScope',
      'Parse', 'tournament', 'MatchServices', 'QueueServices', 'LadderServices',
      DashboardCtrl
    ]);

function DashboardCtrl(
  $scope, $state, $filter, $timeout, $interval, $ionicPopup, $rootScope,
  Parse, tournament, MatchServices, QueueServices, LadderServices) {
  $scope.tournament = tournament[0].tournament;
  var promise = null;
  $scope.user = Parse.User;
  $scope.end = {
    canPlay: true,
    time: parseFloat(moment().format('x'))
  }
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};
  
  $rootScope.$on('opponent:found', playerConfirm);
  $rootScope.$on('opponent:confirmed', opponentConfirmed);
  $rootScope.$on('results:entered', matchPlayed);

  $scope.$on("$ionicView.enter", function(event) {
    console.log('view loaded');
    
    if(navigator && navigator.splashscreen) {
      navigator.splashscreen.hide();
    }
    console.log($scope.user.current().username);
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      status();
    });
  });

  $scope.doRefresh = function() {
    getCurrentStatus(true);
  };

  $scope.startQueue = function () {
    if($scope.end.canPlay) {
      $scope.player.set('status', 'queue');
      savePlayer();
    }
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
    var time = $scope.match.get('activeDate');
    if(time) {
      var fiveMinutes = moment(time).add(1, 'minutes');
      $scope.end.time = parseFloat(fiveMinutes.format('x'));
      $scope.end.canPlay = now.isAfter(fiveMinutes, 'seconds');
    }
  }

  function savePlayer () {
    $scope.player.save().then(function (player) {
      $scope.player = player;
      status();
    });
  }

  function status () {
    if($scope.player) {
      switch ($scope.player.get('status')) {
        case 'open':
          $scope.stop();
          break;
        case 'queue':
          $scope.showOpponents();
          matchMaking();
          break;
        case 'found':
          playerConfirm();
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
      console.log($scope.player.get('status'));
      matchTime();
    }
  }

  $scope.$on('destroy', function () {
    console.log('controller destroyed');
  });

  function getCurrentStatus(refresh) {
    var refresh = refresh;
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      if ($scope.player) {
        console.log('currentStatus');
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
    Parse.Cloud.run('matchmaking');
  }

  function playerConfirm() {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      $scope.match = matches[0];
      $timeout (function () {
        $scope.stop();
        if($scope.match.status === 'pending') {
          var confirmPopup = $ionicPopup.show({
            title: 'Matchmaking',
            template: '<div class="text-center"><strong>A Worthy Opponent</strong><br> has been found!</div>',
            buttons: [
              {
                text: '<b>Confirm</b>',
                type: 'button-positive',
                onTap: function(e) {
                  return true;
                }
              }
            ]
          });

          confirmPopup.then(function (res) {
            if(res) {
              if ($scope.player.player === 'player1') {
                $scope.match.set('confirm1', true);
              } else {
                $scope.match.set('confirm2', true);
              }
              $scope.match.save().then(function () {
                $scope.player.set('status', 'confirmed');
                savePlayer();
              });
            } else {
              showFailPopup();
              $scope.player.set('status', 'open');
              savePlayer();
            }
          });
          $timeout(function () {
            if($scope.player.get('status') === 'found') {
              confirmPopup.close();
            }
          }, 20000);
        }
        if($scope.match.status === 'cancelled') {
          $scope.player.set('status', 'open');
          savePlayer();
        }
      }, 2000);
    });
  }

  function showFailPopup() {
    var failPopup = $ionicPopup.show({
      title: 'Matchmaking',
      template: '<div class="text-center">You Failed to Confirm Match</div>',
      buttons: [
        {
          text: '<b>Close</b>',
          type: 'button-positive',
          onTap: function(e) {
            return true;
          }
        }
      ]
    });

    failPopup.then(function (res) {

    });
  }

  function opponentConfirmed () {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      $scope.match = matches[0];
      if($scope.match.get('status'), 'active') {
        $state.go('app.match.view');
      }
    })
  }

  function waitingForOpponent () {
    Parse.Cloud.run('confirmMatch').then(function (num) {
      checkOpponent(5000, false);
      checkOpponent(30000, true);
    });
  }

  function checkOpponent (timeout, alreadyChecked) {
    $timeout(function () {
      if($scope.player.get('status') === 'confirmed') {
        MatchServices.getLatestMatch($scope.player).then(function (matches) {
          $scope.match = matches[0];

          switch ($scope.match.get('status')) {
            case 'pending':
              if(alreadyChecked) {
                $scope.player.set('status', 'noOpponent');
                savePlayer();
              }
              break;
            case 'active':
              $scope.player.set('status', 'playing');
              $rootScope.$broadcast('show:loading');
              $scope.player.save().then(function () {
                $rootScope.$broadcast('hide:loading');
                $state.go('app.match.view');
              });
              break;
          }

        });
      }
    }, timeout);
  }
  function matchPlayed() {
    if($scope.player.get('status') !== 'open') {
      $scope.player.set('status', 'open');
      $scope.player.save().then(function (player) {
        $scope.player = player;
        showMatchResultsPopup();
      })
    }
  }
  function showMatchResultsPopup() {
    var popup = $ionicPopup.alert({
      title: 'Match Played',
      template: '<div class="text-center">Your Opponent has submitting results</div>'
    }).then(function(res) {

    });
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
        MatchServices.getLatestMatch($scope.player).then(function (matches) {
          $scope.match = matches[0];
          $scope.match.set('status', 'cancelled');
          $scope.match.save().then(function () {
            savePlayer();
          });
        });
      } else {
        $scope.player.set('status', 'open');
        savePlayer();
      }
    });
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
