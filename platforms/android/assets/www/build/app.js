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
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/dashboard.html',
          controller: 'DashboardCtrl'
        }
      },
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament[0].tournament, Parse.User.current());
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
      ParsePushPlugin.on('receivePN', function(pn){
        console.log(pn);
        if(!pn.title) {
          $ionicPopup.alert({
            title: 'Announcement',
            template: '<div class="text-center">'+ pn.alert + '</div>'
          }).then(function(res) {

          });
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
      'Parse', 'tournament', 'MatchServices', 'QueueServices', 'LadderServices', 'player',
      DashboardCtrl
    ]);

function DashboardCtrl(
  $scope, $state, $filter, $timeout, $interval, $ionicPopup, $rootScope,
  Parse, tournament, MatchServices, QueueServices, LadderServices, player) {
  $scope.tournament = tournament[0].tournament;
  var promise = null;
  $scope.user = Parse.User;
  $scope.player = player[0];
  
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};
  $scope.end = {
    canPlay: true,
    time: parseFloat(moment().format('x'))
  }
  

  if(window.ParsePushPlugin) {
    ParsePushPlugin.on('receivePN', function(pn){
      if(pn.title) {
        switch (pn.title) {
          case 'Opponent Found':
            playerConfirm(false);
            break;
          case 'Opponent Confirmed':
            opponentConfirmed(false);
            break;
          case 'Results Entered':
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
    if($scope.end.canPlay) {
      sub();
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
    $scope.stop();
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      $scope.match = matches[0];

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
    $state.go('app.' + link, {reload: true});
    $scope.popover.hide();
  }
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });

  $scope.$on('$ionicView.loaded', function() {
    ionic.Platform.ready( function() {
      if(navigator && navigator.splashscreen) {
        navigator.splashscreen.hide();
      }
    });
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
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/match/match.html'
        }
      }
    })
    .state('app.match.view', {
      url: '/view',
      cache: false,
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
  var attributes = ['tournament', 'user', 'battleTag', 'username', 'hero', 'player', 'status', 'cancelTimer', 'wins', 'losses', 'mmr', 'points'];
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
    getLatestMatch: getLatestMatch
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
}

function Match(Parse) {
  var Model = Parse.Object.extend('Match');
  var attributes = [
    'tournament', 'player1', 'player2', 'hero1', 'hero2', 'username1', 'username2', 'battleTag1', 'battleTag2', 'status', 'winner', 'loser',
    'screenshot', 'report', 'reportedScreenshot', 'activeDate', 'user1', 'user2'
  ];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC52aWV3LmN0cmwuanMiLCJjb250cm9sbGVycy9tZW51LmN0cmwuanMiLCJjb250cm9sbGVycy9yZWdpc3Rlci5jdHJsLmpzIiwicm91dGVzL2FkbWluLnJvdXRlcy5qcyIsInJvdXRlcy9sYWRkZXIucm91dGVzLmpzIiwicm91dGVzL21hdGNoLnJvdXRlcy5qcyIsInNlcnZpY2VzL2xhZGRlci5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL21hdGNoLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDZEE7QUFDQTtBQUNBO0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUNBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnT05PRycsIFtcbiAgJ2lvbmljJyxcbiAgJ25nUGFyc2UnLFxuICAndGltZXInLFxuICAnbmdDb3Jkb3ZhJyxcbiAgJ25nQW5pbWF0ZScsXG4gICdPTk9HLkNvbnRyb2xsZXJzJyxcbiAgJ09OT0cuU2VydmljZXMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRpb25pY0NvbmZpZ1Byb3ZpZGVyJywgJyRjb21waWxlUHJvdmlkZXInLCAnUGFyc2VQcm92aWRlcicsIGNvbmZpZ10pO1xuXG5mdW5jdGlvbiBjb25maWcgKCRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyLCBQYXJzZVByb3ZpZGVyKSB7XG5cbiAgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8ZmlsZXxibG9ifGNvbnRlbnR8bXMtYXBweHx4LXdtYXBwMCk6fGRhdGE6aW1hZ2VcXC98aW1nXFwvLyk7XG4gICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGZpbGV8Z2h0dHBzP3xtcy1hcHB4fHgtd21hcHAwKTovKTtcblxuICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJuWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRXCIsIFwienJpbjhHRUJEVkdia2wxaW9HRXduSHVQNzBGZEc2SGh6VFM4dUdqelwiKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsIHJvdXRlc10pO1xuXG5mdW5jdGlvbiByb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdhcHAvZGFzaGJvYXJkJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcykge1xuICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuZ2V0VG91cm5hbWVudCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5kYXNoYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kYXNoYm9hcmQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHBsYXllcjogZnVuY3Rpb24gKFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCkge1xuICAgICAgICAgIHJldHVybiBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIodG91cm5hbWVudFswXS50b3VybmFtZW50LCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5yZWdpc3RlcicsIHtcbiAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cblxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uc3RhbnQoXCJtb21lbnRcIiwgbW9tZW50KVxuICAucnVuKFsnJGlvbmljUGxhdGZvcm0nLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnJGlvbmljTG9hZGluZycsICckaW9uaWNQb3B1cCcsIHJ1bl0pXG5cblxuXG5mdW5jdGlvbiBydW4gKCRpb25pY1BsYXRmb3JtLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY0xvYWRpbmcsICRpb25pY1BvcHVwKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cbiAgICAgIC8vIERvbid0IHJlbW92ZSB0aGlzIGxpbmUgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91IGFyZSBkb2luZy4gSXQgc3RvcHMgdGhlIHZpZXdwb3J0XG4gICAgICAvLyBmcm9tIHNuYXBwaW5nIHdoZW4gdGV4dCBpbnB1dHMgYXJlIGZvY3VzZWQuIElvbmljIGhhbmRsZXMgdGhpcyBpbnRlcm5hbGx5IGZvclxuICAgICAgLy8gYSBtdWNoIG5pY2VyIGtleWJvYXJkIGV4cGVyaWVuY2UuXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcbiAgICB9XG4gICAgaWYod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cbiAgICAkcm9vdFNjb3BlLiRvbignc2hvdzpsb2FkaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAkaW9uaWNMb2FkaW5nLnNob3coe3RlbXBsYXRlOiAnPGlvbi1zcGlubmVyIGljb249XCJzcGlyYWxcIiBjbGFzcz1cInNwaW5uZXItY2FsbVwiPjwvaW9uLXNwaW5uZXI+Jywgc2hvd0JhY2tkcm9wOiB0cnVlLCBhbmltYXRpb246ICdmYWRlLWluJ30pO1xuICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS4kb24oJ2hpZGU6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XG4gICAgfSk7XG5cbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTicsIGZ1bmN0aW9uKHBuKXtcbiAgICAgICAgY29uc29sZS5sb2cocG4pO1xuICAgICAgICBpZighcG4udGl0bGUpIHtcbiAgICAgICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICB0aXRsZTogJ0Fubm91bmNlbWVudCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPicrIHBuLmFsZXJ0ICsgJzwvZGl2PidcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuXG4gIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnLCBbXSk7XG5cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pbk1hdGNoZXNDdHJsJywgQWRtaW5NYXRjaGVzQ3RybCk7XG5cbkFkbWluTWF0Y2hlc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhcnNlJ107XG5mdW5jdGlvbiBBZG1pbk1hdGNoZXNDdHJsKCRzY29wZSwgUGFyc2UpIHtcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluUGxheWVyc0N0cmwnLCBBZG1pblBsYXllcnNDdHJsKTtcblxuQWRtaW5QbGF5ZXJzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFyc2UnXTtcbmZ1bmN0aW9uIEFkbWluUGxheWVyc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5TZXR0aW5nc0N0cmwnLCBBZG1pblNldHRpbmdzQ3RybCk7XG5cbkFkbWluU2V0dGluZ3NDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdUb3VybmFtZW50U2VydmljZXMnLCAnbmV3VG91cm5hbWVudCddO1xuXG5mdW5jdGlvbiBBZG1pblNldHRpbmdzQ3RybCgkc2NvcGUsIFRvdXJuYW1lbnRTZXJ2aWNlcywgbmV3VG91cm5hbWVudCkge1xuICAkc2NvcGUuZGV0YWlscyA9IG5ld1RvdXJuYW1lbnQ7XG4gIFxuICAvLyBUb3VybmFtZW50U2VydmljZXMuZ2V0TGFkZGVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQpLnRoZW4oZnVuY3Rpb24gKGxhZGRlcikge1xuICAvLyAgICRzY29wZS5sYWRkZXIgPSBsYWRkZXI7XG4gIC8vIH0pO1xuICBcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZEN0cmwnLFxuICAgIFtcbiAgICAgICckc2NvcGUnLCAnJHN0YXRlJywgJyRmaWx0ZXInLCAnJHRpbWVvdXQnLCAnJGludGVydmFsJywgJyRpb25pY1BvcHVwJywgJyRyb290U2NvcGUnLFxuICAgICAgJ1BhcnNlJywgJ3RvdXJuYW1lbnQnLCAnTWF0Y2hTZXJ2aWNlcycsICdRdWV1ZVNlcnZpY2VzJywgJ0xhZGRlclNlcnZpY2VzJywgJ3BsYXllcicsXG4gICAgICBEYXNoYm9hcmRDdHJsXG4gICAgXSk7XG5cbmZ1bmN0aW9uIERhc2hib2FyZEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkZmlsdGVyLCAkdGltZW91dCwgJGludGVydmFsLCAkaW9uaWNQb3B1cCwgJHJvb3RTY29wZSxcbiAgUGFyc2UsIHRvdXJuYW1lbnQsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMsIExhZGRlclNlcnZpY2VzLCBwbGF5ZXIpIHtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQ7XG4gIHZhciBwcm9taXNlID0gbnVsbDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuICBcbiAgJHNjb3BlLm9wcG9uZW50ID0gUXVldWVTZXJ2aWNlcy5vcHBvbmVudDtcbiAgJHNjb3BlLmhlcm9MaXN0ID0gUXVldWVTZXJ2aWNlcy5oZXJvZXM7XG4gICRzY29wZS5teU9wcG9uZW50ID0ge25hbWU6J1BBWCBBdHRlbmRlZSd9O1xuICAkc2NvcGUuZW5kID0ge1xuICAgIGNhblBsYXk6IHRydWUsXG4gICAgdGltZTogcGFyc2VGbG9hdChtb21lbnQoKS5mb3JtYXQoJ3gnKSlcbiAgfVxuICBcblxuICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgUGFyc2VQdXNoUGx1Z2luLm9uKCdyZWNlaXZlUE4nLCBmdW5jdGlvbihwbil7XG4gICAgICBpZihwbi50aXRsZSkge1xuICAgICAgICBzd2l0Y2ggKHBuLnRpdGxlKSB7XG4gICAgICAgICAgY2FzZSAnT3Bwb25lbnQgRm91bmQnOlxuICAgICAgICAgICAgcGxheWVyQ29uZmlybShmYWxzZSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdPcHBvbmVudCBDb25maXJtZWQnOlxuICAgICAgICAgICAgb3Bwb25lbnRDb25maXJtZWQoZmFsc2UpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnUmVzdWx0cyBFbnRlcmVkJzpcbiAgICAgICAgICAgIG1hdGNoUGxheWVkKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIGdldEN1cnJlbnRTdGF0dXModHJ1ZSk7XG4gIH07XG5cbiAgJHNjb3BlLnN0YXJ0UXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoJHNjb3BlLmVuZC5jYW5QbGF5KSB7XG4gICAgICBzdWIoKTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmNhbmNlbFF1ZXVlID0gZnVuY3Rpb24gKCkge1xuICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9O1xuXG4gICRzY29wZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgfTtcblxuICAkc2NvcGUuc2hvd09wcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgcHJvbWlzZSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7Y2hhbmdlV29yZCgpfSwgMjAwMCk7XG4gIH07XG5cbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICB9KTtcbiAgJHNjb3BlLmZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAgICR0aW1lb3V0KHRpbWVyLCAxNTAwKTtcbiAgfVxuXG4gIHN0YXR1cygpO1xuXG4gIGZ1bmN0aW9uIG1hdGNoVGltZSgpIHtcbiAgICBpZighJHNjb3BlLm1hdGNoKSB7XG4gICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgICB0aW1lcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZXIoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lciAoKSB7XG4gICAgdmFyIG5vdyA9IG1vbWVudCgpO1xuICAgIHZhciB0aW1lID0gJHNjb3BlLm1hdGNoLmdldCgnYWN0aXZlRGF0ZScpO1xuICAgIGlmKHRpbWUpIHtcbiAgICAgIHZhciBmaXZlTWludXRlcyA9IG1vbWVudCh0aW1lKS5hZGQoMSwgJ21pbnV0ZXMnKTtcbiAgICAgICRzY29wZS5lbmQudGltZSA9IHBhcnNlRmxvYXQoZml2ZU1pbnV0ZXMuZm9ybWF0KCd4JykpO1xuICAgICAgJHNjb3BlLmVuZC5jYW5QbGF5ID0gbm93LmlzQWZ0ZXIoZml2ZU1pbnV0ZXMsICdzZWNvbmRzJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVBsYXllciAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgc3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXMgKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAgIHN3aXRjaCAoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpKSB7XG4gICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdxdWV1ZSc6XG4gICAgICAgICAgJHNjb3BlLnNob3dPcHBvbmVudHMoKTtcbiAgICAgICAgICBtYXRjaE1ha2luZygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmb3VuZCc6XG4gICAgICAgICAgcGxheWVyQ29uZmlybSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjb25maXJtZWQnOlxuICAgICAgICAgIHdhaXRpbmdGb3JPcHBvbmVudCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdub09wcG9uZW50JzpcbiAgICAgICAgICBub09wcG9uZW50KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BsYXlpbmcnOlxuICAgICAgICAgIGdldExhc3RNYXRjaCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICAgIHBsYXllckNhbmNlbGxlZCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpKTtcbiAgICAgIG1hdGNoVGltZSgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEN1cnJlbnRTdGF0dXMocmVmcmVzaCkge1xuICAgIHZhciByZWZyZXNoID0gcmVmcmVzaDtcbiAgICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnNbMF07XG4gICAgICBpZiAoJHNjb3BlLnBsYXllcikge1xuICAgICAgICBjb25zb2xlLmxvZygnY3VycmVudFN0YXR1cycpO1xuICAgICAgICBzdGF0dXMoKTtcbiAgICAgICAgaWYocmVmcmVzaCkge1xuICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBnZXRMYXN0TWF0Y2goKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSA9PT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoTWFraW5nKCkge1xuICAgIFBhcnNlLkNsb3VkLnJ1bignbWF0Y2htYWtpbmcnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXllckNvbmZpcm0oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG5cbiAgICAgIGlmKCRzY29wZS5tYXRjaC5zdGF0dXMgPT09ICdwZW5kaW5nJykge1xuICAgICAgICB2YXIgY29uZmlybVBvcHVwID0gJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj48c3Ryb25nPkEgV29ydGh5IE9wcG9uZW50PC9zdHJvbmc+PGJyPiBoYXMgYmVlbiBmb3VuZCE8L2Rpdj4nLFxuICAgICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICBdXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbmZpcm1Qb3B1cC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICBpZihyZXMpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdjb25maXJtMicsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdjb25maXJtZWQnKTtcbiAgICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNob3dGYWlsUG9wdXAoKTtcbiAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZigkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykgPT09ICdmb3VuZCcpIHtcbiAgICAgICAgICAgIGNvbmZpcm1Qb3B1cC5jbG9zZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMjAwMDApO1xuICAgICAgfVxuICAgICAgaWYoJHNjb3BlLm1hdGNoLnN0YXR1cyA9PT0gJ2NhbmNlbGxlZCcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dGYWlsUG9wdXAoKSB7XG4gICAgdmFyIGZhaWxQb3B1cCA9ICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdSBGYWlsZWQgdG8gQ29uZmlybSBNYXRjaDwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+Q2xvc2U8L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG5cbiAgICBmYWlsUG9wdXAudGhlbihmdW5jdGlvbiAocmVzKSB7XG5cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wcG9uZW50Q29uZmlybWVkICgpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSwgJ2FjdGl2ZScpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiB3YWl0aW5nRm9yT3Bwb25lbnQgKCkge1xuICAgIFBhcnNlLkNsb3VkLnJ1bignY29uZmlybU1hdGNoJykudGhlbihmdW5jdGlvbiAobnVtKSB7XG4gICAgICBjaGVja09wcG9uZW50KDUwMDAsIGZhbHNlKTtcbiAgICAgIGNoZWNrT3Bwb25lbnQoMzAwMDAsIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tPcHBvbmVudCAodGltZW91dCwgYWxyZWFkeUNoZWNrZWQpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZigkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykgPT09ICdjb25maXJtZWQnKSB7XG4gICAgICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG5cbiAgICAgICAgICBzd2l0Y2ggKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpKSB7XG4gICAgICAgICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgICAgICAgaWYoYWxyZWFkeUNoZWNrZWQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ25vT3Bwb25lbnQnKTtcbiAgICAgICAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdhY3RpdmUnOlxuICAgICAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3BsYXlpbmcnKTtcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzaG93OmxvYWRpbmcnKTtcbiAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdoaWRlOmxvYWRpbmcnKTtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC52aWV3Jyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgdGltZW91dCk7XG4gIH1cbiAgZnVuY3Rpb24gbWF0Y2hQbGF5ZWQoKSB7XG4gICAgaWYoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpICE9PSAnb3BlbicpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgIHNob3dNYXRjaFJlc3VsdHNQb3B1cCgpO1xuICAgICAgfSlcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2hvd01hdGNoUmVzdWx0c1BvcHVwKCkge1xuICAgIHZhciBwb3B1cCA9ICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggUGxheWVkJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+WW91ciBPcHBvbmVudCBoYXMgc3VibWl0dGluZyByZXN1bHRzPC9kaXY+J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vT3Bwb25lbnQgKCkge1xuICAgICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaCBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+WW91ciBPcHBvbmVudDwvc3Ryb25nPjxicj4gZmFpbGVkIHRvIGNvbmZpcm0hPC9kaXY+JyxcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5CYWNrPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1hc3NlcnRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPlF1ZXVlIEFnYWluPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3N0YXR1cycsICdjYW5jZWxsZWQnKTtcbiAgICAgICAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdWIgKCkge1xuICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4pIHtcbiAgICAgIFBhcnNlUHVzaFBsdWdpbi5zdWJzY3JpYmUoJHNjb3BlLnBsYXllci51c2VybmFtZSwgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzdWJiZWQnKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCB0byBzdWInKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5nZVdvcmQgKCkge1xuICAgICRzY29wZS5teU9wcG9uZW50Lm5hbWUgPSAkc2NvcGUub3Bwb25lbnQubGlzdFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqJHNjb3BlLm9wcG9uZW50Lmxpc3QubGVuZ3RoKV07XG4gIH07XG59O1xuLy8gZnVuY3Rpb24gam9pblF1ZXVlUG9wdXAgKCkge1xuLy8gICBzdWIoKTtcbi8vICAgJHNjb3BlLnNlbGVjdGVkID0ge3N0YXR1czogdHJ1ZX07XG4vLyAgICRzY29wZS5zZWxlY3RIZXJvID0gZnVuY3Rpb24gKGhlcm8pIHtcbi8vICAgICAkc2NvcGUuaW1hZ2UgPSBhbmd1bGFyLmVsZW1lbnQoZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmhlcm9DbGFzcycpKVswXS5jbGllbnRXaWR0aDtcbi8vXG4vLyAgICAgaWYoaGVyby5jaGVja2VkKSB7XG4vLyAgICAgICBoZXJvLmNoZWNrZWQgPSAhaGVyby5jaGVja2VkO1xuLy8gICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IHRydWU7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy9cbi8vICAgICBpZighaGVyby5jaGVja2VkICYmICRzY29wZS5zZWxlY3RlZC5zdGF0dXMpIHtcbi8vICAgICAgIGhlcm8uY2hlY2tlZCA9ICFoZXJvLmNoZWNrZWQ7XG4vLyAgICAgICAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzID0gZmFsc2U7XG4vLyAgICAgICByZXR1cm47XG4vLyAgICAgfVxuLy8gICB9O1xuLy8gICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbi8vICAgICB7XG4vLyAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvc2VsZWN0Lmhlcm8uaHRtbCcsXG4vLyAgICAgICB0aXRsZTogJ1NlbGVjdCBIZXJvIENsYXNzJyxcbi8vICAgICAgIHNjb3BlOiAkc2NvcGUsXG4vLyAgICAgICBidXR0b25zOiBbXG4vLyAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuLy8gICAgICAgICB7IHRleHQ6ICc8Yj5RdWV1ZTwvYj4nLFxuLy8gICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuLy8gICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4vLyAgICAgICAgICAgICB2YXIgaGVybyA9ICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5oZXJvTGlzdCwge2NoZWNrZWQ6IHRydWV9LCB0cnVlKTtcbi8vICAgICAgICAgICAgIGlmICghaGVyby5sZW5ndGgpIHtcbi8vICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuLy8gICAgICAgICAgICAgfSBlbHNlIHtcbi8vICAgICAgICAgICAgICAgcmV0dXJuIGhlcm9bMF07XG4vLyAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgICBdXG4vLyAgICAgfSk7XG4vLyB9O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xhZGRlckpvaW5DdHJsJywgWyckc2NvcGUnLCAnJGZpbHRlcicsICckaW9uaWNQb3B1cCcsICckc3RhdGUnLCAnJGlvbmljSGlzdG9yeScsICckcScsICdQYXJzZScsICd0b3VybmFtZW50JywgJ0xhZGRlclNlcnZpY2VzJywgTGFkZGVySm9pbkN0cmxdKTtcblxuZnVuY3Rpb24gTGFkZGVySm9pbkN0cmxcbigkc2NvcGUsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksICRxLCBQYXJzZSwgIHRvdXJuYW1lbnQsIExhZGRlclNlcnZpY2VzKSB7XG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG4gICRzY29wZS5wbGF5ZXIgPSB7XG4gICAgYmF0dGxlVGFnOiAnJ1xuICB9O1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIudXNlcm5hbWUgPSAkc2NvcGUudXNlci51c2VybmFtZTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zdGF0dXMgPSAnb3Blbic7XG4gICAgICAgIExhZGRlclNlcnZpY2VzLmpvaW5Ub3VybmFtZW50KCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlciwgJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgU3VjY2Vzc1BvcHVwKHBsYXllcikudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvcik7XG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZUJhdHRsZVRhZyAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdGFnID0gJHNjb3BlLnBsYXllci5iYXR0bGVUYWc7XG5cbiAgICBpZih0YWcubGVuZ3RoIDwgOCkge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgYmF0dGxlIHRhZycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBzcGxpdCA9IHRhZy5zcGxpdCgnIycpO1xuICAgIGlmKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgQkFUVExFVEFH4oSiIGluY2x1ZGluZyAjIGFuZCBmb3VyIGRpZ2l0cycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKHNwbGl0WzFdLmxlbmd0aCA8IDIgfHwgc3BsaXRbMV0ubGVuZ3RoID4gNCkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyB1cCB0byBmb3VyIGRpZ2l0cyBhZnRlciAjIScpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKGlzTmFOKHNwbGl0WzFdKSkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyBmb3VyIGRpZ2l0cyBhZnRlciAjJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMudmFsaWRhdGVQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCwgdGFnKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICBpZihyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBjYi5yZWplY3QoJ1RoZSBCQVRUTEVUQUfihKIgeW91IGVudGVyZWQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYi5yZXNvbHZlKHRhZyk7XG4gICAgICB9IFxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgc2lnbmVkIHVwISBOb3cgZ28gZmluZCBhIHZhbGlhbnQgb3Bwb25lbnQuJ1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMZWFkZXJCb2FyZHNDdHJsJywgTGVhZGVyQm9hcmRzQ3RybCk7XG5cbkxlYWRlckJvYXJkc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ0xhZGRlclNlcnZpY2VzJywgJ3RvdXJuYW1lbnQnLCAnUGFyc2UnLCAnJGZpbHRlcicsICckaW9uaWNQb3B1cCddO1xuZnVuY3Rpb24gTGVhZGVyQm9hcmRzQ3RybCgkc2NvcGUsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50LCBQYXJzZSwgJGZpbHRlciwgJGlvbmljUG9wdXApIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICBnZXRQbGF5ZXJzKCk7XG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2V0UGxheWVycygpO1xuICB9XG4gIFxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKCkge1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudFswXS50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICB2YXIgcmFuayA9IDE7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGxheWVycywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICAgIHJhbmsrKztcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5Mb2dpbkN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNIaXN0b3J5J107XG5mdW5jdGlvbiBMb2dpbkN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICRzY29wZS51c2VyID0ge307XG4gIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2UuVXNlci5sb2dJbigkc2NvcGUudXNlci51c2VybmFtZSwgJHNjb3BlLnVzZXIucGFzc3dvcmQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24gKHVzZXIsIGVycm9yKSB7XG4gICAgICAgICRzY29wZS53YXJuaW5nID0gZXJyb3IubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndXNlcicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcbiAgICAkc2NvcGUud2FybmluZyA9IG51bGw7XG4gIH0sIHRydWUpO1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFZpZXdDdHJsJywgTWF0Y2hWaWV3Q3RybCk7XG5cbk1hdGNoVmlld0N0cmwuJGluamVjdCA9IFtcbiAgJyRzY29wZScsICckc3RhdGUnLCAnJHJvb3RTY29wZScsICckaW9uaWNQb3B1cCcsICckaW9uaWNIaXN0b3J5JyxcbiAgJ1BhcnNlJywgJ0xhZGRlclNlcnZpY2VzJywgJ01hdGNoU2VydmljZXMnLCAnUXVldWVTZXJ2aWNlcycsXG4gICd0b3VybmFtZW50JywgJ21hdGNoJywgJ3BsYXllcidcbl07XG5mdW5jdGlvbiBNYXRjaFZpZXdDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJHJvb3RTY29wZSwgJGlvbmljUG9wdXAsICRpb25pY0hpc3RvcnksXG4gIFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcyxcbiAgdG91cm5hbWVudCwgbWF0Y2gsIHBsYXllclxuKSB7XG4gICRzY29wZS5tYXRjaCA9IG1hdGNoWzBdO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnRbMF0udG91cm5hbWVudDtcbiAgJHNjb3BlLnBsYXllciA9IHBsYXllclswXTtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUuZW5kID0ge1xuICAgIHRpbWU6IDBcbiAgfTtcblxuXG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgXG4gIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4pIHtcbiAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTicsIGZ1bmN0aW9uKHBuKXtcbiAgICAgIGlmKHBuLnRpdGxlKSB7XG4gICAgICAgIHN3aXRjaCAocG4udGl0bGUpIHtcbiAgICAgICAgICBjYXNlICdPcHBvbmVudCBGb3VuZCc6IFxuICAgICAgICAgICAgZ2V0TWF0Y2goKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ09wcG9uZW50IENvbmZpcm1lZCc6XG4gICAgICAgICAgICBnZXRNYXRjaCgpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnUmVzdWx0cyBFbnRlcmVkJzpcbiAgICAgICAgICAgIGdldE1hdGNoKCk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnJlY29yZCA9IGZ1bmN0aW9uIChyZWNvcmQpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IG51bGw7XG4gICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdhY3RpdmUnKSB7XG4gICAgICAgIHN3aXRjaCAocmVjb3JkKSB7XG4gICAgICAgICAgY2FzZSAnd2luJzpcbiAgICAgICAgICAgIHdpbk1hdGNoKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgaWYocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnd2lubmVyJywgJHNjb3BlLnBsYXllcik7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnbG9zZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWUgPSAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWVcbiAgICAgICAgICAgICAgICByZWNvcmRNYXRjaCgkc2NvcGUubWF0Y2gsIHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2xvc3MnOlxuICAgICAgICAgICAgbG9zZU1hdGNoKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgaWYocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnd2lubmVyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLnBsYXllcik7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWUgPSAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgcmVjb3JkTWF0Y2goJHNjb3BlLm1hdGNoLCB1c2VybmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgXG4gIGdldE1hdGNoRGV0YWlscygpO1xuICBcblxuICBmdW5jdGlvbiBsb3NlTWF0Y2goKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLnNob3coXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy9sb3NlLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1JlcG9ydCBhIExvc3MnLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9XG4gIFxuICBmdW5jdGlvbiBnZXRNYXRjaCgpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29yZE1hdGNoKG1hdGNoLCB1c2VybmFtZSkge1xuXG4gICAgbWF0Y2guc2V0KCdzdGF0dXMnLCAnY29tcGxldGVkJyk7XG4gICAgbWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaFJlc3VsdHMnLCB7dXNlcm5hbWU6IHVzZXJuYW1lLCBtYXRjaDogbWF0Y2guaWR9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICB0aXRsZTogJ01hdGNoIFN1Ym1pdHRlZCcsXG4gICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5UaGFuayB5b3UgZm9yIHN1Ym1pdHRpbmcgcmVzdWx0czwvZGl2PidcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB3aW5NYXRjaCAoKSB7XG4gICAgJHNjb3BlLmltYWdlID0gbnVsbDtcblxuICAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvd2luLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1JlcG9ydCBhIFdpbicsXG4gICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdDYW5jZWwnfSxcbiAgICAgICAgICB7IHRleHQ6ICc8Yj5Db25maXJtPC9iPicsXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLmltYWdlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAkc2NvcGUuaW1hZ2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWF0Y2hEZXRhaWxzKCkge1xuICAgICRzY29wZS5vcHBvbmVudCA9IHtcbiAgICAgIGhlcm86IG51bGwsXG4gICAgICBiYXR0bGVUYWc6IG51bGxcbiAgICB9XG4gICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgJHNjb3BlLm9wcG9uZW50Lmhlcm8gPSAkc2NvcGUubWF0Y2guaGVybzI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWUgPSAkc2NvcGUubWF0Y2gudXNlcm5hbWUyO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LmJhdHRsZVRhZyA9ICRzY29wZS5tYXRjaC5iYXR0bGVUYWcyO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXIgPSAkc2NvcGUubWF0Y2gucGxheWVyMjtcbiAgICB9XG4gICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIyJykge1xuICAgICAgJHNjb3BlLm9wcG9uZW50Lmhlcm8gPSAkc2NvcGUubWF0Y2guaGVybzE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWUgPSAkc2NvcGUubWF0Y2gudXNlcm5hbWUxO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LmJhdHRsZVRhZyA9ICRzY29wZS5tYXRjaC5iYXR0bGVUYWcxO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXIgPSAkc2NvcGUubWF0Y2gucGxheWVyMTtcbiAgICB9XG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdNZW51Q3RybCcsIE1lbnVDdHJsKTtcblxuTWVudUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywnJGlvbmljUG9wb3ZlcicsICckc3RhdGUnLCAnJGlvbmljSGlzdG9yeScsICdQYXJzZScsICckdGltZW91dCddO1xuZnVuY3Rpb24gTWVudUN0cmwoJHNjb3BlLCAkaW9uaWNQb3BvdmVyLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlLCAkdGltZW91dCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJGlvbmljUG9wb3Zlci5mcm9tVGVtcGxhdGVVcmwoJ3RlbXBsYXRlcy9wb3BvdmVycy9wcm9maWxlLnBvcC5odG1sJywge1xuICAgIHNjb3BlOiAkc2NvcGUsXG4gIH0pLnRoZW4oZnVuY3Rpb24ocG9wb3Zlcikge1xuICAgICRzY29wZS5wb3BvdmVyID0gcG9wb3ZlcjtcbiAgfSk7XG5cbiAgJHNjb3BlLm1lbnUgPSBmdW5jdGlvbiAobGluaykge1xuICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgfSk7XG4gICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAkc2NvcGUucG9wb3Zlci5oaWRlKCk7XG4gIH1cbiAgLy9DbGVhbnVwIHRoZSBwb3BvdmVyIHdoZW4gd2UncmUgZG9uZSB3aXRoIGl0IVxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wb3BvdmVyLnJlbW92ZSgpO1xuICB9KTtcblxuICAkc2NvcGUuJG9uKCckaW9uaWNWaWV3LmxvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGlvbmljLlBsYXRmb3JtLnJlYWR5KCBmdW5jdGlvbigpIHtcbiAgICAgIGlmKG5hdmlnYXRvciAmJiBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG4gICAgICAgIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBSZWdpc3RlckN0cmwpO1xuXG5SZWdpc3RlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNQb3B1cCddO1xuZnVuY3Rpb24gUmVnaXN0ZXJDdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljUG9wdXApIHtcblxuICAkc2NvcGUudXNlciA9IHt9O1xuXG4gICRzY29wZS5SZWdpc3RlclVzZXIgPSBmdW5jdGlvbiAodXNlcikge1xuICAgIHZhciByZWdpc3RlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgcmVnaXN0ZXIuc2V0KHVzZXIpO1xuICAgIHJlZ2lzdGVyLnNpZ25VcChudWxsLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuICAgICAgICAvLyBTaG93IHRoZSBlcnJvciBtZXNzYWdlIHNvbWV3aGVyZSBhbmQgbGV0IHRoZSB1c2VyIHRyeSBhZ2Fpbi5cbiAgICAgICAgRXJyb3JQb3B1cChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndXNlcicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcbiAgICAkc2NvcGUud2FybmluZyA9IG51bGw7XG4gIH0sIHRydWUpO1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBBZG1pblJvdXRlc10pO1xuXG5mdW5jdGlvbiBBZG1pblJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmFkbWluJywge1xuICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5zZXR0aW5ncycsIHtcbiAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5zZXR0aW5ncy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pblNldHRpbmdzQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuZXk6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV3VG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgdG91cm5leSkge1xuICAgICAgICAgIGlmKHRvdXJuZXkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdG91cm5leVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5jcmVhdGVUb3VybmFtZW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5tYXRjaGVzJywge1xuICAgICAgdXJsOiAnL21hdGNoZXMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4ubWF0Y2hlcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbk1hdGNoZXNDdHJsJ1xuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIExhZGRlclJvdXRlc10pO1xuXG5mdW5jdGlvbiBMYWRkZXJSb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXInLCB7XG4gICAgICB1cmw6ICcvbGFkZGVyJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sYWRkZXIuaHRtbCcsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5sZWFkZXJib2FyZCcsIHtcbiAgICAgIHVybDogJy9sZWFkZXJib2FyZHMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2xlYWRlcmJvYXJkLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xlYWRlckJvYXJkc0N0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIuam9pbicsIHtcbiAgICAgIHVybDogJy9qb2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9qb2luLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xhZGRlckpvaW5DdHJsJ1xuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIE1hdGNoUm91dGVzXSk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gudmlldycsIHtcbiAgICAgIHVybDogJy92aWV3JyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLnZpZXcuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hWaWV3Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHBsYXllcjogZnVuY3Rpb24gKFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCkge1xuICAgICAgICAgIHJldHVybiBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIodG91cm5hbWVudFswXS50b3VybmFtZW50LCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH0sXG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlLCAkcSwgcGxheWVyKSB7XG4gICAgICAgICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKHBsYXllclswXSkudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgICAgaWYoIW1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNiLnJlamVjdCgpO1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNiLnJlc29sdmUobWF0Y2hlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ0xhZGRlclNlcnZpY2VzJywgWydQYXJzZScsICdMYWRkZXInLCBMYWRkZXJTZXJ2aWNlc10pXG4gIC5mYWN0b3J5KCdMYWRkZXInLCBbJ1BhcnNlJywgTGFkZGVyXSlcblxuZnVuY3Rpb24gTGFkZGVyU2VydmljZXMoUGFyc2UsIExhZGRlcikge1xuICByZXR1cm4ge1xuICAgIGdldFBsYXllcnM6IGdldFBsYXllcnMsXG4gICAgZ2V0UGxheWVyOiBnZXRQbGF5ZXIsXG4gICAgdmFsaWRhdGVQbGF5ZXI6IHZhbGlkYXRlUGxheWVyLFxuICAgIGpvaW5Ub3VybmFtZW50OiBqb2luVG91cm5hbWVudCxcbiAgICBnZXRQZW5kaW5nUGxheWVyczogZ2V0UGVuZGluZ1BsYXllcnNcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQZW5kaW5nUGxheWVycyh0b3VybmFtZW50LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5Lm5vdEVxdWFsVE8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcnModG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKCdwb2ludHMnLCAnbW1yJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZVBsYXllcih0b3VybmV5LCBiYXR0bGVUYWcpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygnYmF0dGxlVGFnJywgYmF0dGxlVGFnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcih0b3VybmV5LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgdXNlciwgdXNlckRhdGEpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbCgpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgdXNlcik7XG4gICAgcGxheWVyLnNldCh1c2VyRGF0YSk7XG4gICAgcGxheWVyLnNldCgnd2lucycsIDApO1xuICAgIHBsYXllci5zZXQoJ2xvc3NlcycsIDApO1xuICAgIHBsYXllci5zZXQoJ3BvaW50cycsIDApO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBMYWRkZXIoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTGFkZGVyJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3VzZXInLCAnYmF0dGxlVGFnJywgJ3VzZXJuYW1lJywgJ2hlcm8nLCAncGxheWVyJywgJ3N0YXR1cycsICdjYW5jZWxUaW1lcicsICd3aW5zJywgJ2xvc3NlcycsICdtbXInLCAncG9pbnRzJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ01hdGNoU2VydmljZXMnLCBbJ1BhcnNlJywgJ01hdGNoJywgJyRxJywgTWF0Y2hTZXJ2aWNlc10pXG4gIC5mYWN0b3J5KCdNYXRjaCcsIFsnUGFyc2UnLCBNYXRjaF0pO1xuXG5mdW5jdGlvbiBNYXRjaFNlcnZpY2VzKFBhcnNlLCBNYXRjaCwgJHEpIHtcbiAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyO1xuICByZXR1cm4ge1xuICAgIGdldENvbmZpcm1lZE1hdGNoOiBnZXRDb25maXJtZWRNYXRjaCxcbiAgICBnZXRQZW5kaW5nTWF0Y2g6IGdldFBlbmRpbmdNYXRjaCxcbiAgICBnZXRMYXRlc3RNYXRjaDogZ2V0TGF0ZXN0TWF0Y2hcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExhdGVzdE1hdGNoKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJylcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3dpbm5lcicpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ2xvc2VyJyk7XG4gICAgcXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBcbiAgZnVuY3Rpb24gZ2V0Q29uZmlybWVkTWF0Y2ggKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJyk7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdhY3RpdmUnKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcilcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcilcbiAgICB9XG4gICAgcXVlcnkuZXF1YWxUbygnY29uZmlybTEnLCB0cnVlKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdjb25maXJtMicsIHRydWUpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIFxuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0UGVuZGluZ01hdGNoKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJylcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoXCJjcmVhdGVkQXRcIik7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgaWYodHlwZSA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgfVxuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdwZW5kaW5nJyk7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNYXRjaChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdNYXRjaCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFtcbiAgICAndG91cm5hbWVudCcsICdwbGF5ZXIxJywgJ3BsYXllcjInLCAnaGVybzEnLCAnaGVybzInLCAndXNlcm5hbWUxJywgJ3VzZXJuYW1lMicsICdiYXR0bGVUYWcxJywgJ2JhdHRsZVRhZzInLCAnc3RhdHVzJywgJ3dpbm5lcicsICdsb3NlcicsXG4gICAgJ3NjcmVlbnNob3QnLCAncmVwb3J0JywgJ3JlcG9ydGVkU2NyZWVuc2hvdCcsICdhY3RpdmVEYXRlJywgJ3VzZXIxJywgJ3VzZXIyJ1xuICBdO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1F1ZXVlU2VydmljZXMnLFtRdWV1ZVNlcnZpY2VzXSlcblxuZnVuY3Rpb24gUXVldWVTZXJ2aWNlcygpIHtcbiAgdmFyIG9wcG9uZW50ID0ge1xuICAgIGxpc3Q6IFsnRWFzeSBQaWNraW5ncycsICdZb3VyIFdvcnN0IE5pZ2h0bWFyZScsICdXb3JsZCBjbGFzcyBwYXN0ZSBlYXRlcicsXG4gICAgICAnQSBNdXJsb2MnLCAnR291cmQgY3JpdGljJywgJ05vc2UgYW5kIG1vdXRoIGJyZWF0aGVyJywgJ0hvZ2dlcicsICdBIGNhcmRpc2ggSWFuJyxcbiAgICAgICdNb3BleSBNYWdlJywgJ1dvbWJhdCBXYXJsb2NrJywgJ1JvdWdlZCB1cCBSb2d1ZScsICdXYWlmaXNoIFdhcnJpb3InLCAnRGFtcCBEcnVpZCcsXG4gICAgICAnU2hhYmJ5IFNoYW1hbicsICdQZW5uaWxlc3MgUGFsYWRpbicsICdIdWZmeSBIdW50ZXInLCAnUGVya3kgUHJpZXN0JywgJ1RoZSBXb3JzdCBQbGF5ZXInLFxuICAgICAgJ1lvdXIgT2xkIFJvb21tYXRlJywgJ1N0YXJDcmFmdCBQcm8nLCAnRmlzY2FsbHkgcmVzcG9uc2libGUgbWltZScsICdZb3VyIEd1aWxkIExlYWRlcicsXG4gICAgICAnTm9uZWNrIEdlb3JnZScsICdHdW0gUHVzaGVyJywgJ0NoZWF0ZXIgTWNDaGVhdGVyc29uJywgJ1JlYWxseSBzbG93IGd1eScsICdSb2FjaCBCb3knLFxuICAgICAgJ09yYW5nZSBSaHltZXInLCAnQ29mZmVlIEFkZGljdCcsICdJbndhcmQgVGFsa2VyJywgJ0JsaXp6YXJkIERldmVsb3BlcicsICdHcmFuZCBNYXN0ZXInLFxuICAgICAgJ0RpYW1vbmQgTGVhZ3VlIFBsYXllcicsICdCcmFuZCBOZXcgUGxheWVyJywgJ0Rhc3RhcmRseSBEZWF0aCBLbmlnaHQnLCAnTWVkaW9jcmUgTW9uaycsXG4gICAgICAnQSBMaXR0bGUgUHVwcHknXG4gICAgXVxuICB9O1xuICB2YXIgaGVyb2VzID0gW1xuICAgIHt0ZXh0OiAnbWFnZScsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2h1bnRlcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3BhbGFkaW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJyaW9yJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnZHJ1aWQnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJsb2NrJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnc2hhbWFuJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncHJpZXN0JywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncm9ndWUnLCBjaGVja2VkOiBmYWxzZX1cbiAgXVxuICByZXR1cm4ge1xuICAgIG9wcG9uZW50OiBvcHBvbmVudCxcbiAgICBoZXJvZXM6IGhlcm9lc1xuICB9XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnVG91cm5hbWVudFNlcnZpY2VzJywgWydQYXJzZScsICckcScsICdUb3VybmFtZW50JywgJ0RldGFpbHMnLCAnTGFkZGVyJywgVG91cm5hbWVudFNlcnZpY2VzXSlcblxuICAuZmFjdG9yeSgnVG91cm5hbWVudCcsIFsnUGFyc2UnLCBUb3VybmFtZW50XSlcbiAgLmZhY3RvcnkoJ0RldGFpbHMnLCBbJ1BhcnNlJywgRGV0YWlsc10pO1xuXG5mdW5jdGlvbiBUb3VybmFtZW50U2VydmljZXMoUGFyc2UsICRxLCBUb3VybmFtZW50LCBEZXRhaWxzLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb3VybmFtZW50OiBnZXRUb3VybmFtZW50LFxuICAgIGNyZWF0ZVRvdXJuYW1lbnQ6IGNyZWF0ZVRvdXJuYW1lbnQsXG4gICAgZ2V0TGFkZGVyOiBnZXRMYWRkZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH1cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgcGxheWVyKSB7XG4gICAgdmFyIHBsYXllciA9IG5ldyBMYWRkZXIuTW9kZWwocGxheWVyKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VybmFtZScsIFBhcnNlLlVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICBwbGF5ZXIuc2V0KCdtbXInLCAxMDAwKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VG91cm5hbWVudCgpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoRGV0YWlscy5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndHlwZScsICdsYWRkZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd0b3VybmFtZW50Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb3VybmFtZW50ICgpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0b3VybmFtZW50ID0gbmV3IFRvdXJuYW1lbnQuTW9kZWwoKTtcbiAgICB0b3VybmFtZW50LnNldCgnbmFtZScsICdPTk9HIE9QRU4nKTtcbiAgICB0b3VybmFtZW50LnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICB0b3VybmFtZW50LnNldCgnZ2FtZScsICdoZWFydGhzdG9uZScpO1xuICAgIHRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuZXkpIHtcbiAgICAgIHZhciBkZXRhaWxzID0gbmV3IERldGFpbHMuTW9kZWwoKTtcbiAgICAgIGRldGFpbHMuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgICBkZXRhaWxzLnNldCgndHlwZScsICdsYWRkZXInKTtcbiAgICAgIGRldGFpbHMuc2V0KCdwbGF5ZXJDb3VudCcsIDApO1xuICAgICAgZGV0YWlscy5zZXQoJ251bU9mR2FtZXMnLCA1KTtcbiAgICAgIGRldGFpbHMuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgZGVmZXIucmVzb2x2ZShkZXRhaWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhZGRlciAodG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5pbmNsdWRlKCdwbGF5ZXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnQoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVG91cm5hbWVudCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnbmFtZScsICdnYW1lJywgJ3N0YXR1cycsICdkaXNhYmxlZCcsICdkaXNhYmxlZFJlYXNvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG5mdW5jdGlvbiBEZXRhaWxzKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0RldGFpbHMnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndHlwZScsICdudW1PZkdhbWVzJywgJ3BsYXllckNvdW50J107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
