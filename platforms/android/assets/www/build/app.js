angular.module('ONOG', [
  'ionic',
  'ngParse',
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
        },
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament[0].tournament, Parse.User.current());
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
  .run(['$ionicPlatform', '$state', '$rootScope', '$ionicLoading', run])



function run ($ionicPlatform, $state, $rootScope, $ionicLoading, resourceService) {
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
        if(pn.title) {
          switch (pn.title) {
            case 'opponent:found': $state.go('app.dashboard'); break;
            case 'opponent:confirmed': break;
            case 'resultsUpdated': $state.go('app.dashboard'); break;
          }
        }
      });
    }

  });
}

angular.module('ONOG.Services', []);


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

  var promise = null;
  $scope.foundCount = 0;
  $scope.user = Parse.User;
  $scope.player = player[0];
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
          case 'resultsUpdated': matchPlayed(); break;
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

  status();
  
  function savePlayer () {
    $scope.player.save().then(function (player) {
      $scope.player = player;
      status();
    });
  }

  function status () {
    switch ($scope.player.status) {
      case 'open':
        break;
      case 'queue':
        $scope.hasFound = false;
        $scope.showOpponents();
        matchMaking();
        break;
      case 'found':
        playerFound();
        break;
      case 'confirmed':
        $scope.hasFound = false;
        waitingForOpponent();
        break;
      case 'noOpponent':
        noOpponent();
        break;
      case 'playing':
        getLastMatch();
        break;
      case 'cancelled':
        $scope.hasFound = false;
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
  function getLastMatch() {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      if(matches[0].get('status') === 'completed') {
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

  function opponentFound() {
    savePlayer();
  }

  function playerFound() {
    $scope.stop();

    if(!$scope.hasFound) {
      console.log($scope.hasFound)
      $scope.hasFound = true;
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
      });
      popup.then(function(res) {
        if(res) {
          MatchServices.getLatestMatch($scope.player).then(function (matches) {
            var match = matches[0];

            if(match.get('status') === 'pending') {
              $scope.player.set('status', 'confirmed');
              if($scope.player.player === 'player1') {
                match.set('confirm1', true);
              } else {
                match.set('confirm2', true);
              }
              match.save().then(function () {
                savePlayer();
              });
            } else {
              alert('no match');
            }
          });
        } else {
          playerCancelled();
        }
      });

      $timeout(function () {
        if($scope.player.get('status') !== 'confirmed') {
          popup.close(false);
        }
      }, 60000);
    }
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
    $ionicPopup.alert({
      title: 'Match Results Entered',
      template: '<div class="text-center">Your Opponent has entered the results!</div>'
    }).then(function(res) {
      $scope.player.set('status', 'open');
      $scope.player.save().then(function () {
        status();
      });
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
  LadderServices.getPlayers(tournament[0].tournament).then(function (players) {
    var rank = 1;
    angular.forEach(players, function (player) {
      player.rank = rank;
      rank++;
    });
    $scope.players = players;
  });

  $scope.showDetails = function (player) {
    $scope.heroes = player.heroes;
    $ionicPopup.alert({
      title: player.username + ' Heroes',
      scope: $scope,
      template:
        '<div class="row">' +
        '<div class="col-25 text-center" ng-repeat="hero in heroes">' +
        '<img ng-src="img/icons/{{hero}}.png" class="responsive-img" style="padding:3px;">{{hero}}' +
        '</div>' +
        '</div>'
    });
  };
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
  '$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', 'Parse', 'LadderServices', 'MatchServices', 'QueueServices', 'tournament', 'match', 'player'
];
function MatchViewCtrl($scope, $state, $rootScope, $ionicPopup, $ionicHistory, Parse, LadderServices, MatchServices, QueueServices, tournament, match, player) {
  $scope.match = match[0];
  $scope.tournament = tournament[0].tournament;
  $scope.player = player[0];
  $scope.user = Parse.User;
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  if(window.ParsePushPlugin) {
    ParsePushPlugin.on('receivePN', function(pn){
      if(pn.title) {
        switch (pn.title) {
          case 'opponent:found': break;
          case 'opponent:confirmed':
            $scope.player.fetch().then(function (player) {
              $scope.player = player;
            });
            break;
          case 'resultsUpdated': break;
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
        title: 'Select Hero Class',
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
        title: 'Select Hero Class',
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
    cancelMatch: cancelMatch,
    getLatestMatch: getLatestMatch
  }

  function getLatestMatch(player) {
    var type = player.get('player')
    var query = new Parse.Query(Match.Model);
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
  function cancelMatch(player) {
    var cb = $q.defer();
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
    query.find().then(function (matches) {
      matches[0].destroy().then(function () {
        cb.resolve(true);
      });
    });
    return cb.promise;
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsInJvdXRlcy9hZG1pbi5yb3V0ZXMuanMiLCJyb3V0ZXMvbGFkZGVyLnJvdXRlcy5qcyIsInJvdXRlcy9tYXRjaC5yb3V0ZXMuanMiLCJjb250cm9sbGVycy9hZG1pbi5tYXRjaGVzLmN0cmwuanMiLCJjb250cm9sbGVycy9hZG1pbi5wbGF5ZXJzLmN0cmwuanMiLCJjb250cm9sbGVycy9hZG1pbi5zZXR0aW5ncy5jdHJsLmpzIiwiY29udHJvbGxlcnMvZGFzaGJvYXJkLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIuam9pbi5jdHJsLmpzIiwiY29udHJvbGxlcnMvbGFkZGVyLmxlYWRlcmJvYXJkLmN0cmwuanMiLCJjb250cm9sbGVycy9sb2dpbi5jdHJsLmpzIiwiY29udHJvbGxlcnMvbWF0Y2gudmlldy5jdHJsLmpzIiwiY29udHJvbGxlcnMvbWVudS5jdHJsLmpzIiwiY29udHJvbGxlcnMvcmVnaXN0ZXIuY3RybC5qcyIsInNlcnZpY2VzL2xhZGRlci5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL21hdGNoLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDM0NBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqV0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnT05PRycsIFtcbiAgJ2lvbmljJyxcbiAgJ25nUGFyc2UnLFxuICAnbmdDb3Jkb3ZhJyxcbiAgJ25nQW5pbWF0ZScsXG4gICdPTk9HLkNvbnRyb2xsZXJzJyxcbiAgJ09OT0cuU2VydmljZXMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRpb25pY0NvbmZpZ1Byb3ZpZGVyJywgJyRjb21waWxlUHJvdmlkZXInLCAnUGFyc2VQcm92aWRlcicsIGNvbmZpZ10pO1xuXG5mdW5jdGlvbiBjb25maWcgKCRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyLCBQYXJzZVByb3ZpZGVyKSB7XG5cbiAgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8ZmlsZXxibG9ifGNvbnRlbnR8bXMtYXBweHx4LXdtYXBwMCk6fGRhdGE6aW1hZ2VcXC98aW1nXFwvLyk7XG4gICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGZpbGV8Z2h0dHBzP3xtcy1hcHB4fHgtd21hcHAwKTovKTtcblxuICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJuWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRXCIsIFwienJpbjhHRUJEVkdia2wxaW9HRXduSHVQNzBGZEc2SGh6VFM4dUdqelwiKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsIHJvdXRlc10pO1xuXG5mdW5jdGlvbiByb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdhcHAvZGFzaGJvYXJkJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcykge1xuICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuZ2V0VG91cm5hbWVudCgpO1xuICAgICAgICB9LFxuICAgICAgICBwbGF5ZXI6IGZ1bmN0aW9uIChQYXJzZSwgTGFkZGVyU2VydmljZXMsIHRvdXJuYW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKHRvdXJuYW1lbnRbMF0udG91cm5hbWVudCwgUGFyc2UuVXNlci5jdXJyZW50KCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5kYXNoYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kYXNoYm9hcmQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5yZWdpc3RlcicsIHtcbiAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cblxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uc3RhbnQoXCJtb21lbnRcIiwgbW9tZW50KVxuICAucnVuKFsnJGlvbmljUGxhdGZvcm0nLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnJGlvbmljTG9hZGluZycsIHJ1bl0pXG5cblxuXG5mdW5jdGlvbiBydW4gKCRpb25pY1BsYXRmb3JtLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY0xvYWRpbmcsIHJlc291cmNlU2VydmljZSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gICAgJHJvb3RTY29wZS4kb24oJ3Nob3c6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5zaG93KHt0ZW1wbGF0ZTogJzxpb24tc3Bpbm5lciBpY29uPVwic3BpcmFsXCIgY2xhc3M9XCJzcGlubmVyLWNhbG1cIj48L2lvbi1zcGlubmVyPicsIHNob3dCYWNrZHJvcDogdHJ1ZSwgYW5pbWF0aW9uOiAnZmFkZS1pbid9KTtcbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuJG9uKCdoaWRlOmxvYWRpbmcnLCBmdW5jdGlvbigpIHtcbiAgICAgICRpb25pY0xvYWRpbmcuaGlkZSgpO1xuICAgIH0pO1xuXG4gICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgUGFyc2VQdXNoUGx1Z2luLm9uKCdyZWNlaXZlUE4nLCBmdW5jdGlvbihwbil7XG4gICAgICAgIGlmKHBuLnRpdGxlKSB7XG4gICAgICAgICAgc3dpdGNoIChwbi50aXRsZSkge1xuICAgICAgICAgICAgY2FzZSAnb3Bwb25lbnQ6Zm91bmQnOiAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTsgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdvcHBvbmVudDpjb25maXJtZWQnOiBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Jlc3VsdHNVcGRhdGVkJzogJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7IGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgQWRtaW5Sb3V0ZXNdKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBMYWRkZXJSb3V0ZXNdKTtcblxuZnVuY3Rpb24gTGFkZGVyUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyJywge1xuICAgICAgdXJsOiAnL2xhZGRlcicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGFkZGVyLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIubGVhZGVyYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvbGVhZGVyYm9hcmRzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sZWFkZXJib2FyZC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZHNDdHJsJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmpvaW4nLCB7XG4gICAgICB1cmw6ICcvam9pbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvam9pbi5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMYWRkZXJKb2luQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBNYXRjaFJvdXRlc10pO1xuXG5mdW5jdGlvbiBNYXRjaFJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoJywge1xuICAgICAgdXJsOiAnL21hdGNoJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmh0bWwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnZpZXcnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC52aWV3Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoVmlld0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBtYXRjaDogZnVuY3Rpb24gKE1hdGNoU2VydmljZXMsICRzdGF0ZSwgJHEsIHBsYXllcikge1xuICAgICAgICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaChwbGF5ZXJbMF0pLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIGlmKCFtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYi5yZWplY3QoKTtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYi5yZXNvbHZlKG1hdGNoZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pbk1hdGNoZXNDdHJsJywgQWRtaW5NYXRjaGVzQ3RybCk7XG5cbkFkbWluTWF0Y2hlc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhcnNlJ107XG5mdW5jdGlvbiBBZG1pbk1hdGNoZXNDdHJsKCRzY29wZSwgUGFyc2UpIHtcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluUGxheWVyc0N0cmwnLCBBZG1pblBsYXllcnNDdHJsKTtcblxuQWRtaW5QbGF5ZXJzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFyc2UnXTtcbmZ1bmN0aW9uIEFkbWluUGxheWVyc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5TZXR0aW5nc0N0cmwnLCBBZG1pblNldHRpbmdzQ3RybCk7XG5cbkFkbWluU2V0dGluZ3NDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdUb3VybmFtZW50U2VydmljZXMnLCAnbmV3VG91cm5hbWVudCddO1xuXG5mdW5jdGlvbiBBZG1pblNldHRpbmdzQ3RybCgkc2NvcGUsIFRvdXJuYW1lbnRTZXJ2aWNlcywgbmV3VG91cm5hbWVudCkge1xuICAkc2NvcGUuZGV0YWlscyA9IG5ld1RvdXJuYW1lbnQ7XG4gIFxuICAvLyBUb3VybmFtZW50U2VydmljZXMuZ2V0TGFkZGVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQpLnRoZW4oZnVuY3Rpb24gKGxhZGRlcikge1xuICAvLyAgICRzY29wZS5sYWRkZXIgPSBsYWRkZXI7XG4gIC8vIH0pO1xuICBcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZEN0cmwnLFxuICAgIFtcbiAgICAgICckc2NvcGUnLCAnJHN0YXRlJywgJyRmaWx0ZXInLCAnJHRpbWVvdXQnLCAnJGludGVydmFsJywgJyRpb25pY1BvcHVwJywgJyRyb290U2NvcGUnLFxuICAgICAgJ1BhcnNlJywgJ3RvdXJuYW1lbnQnLCAnTWF0Y2hTZXJ2aWNlcycsICdRdWV1ZVNlcnZpY2VzJywgJ0xhZGRlclNlcnZpY2VzJywgJ3BsYXllcicsXG4gICAgICBEYXNoYm9hcmRDdHJsXG4gICAgXSk7XG5cbmZ1bmN0aW9uIERhc2hib2FyZEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkZmlsdGVyLCAkdGltZW91dCwgJGludGVydmFsLCAkaW9uaWNQb3B1cCwgJHJvb3RTY29wZSxcbiAgUGFyc2UsIHRvdXJuYW1lbnQsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMsIExhZGRlclNlcnZpY2VzLCBwbGF5ZXIpIHtcblxuICB2YXIgcHJvbWlzZSA9IG51bGw7XG4gICRzY29wZS5mb3VuZENvdW50ID0gMDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnRbMF0udG91cm5hbWVudDtcbiAgJHNjb3BlLm9wcG9uZW50ID0gUXVldWVTZXJ2aWNlcy5vcHBvbmVudDtcbiAgJHNjb3BlLmhlcm9MaXN0ID0gUXVldWVTZXJ2aWNlcy5oZXJvZXM7XG4gICRzY29wZS5teU9wcG9uZW50ID0ge25hbWU6J1BBWCBBdHRlbmRlZSd9O1xuXG4gIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4pIHtcbiAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTicsIGZ1bmN0aW9uKHBuKXtcbiAgICAgIGlmKHBuLnRpdGxlKSB7XG4gICAgICAgIHN3aXRjaCAocG4udGl0bGUpIHtcbiAgICAgICAgICBjYXNlICdvcHBvbmVudDpmb3VuZCc6IG9wcG9uZW50Rm91bmQoKTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnb3Bwb25lbnQ6Y29uZmlybWVkJzogb3Bwb25lbnRDb25maXJtZWQoKTsgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncmVzdWx0c1VwZGF0ZWQnOiBtYXRjaFBsYXllZCgpOyBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIGdldEN1cnJlbnRTdGF0dXModHJ1ZSk7XG4gIH07XG5cbiAgJHNjb3BlLnN0YXJ0UXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgc3ViKCk7XG4gICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgIHNhdmVQbGF5ZXIoKTtcbiAgfTtcblxuICAkc2NvcGUuY2FuY2VsUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBzYXZlUGxheWVyKCk7XG4gIH07XG5cbiAgJHNjb3BlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHByb21pc2UpO1xuICB9O1xuXG4gICRzY29wZS5zaG93T3Bwb25lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBwcm9taXNlID0gJGludGVydmFsKGZ1bmN0aW9uICgpIHtjaGFuZ2VXb3JkKCl9LCAyMDAwKTtcbiAgfTtcblxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gIH0pO1xuXG4gIHN0YXR1cygpO1xuICBcbiAgZnVuY3Rpb24gc2F2ZVBsYXllciAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgc3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXMgKCkge1xuICAgIHN3aXRjaCAoJHNjb3BlLnBsYXllci5zdGF0dXMpIHtcbiAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3F1ZXVlJzpcbiAgICAgICAgJHNjb3BlLmhhc0ZvdW5kID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5zaG93T3Bwb25lbnRzKCk7XG4gICAgICAgIG1hdGNoTWFraW5nKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZm91bmQnOlxuICAgICAgICBwbGF5ZXJGb3VuZCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbmZpcm1lZCc6XG4gICAgICAgICRzY29wZS5oYXNGb3VuZCA9IGZhbHNlO1xuICAgICAgICB3YWl0aW5nRm9yT3Bwb25lbnQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdub09wcG9uZW50JzpcbiAgICAgICAgbm9PcHBvbmVudCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3BsYXlpbmcnOlxuICAgICAgICBnZXRMYXN0TWF0Y2goKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICAkc2NvcGUuaGFzRm91bmQgPSBmYWxzZTtcbiAgICAgICAgcGxheWVyQ2FuY2VsbGVkKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEN1cnJlbnRTdGF0dXMocmVmcmVzaCkge1xuICAgIHZhciByZWZyZXNoID0gcmVmcmVzaDtcbiAgICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnNbMF07XG4gICAgICBpZiAoJHNjb3BlLnBsYXllcikge1xuICAgICAgICBzdGF0dXMoKTtcbiAgICAgIH1cbiAgICAgIGlmKHJlZnJlc2gpIHtcbiAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBnZXRMYXN0TWF0Y2goKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICBpZihtYXRjaGVzWzBdLmdldCgnc3RhdHVzJykgPT09ICdjb21wbGV0ZWQnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoTWFraW5nKCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIFBhcnNlLkNsb3VkLnJ1bignbWF0Y2htYWtpbmcnKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZ2V0Q3VycmVudFN0YXR1cyhmYWxzZSk7XG4gICAgICB9KTtcbiAgICB9LCA1MDAwKTtcbiAgICBcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wcG9uZW50Rm91bmQoKSB7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxheWVyRm91bmQoKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcblxuICAgIGlmKCEkc2NvcGUuaGFzRm91bmQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5oYXNGb3VuZClcbiAgICAgICRzY29wZS5oYXNGb3VuZCA9IHRydWU7XG4gICAgICB2YXIgcG9wdXAgPSAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+PHN0cm9uZz5BIFdvcnRoeSBPcHBvbmVudDwvc3Ryb25nPjxicj4gaGFzIGJlZW4gZm91bmQhPC9kaXY+JyxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6ICc8Yj5DYW5jZWw8L2I+JyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tYXNzZXJ0aXZlJyxcbiAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6ICc8Yj5Db25maXJtPC9iPicsXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gICAgICBwb3B1cC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBpZihyZXMpIHtcbiAgICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIHZhciBtYXRjaCA9IG1hdGNoZXNbMF07XG5cbiAgICAgICAgICAgIGlmKG1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdwZW5kaW5nJykge1xuICAgICAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgICAgICAgICBpZigkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2guc2V0KCdjb25maXJtMScsIHRydWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1hdGNoLnNldCgnY29uZmlybTInLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBtYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGFsZXJ0KCdubyBtYXRjaCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBsYXllckNhbmNlbGxlZCgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBpZigkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykgIT09ICdjb25maXJtZWQnKSB7XG4gICAgICAgICAgcG9wdXAuY2xvc2UoZmFsc2UpO1xuICAgICAgICB9XG4gICAgICB9LCA2MDAwMCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcGxheWVyQ2FuY2VsbGVkKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIuZ2V0KCdjYW5jZWxUaW1lcicpKSB7XG4gICAgICBpZihtb21lbnQoJHNjb3BlLnBsYXllci5nZXQoJ2NhbmNlbFRpbWVyJykpLmlzQWZ0ZXIoKSkge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgJHNjb3BlLnBsYXllci51bnNldCgnY2FuY2VsVGltZXInKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhcnRUaW1lcigpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGltZSA9IG1vbWVudCgpLmFkZCgnMicsICdtaW51dGVzJykuZm9ybWF0KCk7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NhbmNlbGxlZCcpO1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ2NhbmNlbFRpbWVyJywgdGltZSk7XG4gICAgICBzYXZlUGxheWVyKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRUaW1lcigpIHtcbiAgICAvL1RPRE8gZG8gdGltZXJcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wcG9uZW50Q29uZmlybWVkICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3BsYXlpbmcnKTtcbiAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICRzdGF0ZS5nbygnYXBwLm1hdGNoLnZpZXcnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhaXRpbmdGb3JPcHBvbmVudCAoKSB7XG4gICAgUGFyc2UuQ2xvdWQucnVuKCdjb25maXJtTWF0Y2gnKS50aGVuKGZ1bmN0aW9uIChudW0pIHtcbiAgICAgIE1hdGNoU2VydmljZXMuZ2V0Q29uZmlybWVkTWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3BsYXlpbmcnKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdoaWRlOmxvYWRpbmcnKTtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLm1hdGNoLnZpZXcnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBpZighbnVtKSB7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBpZigkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykgPT09ICdjb25maXJtZWQnKSB7XG4gICAgICAgICAgICBNYXRjaFNlcnZpY2VzLmdldENvbmZpcm1lZE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgaWYoIW1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdub09wcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncGxheWluZycpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3RhdHVzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LCA2MDAwMCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gbWF0Y2hQbGF5ZWQoKSB7XG4gICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdNYXRjaCBSZXN1bHRzIEVudGVyZWQnLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5Zb3VyIE9wcG9uZW50IGhhcyBlbnRlcmVkIHRoZSByZXN1bHRzITwvZGl2PidcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc3RhdHVzKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5vT3Bwb25lbnQgKCkge1xuICAgICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaCBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+WW91ciBPcHBvbmVudDwvc3Ryb25nPjxicj4gZmFpbGVkIHRvIGNvbmZpcm0hPC9kaXY+JyxcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5CYWNrPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1hc3NlcnRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPlF1ZXVlIEFnYWluPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmNhbmNlbE1hdGNoKCRzY29wZS51c2VyLmN1cnJlbnQoKSwgJHNjb3BlLnBsYXllci5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc3ViICgpIHtcbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4uc3Vic2NyaWJlKCRzY29wZS5wbGF5ZXIudXNlcm5hbWUsIGZ1bmN0aW9uKG1zZykge1xuICAgICAgICBjb25zb2xlLmxvZygnc3ViYmVkJyk7XG4gICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGFuZ2VXb3JkICgpIHtcbiAgICAkc2NvcGUubXlPcHBvbmVudC5uYW1lID0gJHNjb3BlLm9wcG9uZW50Lmxpc3RbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKiRzY29wZS5vcHBvbmVudC5saXN0Lmxlbmd0aCldO1xuICB9O1xufTtcbi8vIGZ1bmN0aW9uIGpvaW5RdWV1ZVBvcHVwICgpIHtcbi8vICAgc3ViKCk7XG4vLyAgICRzY29wZS5zZWxlY3RlZCA9IHtzdGF0dXM6IHRydWV9O1xuLy8gICAkc2NvcGUuc2VsZWN0SGVybyA9IGZ1bmN0aW9uIChoZXJvKSB7XG4vLyAgICAgJHNjb3BlLmltYWdlID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZXJvQ2xhc3MnKSlbMF0uY2xpZW50V2lkdGg7XG4vL1xuLy8gICAgIGlmKGhlcm8uY2hlY2tlZCkge1xuLy8gICAgICAgaGVyby5jaGVja2VkID0gIWhlcm8uY2hlY2tlZDtcbi8vICAgICAgICRzY29wZS5zZWxlY3RlZC5zdGF0dXMgPSB0cnVlO1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vXG4vLyAgICAgaWYoIWhlcm8uY2hlY2tlZCAmJiAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzKSB7XG4vLyAgICAgICBoZXJvLmNoZWNrZWQgPSAhaGVyby5jaGVja2VkO1xuLy8gICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IGZhbHNlO1xuLy8gICAgICAgcmV0dXJuO1xuLy8gICAgIH1cbi8vICAgfTtcbi8vICAgcmV0dXJuICRpb25pY1BvcHVwLnNob3coXG4vLyAgICAge1xuLy8gICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcG9wdXBzL3NlbGVjdC5oZXJvLmh0bWwnLFxuLy8gICAgICAgdGl0bGU6ICdTZWxlY3QgSGVybyBDbGFzcycsXG4vLyAgICAgICBzY29wZTogJHNjb3BlLFxuLy8gICAgICAgYnV0dG9uczogW1xuLy8gICAgICAgICB7IHRleHQ6ICdDYW5jZWwnfSxcbi8vICAgICAgICAgeyB0ZXh0OiAnPGI+UXVldWU8L2I+Jyxcbi8vICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbi8vICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuLy8gICAgICAgICAgICAgdmFyIGhlcm8gPSAkZmlsdGVyKCdmaWx0ZXInKSgkc2NvcGUuaGVyb0xpc3QsIHtjaGVja2VkOiB0cnVlfSwgdHJ1ZSk7XG4vLyAgICAgICAgICAgICBpZiAoIWhlcm8ubGVuZ3RoKSB7XG4vLyAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbi8vICAgICAgICAgICAgIH0gZWxzZSB7XG4vLyAgICAgICAgICAgICAgIHJldHVybiBoZXJvWzBdO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgICAgXVxuLy8gICAgIH0pO1xuLy8gfTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMYWRkZXJKb2luQ3RybCcsIFsnJHNjb3BlJywgJyRmaWx0ZXInLCAnJGlvbmljUG9wdXAnLCAnJHN0YXRlJywgJyRpb25pY0hpc3RvcnknLCAnJHEnLCAnUGFyc2UnLCAndG91cm5hbWVudCcsICdMYWRkZXJTZXJ2aWNlcycsIExhZGRlckpvaW5DdHJsXSk7XG5cbmZ1bmN0aW9uIExhZGRlckpvaW5DdHJsXG4oJHNjb3BlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCAkcSwgUGFyc2UsICB0b3VybmFtZW50LCBMYWRkZXJTZXJ2aWNlcykge1xuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICAkc2NvcGUucGxheWVyID0ge1xuICAgIGJhdHRsZVRhZzogJydcbiAgfTtcblxuICAkc2NvcGUucmVnaXN0ZXJQbGF5ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFsaWRhdGVCYXR0bGVUYWcoKS50aGVuKFxuICAgICAgZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnVzZXJuYW1lID0gJHNjb3BlLnVzZXIudXNlcm5hbWU7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc3RhdHVzID0gJ29wZW4nO1xuICAgICAgICBMYWRkZXJTZXJ2aWNlcy5qb2luVG91cm5hbWVudCgkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIsICRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgIFN1Y2Nlc3NQb3B1cChwbGF5ZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IpO1xuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVCYXR0bGVUYWcgKCkge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRhZyA9ICRzY29wZS5wbGF5ZXIuYmF0dGxlVGFnO1xuXG4gICAgaWYodGFnLmxlbmd0aCA8IDgpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIGJhdHRsZSB0YWcnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgc3BsaXQgPSB0YWcuc3BsaXQoJyMnKTtcbiAgICBpZihzcGxpdC5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIEJBVFRMRVRBR+KEoiBpbmNsdWRpbmcgIyBhbmQgZm91ciBkaWdpdHMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihzcGxpdFsxXS5sZW5ndGggPCAyIHx8IHNwbGl0WzFdLmxlbmd0aCA+IDQpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgdXAgdG8gZm91ciBkaWdpdHMgYWZ0ZXIgIyEnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihpc05hTihzcGxpdFsxXSkpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgZm91ciBkaWdpdHMgYWZ0ZXIgIycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLnZhbGlkYXRlUGxheWVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsIHRhZykudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgaWYocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgY2IucmVqZWN0KCdUaGUgQkFUVExFVEFH4oSiIHlvdSBlbnRlcmVkIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0YWcpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgfTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gU3VjY2Vzc1BvcHVwIChwbGF5ZXIpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdDb25ncmF0dWxhdGlvbnMgJyArIHBsYXllci51c2VybmFtZSArICchJyxcbiAgICAgIHRlbXBsYXRlOiAnWW91IGhhdmUgc3VjY2Vzc2Z1bGx5IHNpZ25lZCB1cCEgTm93IGdvIGZpbmQgYSB2YWxpYW50IG9wcG9uZW50LidcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGVhZGVyQm9hcmRzQ3RybCcsIExlYWRlckJvYXJkc0N0cmwpO1xuXG5MZWFkZXJCb2FyZHNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdMYWRkZXJTZXJ2aWNlcycsICd0b3VybmFtZW50JywgJ1BhcnNlJywgJyRmaWx0ZXInLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIExlYWRlckJvYXJkc0N0cmwoJHNjb3BlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCwgUGFyc2UsICRmaWx0ZXIsICRpb25pY1BvcHVwKSB7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcbiAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVycyh0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICB2YXIgcmFuayA9IDE7XG4gICAgYW5ndWxhci5mb3JFYWNoKHBsYXllcnMsIGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgIHBsYXllci5yYW5rID0gcmFuaztcbiAgICAgIHJhbmsrKztcbiAgICB9KTtcbiAgICAkc2NvcGUucGxheWVycyA9IHBsYXllcnM7XG4gIH0pO1xuXG4gICRzY29wZS5zaG93RGV0YWlscyA9IGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAkc2NvcGUuaGVyb2VzID0gcGxheWVyLmhlcm9lcztcbiAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogcGxheWVyLnVzZXJuYW1lICsgJyBIZXJvZXMnLFxuICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgIHRlbXBsYXRlOlxuICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC0yNSB0ZXh0LWNlbnRlclwiIG5nLXJlcGVhdD1cImhlcm8gaW4gaGVyb2VzXCI+JyArXG4gICAgICAgICc8aW1nIG5nLXNyYz1cImltZy9pY29ucy97e2hlcm99fS5wbmdcIiBjbGFzcz1cInJlc3BvbnNpdmUtaW1nXCIgc3R5bGU9XCJwYWRkaW5nOjNweDtcIj57e2hlcm99fScgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgfSk7XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybCk7XG5cbkxvZ2luQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJHN0YXRlJywgJ1BhcnNlJywgJyRpb25pY0hpc3RvcnknXTtcbmZ1bmN0aW9uIExvZ2luQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY0hpc3RvcnkpIHtcbiAgJHNjb3BlLnVzZXIgPSB7fTtcbiAgUGFyc2UuVXNlci5sb2dPdXQoKTtcbiAgJHNjb3BlLmxvZ2luVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBQYXJzZS5Vc2VyLmxvZ0luKCRzY29wZS51c2VyLnVzZXJuYW1lLCAkc2NvcGUudXNlci5wYXNzd29yZCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbiAodXNlciwgZXJyb3IpIHtcbiAgICAgICAgJHNjb3BlLndhcm5pbmcgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd1c2VyJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuICAgICRzY29wZS53YXJuaW5nID0gbnVsbDtcbiAgfSwgdHJ1ZSk7XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoVmlld0N0cmwnLCBNYXRjaFZpZXdDdHJsKTtcblxuTWF0Y2hWaWV3Q3RybC4kaW5qZWN0ID0gW1xuICAnJHNjb3BlJywgJyRzdGF0ZScsICckcm9vdFNjb3BlJywgJyRpb25pY1BvcHVwJywgJyRpb25pY0hpc3RvcnknLCAnUGFyc2UnLCAnTGFkZGVyU2VydmljZXMnLCAnTWF0Y2hTZXJ2aWNlcycsICdRdWV1ZVNlcnZpY2VzJywgJ3RvdXJuYW1lbnQnLCAnbWF0Y2gnLCAncGxheWVyJ1xuXTtcbmZ1bmN0aW9uIE1hdGNoVmlld0N0cmwoJHNjb3BlLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY1BvcHVwLCAkaW9uaWNIaXN0b3J5LCBQYXJzZSwgTGFkZGVyU2VydmljZXMsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMsIHRvdXJuYW1lbnQsIG1hdGNoLCBwbGF5ZXIpIHtcbiAgJHNjb3BlLm1hdGNoID0gbWF0Y2hbMF07XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgIFBhcnNlUHVzaFBsdWdpbi5vbigncmVjZWl2ZVBOJywgZnVuY3Rpb24ocG4pe1xuICAgICAgaWYocG4udGl0bGUpIHtcbiAgICAgICAgc3dpdGNoIChwbi50aXRsZSkge1xuICAgICAgICAgIGNhc2UgJ29wcG9uZW50OmZvdW5kJzogYnJlYWs7XG4gICAgICAgICAgY2FzZSAnb3Bwb25lbnQ6Y29uZmlybWVkJzpcbiAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuZmV0Y2goKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAncmVzdWx0c1VwZGF0ZWQnOiBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnJlY29yZCA9IGZ1bmN0aW9uIChyZWNvcmQpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IG51bGw7XG4gICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdhY3RpdmUnKSB7XG4gICAgICAgIHN3aXRjaCAocmVjb3JkKSB7XG4gICAgICAgICAgY2FzZSAnd2luJzpcbiAgICAgICAgICAgIHdpbk1hdGNoKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgaWYocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnd2lubmVyJywgJHNjb3BlLnBsYXllcik7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnbG9zZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWUgPSAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWVcbiAgICAgICAgICAgICAgICByZWNvcmRNYXRjaCgkc2NvcGUubWF0Y2gsIHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2xvc3MnOlxuICAgICAgICAgICAgbG9zZU1hdGNoKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgICAgICAgaWYocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnd2lubmVyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLnBsYXllcik7XG4gICAgICAgICAgICAgICAgdXNlcm5hbWUgPSAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWU7XG4gICAgICAgICAgICAgICAgcmVjb3JkTWF0Y2goJHNjb3BlLm1hdGNoLCB1c2VybmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBnZXRNYXRjaERldGFpbHMoKTtcblxuICBmdW5jdGlvbiBsb3NlTWF0Y2goKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLnNob3coXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy9sb3NlLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1NlbGVjdCBIZXJvIENsYXNzJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29yZE1hdGNoKG1hdGNoLCB1c2VybmFtZSkge1xuXG4gICAgbWF0Y2guc2V0KCdzdGF0dXMnLCAnY29tcGxldGVkJyk7XG4gICAgbWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaFJlc3VsdHMnLCB7dXNlcm5hbWU6IHVzZXJuYW1lLCBtYXRjaDogbWF0Y2guaWR9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICB0aXRsZTogJ01hdGNoIFN1Ym1pdHRlZCcsXG4gICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5UaGFuayB5b3UgZm9yIHN1Ym1pdHRpbmcgcmVzdWx0czwvZGl2PidcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB3aW5NYXRjaCAoKSB7XG4gICAgJHNjb3BlLmltYWdlID0gbnVsbDtcblxuICAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvd2luLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1NlbGVjdCBIZXJvIENsYXNzJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuaW1hZ2UpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRzY29wZS5pbWFnZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRNYXRjaERldGFpbHMoKSB7XG4gICAgJHNjb3BlLm9wcG9uZW50ID0ge1xuICAgICAgaGVybzogbnVsbCxcbiAgICAgIGJhdHRsZVRhZzogbnVsbFxuICAgIH1cbiAgICBpZigkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuaGVybyA9ICRzY29wZS5tYXRjaC5oZXJvMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VybmFtZSA9ICRzY29wZS5tYXRjaC51c2VybmFtZTI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuYmF0dGxlVGFnID0gJHNjb3BlLm1hdGNoLmJhdHRsZVRhZzI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlciA9ICRzY29wZS5tYXRjaC5wbGF5ZXIyO1xuICAgIH1cbiAgICBpZigkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjInKSB7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuaGVybyA9ICRzY29wZS5tYXRjaC5oZXJvMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VybmFtZSA9ICRzY29wZS5tYXRjaC51c2VybmFtZTE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuYmF0dGxlVGFnID0gJHNjb3BlLm1hdGNoLmJhdHRsZVRhZzE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlciA9ICRzY29wZS5tYXRjaC5wbGF5ZXIxO1xuICAgIH1cbiAgfVxufTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcbiAgLmNvbnRyb2xsZXIoJ01lbnVDdHJsJywgTWVudUN0cmwpO1xuXG5NZW51Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCckaW9uaWNQb3BvdmVyJywgJyRzdGF0ZScsICckaW9uaWNIaXN0b3J5JywgJ1BhcnNlJywgJyR0aW1lb3V0J107XG5mdW5jdGlvbiBNZW51Q3RybCgkc2NvcGUsICRpb25pY1BvcG92ZXIsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgUGFyc2UsICR0aW1lb3V0KSB7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcblxuICAkaW9uaWNQb3BvdmVyLmZyb21UZW1wbGF0ZVVybCgndGVtcGxhdGVzL3BvcG92ZXJzL3Byb2ZpbGUucG9wLmh0bWwnLCB7XG4gICAgc2NvcGU6ICRzY29wZSxcbiAgfSkudGhlbihmdW5jdGlvbihwb3BvdmVyKSB7XG4gICAgJHNjb3BlLnBvcG92ZXIgPSBwb3BvdmVyO1xuICB9KTtcblxuICAkc2NvcGUubWVudSA9IGZ1bmN0aW9uIChsaW5rKSB7XG4gICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICB9KTtcbiAgICAkc3RhdGUuZ28oJ2FwcC4nICsgbGluaywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICRzY29wZS5wb3BvdmVyLmhpZGUoKTtcbiAgfVxuICAvL0NsZWFudXAgdGhlIHBvcG92ZXIgd2hlbiB3ZSdyZSBkb25lIHdpdGggaXQhXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnBvcG92ZXIucmVtb3ZlKCk7XG4gIH0pO1xuXG4gICRzY29wZS4kb24oJyRpb25pY1ZpZXcubG9hZGVkJywgZnVuY3Rpb24oKSB7XG4gICAgaW9uaWMuUGxhdGZvcm0ucmVhZHkoIGZ1bmN0aW9uKCkge1xuICAgICAgaWYobmF2aWdhdG9yICYmIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4pIHtcbiAgICAgICAgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbi5oaWRlKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ1JlZ2lzdGVyQ3RybCcsIFJlZ2lzdGVyQ3RybCk7XG5cblJlZ2lzdGVyQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJHN0YXRlJywgJ1BhcnNlJywgJyRpb25pY1BvcHVwJ107XG5mdW5jdGlvbiBSZWdpc3RlckN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNQb3B1cCkge1xuXG4gICRzY29wZS51c2VyID0ge307XG5cbiAgJHNjb3BlLlJlZ2lzdGVyVXNlciA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdmFyIHJlZ2lzdGVyID0gbmV3IFBhcnNlLlVzZXIoKTtcbiAgICByZWdpc3Rlci5zZXQodXNlcik7XG4gICAgcmVnaXN0ZXIuc2lnblVwKG51bGwsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIGVycm9yIG1lc3NhZ2Ugc29tZXdoZXJlIGFuZCBsZXQgdGhlIHVzZXIgdHJ5IGFnYWluLlxuICAgICAgICBFcnJvclBvcHVwKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd1c2VyJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuICAgICRzY29wZS53YXJuaW5nID0gbnVsbDtcbiAgfSwgdHJ1ZSk7XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1JlZ2lzdHJhdGlvbiBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTGFkZGVyU2VydmljZXMnLCBbJ1BhcnNlJywgJ0xhZGRlcicsIExhZGRlclNlcnZpY2VzXSlcbiAgLmZhY3RvcnkoJ0xhZGRlcicsIFsnUGFyc2UnLCBMYWRkZXJdKVxuXG5mdW5jdGlvbiBMYWRkZXJTZXJ2aWNlcyhQYXJzZSwgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UGxheWVyczogZ2V0UGxheWVycyxcbiAgICBnZXRQbGF5ZXI6IGdldFBsYXllcixcbiAgICB2YWxpZGF0ZVBsYXllcjogdmFsaWRhdGVQbGF5ZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50LFxuICAgIGdldFBlbmRpbmdQbGF5ZXJzOiBnZXRQZW5kaW5nUGxheWVyc1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBlbmRpbmdQbGF5ZXJzKHRvdXJuYW1lbnQsIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkubm90RXF1YWxUTygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVycyh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoJ3BvaW50cycsICdtbXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUGxheWVyKHRvdXJuZXksIGJhdHRsZVRhZykge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5lcXVhbFRvKCdiYXR0bGVUYWcnLCBiYXR0bGVUYWcpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyKHRvdXJuZXksIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCB1c2VyLCB1c2VyRGF0YSkge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKCk7XG4gICAgcGxheWVyLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXInLCB1c2VyKTtcbiAgICBwbGF5ZXIuc2V0KHVzZXJEYXRhKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIExhZGRlcihQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdMYWRkZXInKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndXNlcicsICdiYXR0bGVUYWcnLCAndXNlcm5hbWUnLCAnaGVybycsICdwbGF5ZXInLCAnc3RhdHVzJywgJ2NhbmNlbFRpbWVyJywgJ3dpbnMnLCAnbG9zc2VzJywgJ21tcicsICdwb2ludHMnXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTWF0Y2hTZXJ2aWNlcycsIFsnUGFyc2UnLCAnTWF0Y2gnLCAnJHEnLCBNYXRjaFNlcnZpY2VzXSlcbiAgLmZhY3RvcnkoJ01hdGNoJywgWydQYXJzZScsIE1hdGNoXSk7XG5cbmZ1bmN0aW9uIE1hdGNoU2VydmljZXMoUGFyc2UsIE1hdGNoLCAkcSkge1xuICB2YXIgdXNlciA9IFBhcnNlLlVzZXI7XG4gIHJldHVybiB7XG4gICAgZ2V0Q29uZmlybWVkTWF0Y2g6IGdldENvbmZpcm1lZE1hdGNoLFxuICAgIGNhbmNlbE1hdGNoOiBjYW5jZWxNYXRjaCxcbiAgICBnZXRMYXRlc3RNYXRjaDogZ2V0TGF0ZXN0TWF0Y2hcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExhdGVzdE1hdGNoKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJylcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoXCJjcmVhdGVkQXRcIik7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgaWYodHlwZSA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgfVxuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGdldENvbmZpcm1lZE1hdGNoIChwbGF5ZXIpIHtcbiAgICB2YXIgdHlwZSA9IHBsYXllci5nZXQoJ3BsYXllcicpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSgnTWF0Y2gnKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpXG4gICAgfVxuICAgIHF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgcXVlcnkuZXF1YWxUbygnY29uZmlybTInLCB0cnVlKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGNhbmNlbE1hdGNoKHBsYXllcikge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKVxuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKTtcbiAgICB9XG4gICAgcXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBxdWVyeS5maW5kKCkudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgbWF0Y2hlc1swXS5kZXN0cm95KCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgIGNiLnJlc29sdmUodHJ1ZSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNYXRjaChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdNYXRjaCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFtcbiAgICAndG91cm5hbWVudCcsICdwbGF5ZXIxJywgJ3BsYXllcjInLCAnaGVybzEnLCAnaGVybzInLCAndXNlcm5hbWUxJywgJ3VzZXJuYW1lMicsICdiYXR0bGVUYWcxJywgJ2JhdHRsZVRhZzInLCAnc3RhdHVzJywgJ3dpbm5lcicsICdsb3NlcicsXG4gICAgJ3NjcmVlbnNob3QnLCAncmVwb3J0JywgJ3JlcG9ydGVkU2NyZWVuc2hvdCcsICdhY3RpdmVEYXRlJywgJ3VzZXIxJywgJ3VzZXIyJ1xuICBdO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1F1ZXVlU2VydmljZXMnLFtRdWV1ZVNlcnZpY2VzXSlcblxuZnVuY3Rpb24gUXVldWVTZXJ2aWNlcygpIHtcbiAgdmFyIG9wcG9uZW50ID0ge1xuICAgIGxpc3Q6IFsnRWFzeSBQaWNraW5ncycsICdZb3VyIFdvcnN0IE5pZ2h0bWFyZScsICdXb3JsZCBjbGFzcyBwYXN0ZSBlYXRlcicsXG4gICAgICAnQSBNdXJsb2MnLCAnR291cmQgY3JpdGljJywgJ05vc2UgYW5kIG1vdXRoIGJyZWF0aGVyJywgJ0hvZ2dlcicsICdBIGNhcmRpc2ggSWFuJyxcbiAgICAgICdNb3BleSBNYWdlJywgJ1dvbWJhdCBXYXJsb2NrJywgJ1JvdWdlZCB1cCBSb2d1ZScsICdXYWlmaXNoIFdhcnJpb3InLCAnRGFtcCBEcnVpZCcsXG4gICAgICAnU2hhYmJ5IFNoYW1hbicsICdQZW5uaWxlc3MgUGFsYWRpbicsICdIdWZmeSBIdW50ZXInLCAnUGVya3kgUHJpZXN0JywgJ1RoZSBXb3JzdCBQbGF5ZXInLFxuICAgICAgJ1lvdXIgT2xkIFJvb21tYXRlJywgJ1N0YXJDcmFmdCBQcm8nLCAnRmlzY2FsbHkgcmVzcG9uc2libGUgbWltZScsICdZb3VyIEd1aWxkIExlYWRlcicsXG4gICAgICAnTm9uZWNrIEdlb3JnZScsICdHdW0gUHVzaGVyJywgJ0NoZWF0ZXIgTWNDaGVhdGVyc29uJywgJ1JlYWxseSBzbG93IGd1eScsICdSb2FjaCBCb3knLFxuICAgICAgJ09yYW5nZSBSaHltZXInLCAnQ29mZmVlIEFkZGljdCcsICdJbndhcmQgVGFsa2VyJywgJ0JsaXp6YXJkIERldmVsb3BlcicsICdHcmFuZCBNYXN0ZXInLFxuICAgICAgJ0RpYW1vbmQgTGVhZ3VlIFBsYXllcicsICdCcmFuZCBOZXcgUGxheWVyJywgJ0Rhc3RhcmRseSBEZWF0aCBLbmlnaHQnLCAnTWVkaW9jcmUgTW9uaycsXG4gICAgICAnQSBMaXR0bGUgUHVwcHknXG4gICAgXVxuICB9O1xuICB2YXIgaGVyb2VzID0gW1xuICAgIHt0ZXh0OiAnbWFnZScsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2h1bnRlcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3BhbGFkaW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJyaW9yJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnZHJ1aWQnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJsb2NrJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnc2hhbWFuJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncHJpZXN0JywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncm9ndWUnLCBjaGVja2VkOiBmYWxzZX1cbiAgXVxuICByZXR1cm4ge1xuICAgIG9wcG9uZW50OiBvcHBvbmVudCxcbiAgICBoZXJvZXM6IGhlcm9lc1xuICB9XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnVG91cm5hbWVudFNlcnZpY2VzJywgWydQYXJzZScsICckcScsICdUb3VybmFtZW50JywgJ0RldGFpbHMnLCAnTGFkZGVyJywgVG91cm5hbWVudFNlcnZpY2VzXSlcblxuICAuZmFjdG9yeSgnVG91cm5hbWVudCcsIFsnUGFyc2UnLCBUb3VybmFtZW50XSlcbiAgLmZhY3RvcnkoJ0RldGFpbHMnLCBbJ1BhcnNlJywgRGV0YWlsc10pO1xuXG5mdW5jdGlvbiBUb3VybmFtZW50U2VydmljZXMoUGFyc2UsICRxLCBUb3VybmFtZW50LCBEZXRhaWxzLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb3VybmFtZW50OiBnZXRUb3VybmFtZW50LFxuICAgIGNyZWF0ZVRvdXJuYW1lbnQ6IGNyZWF0ZVRvdXJuYW1lbnQsXG4gICAgZ2V0TGFkZGVyOiBnZXRMYWRkZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH1cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgcGxheWVyKSB7XG4gICAgdmFyIHBsYXllciA9IG5ldyBMYWRkZXIuTW9kZWwocGxheWVyKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VybmFtZScsIFBhcnNlLlVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICBwbGF5ZXIuc2V0KCdtbXInLCAxMDAwKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VG91cm5hbWVudCgpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoRGV0YWlscy5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndHlwZScsICdsYWRkZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd0b3VybmFtZW50Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb3VybmFtZW50ICgpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0b3VybmFtZW50ID0gbmV3IFRvdXJuYW1lbnQuTW9kZWwoKTtcbiAgICB0b3VybmFtZW50LnNldCgnbmFtZScsICdPTk9HIE9QRU4nKTtcbiAgICB0b3VybmFtZW50LnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICB0b3VybmFtZW50LnNldCgnZ2FtZScsICdoZWFydGhzdG9uZScpO1xuICAgIHRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuZXkpIHtcbiAgICAgIHZhciBkZXRhaWxzID0gbmV3IERldGFpbHMuTW9kZWwoKTtcbiAgICAgIGRldGFpbHMuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgICBkZXRhaWxzLnNldCgndHlwZScsICdsYWRkZXInKTtcbiAgICAgIGRldGFpbHMuc2V0KCdwbGF5ZXJDb3VudCcsIDApO1xuICAgICAgZGV0YWlscy5zZXQoJ251bU9mR2FtZXMnLCA1KTtcbiAgICAgIGRldGFpbHMuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgZGVmZXIucmVzb2x2ZShkZXRhaWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhZGRlciAodG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5pbmNsdWRlKCdwbGF5ZXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnQoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVG91cm5hbWVudCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnbmFtZScsICdnYW1lJywgJ3N0YXR1cycsICdkaXNhYmxlZCcsICdkaXNhYmxlZFJlYXNvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG5mdW5jdGlvbiBEZXRhaWxzKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0RldGFpbHMnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndHlwZScsICdudW1PZkdhbWVzJywgJ3BsYXllckNvdW50J107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
