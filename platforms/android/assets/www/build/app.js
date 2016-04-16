angular.module('ONOG', [
  'ionic',
  'ngParse',
  'timer',
  'ngCordova',
  'ngAnimate',
  'ONOG.Controllers',
  'ONOG.Services'
]);

angular.module('ONOG')
  .config(['$ionicConfigProvider', '$compileProvider', 'ParseProvider', config]);

function config ($ionicConfigProvider, $compileProvider, ParseProvider) {

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

  ParseProvider.initialize("nYsB6tmBMYKYMzM5iV9BUcBvHWX89ItPX5GfbN6Q", "zrin8GEBDVGbkl1ioGEwnHuP70FdG6HhzTS8uGjz");

  if (ionic.Platform.isIOS()) {
    $ionicConfigProvider.scrolling.jsScrolling(true);
  }
}

angular.module('ONOG.Controllers', []);


angular.module('ONOG')
  .config(['$stateProvider', '$urlRouterProvider', routes]);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('app/dashboard');

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      cache: false,
      templateUrl: 'templates/menu.html',
      controller: 'MenuCtrl',
      resolve: {
        tournament: function (TournamentServices) {
          return TournamentServices.getTournament();
        }
      }
    })
    .state('app.dashboard', {
      url: '/dashboard',
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardCtrl'
        }
      }
    })
    .state('app.login', {
      url: '/login',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/login.html',
          controller: 'LoginCtrl'
        }
      }
    })
    .state('app.register', {
      url: '/register',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/register.html',
          controller: 'RegisterCtrl'
        }
      }
    })


}

angular.module('ONOG')
  .constant("moment", moment)
  .run(['$ionicPlatform', '$state', '$rootScope', '$ionicLoading', '$ionicPopup', run])



function run ($ionicPlatform, $state, $rootScope, $ionicLoading, $ionicPopup) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
    $rootScope.$on('show:loading', function() {
      $ionicLoading.show({template: '<ion-spinner icon="spiral" class="spinner-calm"></ion-spinner>', showBackdrop: true, animation: 'fade-in'});
    });

    $rootScope.$on('hide:loading', function() {
      $ionicLoading.hide();
    });

    if(window.ParsePushPlugin) {
      console.log('new version 1');
      ParsePushPlugin.on('receivePN', function(pn){
        console.log(pn);
        if(!pn.title) {
          $ionicPopup.alert({
            title: 'Announcement',
            template: '<div class="text-center">'+ pn.alert + '</div>'
          }).then(function(res) {

          });
        } else {
          switch (pn.title) {
            case 'Opponent Found':
              $rootScope.$broadcast('opponent:found');
              break;
            case 'Opponent Confirmed':
              $rootScope.$broadcast('opponent:confirmed');
              break;
            case 'Results Entered':
              $rootScope.$broadcast('results:entered');
              break;
          }
        }
      });
    }

  });
}

angular.module('ONOG.Services', []);



angular.module('ONOG.Controllers')

  .controller('AdminMatchesCtrl', AdminMatchesCtrl);

AdminMatchesCtrl.$inject = ['$scope', 'Parse'];
function AdminMatchesCtrl($scope, Parse) {
  
};


angular.module('ONOG.Controllers')

  .controller('AdminPlayersCtrl', AdminPlayersCtrl);

AdminPlayersCtrl.$inject = ['$scope', 'Parse'];
function AdminPlayersCtrl($scope, Parse) {
  
};


angular.module('ONOG.Controllers')

  .controller('AdminSettingsCtrl', AdminSettingsCtrl);

AdminSettingsCtrl.$inject = ['$scope', 'TournamentServices', 'newTournament'];

function AdminSettingsCtrl($scope, TournamentServices, newTournament) {
  $scope.details = newTournament;
  
  // TournamentServices.getLadder($scope.tournament.tournament).then(function (ladder) {
  //   $scope.ladder = ladder;
  // });
  
  
};


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


angular.module('ONOG.Controllers')

  .controller('LadderJoinCtrl', ['$scope', '$filter', '$ionicPopup', '$state', '$ionicHistory', '$q', 'Parse', 'tournament', 'LadderServices', LadderJoinCtrl]);

function LadderJoinCtrl
($scope, $filter, $ionicPopup, $state, $ionicHistory, $q, Parse,  tournament, LadderServices) {
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $scope.tournament = tournament[0].tournament;
  $scope.user = Parse.User.current();
  $scope.player = {
    battleTag: ''
  };

  $scope.registerPlayer = function () {
    validateBattleTag().then(
      function (tag) {
        $scope.player.username = $scope.user.username;
        $scope.player.status = 'open';
        LadderServices.joinTournament($scope.tournament, $scope.user, $scope.player).then(function (player) {
          SuccessPopup(player).then(function(res) {
            $state.go('app.dashboard');
          });
        });
      },
      function (error) {
        ErrorPopup(error);
      });
  };

  function validateBattleTag () {
    var cb = $q.defer();
    var tag = $scope.player.battleTag;

    if(tag.length < 8) {
      cb.reject('Enter your full battle tag');
      return cb.promise;
    }
    var split = tag.split('#');
    if(split.length !== 2) {
      cb.reject('Enter your full BATTLETAG™ including # and four digits');
      return cb.promise;
    }
    if(split[1].length < 2 || split[1].length > 4) {
      cb.reject('Your BATTLETAG™ must including up to four digits after #!');
      return cb.promise;
    }
    if(isNaN(split[1])) {
      cb.reject('Your BATTLETAG™ must including four digits after #');
      return cb.promise;
    }
    LadderServices.validatePlayer($scope.tournament.tournament, tag).then(function (results) {
      if(results.length) {
        cb.reject('The BATTLETAG™ you entered is already registered.')
      } else {
        cb.resolve(tag);
      } 
    });
    return cb.promise;
  };

  function ErrorPopup (message) {
    return $ionicPopup.alert({
      title: 'Registration Error',
      template: message
    });
  };

  function SuccessPopup (player) {
    return $ionicPopup.alert({
      title: 'Congratulations ' + player.username + '!',
      template: 'You have successfully signed up! Now go find a valiant opponent.'
    });
  };
};


angular.module('ONOG.Controllers')

  .controller('LeaderBoardsCtrl', LeaderBoardsCtrl);

LeaderBoardsCtrl.$inject = ['$scope', 'LadderServices', 'tournament', 'Parse', '$filter', '$ionicPopup'];
function LeaderBoardsCtrl($scope, LadderServices, tournament, Parse, $filter, $ionicPopup) {
  $scope.user = Parse.User;
  getPlayers();
  $scope.doRefresh = function () {
    getPlayers();
  }
  
  function getPlayers() {
    LadderServices.getPlayers(tournament[0].tournament).then(function (players) {
      var rank = 1;
      angular.forEach(players, function (player) {
        player.rank = rank;
        rank++;
      });
      $scope.players = players;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
};


angular.module('ONOG.Controllers')

  .controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = ['$scope', '$state', 'Parse', '$ionicHistory'];
function LoginCtrl($scope, $state, Parse, $ionicHistory) {
  $scope.user = {};
  Parse.User.logOut();
  $scope.loginUser = function () {
    Parse.User.logIn($scope.user.username, $scope.user.password, {
      success: function(user) {
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        if(window.ParsePushPlugin) {
          ParsePushPlugin.subscribe(user.username, function(msg) {
            console.log('subbed');
          }, function(e) {
            console.log('failed to sub');
          });
        }
        $state.go('app.dashboard');
      },
      error: function (user, error) {
        $scope.warning = error.message;
      }
    });
  };
  $scope.$watch('user', function(newVal, oldVal){
    $scope.warning = null;
  }, true);
};


angular.module('ONOG.Controllers')

  .controller('MatchListCtrl', MatchListCtrl);

MatchListCtrl.$inject = [
  '$scope', '$state', '$ionicPopup', 'Parse', 'MatchServices', 'player'
];
function MatchListCtrl($scope, $state, $ionicPopup, Parse, MatchServices, player) {
  $scope.matches = [];
  $scope.player = player[0];
  if($scope.player) {
    MatchServices.getPlayerMatches($scope.player, 'completed').then(function (matches) {
      $scope.matches = matches;
    });
    MatchServices.getPlayerMatches($scope.player, 'reported').then(function (matches) {
      $scope.reported = matches;
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


angular.module('ONOG.Controllers')

  .controller('MatchReportCtrl', MatchReportCtrl);

MatchReportCtrl.$inject = [
  '$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory',
  'Parse', 'MatchServices', 'report'
];
function MatchReportCtrl(
  $scope, $state, $rootScope, $ionicPopup, $ionicHistory,
  Parse, MatchServices, report
) {

  $scope.match = report;

  $scope.picture = null;

  var parseFile = new Parse.File();
  var imgString = null;

  $scope.getPicture = function() {
    var options = {
      quality: 90,
      targetWidth: 320,
      targetHeight: 500,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: 0,
      encodingType: 1
    }
    navigator.camera.getPicture(onSuccess,onFail,options);
  }
  var onSuccess = function(imageData) {
    $scope.picture = 'data:image/png;base64,' + imageData;
    imgString = imageData;
    $scope.$apply();
  };
  var onFail = function(e) {
    console.log("On fail " + e);
  }
  
  $scope.processReport = function (name) {
    if(imgString) {
      parseFile = new Parse.File("report.png", {base64:imgString});
    } else {
      parseFile = null;
    }
    $scope.match.set("reportImage", parseFile);
    $scope.match.set('status', 'reported');
    $scope.match.save().then(function (match) {
      $ionicHistory.nextViewOptions({
        disableBack: true
      });
      $ionicPopup.alert({
        title: 'Match Reported',
        template: '<div class="text-center">Thank you for submitting the report.</div>'
      }).then(function () {
        $state.go('app.dashboard');
      });
    });

  }

};


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
  $scope.tournament = tournament[0].tournament;
  $scope.user = Parse.User;
  $scope.end = {
    time: 0
  };

  $scope.$on("$ionicView.enter", function(event) {
    $scope.match = match[0];
    $scope.player = player[0];
    getMatchDetails();
  });

  $rootScope.$on('results:entered', getMatch);

  $scope.picture = null;
  var parseFile = new Parse.File();
  var imgString = null;

  $ionicHistory.nextViewOptions({
    disableBack: true
  });



  $scope.getPicture = function() {
    var options = {
      quality: 90,
      targetWidth: 320,
      targetHeight: 500,
      destinationType: Camera.DestinationType.DATA_URL,
      sourceType: 0,
      encodingType: 1
    }
    navigator.camera.getPicture(onSuccess,onFail,options);
  }
  var onSuccess = function(imageData) {
    $scope.picture = 'data:image/png;base64,' + imageData;
    imgString = imageData;
    $scope.$apply();
  };
  var onFail = function(e) {
    console.log("On fail " + e);
  }

  $scope.doRefresh = function() {
    getMatch(true);
  };

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

  function winMatch () {
    $scope.picture = null;
    $scope.errorMessage = null;

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
              if (!$scope.picture) {
                $scope.errorMessage = 'Upload a Screenshot';
                e.preventDefault();
              } else {
                return true;
              }
            }
          }
        ]
      });
  }

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

  function getMatch(refresh) {
    MatchServices.getMatch($scope.match.id).then(function (match) {
      $scope.match = match;
      console.log('match' + $scope.match.get('status'));
      if(refresh) {
        $scope.$broadcast('scroll.refreshComplete');
      }
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

        })
      });
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

angular.module('ONOG.Controllers')
  .controller('MenuCtrl', MenuCtrl);

MenuCtrl.$inject = ['$scope','$ionicPopover', '$state', '$ionicHistory', 'Parse', '$timeout'];
function MenuCtrl($scope, $ionicPopover, $state, $ionicHistory, Parse, $timeout) {
  $scope.user = Parse.User;

  $ionicPopover.fromTemplateUrl('templates/popovers/profile.pop.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.menu = function (link) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    if(link === 'login') {
      if(window.ParsePushPlugin) {
        ParsePushPlugin.unsubscribe($scope.user.current().username, function(msg) {
          console.log('subbed');
        }, function(e) {
          console.log('failed to sub');
        });
      }
      Parse.User.logOut().then(function (user) {
        $state.go('app.' + link, {reload: true});
      });
      
    } else {
      $state.go('app.' + link, {reload: true});
    }
    $scope.popover.hide();
  }
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
}


