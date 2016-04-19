
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

function DashboardCtrl(
  $scope, $state, $filter, $timeout, $interval, $ionicPopup, $rootScope, moment,
  Parse, tournament, MatchServices, QueueServices, LadderServices, locationServices
) {
  var promise = null;
  $scope.tournament = tournament.tournament;
  $scope.user = Parse.User;

  $scope.end = {
    canPlay: true,
    time: parseFloat(moment().format('x'))
  };

  $scope.location = locationServices.location;
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};

  $scope.$on('$ionicView.enter', function(event) {
    if(navigator && navigator.splashscreen) {
      navigator.splashscreen.hide();
    }
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      $scope.player.set('location', $scope.location.coords);
      $scope.player.save().then(function (player) {
        $scope.player = player;
        MatchServices.getLatestMatch($scope.player).then(function (matches) {
          if(matches.length) {
            $scope.match = matches[0];
            timer();
          }
          setNotifications();
          status();
          $scope.$broadcast('scroll.refreshComplete');
        });
      });
    });
  });

  $scope.doRefresh = function() {
    $state.reload('app.dashboard');
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

  $scope.playerConfirm = function () {
    $scope.match.fetch().then(function (match) {
      $scope.match = match;
      switch ($scope.match.get('status')) {
        case 'pending': 
          confirmPlayer();
          break;
        case 'cancelled':
          showCancelledMatch();
          break;
      }
    });
  };
  
  $scope.stop = function() {
    $interval.cancel(promise);
  };
  
  $scope.showOpponents = function() {
    $scope.stop();
    promise = $interval(function () {changeWord();}, 2000);
  };

  $scope.setToOpen = function() {
    $scope.player.set('status', 'open');
    savePlayer();
  }

  $scope.finished = function () {
    $timeout(timer, 1500);
  }
  
  $scope.$on('$destroy', function() {
    $scope.stop();
  });
  
  $scope.$on('destroy', function () {
    console.log('controller destroyed');
  });

  function setNotifications() {
    if(window.ParsePushPlugin) {
      ParsePushPlugin.subscribe($scope.player.username, function(msg) {
        console.log('subbed to ' + $scope.player.username);
      }, function(e) {
        console.log('failed to sub');
      });
    }
    var userGeoPoint = $scope.player.get("location");
    if(userGeoPoint) {
      var query = new Parse.Query('Tournament');
      query.withinMiles("location", userGeoPoint, 50);
      query.limit(10);
      query.find({
        success: function(placesObjects) {
          console.log(placesObjects);
          if(window.ParsePushPlugin && placesObjects.length) {
            ParsePushPlugin.subscribe('pax-east', function(msg) {
              console.log('paxed');
            }, function(e) {
              console.log('failed to sub');
            });
          }
        }
      });
    }
  }
  function getStatus() {
    $timeout(function () {
      $scope.player.fetch().then(function (player) {
        status();
      });
    }, 2000);
  }

  function status() {
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
    }
  }

  function timer () {
    var now = moment();
    var time = $scope.match.get('activeDate');
    if(time) {
      var fiveMinutes = moment(time).add(5, 'minutes');
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

  function matchMaking() {
    $timeout(function () {
      Parse.Cloud.run('matchmaking').then(function (res){
        console.log('matchmaking started');
        MatchServices.getLatestMatch($scope.player).then(function (matches) {
          if(matches.length) {
            $scope.match = matches[0];
          }
          getStatus();
        });
      });
    }, 15000);
  }

  function showCancelledMatch() {
    $ionicPopup.alert({
      title: 'Match Cancelled',
      template: '<div class="text-center">You have failed to confirm</div>'
    }).then(function(res) {
      $scope.player.set('status', 'open');
      savePlayer();
    });
  }

  function confirmPlayer() {
    if ($scope.player.player === 'player1') {
      $scope.match.set('confirm1', true);
    } else {
      $scope.match.set('confirm2', true);
    }
    $scope.match.save().then(function (match) {
      $scope.match = match;
      $scope.player.set('status', 'confirmed');
      savePlayer();
    });
  }

  function opponentConfirmed () {
    $timeout(function () {
      if($scope.match.get('status') === 'active') {
        $state.go('app.match.view');
      }
    }, 1000);
  }

  function waitingForOpponent () {
    Parse.Cloud.run('confirmMatch').then(function (num) {
      checkOpponent(5000, false);
      checkOpponent(20000, true);
    });
  }

  function checkOpponent (timeout, alreadyChecked) {
    $timeout(function () {
      if($scope.player.get('status') === 'confirmed') {
        $scope.match.fetch().then(function (match) {
          $scope.match = match;
          checkMatchStatus(alreadyChecked);
        });
      }
    }, timeout);
  }
  
  function checkMatchStatus(alreadyChecked) {
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
      case 'cancelled':
        $scope.player.set('status', 'open');
        savePlayer();
        break;
      case 'completed':
        $scope.player.set('status', 'open');
        savePlayer();
        break;
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
        $scope.match.set('status', 'cancelled');
        $scope.match.save().then(function () {
          savePlayer();
        });
      } else {
        $scope.player.set('status', 'open');
        $scope.match.set('status', 'cancelled');
        $scope.match.save().then(function () {
          savePlayer();
        });
      }
    });
  }

  function getLastMatch() {
    if($scope.match.get('status') === 'completed') {
      $scope.player.set('status', 'open');
      savePlayer();
    }
  }

  function changeWord () {
    $scope.myOpponent.name = $scope.opponent.list[Math.floor(Math.random()*$scope.opponent.list.length)];
  }
};