angular.module('ONOG.Controllers')

  .controller('RegisterCtrl', RegisterCtrl);

RegisterCtrl.$inject = ['$scope', '$state', 'Parse', '$ionicPopup'];
function RegisterCtrl($scope, $state, Parse, $ionicPopup) {

  $scope.user = {};

  $scope.RegisterUser = function (user) {
    var register = new Parse.User();
    register.set(user);
    register.signUp(null, {
      success: function(user) {
        $state.go('app.dashboard');
      },
      error: function(user, error) {
        // Show the error message somewhere and let the user try again.
        ErrorPopup(error.message);
      }
    });
  };
  $scope.$watch('user', function(newVal, oldVal){
    $scope.warning = null;
  }, true);

  function ErrorPopup (message) {
    return $ionicPopup.alert({
      title: 'Registration Error',
      template: message
    });
  }
}

angular.module('ONOG')
  .config(['$stateProvider', AdminRoutes]);

function AdminRoutes ($stateProvider) {

  $stateProvider
    .state('app.admin', {
      url: '/admin',
      abstract: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/admin/admin.html',
        }
      }
    })
    .state('app.admin.settings', {
      url: '/settings',
      cache: false,
      templateUrl: 'templates/admin/admin.settings.html',
      controller: 'AdminSettingsCtrl',
      resolve: {
        tourney: function (TournamentServices) {
          return TournamentServices.getTournament();
        },
        newTournament: function (TournamentServices, tourney) {
          if(tourney.length) {
            return tourney[0];
          } else {
            return TournamentServices.createTournament();
          }
        }
      }
    })
    .state('app.admin.matches', {
      url: '/matches',
      cache: false,
      templateUrl: 'templates/admin/admin.matches.html',
      controller: 'AdminMatchesCtrl'
    })
}

angular.module('ONOG')
  .config(['$stateProvider', LadderRoutes]);

function LadderRoutes ($stateProvider) {

  $stateProvider
    .state('app.ladder', {
      url: '/ladder',
      abstract: true,
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/ladder/ladder.html',
        }
      }
    })
    .state('app.ladder.leaderboard', {
      url: '/leaderboards',
      cache: false,
      templateUrl: 'templates/ladder/leaderboard.html',
      controller: 'LeaderBoardsCtrl'
    })
    .state('app.ladder.join', {
      url: '/join',
      cache: false,
      templateUrl: 'templates/ladder/join.html',
      controller: 'LadderJoinCtrl'
    })
}

angular.module('ONOG')
  .config(['$stateProvider', MatchRoutes]);

function MatchRoutes ($stateProvider) {

  $stateProvider
    .state('app.match', {
      url: '/match',
      abstract: true,
      views: {
        'menuContent': {
          templateUrl: 'templates/match/match.html'
        }
      }
    })
    .state('app.match.list', {
      url: '/view',
      templateUrl: 'templates/match/match.list.html',
      controller: 'MatchListCtrl',
      cache: false,
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament[0].tournament, Parse.User.current());
        }
      }
    })
    .state('app.match.view', {
      url: '/view',
      templateUrl: 'templates/match/match.view.html',
      controller: 'MatchViewCtrl',
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament[0].tournament, Parse.User.current());
        },
        match: function (MatchServices, $state, $q, player) {
          var cb = $q.defer();
          MatchServices.getLatestMatch(player[0]).then(function (matches) {
            if(!matches.length) {
              cb.reject();
              $state.go('app.dashboard');
            } else {
              cb.resolve(matches);
            }
          });
          return cb.promise;
        }
      }
    })
    .state('app.match.report', {
      url: '/report/:id',
      cache: false,
      templateUrl: 'templates/match/match.report.html',
      controller: 'MatchReportCtrl',
      resolve: {
        report: function (MatchServices, $stateParams) {
          return MatchServices.getMatch($stateParams.id);
        }
      }
    })
}


angular.module('ONOG.Services')

  .service('LadderServices', ['Parse', 'Ladder', LadderServices])
  .factory('Ladder', ['Parse', Ladder])

function LadderServices(Parse, Ladder) {
  return {
    getPlayers: getPlayers,
    getPlayer: getPlayer,
    validatePlayer: validatePlayer,
    joinTournament: joinTournament,
    getPendingPlayers: getPendingPlayers
  };

  function getPendingPlayers(tournament, user) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.notEqualTO('user', user);
    query.equalTo('status', 'queue');
    return query.find();
  };

  function getPlayers(tourney) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.descending('points', 'mmr');
    return query.find();
  };

  function validatePlayer(tourney, battleTag) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.equalTo('battleTag', battleTag);
    return query.find();
  };

  function getPlayer(tourney, user) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.equalTo('user', user);
    query.limit(1);
    return query.find();
  }

  function joinTournament(tourney, user, userData) {
    var player = new Ladder.Model();
    player.set('tournament', tourney);
    player.set('user', user);
    player.set(userData);
    player.set('wins', 0);
    player.set('losses', 0);
    player.set('points', 0);
    return player.save();
  }
};

function Ladder(Parse) {
  var Model = Parse.Object.extend('Ladder');
  var attributes = ['tournament', 'user', 'battleTag', 'username', 
    'hero', 'player', 'status', 'cancelTimer', 'wins', 'losses', 'mmr', 'points', 'banReason'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
};

angular.module('ONOG.Services')

  .service('MatchServices', ['Parse', 'Match', '$q', MatchServices])
  .factory('Match', ['Parse', Match]);

function MatchServices(Parse, Match, $q) {
  var user = Parse.User;
  return {
    getConfirmedMatch: getConfirmedMatch,
    getPendingMatch: getPendingMatch,
    getLatestMatch: getLatestMatch,
    getMatch: getMatch,
    getPlayerMatches: getPlayerMatches,
  }

  function getPlayerMatches(player, status) {
    var player1 = new Parse.Query(Match.Model);
    player1.equalTo('player1', player);
    var player2 = new Parse.Query(Match.Model);
    player2.equalTo('player2', player);
    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.limit(10);
    mainQuery.equalTo('status', status);
    return mainQuery.find();
  }

  function getLatestMatch(player) {
    var type = player.get('player')
    var query = new Parse.Query(Match.Model);
    query.include('winner');
    query.include('loser');
    query.descending("createdAt");
    query.limit(1);
    if(type === 'player1') {
      query.equalTo('player1', player);
    } else {
      query.equalTo('player2', player);
    }
    return query.find();
  }

  function getConfirmedMatch (player) {
    var type = player.get('player');
    var query = new Parse.Query('Match');
    query.equalTo('status', 'active');
    query.descending("createdAt");
    if(type === 'player1') {
      query.equalTo('player1', player)
    } else {
      query.equalTo('player2', player)
    }
    query.equalTo('confirm1', true);
    query.equalTo('confirm2', true);
    query.limit(1);

    return query.find();
  }
  function getPendingMatch(player) {
    var type = player.get('player')
    var query = new Parse.Query(Match.Model);
    query.descending("createdAt");
    query.limit(1);
    if(type === 'player1') {
      query.equalTo('player1', player);
    } else {
      query.equalTo('player2', player);
    }
    query.equalTo('status', 'pending');
    query.limit(1);
    return query.find();
  }
  function getMatch(id) {
    var match = new Match.Model();
    match.id = id;
    return match.fetch();
  }
}

function Match(Parse) {
  var Model = Parse.Object.extend('Match');
  var attributes = [
    'tournament', 'player1', 'player2', 'hero1', 'hero2', 'username1', 'username2', 'battleTag1', 'battleTag2', 'status', 'winner', 'loser',
    'winImage', 'reportReason', 'reportImage', 'activeDate', 'user1', 'user2'
  ];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}

angular.module('ONOG.Services')

  .service('convertImage', [convertImage]);

function convertImage () {

  return {
    getDataUri: getDataUri
  }

  function getDataUri (url, callback) {
    var image = new Image();
    image.onload = function () {
      var canvas = document.createElement('canvas');
      canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
      canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

      canvas.getContext('2d').drawImage(this, 0, 0);

      // Get raw image data
      callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

      // ... or get as Data URI
      //callback(canvas.toDataURL('image/png'));
    };
    image.src = url;
  }

}

angular.module('ONOG.Services')

  .service('QueueServices',[QueueServices])

function QueueServices() {
  var opponent = {
    list: ['Easy Pickings', 'Your Worst Nightmare', 'World class paste eater',
      'A Murloc', 'Gourd critic', 'Nose and mouth breather', 'Hogger', 'A cardish Ian',
      'Mopey Mage', 'Wombat Warlock', 'Rouged up Rogue', 'Waifish Warrior', 'Damp Druid',
      'Shabby Shaman', 'Penniless Paladin', 'Huffy Hunter', 'Perky Priest', 'The Worst Player',
      'Your Old Roommate', 'StarCraft Pro', 'Fiscally responsible mime', 'Your Guild Leader',
      'Noneck George', 'Gum Pusher', 'Cheater McCheaterson', 'Really slow guy', 'Roach Boy',
      'Orange Rhymer', 'Coffee Addict', 'Inward Talker', 'Blizzard Developer', 'Grand Master',
      'Diamond League Player', 'Brand New Player', 'Dastardly Death Knight', 'Mediocre Monk',
      'A Little Puppy'
    ]
  };
  var heroes = [
    {text: 'mage', checked: false},
    {text: 'hunter', checked: false},
    {text: 'paladin', checked: false},
    {text: 'warrior', checked: false},
    {text: 'druid', checked: false},
    {text: 'warlock', checked: false},
    {text: 'shaman', checked: false},
    {text: 'priest', checked: false},
    {text: 'rogue', checked: false}
  ]
  return {
    opponent: opponent,
    heroes: heroes
  }
}


angular.module('ONOG.Services')

  .service('TournamentServices', ['Parse', '$q', 'Tournament', 'Details', 'Ladder', TournamentServices])

  .factory('Tournament', ['Parse', Tournament])
  .factory('Details', ['Parse', Details]);

function TournamentServices(Parse, $q, Tournament, Details, Ladder) {
  return {
    getTournament: getTournament,
    createTournament: createTournament,
    getLadder: getLadder,
    joinTournament: joinTournament
  }
  function joinTournament(tourney, player) {
    var player = new Ladder.Model(player);
    player.set('tournament', tourney);
    player.set('user', Parse.User.current());
    player.set('username', Parse.User.current().username);
    player.set('mmr', 1000);
    player.set('wins', 0);
    player.set('losses', 0);
    player.set('points', 0);
    return player.save();
  }
  function getTournament() {
    var query = new Parse.Query(Details.Model);
    query.equalTo('type', 'ladder');
    query.include('tournament');
    return query.find();
  }
  function createTournament () {
    var defer = $q.defer();
    var tournament = new Tournament.Model();
    tournament.set('name', 'ONOG OPEN');
    tournament.set('status', 'pending');
    tournament.set('game', 'hearthstone');
    tournament.save().then(function (tourney) {
      var details = new Details.Model();
      details.set('tournament', tourney);
      details.set('type', 'ladder');
      details.set('playerCount', 0);
      details.set('numOfGames', 5);
      details.save().then(function (details) {
        defer.resolve(details);
      });
    });
    return defer.promise;
  }
  function getLadder (tourney) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.include('player');
    return query.find();
  }
}

function Tournament(Parse) {
  var Model = Parse.Object.extend('Tournament');
  var attributes = ['name', 'game', 'status', 'disabled', 'disabledReason'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}
function Details(Parse) {
  var Model = Parse.Object.extend('Details');
  var attributes = ['tournament', 'type', 'numOfGames', 'playerCount'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5saXN0LmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5yZXBvcnQuY3RybC5qcyIsImNvbnRyb2xsZXJzL21hdGNoLnZpZXcuY3RybC5qcyIsImNvbnRyb2xsZXJzL21lbnUuY3RybC5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmN0cmwuanMiLCJyb3V0ZXMvYWRtaW4ucm91dGVzLmpzIiwicm91dGVzL2xhZGRlci5yb3V0ZXMuanMiLCJyb3V0ZXMvbWF0Y2gucm91dGVzLmpzIiwic2VydmljZXMvbGFkZGVyLnNlcnZpY2VzLmpzIiwic2VydmljZXMvbWF0Y2guc2VydmljZXMuanMiLCJzZXJ2aWNlcy9waG90by5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL3F1ZXVlLnNlcnZpY2VzLmpzIiwic2VydmljZXMvdG91cm5hbWVudC5zZXJ2aWNlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvWEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnT05PRycsIFtcbiAgJ2lvbmljJyxcbiAgJ25nUGFyc2UnLFxuICAndGltZXInLFxuICAnbmdDb3Jkb3ZhJyxcbiAgJ25nQW5pbWF0ZScsXG4gICdPTk9HLkNvbnRyb2xsZXJzJyxcbiAgJ09OT0cuU2VydmljZXMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRpb25pY0NvbmZpZ1Byb3ZpZGVyJywgJyRjb21waWxlUHJvdmlkZXInLCAnUGFyc2VQcm92aWRlcicsIGNvbmZpZ10pO1xuXG5mdW5jdGlvbiBjb25maWcgKCRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyLCBQYXJzZVByb3ZpZGVyKSB7XG5cbiAgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8ZmlsZXxibG9ifGNvbnRlbnR8bXMtYXBweHx4LXdtYXBwMCk6fGRhdGE6aW1hZ2VcXC98aW1nXFwvLyk7XG4gICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGZpbGV8Z2h0dHBzP3xtcy1hcHB4fHgtd21hcHAwKTovKTtcblxuICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJuWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRXCIsIFwienJpbjhHRUJEVkdia2wxaW9HRXduSHVQNzBGZEc2SGh6VFM4dUdqelwiKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsIHJvdXRlc10pO1xuXG5mdW5jdGlvbiByb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdhcHAvZGFzaGJvYXJkJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcykge1xuICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuZ2V0VG91cm5hbWVudCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5kYXNoYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kYXNoYm9hcmQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5yZWdpc3RlcicsIHtcbiAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cblxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uc3RhbnQoXCJtb21lbnRcIiwgbW9tZW50KVxuICAucnVuKFsnJGlvbmljUGxhdGZvcm0nLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnJGlvbmljTG9hZGluZycsICckaW9uaWNQb3B1cCcsIHJ1bl0pXG5cblxuXG5mdW5jdGlvbiBydW4gKCRpb25pY1BsYXRmb3JtLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY0xvYWRpbmcsICRpb25pY1BvcHVwKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cbiAgICAgIC8vIERvbid0IHJlbW92ZSB0aGlzIGxpbmUgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91IGFyZSBkb2luZy4gSXQgc3RvcHMgdGhlIHZpZXdwb3J0XG4gICAgICAvLyBmcm9tIHNuYXBwaW5nIHdoZW4gdGV4dCBpbnB1dHMgYXJlIGZvY3VzZWQuIElvbmljIGhhbmRsZXMgdGhpcyBpbnRlcm5hbGx5IGZvclxuICAgICAgLy8gYSBtdWNoIG5pY2VyIGtleWJvYXJkIGV4cGVyaWVuY2UuXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcbiAgICB9XG4gICAgaWYod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cbiAgICAkcm9vdFNjb3BlLiRvbignc2hvdzpsb2FkaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAkaW9uaWNMb2FkaW5nLnNob3coe3RlbXBsYXRlOiAnPGlvbi1zcGlubmVyIGljb249XCJzcGlyYWxcIiBjbGFzcz1cInNwaW5uZXItY2FsbVwiPjwvaW9uLXNwaW5uZXI+Jywgc2hvd0JhY2tkcm9wOiB0cnVlLCBhbmltYXRpb246ICdmYWRlLWluJ30pO1xuICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS4kb24oJ2hpZGU6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XG4gICAgfSk7XG5cbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICBjb25zb2xlLmxvZygnbmV3IHZlcnNpb24gMScpO1xuICAgICAgUGFyc2VQdXNoUGx1Z2luLm9uKCdyZWNlaXZlUE4nLCBmdW5jdGlvbihwbil7XG4gICAgICAgIGNvbnNvbGUubG9nKHBuKTtcbiAgICAgICAgaWYoIXBuLnRpdGxlKSB7XG4gICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgdGl0bGU6ICdBbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj4nKyBwbi5hbGVydCArICc8L2Rpdj4nXG4gICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcblxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN3aXRjaCAocG4udGl0bGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ09wcG9uZW50IEZvdW5kJzpcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdvcHBvbmVudDpmb3VuZCcpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ09wcG9uZW50IENvbmZpcm1lZCc6XG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnb3Bwb25lbnQ6Y29uZmlybWVkJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnUmVzdWx0cyBFbnRlcmVkJzpcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdyZXN1bHRzOmVudGVyZWQnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycsIFtdKTtcblxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluTWF0Y2hlc0N0cmwnLCBBZG1pbk1hdGNoZXNDdHJsKTtcblxuQWRtaW5NYXRjaGVzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFyc2UnXTtcbmZ1bmN0aW9uIEFkbWluTWF0Y2hlc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5QbGF5ZXJzQ3RybCcsIEFkbWluUGxheWVyc0N0cmwpO1xuXG5BZG1pblBsYXllcnNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYXJzZSddO1xuZnVuY3Rpb24gQWRtaW5QbGF5ZXJzQ3RybCgkc2NvcGUsIFBhcnNlKSB7XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblNldHRpbmdzQ3RybCcsIEFkbWluU2V0dGluZ3NDdHJsKTtcblxuQWRtaW5TZXR0aW5nc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1RvdXJuYW1lbnRTZXJ2aWNlcycsICduZXdUb3VybmFtZW50J107XG5cbmZ1bmN0aW9uIEFkbWluU2V0dGluZ3NDdHJsKCRzY29wZSwgVG91cm5hbWVudFNlcnZpY2VzLCBuZXdUb3VybmFtZW50KSB7XG4gICRzY29wZS5kZXRhaWxzID0gbmV3VG91cm5hbWVudDtcbiAgXG4gIC8vIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRMYWRkZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCkudGhlbihmdW5jdGlvbiAobGFkZGVyKSB7XG4gIC8vICAgJHNjb3BlLmxhZGRlciA9IGxhZGRlcjtcbiAgLy8gfSk7XG4gIFxuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignRGFzaGJvYXJkQ3RybCcsXG4gICAgW1xuICAgICAgJyRzY29wZScsICckc3RhdGUnLCAnJGZpbHRlcicsICckdGltZW91dCcsICckaW50ZXJ2YWwnLCAnJGlvbmljUG9wdXAnLCAnJHJvb3RTY29wZScsXG4gICAgICAnUGFyc2UnLCAndG91cm5hbWVudCcsICdNYXRjaFNlcnZpY2VzJywgJ1F1ZXVlU2VydmljZXMnLCAnTGFkZGVyU2VydmljZXMnLFxuICAgICAgRGFzaGJvYXJkQ3RybFxuICAgIF0pO1xuXG5mdW5jdGlvbiBEYXNoYm9hcmRDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGZpbHRlciwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJGlvbmljUG9wdXAsICRyb290U2NvcGUsXG4gIFBhcnNlLCB0b3VybmFtZW50LCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCBMYWRkZXJTZXJ2aWNlcykge1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnRbMF0udG91cm5hbWVudDtcbiAgdmFyIHByb21pc2UgPSBudWxsO1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gICRzY29wZS5lbmQgPSB7XG4gICAgY2FuUGxheTogdHJ1ZSxcbiAgICB0aW1lOiBwYXJzZUZsb2F0KG1vbWVudCgpLmZvcm1hdCgneCcpKVxuICB9XG4gICRzY29wZS5vcHBvbmVudCA9IFF1ZXVlU2VydmljZXMub3Bwb25lbnQ7XG4gICRzY29wZS5oZXJvTGlzdCA9IFF1ZXVlU2VydmljZXMuaGVyb2VzO1xuICAkc2NvcGUubXlPcHBvbmVudCA9IHtuYW1lOidQQVggQXR0ZW5kZWUnfTtcbiAgXG4gICRyb290U2NvcGUuJG9uKCdvcHBvbmVudDpmb3VuZCcsIHBsYXllckNvbmZpcm0pO1xuICAkcm9vdFNjb3BlLiRvbignb3Bwb25lbnQ6Y29uZmlybWVkJywgb3Bwb25lbnRDb25maXJtZWQpO1xuICAkcm9vdFNjb3BlLiRvbigncmVzdWx0czplbnRlcmVkJywgbWF0Y2hQbGF5ZWQpO1xuXG4gICRzY29wZS4kb24oXCIkaW9uaWNWaWV3LmVudGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ3ZpZXcgbG9hZGVkJyk7XG4gICAgXG4gICAgaWYobmF2aWdhdG9yICYmIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4pIHtcbiAgICAgIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygkc2NvcGUudXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcigkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyc1swXTtcbiAgICAgIHN0YXR1cygpO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgZ2V0Q3VycmVudFN0YXR1cyh0cnVlKTtcbiAgfTtcblxuICAkc2NvcGUuc3RhcnRRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZigkc2NvcGUuZW5kLmNhblBsYXkpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmNhbmNlbFF1ZXVlID0gZnVuY3Rpb24gKCkge1xuICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9O1xuXG4gICRzY29wZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgfTtcblxuICAkc2NvcGUuc2hvd09wcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgcHJvbWlzZSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7Y2hhbmdlV29yZCgpfSwgMjAwMCk7XG4gIH07XG5cbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICB9KTtcbiAgJHNjb3BlLmZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAgICR0aW1lb3V0KHRpbWVyLCAxNTAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoVGltZSgpIHtcbiAgICBpZighJHNjb3BlLm1hdGNoKSB7XG4gICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgICB0aW1lcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZXIoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lciAoKSB7XG4gICAgdmFyIG5vdyA9IG1vbWVudCgpO1xuICAgIHZhciB0aW1lID0gJHNjb3BlLm1hdGNoLmdldCgnYWN0aXZlRGF0ZScpO1xuICAgIGlmKHRpbWUpIHtcbiAgICAgIHZhciBmaXZlTWludXRlcyA9IG1vbWVudCh0aW1lKS5hZGQoMSwgJ21pbnV0ZXMnKTtcbiAgICAgICRzY29wZS5lbmQudGltZSA9IHBhcnNlRmxvYXQoZml2ZU1pbnV0ZXMuZm9ybWF0KCd4JykpO1xuICAgICAgJHNjb3BlLmVuZC5jYW5QbGF5ID0gbm93LmlzQWZ0ZXIoZml2ZU1pbnV0ZXMsICdzZWNvbmRzJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVBsYXllciAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgc3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXMgKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAgIHN3aXRjaCAoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpKSB7XG4gICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgICRzY29wZS5zdG9wKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3F1ZXVlJzpcbiAgICAgICAgICAkc2NvcGUuc2hvd09wcG9uZW50cygpO1xuICAgICAgICAgIG1hdGNoTWFraW5nKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZvdW5kJzpcbiAgICAgICAgICBwbGF5ZXJDb25maXJtKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NvbmZpcm1lZCc6XG4gICAgICAgICAgd2FpdGluZ0Zvck9wcG9uZW50KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ25vT3Bwb25lbnQnOlxuICAgICAgICAgIG5vT3Bwb25lbnQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGxheWluZyc6XG4gICAgICAgICAgZ2V0TGFzdE1hdGNoKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbGxlZCc6XG4gICAgICAgICAgcGxheWVyQ2FuY2VsbGVkKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykpO1xuICAgICAgbWF0Y2hUaW1lKCk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLiRvbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnY29udHJvbGxlciBkZXN0cm95ZWQnKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZ2V0Q3VycmVudFN0YXR1cyhyZWZyZXNoKSB7XG4gICAgdmFyIHJlZnJlc2ggPSByZWZyZXNoO1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcigkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyc1swXTtcbiAgICAgIGlmICgkc2NvcGUucGxheWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjdXJyZW50U3RhdHVzJyk7XG4gICAgICAgIHN0YXR1cygpO1xuICAgICAgICBpZihyZWZyZXNoKSB7XG4gICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhc3RNYXRjaCgpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgIGlmKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnY29tcGxldGVkJykge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gbWF0Y2hNYWtpbmcoKSB7XG4gICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaG1ha2luZycpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxheWVyQ29uZmlybSgpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAkdGltZW91dCAoZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUuc3RvcCgpO1xuICAgICAgICBpZigkc2NvcGUubWF0Y2guc3RhdHVzID09PSAncGVuZGluZycpIHtcbiAgICAgICAgICB2YXIgY29uZmlybVBvcHVwID0gJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICAgICAgICB0aXRsZTogJ01hdGNobWFraW5nJyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+PHN0cm9uZz5BIFdvcnRoeSBPcHBvbmVudDwvc3Ryb25nPjxicj4gaGFzIGJlZW4gZm91bmQhPC9kaXY+JyxcbiAgICAgICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRleHQ6ICc8Yj5Db25maXJtPC9iPicsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgXVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgY29uZmlybVBvcHVwLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgaWYocmVzKSB7XG4gICAgICAgICAgICAgIGlmICgkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnY29uZmlybTEnLCB0cnVlKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdjb25maXJtMicsIHRydWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdjb25maXJtZWQnKTtcbiAgICAgICAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2hvd0ZhaWxQb3B1cCgpO1xuICAgICAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSA9PT0gJ2ZvdW5kJykge1xuICAgICAgICAgICAgICBjb25maXJtUG9wdXAuY2xvc2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCAyMDAwMCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYoJHNjb3BlLm1hdGNoLnN0YXR1cyA9PT0gJ2NhbmNlbGxlZCcpIHtcbiAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0sIDIwMDApO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd0ZhaWxQb3B1cCgpIHtcbiAgICB2YXIgZmFpbFBvcHVwID0gJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICB0aXRsZTogJ01hdGNobWFraW5nJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+WW91IEZhaWxlZCB0byBDb25maXJtIE1hdGNoPC9kaXY+JyxcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5DbG9zZTwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KTtcblxuICAgIGZhaWxQb3B1cC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcblxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gb3Bwb25lbnRDb25maXJtZWQgKCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpLCAnYWN0aXZlJykge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC52aWV3Jyk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhaXRpbmdGb3JPcHBvbmVudCAoKSB7XG4gICAgUGFyc2UuQ2xvdWQucnVuKCdjb25maXJtTWF0Y2gnKS50aGVuKGZ1bmN0aW9uIChudW0pIHtcbiAgICAgIGNoZWNrT3Bwb25lbnQoNTAwMCwgZmFsc2UpO1xuICAgICAgY2hlY2tPcHBvbmVudCgzMDAwMCwgdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja09wcG9uZW50ICh0aW1lb3V0LCBhbHJlYWR5Q2hlY2tlZCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSA9PT0gJ2NvbmZpcm1lZCcpIHtcbiAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcblxuICAgICAgICAgIHN3aXRjaCAoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykpIHtcbiAgICAgICAgICAgIGNhc2UgJ3BlbmRpbmcnOlxuICAgICAgICAgICAgICBpZihhbHJlYWR5Q2hlY2tlZCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnbm9PcHBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2FjdGl2ZSc6XG4gICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncGxheWluZycpO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgICAgICAgICAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLm1hdGNoLnZpZXcnKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuICBmdW5jdGlvbiBtYXRjaFBsYXllZCgpIHtcbiAgICBpZigkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykgIT09ICdvcGVuJykge1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgc2hvd01hdGNoUmVzdWx0c1BvcHVwKCk7XG4gICAgICB9KVxuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBzaG93TWF0Y2hSZXN1bHRzUG9wdXAoKSB7XG4gICAgdmFyIHBvcHVwID0gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdNYXRjaCBQbGF5ZWQnLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5Zb3VyIE9wcG9uZW50IGhhcyBzdWJtaXR0aW5nIHJlc3VsdHM8L2Rpdj4nXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcblxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9PcHBvbmVudCAoKSB7XG4gICAgJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICB0aXRsZTogJ01hdGNoIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+PHN0cm9uZz5Zb3VyIE9wcG9uZW50PC9zdHJvbmc+PGJyPiBmYWlsZWQgdG8gY29uZmlybSE8L2Rpdj4nLFxuICAgICAgYnV0dG9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPkJhY2s8L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLWFzc2VydGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+UXVldWUgQWdhaW48L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ2NhbmNlbGxlZCcpO1xuICAgICAgICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5nZVdvcmQgKCkge1xuICAgICRzY29wZS5teU9wcG9uZW50Lm5hbWUgPSAkc2NvcGUub3Bwb25lbnQubGlzdFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqJHNjb3BlLm9wcG9uZW50Lmxpc3QubGVuZ3RoKV07XG4gIH07XG59O1xuLy8gZnVuY3Rpb24gam9pblF1ZXVlUG9wdXAgKCkge1xuLy8gICBzdWIoKTtcbi8vICAgJHNjb3BlLnNlbGVjdGVkID0ge3N0YXR1czogdHJ1ZX07XG4vLyAgICRzY29wZS5zZWxlY3RIZXJvID0gZnVuY3Rpb24gKGhlcm8pIHtcbi8vICAgICAkc2NvcGUuaW1hZ2UgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm9DbGFzcycpKVswXS5jbGllbnRXaWR0aDtcbi8vXG4vLyAgICAgaWYoaGVyby5jaGVja2VkKSB7XG4vLyAgICAgICBoZXJvLmNoZWNrZWQgPSAhaGVyby5jaGVja2VkO1xuLy8gICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IHRydWU7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy9cbi8vICAgICBpZighaGVyby5jaGVja2VkICYmICRzY29wZS5zZWxlY3RlZC5zdGF0dXMpIHtcbi8vICAgICAgIGhlcm8uY2hlY2tlZCA9ICFoZXJvLmNoZWNrZWQ7XG4vLyAgICAgICAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzID0gZmFsc2U7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICB9O1xuLy8gICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbi8vICAgICB7XG4vLyAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvc2VsZWN0Lmhlcm8uaHRtbCcsXG4vLyAgICAgICB0aXRsZTogJ1NlbGVjdCBIZXJvIENsYXNzJyxcbi8vICAgICAgIHNjb3BlOiAkc2NvcGUsXG4vLyAgICAgICBidXR0b25zOiBbXG4vLyAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuLy8gICAgICAgICB7IHRleHQ6ICc8Yj5RdWV1ZTwvYj4nLFxuLy8gICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuLy8gICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4vLyAgICAgICAgICAgICB2YXIgaGVybyA9ICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5oZXJvTGlzdCwge2NoZWNrZWQ6IHRydWV9LCB0cnVlKTtcbi8vICAgICAgICAgICAgIGlmICghaGVyby5sZW5ndGgpIHtcbi8vICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gICAgICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAgICAgcmV0dXJuIGhlcm9bMF07XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgICBdXG4vLyAgICAgfSk7XG4vLyB9O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xhZGRlckpvaW5DdHJsJywgWyckc2NvcGUnLCAnJGZpbHRlcicsICckaW9uaWNQb3B1cCcsICckc3RhdGUnLCAnJGlvbmljSGlzdG9yeScsICckcScsICdQYXJzZScsICd0b3VybmFtZW50JywgJ0xhZGRlclNlcnZpY2VzJywgTGFkZGVySm9pbkN0cmxdKTtcblxuZnVuY3Rpb24gTGFkZGVySm9pbkN0cmxcbigkc2NvcGUsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksICRxLCBQYXJzZSwgIHRvdXJuYW1lbnQsIExhZGRlclNlcnZpY2VzKSB7XG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG4gICRzY29wZS5wbGF5ZXIgPSB7XG4gICAgYmF0dGxlVGFnOiAnJ1xuICB9O1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIudXNlcm5hbWUgPSAkc2NvcGUudXNlci51c2VybmFtZTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zdGF0dXMgPSAnb3Blbic7XG4gICAgICAgIExhZGRlclNlcnZpY2VzLmpvaW5Ub3VybmFtZW50KCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlciwgJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgU3VjY2Vzc1BvcHVwKHBsYXllcikudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvcik7XG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZUJhdHRsZVRhZyAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdGFnID0gJHNjb3BlLnBsYXllci5iYXR0bGVUYWc7XG5cbiAgICBpZih0YWcubGVuZ3RoIDwgOCkge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgYmF0dGxlIHRhZycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBzcGxpdCA9IHRhZy5zcGxpdCgnIycpO1xuICAgIGlmKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgQkFUVExFVEFH4oSiIGluY2x1ZGluZyAjIGFuZCBmb3VyIGRpZ2l0cycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKHNwbGl0WzFdLmxlbmd0aCA8IDIgfHwgc3BsaXRbMV0ubGVuZ3RoID4gNCkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyB1cCB0byBmb3VyIGRpZ2l0cyBhZnRlciAjIScpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKGlzTmFOKHNwbGl0WzFdKSkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyBmb3VyIGRpZ2l0cyBhZnRlciAjJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMudmFsaWRhdGVQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCwgdGFnKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICBpZihyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBjYi5yZWplY3QoJ1RoZSBCQVRUTEVUQUfihKIgeW91IGVudGVyZWQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYi5yZXNvbHZlKHRhZyk7XG4gICAgICB9IFxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgc2lnbmVkIHVwISBOb3cgZ28gZmluZCBhIHZhbGlhbnQgb3Bwb25lbnQuJ1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMZWFkZXJCb2FyZHNDdHJsJywgTGVhZGVyQm9hcmRzQ3RybCk7XG5cbkxlYWRlckJvYXJkc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ0xhZGRlclNlcnZpY2VzJywgJ3RvdXJuYW1lbnQnLCAnUGFyc2UnLCAnJGZpbHRlcicsICckaW9uaWNQb3B1cCddO1xuZnVuY3Rpb24gTGVhZGVyQm9hcmRzQ3RybCgkc2NvcGUsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50LCBQYXJzZSwgJGZpbHRlciwgJGlvbmljUG9wdXApIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICBnZXRQbGF5ZXJzKCk7XG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2V0UGxheWVycygpO1xuICB9XG4gIFxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKCkge1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudFswXS50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICB2YXIgcmFuayA9IDE7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGxheWVycywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICAgIHJhbmsrKztcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5Mb2dpbkN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNIaXN0b3J5J107XG5mdW5jdGlvbiBMb2dpbkN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICRzY29wZS51c2VyID0ge307XG4gIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2UuVXNlci5sb2dJbigkc2NvcGUudXNlci51c2VybmFtZSwgJHNjb3BlLnVzZXIucGFzc3dvcmQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICAgICAgUGFyc2VQdXNoUGx1Z2luLnN1YnNjcmliZSh1c2VyLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWJiZWQnKTtcbiAgICAgICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbiAodXNlciwgZXJyb3IpIHtcbiAgICAgICAgJHNjb3BlLndhcm5pbmcgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd1c2VyJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuICAgICRzY29wZS53YXJuaW5nID0gbnVsbDtcbiAgfSwgdHJ1ZSk7XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoTGlzdEN0cmwnLCBNYXRjaExpc3RDdHJsKTtcblxuTWF0Y2hMaXN0Q3RybC4kaW5qZWN0ID0gW1xuICAnJHNjb3BlJywgJyRzdGF0ZScsICckaW9uaWNQb3B1cCcsICdQYXJzZScsICdNYXRjaFNlcnZpY2VzJywgJ3BsYXllcidcbl07XG5mdW5jdGlvbiBNYXRjaExpc3RDdHJsKCRzY29wZSwgJHN0YXRlLCAkaW9uaWNQb3B1cCwgUGFyc2UsIE1hdGNoU2VydmljZXMsIHBsYXllcikge1xuICAkc2NvcGUubWF0Y2hlcyA9IFtdO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuICBpZigkc2NvcGUucGxheWVyKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRQbGF5ZXJNYXRjaGVzKCRzY29wZS5wbGF5ZXIsICdjb21wbGV0ZWQnKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAkc2NvcGUubWF0Y2hlcyA9IG1hdGNoZXM7XG4gICAgfSk7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRQbGF5ZXJNYXRjaGVzKCRzY29wZS5wbGF5ZXIsICdyZXBvcnRlZCcpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICRzY29wZS5yZXBvcnRlZCA9IG1hdGNoZXM7XG4gICAgfSk7XG4gIH1cbiAgXG4gICRzY29wZS5wcm9jZXNzTWF0Y2ggPSBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICBpZihtYXRjaC53aW5uZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYobWF0Y2gubG9zZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIGlmKG1hdGNoLnJlcG9ydFJlYXNvbil7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoJHNjb3BlLnJlcG9ydGVkLmxlbmd0aCkge1xuICAgICAgc2hvd1JlcG9ydGVkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICRzdGF0ZS5nbygnYXBwLm1hdGNoLnJlcG9ydCcsIHtpZDogbWF0Y2guaWR9KTtcbiAgfVxuICBcbiAgZnVuY3Rpb24gc2hvd1JlcG9ydGVkKCkge1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnVG9vIE1hbnkgUmVwb3J0cycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdSBoYXZlIHRvbyBtYW55IHBlbmRpbmcgcmVwb3J0cy4gUGxlYXNlIHdhaXQuPC9kaXY+J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgXG4gICAgfSlcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFJlcG9ydEN0cmwnLCBNYXRjaFJlcG9ydEN0cmwpO1xuXG5NYXRjaFJlcG9ydEN0cmwuJGluamVjdCA9IFtcbiAgJyRzY29wZScsICckc3RhdGUnLCAnJHJvb3RTY29wZScsICckaW9uaWNQb3B1cCcsICckaW9uaWNIaXN0b3J5JyxcbiAgJ1BhcnNlJywgJ01hdGNoU2VydmljZXMnLCAncmVwb3J0J1xuXTtcbmZ1bmN0aW9uIE1hdGNoUmVwb3J0Q3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY1BvcHVwLCAkaW9uaWNIaXN0b3J5LFxuICBQYXJzZSwgTWF0Y2hTZXJ2aWNlcywgcmVwb3J0XG4pIHtcblxuICAkc2NvcGUubWF0Y2ggPSByZXBvcnQ7XG5cbiAgJHNjb3BlLnBpY3R1cmUgPSBudWxsO1xuXG4gIHZhciBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZSgpO1xuICB2YXIgaW1nU3RyaW5nID0gbnVsbDtcblxuICAkc2NvcGUuZ2V0UGljdHVyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgcXVhbGl0eTogOTAsXG4gICAgICB0YXJnZXRXaWR0aDogMzIwLFxuICAgICAgdGFyZ2V0SGVpZ2h0OiA1MDAsXG4gICAgICBkZXN0aW5hdGlvblR5cGU6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuREFUQV9VUkwsXG4gICAgICBzb3VyY2VUeXBlOiAwLFxuICAgICAgZW5jb2RpbmdUeXBlOiAxXG4gICAgfVxuICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZShvblN1Y2Nlc3Msb25GYWlsLG9wdGlvbnMpO1xuICB9XG4gIHZhciBvblN1Y2Nlc3MgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlRGF0YTtcbiAgICBpbWdTdHJpbmcgPSBpbWFnZURhdGE7XG4gICAgJHNjb3BlLiRhcHBseSgpO1xuICB9O1xuICB2YXIgb25GYWlsID0gZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUubG9nKFwiT24gZmFpbCBcIiArIGUpO1xuICB9XG4gIFxuICAkc2NvcGUucHJvY2Vzc1JlcG9ydCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYoaW1nU3RyaW5nKSB7XG4gICAgICBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZShcInJlcG9ydC5wbmdcIiwge2Jhc2U2NDppbWdTdHJpbmd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyc2VGaWxlID0gbnVsbDtcbiAgICB9XG4gICAgJHNjb3BlLm1hdGNoLnNldChcInJlcG9ydEltYWdlXCIsIHBhcnNlRmlsZSk7XG4gICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ3JlcG9ydGVkJyk7XG4gICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgfSk7XG4gICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgIHRpdGxlOiAnTWF0Y2ggUmVwb3J0ZWQnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlRoYW5rIHlvdSBmb3Igc3VibWl0dGluZyB0aGUgcmVwb3J0LjwvZGl2PidcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIH1cblxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFZpZXdDdHJsJywgTWF0Y2hWaWV3Q3RybCk7XG5cbk1hdGNoVmlld0N0cmwuJGluamVjdCA9IFtcbiAgJyRzY29wZScsICckc3RhdGUnLCAnJHJvb3RTY29wZScsICckaW9uaWNQb3B1cCcsICckaW9uaWNIaXN0b3J5JyxcbiAgJ1BhcnNlJywgJ0xhZGRlclNlcnZpY2VzJywgJ01hdGNoU2VydmljZXMnLCAnUXVldWVTZXJ2aWNlcycsXG4gICd0b3VybmFtZW50JywgJ21hdGNoJywgJ3BsYXllcidcbl07XG5mdW5jdGlvbiBNYXRjaFZpZXdDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJHJvb3RTY29wZSwgJGlvbmljUG9wdXAsICRpb25pY0hpc3RvcnksXG4gIFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcyxcbiAgdG91cm5hbWVudCwgbWF0Y2gsIHBsYXllclxuKSB7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gICRzY29wZS5lbmQgPSB7XG4gICAgdGltZTogMFxuICB9O1xuXG4gICRzY29wZS4kb24oXCIkaW9uaWNWaWV3LmVudGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hbMF07XG4gICAgJHNjb3BlLnBsYXllciA9IHBsYXllclswXTtcbiAgICBnZXRNYXRjaERldGFpbHMoKTtcbiAgfSk7XG5cbiAgJHJvb3RTY29wZS4kb24oJ3Jlc3VsdHM6ZW50ZXJlZCcsIGdldE1hdGNoKTtcblxuICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG4gIHZhciBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZSgpO1xuICB2YXIgaW1nU3RyaW5nID0gbnVsbDtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG5cblxuXG4gICRzY29wZS5nZXRQaWN0dXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICBxdWFsaXR5OiA5MCxcbiAgICAgIHRhcmdldFdpZHRoOiAzMjAsXG4gICAgICB0YXJnZXRIZWlnaHQ6IDUwMCxcbiAgICAgIGRlc3RpbmF0aW9uVHlwZTogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5EQVRBX1VSTCxcbiAgICAgIHNvdXJjZVR5cGU6IDAsXG4gICAgICBlbmNvZGluZ1R5cGU6IDFcbiAgICB9XG4gICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKG9uU3VjY2VzcyxvbkZhaWwsb3B0aW9ucyk7XG4gIH1cbiAgdmFyIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuICAgICRzY29wZS5waWN0dXJlID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnICsgaW1hZ2VEYXRhO1xuICAgIGltZ1N0cmluZyA9IGltYWdlRGF0YTtcbiAgICAkc2NvcGUuJGFwcGx5KCk7XG4gIH07XG4gIHZhciBvbkZhaWwgPSBmdW5jdGlvbihlKSB7XG4gICAgY29uc29sZS5sb2coXCJPbiBmYWlsIFwiICsgZSk7XG4gIH1cblxuICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgZ2V0TWF0Y2godHJ1ZSk7XG4gIH07XG5cbiAgJHNjb3BlLnJlY29yZCA9IGZ1bmN0aW9uIChyZWNvcmQpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IG51bGw7XG4gICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdhY3RpdmUnKSB7XG4gICAgICAgIHN3aXRjaCAocmVjb3JkKSB7XG4gICAgICAgICAgY2FzZSAnd2luJzpcbiAgICAgICAgICAgIHdpbk1hdGNoKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgaWYocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnd2lubmVyJywgJHNjb3BlLnBsYXllcik7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnbG9zZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWUgPSAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWVcbiAgICAgICAgICAgICAgICByZWNvcmRNYXRjaCgkc2NvcGUubWF0Y2gsIHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2xvc3MnOlxuICAgICAgICAgICAgbG9zZU1hdGNoKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgaWYocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnd2lubmVyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLnBsYXllcik7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWUgPSAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgcmVjb3JkTWF0Y2goJHNjb3BlLm1hdGNoLCB1c2VybmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB3aW5NYXRjaCAoKSB7XG4gICAgJHNjb3BlLnBpY3R1cmUgPSBudWxsO1xuICAgICRzY29wZS5lcnJvck1lc3NhZ2UgPSBudWxsO1xuXG4gICAgcmV0dXJuICRpb25pY1BvcHVwLnNob3coXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy93aW4ubWF0Y2guaHRtbCcsXG4gICAgICAgIHRpdGxlOiAnUmVwb3J0IGEgV2luJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgaWYgKCEkc2NvcGUucGljdHVyZSkge1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvck1lc3NhZ2UgPSAnVXBsb2FkIGEgU2NyZWVuc2hvdCc7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvc2VNYXRjaCgpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcG9wdXBzL2xvc2UubWF0Y2guaHRtbCcsXG4gICAgICAgIHRpdGxlOiAnUmVwb3J0IGEgTG9zcycsXG4gICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdDYW5jZWwnfSxcbiAgICAgICAgICB7IHRleHQ6ICc8Yj5Db25maXJtPC9iPicsXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRNYXRjaChyZWZyZXNoKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRNYXRjaCgkc2NvcGUubWF0Y2guaWQpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaDtcbiAgICAgIGNvbnNvbGUubG9nKCdtYXRjaCcgKyAkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSk7XG4gICAgICBpZihyZWZyZXNoKSB7XG4gICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29yZE1hdGNoKG1hdGNoLCB1c2VybmFtZSkge1xuXG4gICAgbWF0Y2guc2V0KCdzdGF0dXMnLCAnY29tcGxldGVkJyk7XG4gICAgbWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaFJlc3VsdHMnLCB7dXNlcm5hbWU6IHVzZXJuYW1lLCBtYXRjaDogbWF0Y2guaWR9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICB0aXRsZTogJ01hdGNoIFN1Ym1pdHRlZCcsXG4gICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5UaGFuayB5b3UgZm9yIHN1Ym1pdHRpbmcgcmVzdWx0czwvZGl2PidcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG5cbiAgICAgICAgfSlcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWF0Y2hEZXRhaWxzKCkge1xuICAgICRzY29wZS5vcHBvbmVudCA9IHtcbiAgICAgIGhlcm86IG51bGwsXG4gICAgICBiYXR0bGVUYWc6IG51bGxcbiAgICB9XG4gICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgJHNjb3BlLm9wcG9uZW50Lmhlcm8gPSAkc2NvcGUubWF0Y2guaGVybzI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWUgPSAkc2NvcGUubWF0Y2gudXNlcm5hbWUyO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LmJhdHRsZVRhZyA9ICRzY29wZS5tYXRjaC5iYXR0bGVUYWcyO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXIgPSAkc2NvcGUubWF0Y2gucGxheWVyMjtcbiAgICB9XG4gICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIyJykge1xuICAgICAgJHNjb3BlLm9wcG9uZW50Lmhlcm8gPSAkc2NvcGUubWF0Y2guaGVybzE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWUgPSAkc2NvcGUubWF0Y2gudXNlcm5hbWUxO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LmJhdHRsZVRhZyA9ICRzY29wZS5tYXRjaC5iYXR0bGVUYWcxO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXIgPSAkc2NvcGUubWF0Y2gucGxheWVyMTtcbiAgICB9XG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdNZW51Q3RybCcsIE1lbnVDdHJsKTtcblxuTWVudUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywnJGlvbmljUG9wb3ZlcicsICckc3RhdGUnLCAnJGlvbmljSGlzdG9yeScsICdQYXJzZScsICckdGltZW91dCddO1xuZnVuY3Rpb24gTWVudUN0cmwoJHNjb3BlLCAkaW9uaWNQb3BvdmVyLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlLCAkdGltZW91dCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJGlvbmljUG9wb3Zlci5mcm9tVGVtcGxhdGVVcmwoJ3RlbXBsYXRlcy9wb3BvdmVycy9wcm9maWxlLnBvcC5odG1sJywge1xuICAgIHNjb3BlOiAkc2NvcGUsXG4gIH0pLnRoZW4oZnVuY3Rpb24ocG9wb3Zlcikge1xuICAgICRzY29wZS5wb3BvdmVyID0gcG9wb3ZlcjtcbiAgfSk7XG5cbiAgJHNjb3BlLm1lbnUgPSBmdW5jdGlvbiAobGluaykge1xuICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgfSk7XG4gICAgaWYobGluayA9PT0gJ2xvZ2luJykge1xuICAgICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgICBQYXJzZVB1c2hQbHVnaW4udW5zdWJzY3JpYmUoJHNjb3BlLnVzZXIuY3VycmVudCgpLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnc3ViYmVkJyk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC4nICsgbGluaywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgfSk7XG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICB9XG4gICAgJHNjb3BlLnBvcG92ZXIuaGlkZSgpO1xuICB9XG4gIC8vQ2xlYW51cCB0aGUgcG9wb3ZlciB3aGVuIHdlJ3JlIGRvbmUgd2l0aCBpdCFcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wb3Zlci5yZW1vdmUoKTtcbiAgfSk7XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgUmVnaXN0ZXJDdHJsKTtcblxuUmVnaXN0ZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIFJlZ2lzdGVyQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY1BvcHVwKSB7XG5cbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuUmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB2YXIgcmVnaXN0ZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgIHJlZ2lzdGVyLnNldCh1c2VyKTtcbiAgICByZWdpc3Rlci5zaWduVXAobnVsbCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgQWRtaW5Sb3V0ZXNdKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBMYWRkZXJSb3V0ZXNdKTtcblxuZnVuY3Rpb24gTGFkZGVyUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyJywge1xuICAgICAgdXJsOiAnL2xhZGRlcicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGFkZGVyLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIubGVhZGVyYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvbGVhZGVyYm9hcmRzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sZWFkZXJib2FyZC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZHNDdHJsJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmpvaW4nLCB7XG4gICAgICB1cmw6ICcvam9pbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvam9pbi5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMYWRkZXJKb2luQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBNYXRjaFJvdXRlc10pO1xuXG5mdW5jdGlvbiBNYXRjaFJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoJywge1xuICAgICAgdXJsOiAnL21hdGNoJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmh0bWwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLmxpc3QnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC5saXN0Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoTGlzdEN0cmwnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBwbGF5ZXI6IGZ1bmN0aW9uIChQYXJzZSwgTGFkZGVyU2VydmljZXMsIHRvdXJuYW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKHRvdXJuYW1lbnRbMF0udG91cm5hbWVudCwgUGFyc2UuVXNlci5jdXJyZW50KCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5tYXRjaC52aWV3Jywge1xuICAgICAgdXJsOiAnL3ZpZXcnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2gudmlldy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNYXRjaFZpZXdDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcGxheWVyOiBmdW5jdGlvbiAoUGFyc2UsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIExhZGRlclNlcnZpY2VzLmdldFBsYXllcih0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfSxcbiAgICAgICAgbWF0Y2g6IGZ1bmN0aW9uIChNYXRjaFNlcnZpY2VzLCAkc3RhdGUsICRxLCBwbGF5ZXIpIHtcbiAgICAgICAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2gocGxheWVyWzBdKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICAgICBpZighbWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY2IucmVqZWN0KCk7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgY2IucmVzb2x2ZShtYXRjaGVzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gucmVwb3J0Jywge1xuICAgICAgdXJsOiAnL3JlcG9ydC86aWQnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2gucmVwb3J0Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoUmVwb3J0Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHJlcG9ydDogZnVuY3Rpb24gKE1hdGNoU2VydmljZXMsICRzdGF0ZVBhcmFtcykge1xuICAgICAgICAgIHJldHVybiBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCRzdGF0ZVBhcmFtcy5pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ0xhZGRlclNlcnZpY2VzJywgWydQYXJzZScsICdMYWRkZXInLCBMYWRkZXJTZXJ2aWNlc10pXG4gIC5mYWN0b3J5KCdMYWRkZXInLCBbJ1BhcnNlJywgTGFkZGVyXSlcblxuZnVuY3Rpb24gTGFkZGVyU2VydmljZXMoUGFyc2UsIExhZGRlcikge1xuICByZXR1cm4ge1xuICAgIGdldFBsYXllcnM6IGdldFBsYXllcnMsXG4gICAgZ2V0UGxheWVyOiBnZXRQbGF5ZXIsXG4gICAgdmFsaWRhdGVQbGF5ZXI6IHZhbGlkYXRlUGxheWVyLFxuICAgIGpvaW5Ub3VybmFtZW50OiBqb2luVG91cm5hbWVudCxcbiAgICBnZXRQZW5kaW5nUGxheWVyczogZ2V0UGVuZGluZ1BsYXllcnNcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQZW5kaW5nUGxheWVycyh0b3VybmFtZW50LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5Lm5vdEVxdWFsVE8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcnModG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKCdwb2ludHMnLCAnbW1yJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZVBsYXllcih0b3VybmV5LCBiYXR0bGVUYWcpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygnYmF0dGxlVGFnJywgYmF0dGxlVGFnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcih0b3VybmV5LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgdXNlciwgdXNlckRhdGEpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbCgpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgdXNlcik7XG4gICAgcGxheWVyLnNldCh1c2VyRGF0YSk7XG4gICAgcGxheWVyLnNldCgnd2lucycsIDApO1xuICAgIHBsYXllci5zZXQoJ2xvc3NlcycsIDApO1xuICAgIHBsYXllci5zZXQoJ3BvaW50cycsIDApO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBMYWRkZXIoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTGFkZGVyJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3VzZXInLCAnYmF0dGxlVGFnJywgJ3VzZXJuYW1lJywgXG4gICAgJ2hlcm8nLCAncGxheWVyJywgJ3N0YXR1cycsICdjYW5jZWxUaW1lcicsICd3aW5zJywgJ2xvc3NlcycsICdtbXInLCAncG9pbnRzJywgJ2JhblJlYXNvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59O1xuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdNYXRjaFNlcnZpY2VzJywgWydQYXJzZScsICdNYXRjaCcsICckcScsIE1hdGNoU2VydmljZXNdKVxuICAuZmFjdG9yeSgnTWF0Y2gnLCBbJ1BhcnNlJywgTWF0Y2hdKTtcblxuZnVuY3Rpb24gTWF0Y2hTZXJ2aWNlcyhQYXJzZSwgTWF0Y2gsICRxKSB7XG4gIHZhciB1c2VyID0gUGFyc2UuVXNlcjtcbiAgcmV0dXJuIHtcbiAgICBnZXRDb25maXJtZWRNYXRjaDogZ2V0Q29uZmlybWVkTWF0Y2gsXG4gICAgZ2V0UGVuZGluZ01hdGNoOiBnZXRQZW5kaW5nTWF0Y2gsXG4gICAgZ2V0TGF0ZXN0TWF0Y2g6IGdldExhdGVzdE1hdGNoLFxuICAgIGdldE1hdGNoOiBnZXRNYXRjaCxcbiAgICBnZXRQbGF5ZXJNYXRjaGVzOiBnZXRQbGF5ZXJNYXRjaGVzLFxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyTWF0Y2hlcyhwbGF5ZXIsIHN0YXR1cykge1xuICAgIHZhciBwbGF5ZXIxID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBwbGF5ZXIxLmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIHZhciBwbGF5ZXIyID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBwbGF5ZXIyLmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIHZhciBtYWluUXVlcnkgPSBQYXJzZS5RdWVyeS5vcihwbGF5ZXIxLCBwbGF5ZXIyKTtcbiAgICBtYWluUXVlcnkubGltaXQoMTApO1xuICAgIG1haW5RdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCBzdGF0dXMpO1xuICAgIHJldHVybiBtYWluUXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGF0ZXN0TWF0Y2gocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKVxuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuaW5jbHVkZSgnd2lubmVyJyk7XG4gICAgcXVlcnkuaW5jbHVkZSgnbG9zZXInKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q29uZmlybWVkTWF0Y2ggKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJyk7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdhY3RpdmUnKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcilcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcilcbiAgICB9XG4gICAgcXVlcnkuZXF1YWxUbygnY29uZmlybTEnLCB0cnVlKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdjb25maXJtMicsIHRydWUpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuXG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRQZW5kaW5nTWF0Y2gocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKVxuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKTtcbiAgICB9XG4gICAgcXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE1hdGNoKGlkKSB7XG4gICAgdmFyIG1hdGNoID0gbmV3IE1hdGNoLk1vZGVsKCk7XG4gICAgbWF0Y2guaWQgPSBpZDtcbiAgICByZXR1cm4gbWF0Y2guZmV0Y2goKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNYXRjaChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdNYXRjaCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFtcbiAgICAndG91cm5hbWVudCcsICdwbGF5ZXIxJywgJ3BsYXllcjInLCAnaGVybzEnLCAnaGVybzInLCAndXNlcm5hbWUxJywgJ3VzZXJuYW1lMicsICdiYXR0bGVUYWcxJywgJ2JhdHRsZVRhZzInLCAnc3RhdHVzJywgJ3dpbm5lcicsICdsb3NlcicsXG4gICAgJ3dpbkltYWdlJywgJ3JlcG9ydFJlYXNvbicsICdyZXBvcnRJbWFnZScsICdhY3RpdmVEYXRlJywgJ3VzZXIxJywgJ3VzZXIyJ1xuICBdO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ2NvbnZlcnRJbWFnZScsIFtjb252ZXJ0SW1hZ2VdKTtcblxuZnVuY3Rpb24gY29udmVydEltYWdlICgpIHtcblxuICByZXR1cm4ge1xuICAgIGdldERhdGFVcmk6IGdldERhdGFVcmlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldERhdGFVcmkgKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICBjYW52YXMud2lkdGggPSB0aGlzLm5hdHVyYWxXaWR0aDsgLy8gb3IgJ3dpZHRoJyBpZiB5b3Ugd2FudCBhIHNwZWNpYWwvc2NhbGVkIHNpemVcbiAgICAgIGNhbnZhcy5oZWlnaHQgPSB0aGlzLm5hdHVyYWxIZWlnaHQ7IC8vIG9yICdoZWlnaHQnIGlmIHlvdSB3YW50IGEgc3BlY2lhbC9zY2FsZWQgc2l6ZVxuXG4gICAgICBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcywgMCwgMCk7XG5cbiAgICAgIC8vIEdldCByYXcgaW1hZ2UgZGF0YVxuICAgICAgY2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJykucmVwbGFjZSgvXmRhdGE6aW1hZ2VcXC8ocG5nfGpwZyk7YmFzZTY0LC8sICcnKSk7XG5cbiAgICAgIC8vIC4uLiBvciBnZXQgYXMgRGF0YSBVUklcbiAgICAgIC8vY2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJykpO1xuICAgIH07XG4gICAgaW1hZ2Uuc3JjID0gdXJsO1xuICB9XG5cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnUXVldWVTZXJ2aWNlcycsW1F1ZXVlU2VydmljZXNdKVxuXG5mdW5jdGlvbiBRdWV1ZVNlcnZpY2VzKCkge1xuICB2YXIgb3Bwb25lbnQgPSB7XG4gICAgbGlzdDogWydFYXN5IFBpY2tpbmdzJywgJ1lvdXIgV29yc3QgTmlnaHRtYXJlJywgJ1dvcmxkIGNsYXNzIHBhc3RlIGVhdGVyJyxcbiAgICAgICdBIE11cmxvYycsICdHb3VyZCBjcml0aWMnLCAnTm9zZSBhbmQgbW91dGggYnJlYXRoZXInLCAnSG9nZ2VyJywgJ0EgY2FyZGlzaCBJYW4nLFxuICAgICAgJ01vcGV5IE1hZ2UnLCAnV29tYmF0IFdhcmxvY2snLCAnUm91Z2VkIHVwIFJvZ3VlJywgJ1dhaWZpc2ggV2FycmlvcicsICdEYW1wIERydWlkJyxcbiAgICAgICdTaGFiYnkgU2hhbWFuJywgJ1Blbm5pbGVzcyBQYWxhZGluJywgJ0h1ZmZ5IEh1bnRlcicsICdQZXJreSBQcmllc3QnLCAnVGhlIFdvcnN0IFBsYXllcicsXG4gICAgICAnWW91ciBPbGQgUm9vbW1hdGUnLCAnU3RhckNyYWZ0IFBybycsICdGaXNjYWxseSByZXNwb25zaWJsZSBtaW1lJywgJ1lvdXIgR3VpbGQgTGVhZGVyJyxcbiAgICAgICdOb25lY2sgR2VvcmdlJywgJ0d1bSBQdXNoZXInLCAnQ2hlYXRlciBNY0NoZWF0ZXJzb24nLCAnUmVhbGx5IHNsb3cgZ3V5JywgJ1JvYWNoIEJveScsXG4gICAgICAnT3JhbmdlIFJoeW1lcicsICdDb2ZmZWUgQWRkaWN0JywgJ0lud2FyZCBUYWxrZXInLCAnQmxpenphcmQgRGV2ZWxvcGVyJywgJ0dyYW5kIE1hc3RlcicsXG4gICAgICAnRGlhbW9uZCBMZWFndWUgUGxheWVyJywgJ0JyYW5kIE5ldyBQbGF5ZXInLCAnRGFzdGFyZGx5IERlYXRoIEtuaWdodCcsICdNZWRpb2NyZSBNb25rJyxcbiAgICAgICdBIExpdHRsZSBQdXBweSdcbiAgICBdXG4gIH07XG4gIHZhciBoZXJvZXMgPSBbXG4gICAge3RleHQ6ICdtYWdlJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnaHVudGVyJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncGFsYWRpbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcnJpb3InLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdkcnVpZCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcmxvY2snLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdzaGFtYW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwcmllc3QnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdyb2d1ZScsIGNoZWNrZWQ6IGZhbHNlfVxuICBdXG4gIHJldHVybiB7XG4gICAgb3Bwb25lbnQ6IG9wcG9uZW50LFxuICAgIGhlcm9lczogaGVyb2VzXG4gIH1cbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdUb3VybmFtZW50U2VydmljZXMnLCBbJ1BhcnNlJywgJyRxJywgJ1RvdXJuYW1lbnQnLCAnRGV0YWlscycsICdMYWRkZXInLCBUb3VybmFtZW50U2VydmljZXNdKVxuXG4gIC5mYWN0b3J5KCdUb3VybmFtZW50JywgWydQYXJzZScsIFRvdXJuYW1lbnRdKVxuICAuZmFjdG9yeSgnRGV0YWlscycsIFsnUGFyc2UnLCBEZXRhaWxzXSk7XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnRTZXJ2aWNlcyhQYXJzZSwgJHEsIFRvdXJuYW1lbnQsIERldGFpbHMsIExhZGRlcikge1xuICByZXR1cm4ge1xuICAgIGdldFRvdXJuYW1lbnQ6IGdldFRvdXJuYW1lbnQsXG4gICAgY3JlYXRlVG91cm5hbWVudDogY3JlYXRlVG91cm5hbWVudCxcbiAgICBnZXRMYWRkZXI6IGdldExhZGRlcixcbiAgICBqb2luVG91cm5hbWVudDogam9pblRvdXJuYW1lbnRcbiAgfVxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCBwbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbChwbGF5ZXIpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgUGFyc2UuVXNlci5jdXJyZW50KCkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXJuYW1lJywgUGFyc2UuVXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuICAgIHBsYXllci5zZXQoJ21tcicsIDEwMDApO1xuICAgIHBsYXllci5zZXQoJ3dpbnMnLCAwKTtcbiAgICBwbGF5ZXIuc2V0KCdsb3NzZXMnLCAwKTtcbiAgICBwbGF5ZXIuc2V0KCdwb2ludHMnLCAwKTtcbiAgICByZXR1cm4gcGxheWVyLnNhdmUoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRUb3VybmFtZW50KCkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShEZXRhaWxzLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0eXBlJywgJ2xhZGRlcicpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3RvdXJuYW1lbnQnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZVRvdXJuYW1lbnQgKCkge1xuICAgIHZhciBkZWZlciA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRvdXJuYW1lbnQgPSBuZXcgVG91cm5hbWVudC5Nb2RlbCgpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCduYW1lJywgJ09OT0cgT1BFTicpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCdzdGF0dXMnLCAncGVuZGluZycpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCdnYW1lJywgJ2hlYXJ0aHN0b25lJyk7XG4gICAgdG91cm5hbWVudC5zYXZlKCkudGhlbihmdW5jdGlvbiAodG91cm5leSkge1xuICAgICAgdmFyIGRldGFpbHMgPSBuZXcgRGV0YWlscy5Nb2RlbCgpO1xuICAgICAgZGV0YWlscy5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICAgIGRldGFpbHMuc2V0KCd0eXBlJywgJ2xhZGRlcicpO1xuICAgICAgZGV0YWlscy5zZXQoJ3BsYXllckNvdW50JywgMCk7XG4gICAgICBkZXRhaWxzLnNldCgnbnVtT2ZHYW1lcycsIDUpO1xuICAgICAgZGV0YWlscy5zYXZlKCkudGhlbihmdW5jdGlvbiAoZGV0YWlscykge1xuICAgICAgICBkZWZlci5yZXNvbHZlKGRldGFpbHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TGFkZGVyICh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3BsYXllcicpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gVG91cm5hbWVudChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdUb3VybmFtZW50Jyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyduYW1lJywgJ2dhbWUnLCAnc3RhdHVzJywgJ2Rpc2FibGVkJywgJ2Rpc2FibGVkUmVhc29uJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbmZ1bmN0aW9uIERldGFpbHMoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnRGV0YWlscycpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsndG91cm5hbWVudCcsICd0eXBlJywgJ251bU9mR2FtZXMnLCAncGxheWVyQ291bnQnXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
