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

    if(window.ParsePushPlugin){
      $state.go('app.dashboard');
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

  var promise = null;
  $scope.foundCount = 0;
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
          case 'match:results': matchPlayed(); break;
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
        $scope.matchmaking = 0;
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
    if($scope.matchmaking < 3) {
      $timeout(function () {
        Parse.Cloud.run('matchmaking').then(function (status) {
          getCurrentStatus(false);
          $scope.matchmaking++;
          console.log($scope.matchmaking);
        });
      }, 10000);
    } else {
      $scope.cancelQueue();
      showEmptyQueue();
    }
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
    if(!$scope.foundCount) {
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
      });
      $scope.foundCount++;
    }

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
              $scope.foundCount = 0;
              savePlayer();
            });
          }
        });
      } else {
        $scope.foundCount = 0;
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
    Parse.Cloud.run('confirmMatch').then(function (num) {
      MatchServices.getConfirmedMatch().then(function (matches) {
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
            MatchServices.getConfirmedMatch().then(function (matches) {
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
  '$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', 'Parse', 'LadderServices', 'MatchServices', 'QueueServices', 'tournament', 'match'
];
function MatchViewCtrl($scope, $state, $rootScope, $ionicPopup, $ionicHistory, Parse, LadderServices, MatchServices, QueueServices, tournament, match) {
  $scope.match = match[0];
  $scope.tournament = tournament[0].tournament;
  $scope.user = Parse.User;
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  
  if(window.ParsePushPlugin) {
    ParsePushPlugin.on('receivePN', function (pn) {
      if (pn.title) {
        switch (pn.title) {
          case 'match:results':
            $state.go('app.dashboard');
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
              $rootScope.$broadcast('show:loading');
              Parse.Cloud.run('matchResults', {username: username}).then(function (results) {
                $rootScope.$broadcast('hide:loading');
                $state.go('app.dashboard');
              });
            });
          });
        });
      } else {
        showResultsPopup();
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
        match: function (MatchServices, $state, $q) {
          var cb = $q.defer();
          MatchServices.getMatch('active').then(function (matches) {
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
    var player = new Ladder.Model(userData);
    player.set('tournament', tourney);
    player.set('user', user);
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
    getMatch: getMatch,
    getConfirmedMatch: getConfirmedMatch,
    cancelMatch: cancelMatch
  }
  function getConfirmedMatch () {
    var player1 = new Parse.Query('Match');
    player1.equalTo('username1', user.current().username);
    var player2 = new Parse.Query('Match');
    player2.equalTo('username2', user.current().username);

    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.equalTo('status', 'active');
    mainQuery.equalTo('confirm1', true);
    mainQuery.equalTo('confirm2', true);
    return mainQuery.find();
  }
  function getMatch(status) {
    var player1 = new Parse.Query('Match');
    player1.equalTo('username1', user.current().username);
    var player2 = new Parse.Query('Match');
    player2.equalTo('username2', user.current().username);

    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.equalTo('status', status);
    return mainQuery.find();
  }
  function cancelMatch (user, player) {
    var cb = $q.defer();
    var query = new Parse.Query(Match.Model);
    if(player = 'player1') {
      query.equalTo('user1', user);
    } else {
      query.equalTo('user2', user);
    }
    query.equalTo('status', 'pending');
    query.find().then(function (matches) {
      Parse.Object.destroyAll(matches).then(function () {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC52aWV3LmN0cmwuanMiLCJjb250cm9sbGVycy9tZW51LmN0cmwuanMiLCJjb250cm9sbGVycy9yZWdpc3Rlci5jdHJsLmpzIiwicm91dGVzL2FkbWluLnJvdXRlcy5qcyIsInJvdXRlcy9sYWRkZXIucm91dGVzLmpzIiwicm91dGVzL21hdGNoLnJvdXRlcy5qcyIsInNlcnZpY2VzL2xhZGRlci5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL21hdGNoLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuQ0E7QUFDQTtBQUNBO0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNoQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4V0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnT05PRycsIFtcbiAgJ2lvbmljJyxcbiAgJ25nUGFyc2UnLFxuICAnbmdDb3Jkb3ZhJyxcbiAgJ25nQW5pbWF0ZScsXG4gICdPTk9HLkNvbnRyb2xsZXJzJyxcbiAgJ09OT0cuU2VydmljZXMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRpb25pY0NvbmZpZ1Byb3ZpZGVyJywgJyRjb21waWxlUHJvdmlkZXInLCAnUGFyc2VQcm92aWRlcicsIGNvbmZpZ10pO1xuXG5mdW5jdGlvbiBjb25maWcgKCRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyLCBQYXJzZVByb3ZpZGVyKSB7XG5cbiAgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8ZmlsZXxibG9ifGNvbnRlbnR8bXMtYXBweHx4LXdtYXBwMCk6fGRhdGE6aW1hZ2VcXC98aW1nXFwvLyk7XG4gICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGZpbGV8Z2h0dHBzP3xtcy1hcHB4fHgtd21hcHAwKTovKTtcblxuICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJuWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRXCIsIFwienJpbjhHRUJEVkdia2wxaW9HRXduSHVQNzBGZEc2SGh6VFM4dUdqelwiKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsIHJvdXRlc10pO1xuXG5mdW5jdGlvbiByb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdhcHAvZGFzaGJvYXJkJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcykge1xuICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuZ2V0VG91cm5hbWVudCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5kYXNoYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kYXNoYm9hcmQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5yZWdpc3RlcicsIHtcbiAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cblxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uc3RhbnQoXCJtb21lbnRcIiwgbW9tZW50KVxuICAucnVuKFsnJGlvbmljUGxhdGZvcm0nLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnJGlvbmljTG9hZGluZycsIHJ1bl0pXG5cblxuXG5mdW5jdGlvbiBydW4gKCRpb25pY1BsYXRmb3JtLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY0xvYWRpbmcsIHJlc291cmNlU2VydmljZSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG4gICAgJHJvb3RTY29wZS4kb24oJ3Nob3c6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5zaG93KHt0ZW1wbGF0ZTogJzxpb24tc3Bpbm5lciBpY29uPVwic3BpcmFsXCIgY2xhc3M9XCJzcGlubmVyLWNhbG1cIj48L2lvbi1zcGlubmVyPicsIHNob3dCYWNrZHJvcDogdHJ1ZSwgYW5pbWF0aW9uOiAnZmFkZS1pbid9KTtcbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuJG9uKCdoaWRlOmxvYWRpbmcnLCBmdW5jdGlvbigpIHtcbiAgICAgICRpb25pY0xvYWRpbmcuaGlkZSgpO1xuICAgIH0pO1xuXG4gICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbil7XG4gICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICB9XG5cbiAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycsIFtdKTtcblxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluTWF0Y2hlc0N0cmwnLCBBZG1pbk1hdGNoZXNDdHJsKTtcblxuQWRtaW5NYXRjaGVzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFyc2UnXTtcbmZ1bmN0aW9uIEFkbWluTWF0Y2hlc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5QbGF5ZXJzQ3RybCcsIEFkbWluUGxheWVyc0N0cmwpO1xuXG5BZG1pblBsYXllcnNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYXJzZSddO1xuZnVuY3Rpb24gQWRtaW5QbGF5ZXJzQ3RybCgkc2NvcGUsIFBhcnNlKSB7XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblNldHRpbmdzQ3RybCcsIEFkbWluU2V0dGluZ3NDdHJsKTtcblxuQWRtaW5TZXR0aW5nc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1RvdXJuYW1lbnRTZXJ2aWNlcycsICduZXdUb3VybmFtZW50J107XG5cbmZ1bmN0aW9uIEFkbWluU2V0dGluZ3NDdHJsKCRzY29wZSwgVG91cm5hbWVudFNlcnZpY2VzLCBuZXdUb3VybmFtZW50KSB7XG4gICRzY29wZS5kZXRhaWxzID0gbmV3VG91cm5hbWVudDtcbiAgXG4gIC8vIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRMYWRkZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCkudGhlbihmdW5jdGlvbiAobGFkZGVyKSB7XG4gIC8vICAgJHNjb3BlLmxhZGRlciA9IGxhZGRlcjtcbiAgLy8gfSk7XG4gIFxuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignRGFzaGJvYXJkQ3RybCcsXG4gICAgW1xuICAgICAgJyRzY29wZScsICckc3RhdGUnLCAnJGZpbHRlcicsICckdGltZW91dCcsICckaW50ZXJ2YWwnLCAnJGlvbmljUG9wdXAnLCAnJHJvb3RTY29wZScsXG4gICAgICAnUGFyc2UnLCAndG91cm5hbWVudCcsICdNYXRjaFNlcnZpY2VzJywgJ1F1ZXVlU2VydmljZXMnLCAnTGFkZGVyU2VydmljZXMnLFxuICAgICAgRGFzaGJvYXJkQ3RybFxuICAgIF0pO1xuXG5mdW5jdGlvbiBEYXNoYm9hcmRDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGZpbHRlciwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJGlvbmljUG9wdXAsICRyb290U2NvcGUsXG4gIFBhcnNlLCB0b3VybmFtZW50LCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCBMYWRkZXJTZXJ2aWNlcykge1xuXG4gIHZhciBwcm9taXNlID0gbnVsbDtcbiAgJHNjb3BlLmZvdW5kQ291bnQgPSAwO1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUub3Bwb25lbnQgPSBRdWV1ZVNlcnZpY2VzLm9wcG9uZW50O1xuICAkc2NvcGUuaGVyb0xpc3QgPSBRdWV1ZVNlcnZpY2VzLmhlcm9lcztcbiAgJHNjb3BlLm15T3Bwb25lbnQgPSB7bmFtZTonUEFYIEF0dGVuZGVlJ307XG5cbiAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgIFBhcnNlUHVzaFBsdWdpbi5vbigncmVjZWl2ZVBOJywgZnVuY3Rpb24ocG4pe1xuICAgICAgaWYocG4udGl0bGUpIHtcbiAgICAgICAgc3dpdGNoIChwbi50aXRsZSkge1xuICAgICAgICAgIGNhc2UgJ29wcG9uZW50OmZvdW5kJzogb3Bwb25lbnRGb3VuZCgpOyBicmVhaztcbiAgICAgICAgICBjYXNlICdvcHBvbmVudDpjb25maXJtZWQnOiBvcHBvbmVudENvbmZpcm1lZCgpOyBicmVhaztcbiAgICAgICAgICBjYXNlICdtYXRjaDpyZXN1bHRzJzogbWF0Y2hQbGF5ZWQoKTsgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBnZXRDdXJyZW50U3RhdHVzKGZhbHNlKTtcblxuICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgZ2V0Q3VycmVudFN0YXR1cyh0cnVlKTtcbiAgfTtcblxuICAkc2NvcGUuc3RhcnRRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaGVybyA9ICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5oZXJvTGlzdCwge2NoZWNrZWQ6IHRydWV9LCB0cnVlKTtcbiAgICBpZihoZXJvLmxlbmd0aCkge1xuICAgICAgaGVyb1swXS5jaGVja2VkID0gZmFsc2U7XG4gICAgfVxuICAgIGpvaW5RdWV1ZVBvcHVwKCkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICBpZihyZXMpIHtcbiAgICAgICAgJHNjb3BlLm1hdGNobWFraW5nID0gMDtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ2hlcm8nLCByZXMudGV4dCk7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5jYW5jZWxRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAkc2NvcGUucGxheWVyLnVuc2V0KCdoZXJvJyk7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBzYXZlUGxheWVyKCk7XG4gIH07XG5cbiAgJHNjb3BlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHByb21pc2UpO1xuICB9O1xuXG4gICRzY29wZS5zaG93T3Bwb25lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBwcm9taXNlID0gJGludGVydmFsKGZ1bmN0aW9uICgpIHtjaGFuZ2VXb3JkKCl9LCAyMDAwKTtcbiAgfTtcblxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gIH0pO1xuXG5cbiAgZnVuY3Rpb24gc2F2ZVBsYXllciAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgc3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2luUXVldWVQb3B1cCAoKSB7XG4gICAgc3ViKCk7XG4gICAgJHNjb3BlLnNlbGVjdGVkID0ge3N0YXR1czogdHJ1ZX07XG4gICAgJHNjb3BlLnNlbGVjdEhlcm8gPSBmdW5jdGlvbiAoaGVybykge1xuICAgICAgJHNjb3BlLmltYWdlID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZXJvQ2xhc3MnKSlbMF0uY2xpZW50V2lkdGg7XG5cbiAgICAgIGlmKGhlcm8uY2hlY2tlZCkge1xuICAgICAgICBoZXJvLmNoZWNrZWQgPSAhaGVyby5jaGVja2VkO1xuICAgICAgICAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZighaGVyby5jaGVja2VkICYmICRzY29wZS5zZWxlY3RlZC5zdGF0dXMpIHtcbiAgICAgICAgaGVyby5jaGVja2VkID0gIWhlcm8uY2hlY2tlZDtcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcG9wdXBzL3NlbGVjdC5oZXJvLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1NlbGVjdCBIZXJvIENsYXNzJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPlF1ZXVlPC9iPicsXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIHZhciBoZXJvID0gJGZpbHRlcignZmlsdGVyJykoJHNjb3BlLmhlcm9MaXN0LCB7Y2hlY2tlZDogdHJ1ZX0sIHRydWUpO1xuICAgICAgICAgICAgICBpZiAoIWhlcm8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBoZXJvWzBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBzdGF0dXMgKCkge1xuICAgIHN3aXRjaCAoJHNjb3BlLnBsYXllci5zdGF0dXMpIHtcbiAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3F1ZXVlJzpcbiAgICAgICAgJHNjb3BlLnNob3dPcHBvbmVudHMoKTtcbiAgICAgICAgbWF0Y2hNYWtpbmcoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmb3VuZCc6XG4gICAgICAgIHBsYXllckZvdW5kKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29uZmlybWVkJzpcbiAgICAgICAgd2FpdGluZ0Zvck9wcG9uZW50KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnbm9PcHBvbmVudCc6XG4gICAgICAgIG5vT3Bwb25lbnQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwbGF5aW5nJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICBwbGF5ZXJDYW5jZWxsZWQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q3VycmVudFN0YXR1cyhyZWZyZXNoKSB7XG4gICAgdmFyIHJlZnJlc2ggPSByZWZyZXNoO1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcigkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyc1swXTtcbiAgICAgIGlmICgkc2NvcGUucGxheWVyKSB7XG4gICAgICAgIHN0YXR1cygpO1xuICAgICAgfVxuICAgICAgaWYocmVmcmVzaCkge1xuICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbWF0Y2hNYWtpbmcoKSB7XG4gICAgaWYoJHNjb3BlLm1hdGNobWFraW5nIDwgMykge1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBQYXJzZS5DbG91ZC5ydW4oJ21hdGNobWFraW5nJykudGhlbihmdW5jdGlvbiAoc3RhdHVzKSB7XG4gICAgICAgICAgZ2V0Q3VycmVudFN0YXR1cyhmYWxzZSk7XG4gICAgICAgICAgJHNjb3BlLm1hdGNobWFraW5nKys7XG4gICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm1hdGNobWFraW5nKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCAxMDAwMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5jYW5jZWxRdWV1ZSgpO1xuICAgICAgc2hvd0VtcHR5UXVldWUoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzaG93RW1wdHlRdWV1ZSgpIHtcbiAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1BsZWFzZSB0cnkgYWdhaW4nLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5ObyBPcHBvbmVudHMgaGF2ZSBiZWVuIGZvdW5kIGF0IHRoaXMgdGltZS48L2Rpdj4nXG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gb3Bwb25lbnRGb3VuZCgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2ZvdW5kJyk7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxheWVyRm91bmQoKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBpZighJHNjb3BlLmZvdW5kQ291bnQpIHtcbiAgICAgIHZhciBvcHBvbmVudEZvdW5kID0gJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICAgIHRpdGxlOiAnTWF0Y2htYWtpbmcnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+QSBXb3J0aHkgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGhhcyBiZWVuIGZvdW5kITwvZGl2PicsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiAnPGI+Q2FuY2VsPC9iPicsXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uLWFzc2VydGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLmZvdW5kQ291bnQrKztcbiAgICB9XG5cbiAgICBvcHBvbmVudEZvdW5kLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZihyZXMpIHtcbiAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRNYXRjaCgncGVuZGluZycpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdjb25maXJtZWQnKTtcbiAgICAgICAgICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICAgICAgICAgbWF0Y2hlc1swXS5zZXQoJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBtYXRjaGVzWzBdLnNldCgnY29uZmlybTInLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hdGNoZXNbMF0uc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAkc2NvcGUuZm91bmRDb3VudCA9IDA7XG4gICAgICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUuZm91bmRDb3VudCA9IDA7XG4gICAgICAgIHBsYXllckNhbmNlbGxlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpICE9PSAnY29uZmlybWVkJykge1xuICAgICAgICBwbGF5ZXJGb3VuZC5jbG9zZShmYWxzZSk7XG4gICAgICB9XG4gICAgfSwgNjAwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxheWVyQ2FuY2VsbGVkKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIuZ2V0KCdjYW5jZWxUaW1lcicpKSB7XG4gICAgICBpZihtb21lbnQoJHNjb3BlLnBsYXllci5nZXQoJ2NhbmNlbFRpbWVyJykpLmlzQWZ0ZXIoKSkge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgJHNjb3BlLnBsYXllci51bnNldCgnY2FuY2VsVGltZXInKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3RhcnRUaW1lcigpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgdGltZSA9IG1vbWVudCgpLmFkZCgnMicsICdtaW51dGVzJykuZm9ybWF0KCk7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NhbmNlbGxlZCcpO1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ2NhbmNlbFRpbWVyJywgdGltZSk7XG4gICAgICBzYXZlUGxheWVyKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRUaW1lcigpIHtcbiAgICAvL1RPRE8gZG8gdGltZXJcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wcG9uZW50Q29uZmlybWVkICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3BsYXlpbmcnKTtcbiAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICRzdGF0ZS5nbygnYXBwLm1hdGNoLnZpZXcnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhaXRpbmdGb3JPcHBvbmVudCAoKSB7XG4gICAgUGFyc2UuQ2xvdWQucnVuKCdjb25maXJtTWF0Y2gnKS50aGVuKGZ1bmN0aW9uIChudW0pIHtcbiAgICAgIE1hdGNoU2VydmljZXMuZ2V0Q29uZmlybWVkTWF0Y2goKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgIGlmIChtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncGxheWluZycpO1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2hvdzpsb2FkaW5nJyk7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC52aWV3Jyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgaWYoIW51bSkge1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpID09PSAnY29uZmlybWVkJykge1xuICAgICAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRDb25maXJtZWRNYXRjaCgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgaWYoIW1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdub09wcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncGxheWluZycpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sIDYwMDAwKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBmdW5jdGlvbiBtYXRjaFBsYXllZCgpIHtcbiAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ01hdGNoIFJlc3VsdHMgRW50ZXJlZCcsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdXIgT3Bwb25lbnQgaGFzIGVudGVyZWQgdGhlIHJlc3VsdHMhPC9kaXY+J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBzdGF0dXMoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9PcHBvbmVudCAoKSB7XG4gICAgJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICB0aXRsZTogJ01hdGNoIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+PHN0cm9uZz5Zb3VyIE9wcG9uZW50PC9zdHJvbmc+PGJyPiBmYWlsZWQgdG8gY29uZmlybSE8L2Rpdj4nLFxuICAgICAgYnV0dG9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPkJhY2s8L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLWFzc2VydGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+UXVldWUgQWdhaW48L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICAgIE1hdGNoU2VydmljZXMuY2FuY2VsTWF0Y2goJHNjb3BlLnVzZXIuY3VycmVudCgpLCAkc2NvcGUucGxheWVyLnBsYXllcikudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdWIgKCkge1xuICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4pIHtcbiAgICAgIFBhcnNlUHVzaFBsdWdpbi5zdWJzY3JpYmUoJHNjb3BlLnBsYXllci51c2VybmFtZSwgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzdWJiZWQnKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCB0byBzdWInKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5nZVdvcmQgKCkge1xuICAgICRzY29wZS5teU9wcG9uZW50Lm5hbWUgPSAkc2NvcGUub3Bwb25lbnQubGlzdFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqJHNjb3BlLm9wcG9uZW50Lmxpc3QubGVuZ3RoKV07XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xhZGRlckpvaW5DdHJsJywgWyckc2NvcGUnLCAnJGZpbHRlcicsICckaW9uaWNQb3B1cCcsICckc3RhdGUnLCAnJGlvbmljSGlzdG9yeScsICckcScsICdQYXJzZScsICd0b3VybmFtZW50JywgJ0xhZGRlclNlcnZpY2VzJywgTGFkZGVySm9pbkN0cmxdKTtcblxuZnVuY3Rpb24gTGFkZGVySm9pbkN0cmxcbigkc2NvcGUsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksICRxLCBQYXJzZSwgIHRvdXJuYW1lbnQsIExhZGRlclNlcnZpY2VzKSB7XG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG4gICRzY29wZS5wbGF5ZXIgPSB7XG4gICAgYmF0dGxlVGFnOiAnJ1xuICB9O1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIudXNlcm5hbWUgPSAkc2NvcGUudXNlci51c2VybmFtZTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zdGF0dXMgPSAnb3Blbic7XG4gICAgICAgIExhZGRlclNlcnZpY2VzLmpvaW5Ub3VybmFtZW50KCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlciwgJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgU3VjY2Vzc1BvcHVwKHBsYXllcikudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvcik7XG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZUJhdHRsZVRhZyAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdGFnID0gJHNjb3BlLnBsYXllci5iYXR0bGVUYWc7XG5cbiAgICBpZih0YWcubGVuZ3RoIDwgOCkge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgYmF0dGxlIHRhZycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBzcGxpdCA9IHRhZy5zcGxpdCgnIycpO1xuICAgIGlmKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgQkFUVExFVEFH4oSiIGluY2x1ZGluZyAjIGFuZCBmb3VyIGRpZ2l0cycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKHNwbGl0WzFdLmxlbmd0aCA8IDIgfHwgc3BsaXRbMV0ubGVuZ3RoID4gNCkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyB1cCB0byBmb3VyIGRpZ2l0cyBhZnRlciAjIScpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKGlzTmFOKHNwbGl0WzFdKSkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyBmb3VyIGRpZ2l0cyBhZnRlciAjJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMudmFsaWRhdGVQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCwgdGFnKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICBpZihyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBjYi5yZWplY3QoJ1RoZSBCQVRUTEVUQUfihKIgeW91IGVudGVyZWQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYi5yZXNvbHZlKHRhZyk7XG4gICAgICB9IFxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgc2lnbmVkIHVwISBOb3cgZ28gZmluZCBhIHZhbGlhbnQgb3Bwb25lbnQuJ1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMZWFkZXJCb2FyZHNDdHJsJywgTGVhZGVyQm9hcmRzQ3RybCk7XG5cbkxlYWRlckJvYXJkc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ0xhZGRlclNlcnZpY2VzJywgJ3RvdXJuYW1lbnQnLCAnUGFyc2UnLCAnJGZpbHRlcicsICckaW9uaWNQb3B1cCddO1xuZnVuY3Rpb24gTGVhZGVyQm9hcmRzQ3RybCgkc2NvcGUsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50LCBQYXJzZSwgJGZpbHRlciwgJGlvbmljUG9wdXApIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXJzKHRvdXJuYW1lbnRbMF0udG91cm5hbWVudCkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgIHZhciByYW5rID0gMTtcbiAgICBhbmd1bGFyLmZvckVhY2gocGxheWVycywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgcGxheWVyLnJhbmsgPSByYW5rO1xuICAgICAgcmFuaysrO1xuICAgIH0pO1xuICAgICRzY29wZS5wbGF5ZXJzID0gcGxheWVycztcbiAgfSk7XG5cbiAgJHNjb3BlLnNob3dEZXRhaWxzID0gZnVuY3Rpb24gKHBsYXllcikge1xuICAgICRzY29wZS5oZXJvZXMgPSBwbGF5ZXIuaGVyb2VzO1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiBwbGF5ZXIudXNlcm5hbWUgKyAnIEhlcm9lcycsXG4gICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgdGVtcGxhdGU6XG4gICAgICAgICc8ZGl2IGNsYXNzPVwicm93XCI+JyArXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiY29sLTI1IHRleHQtY2VudGVyXCIgbmctcmVwZWF0PVwiaGVybyBpbiBoZXJvZXNcIj4nICtcbiAgICAgICAgJzxpbWcgbmctc3JjPVwiaW1nL2ljb25zL3t7aGVyb319LnBuZ1wiIGNsYXNzPVwicmVzcG9uc2l2ZS1pbWdcIiBzdHlsZT1cInBhZGRpbmc6M3B4O1wiPnt7aGVyb319JyArXG4gICAgICAgICc8L2Rpdj4nICtcbiAgICAgICAgJzwvZGl2PidcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuTG9naW5DdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljSGlzdG9yeSddO1xuZnVuY3Rpb24gTG9naW5DdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljSGlzdG9yeSkge1xuICAkc2NvcGUudXNlciA9IHt9O1xuICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24gKCkge1xuICAgIFBhcnNlLlVzZXIubG9nSW4oJHNjb3BlLnVzZXIudXNlcm5hbWUsICRzY29wZS51c2VyLnBhc3N3b3JkLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uICh1c2VyLCBlcnJvcikge1xuICAgICAgICAkc2NvcGUud2FybmluZyA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTWF0Y2hWaWV3Q3RybCcsIE1hdGNoVmlld0N0cmwpO1xuXG5NYXRjaFZpZXdDdHJsLiRpbmplY3QgPSBbXG4gICckc2NvcGUnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnJGlvbmljUG9wdXAnLCAnJGlvbmljSGlzdG9yeScsICdQYXJzZScsICdMYWRkZXJTZXJ2aWNlcycsICdNYXRjaFNlcnZpY2VzJywgJ1F1ZXVlU2VydmljZXMnLCAndG91cm5hbWVudCcsICdtYXRjaCdcbl07XG5mdW5jdGlvbiBNYXRjaFZpZXdDdHJsKCRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCwgJGlvbmljSGlzdG9yeSwgUGFyc2UsIExhZGRlclNlcnZpY2VzLCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCB0b3VybmFtZW50LCBtYXRjaCkge1xuICAkc2NvcGUubWF0Y2ggPSBtYXRjaFswXTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICBcbiAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgIFBhcnNlUHVzaFBsdWdpbi5vbigncmVjZWl2ZVBOJywgZnVuY3Rpb24gKHBuKSB7XG4gICAgICBpZiAocG4udGl0bGUpIHtcbiAgICAgICAgc3dpdGNoIChwbi50aXRsZSkge1xuICAgICAgICAgIGNhc2UgJ21hdGNoOnJlc3VsdHMnOlxuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlci5jdXJyZW50KCkpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAkc2NvcGUucGxheWVyID0gcGxheWVyc1swXTtcbiAgICBpZiAoJHNjb3BlLnBsYXllcikge1xuICAgICAgZ2V0TWF0Y2hEZXRhaWxzKCk7XG4gICAgfVxuICB9KTtcblxuICAkc2NvcGUucmVjb3JkID0gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJ2FjdGl2ZScpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IG51bGw7XG4gICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICBzd2l0Y2ggKHJlY29yZCkge1xuICAgICAgICAgIGNhc2UgJ3dpbic6XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS51c2VyLmN1cnJlbnQoKSk7XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgdXNlcm5hbWUgPSAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWVcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2xvc3MnOlxuICAgICAgICAgICAgbWF0Y2guc2V0KCd3aW5uZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLnVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLnVzZXIuY3VycmVudCgpLnVzZXJuYW1lXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBtYXRjaC5zZXQoJ3N0YXR1cycsICdjb21wbGV0ZWQnKTtcbiAgICAgICAgbWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgICB0aXRsZTogJ01hdGNoIFN1Ym1pdHRlZCcsXG4gICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+VGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHJlc3VsdHM8L2Rpdj4nXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzaG93OmxvYWRpbmcnKTtcbiAgICAgICAgICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaFJlc3VsdHMnLCB7dXNlcm5hbWU6IHVzZXJuYW1lfSkudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2hvd1Jlc3VsdHNQb3B1cCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldE1hdGNoRGV0YWlscygpIHtcbiAgICAkc2NvcGUub3Bwb25lbnQgPSB7XG4gICAgICBoZXJvOiBudWxsLFxuICAgICAgYmF0dGxlVGFnOiBudWxsXG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8yO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnVzZXIyO1xuICAgIH1cbiAgICBpZigkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjInKSB7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuaGVybyA9ICRzY29wZS5tYXRjaC5oZXJvMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VybmFtZSA9ICRzY29wZS5tYXRjaC51c2VybmFtZTE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuYmF0dGxlVGFnID0gJHNjb3BlLm1hdGNoLmJhdHRsZVRhZzE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlciA9ICRzY29wZS5tYXRjaC51c2VyMTtcbiAgICB9XG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdNZW51Q3RybCcsIE1lbnVDdHJsKTtcblxuTWVudUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywnJGlvbmljUG9wb3ZlcicsICckc3RhdGUnLCAnJGlvbmljSGlzdG9yeScsICdQYXJzZScsICckdGltZW91dCddO1xuZnVuY3Rpb24gTWVudUN0cmwoJHNjb3BlLCAkaW9uaWNQb3BvdmVyLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlLCAkdGltZW91dCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJGlvbmljUG9wb3Zlci5mcm9tVGVtcGxhdGVVcmwoJ3RlbXBsYXRlcy9wb3BvdmVycy9wcm9maWxlLnBvcC5odG1sJywge1xuICAgIHNjb3BlOiAkc2NvcGUsXG4gIH0pLnRoZW4oZnVuY3Rpb24ocG9wb3Zlcikge1xuICAgICRzY29wZS5wb3BvdmVyID0gcG9wb3ZlcjtcbiAgfSk7XG5cbiAgJHNjb3BlLm1lbnUgPSBmdW5jdGlvbiAobGluaykge1xuICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgfSk7XG4gICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAkc2NvcGUucG9wb3Zlci5oaWRlKCk7XG4gIH1cbiAgLy9DbGVhbnVwIHRoZSBwb3BvdmVyIHdoZW4gd2UncmUgZG9uZSB3aXRoIGl0IVxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wb3BvdmVyLnJlbW92ZSgpO1xuICB9KTtcblxuICAkc2NvcGUuJG9uKCckaW9uaWNWaWV3LmxvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGlvbmljLlBsYXRmb3JtLnJlYWR5KCBmdW5jdGlvbigpIHtcbiAgICAgIGlmKG5hdmlnYXRvciAmJiBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG4gICAgICAgIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBSZWdpc3RlckN0cmwpO1xuXG5SZWdpc3RlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNQb3B1cCddO1xuZnVuY3Rpb24gUmVnaXN0ZXJDdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljUG9wdXApIHtcblxuICAkc2NvcGUudXNlciA9IHt9O1xuXG4gICRzY29wZS5SZWdpc3RlclVzZXIgPSBmdW5jdGlvbiAodXNlcikge1xuICAgIHZhciByZWdpc3RlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgcmVnaXN0ZXIuc2V0KHVzZXIpO1xuICAgIHJlZ2lzdGVyLnNpZ25VcChudWxsLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuICAgICAgICAvLyBTaG93IHRoZSBlcnJvciBtZXNzYWdlIHNvbWV3aGVyZSBhbmQgbGV0IHRoZSB1c2VyIHRyeSBhZ2Fpbi5cbiAgICAgICAgRXJyb3JQb3B1cChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndXNlcicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcbiAgICAkc2NvcGUud2FybmluZyA9IG51bGw7XG4gIH0sIHRydWUpO1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBBZG1pblJvdXRlc10pO1xuXG5mdW5jdGlvbiBBZG1pblJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmFkbWluJywge1xuICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5zZXR0aW5ncycsIHtcbiAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5zZXR0aW5ncy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pblNldHRpbmdzQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuZXk6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV3VG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgdG91cm5leSkge1xuICAgICAgICAgIGlmKHRvdXJuZXkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdG91cm5leVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5jcmVhdGVUb3VybmFtZW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5tYXRjaGVzJywge1xuICAgICAgdXJsOiAnL21hdGNoZXMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4ubWF0Y2hlcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbk1hdGNoZXNDdHJsJ1xuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIExhZGRlclJvdXRlc10pO1xuXG5mdW5jdGlvbiBMYWRkZXJSb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXInLCB7XG4gICAgICB1cmw6ICcvbGFkZGVyJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sYWRkZXIuaHRtbCcsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5sZWFkZXJib2FyZCcsIHtcbiAgICAgIHVybDogJy9sZWFkZXJib2FyZHMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2xlYWRlcmJvYXJkLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xlYWRlckJvYXJkc0N0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIuam9pbicsIHtcbiAgICAgIHVybDogJy9qb2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9qb2luLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xhZGRlckpvaW5DdHJsJ1xuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIE1hdGNoUm91dGVzXSk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gudmlldycsIHtcbiAgICAgIHVybDogJy92aWV3JyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLnZpZXcuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hWaWV3Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlLCAkcSkge1xuICAgICAgICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRNYXRjaCgnYWN0aXZlJykudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgICAgaWYoIW1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNiLnJlamVjdCgpO1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNiLnJlc29sdmUobWF0Y2hlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ0xhZGRlclNlcnZpY2VzJywgWydQYXJzZScsICdMYWRkZXInLCBMYWRkZXJTZXJ2aWNlc10pXG4gIC5mYWN0b3J5KCdMYWRkZXInLCBbJ1BhcnNlJywgTGFkZGVyXSlcblxuZnVuY3Rpb24gTGFkZGVyU2VydmljZXMoUGFyc2UsIExhZGRlcikge1xuICByZXR1cm4ge1xuICAgIGdldFBsYXllcnM6IGdldFBsYXllcnMsXG4gICAgZ2V0UGxheWVyOiBnZXRQbGF5ZXIsXG4gICAgdmFsaWRhdGVQbGF5ZXI6IHZhbGlkYXRlUGxheWVyLFxuICAgIGpvaW5Ub3VybmFtZW50OiBqb2luVG91cm5hbWVudCxcbiAgICBnZXRQZW5kaW5nUGxheWVyczogZ2V0UGVuZGluZ1BsYXllcnNcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQZW5kaW5nUGxheWVycyh0b3VybmFtZW50LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5Lm5vdEVxdWFsVE8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcnModG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKCdwb2ludHMnLCAnbW1yJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZVBsYXllcih0b3VybmV5LCBiYXR0bGVUYWcpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygnYmF0dGxlVGFnJywgYmF0dGxlVGFnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcih0b3VybmV5LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgdXNlciwgdXNlckRhdGEpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbCh1c2VyRGF0YSk7XG4gICAgcGxheWVyLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXInLCB1c2VyKTtcbiAgICByZXR1cm4gcGxheWVyLnNhdmUoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gTGFkZGVyKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0xhZGRlcicpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsndG91cm5hbWVudCcsICd1c2VyJywgJ2JhdHRsZVRhZycsICd1c2VybmFtZScsICdoZXJvJywgJ3BsYXllcicsICdzdGF0dXMnLCAnY2FuY2VsVGltZXInLCAnd2lucycsICdsb3NzZXMnLCAnbW1yJywgJ3BvaW50cyddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59O1xuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdNYXRjaFNlcnZpY2VzJywgWydQYXJzZScsICdNYXRjaCcsICckcScsIE1hdGNoU2VydmljZXNdKVxuICAuZmFjdG9yeSgnTWF0Y2gnLCBbJ1BhcnNlJywgTWF0Y2hdKTtcblxuZnVuY3Rpb24gTWF0Y2hTZXJ2aWNlcyhQYXJzZSwgTWF0Y2gsICRxKSB7XG4gIHZhciB1c2VyID0gUGFyc2UuVXNlcjtcbiAgcmV0dXJuIHtcbiAgICBnZXRNYXRjaDogZ2V0TWF0Y2gsXG4gICAgZ2V0Q29uZmlybWVkTWF0Y2g6IGdldENvbmZpcm1lZE1hdGNoLFxuICAgIGNhbmNlbE1hdGNoOiBjYW5jZWxNYXRjaFxuICB9XG4gIGZ1bmN0aW9uIGdldENvbmZpcm1lZE1hdGNoICgpIHtcbiAgICB2YXIgcGxheWVyMSA9IG5ldyBQYXJzZS5RdWVyeSgnTWF0Y2gnKTtcbiAgICBwbGF5ZXIxLmVxdWFsVG8oJ3VzZXJuYW1lMScsIHVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICB2YXIgcGxheWVyMiA9IG5ldyBQYXJzZS5RdWVyeSgnTWF0Y2gnKTtcbiAgICBwbGF5ZXIyLmVxdWFsVG8oJ3VzZXJuYW1lMicsIHVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcblxuICAgIHZhciBtYWluUXVlcnkgPSBQYXJzZS5RdWVyeS5vcihwbGF5ZXIxLCBwbGF5ZXIyKTtcbiAgICBtYWluUXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ2FjdGl2ZScpO1xuICAgIG1haW5RdWVyeS5lcXVhbFRvKCdjb25maXJtMScsIHRydWUpO1xuICAgIG1haW5RdWVyeS5lcXVhbFRvKCdjb25maXJtMicsIHRydWUpO1xuICAgIHJldHVybiBtYWluUXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE1hdGNoKHN0YXR1cykge1xuICAgIHZhciBwbGF5ZXIxID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHBsYXllcjEuZXF1YWxUbygndXNlcm5hbWUxJywgdXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuICAgIHZhciBwbGF5ZXIyID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHBsYXllcjIuZXF1YWxUbygndXNlcm5hbWUyJywgdXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuXG4gICAgdmFyIG1haW5RdWVyeSA9IFBhcnNlLlF1ZXJ5Lm9yKHBsYXllcjEsIHBsYXllcjIpO1xuICAgIG1haW5RdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCBzdGF0dXMpO1xuICAgIHJldHVybiBtYWluUXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGNhbmNlbE1hdGNoICh1c2VyLCBwbGF5ZXIpIHtcbiAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgaWYocGxheWVyID0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCd1c2VyMScsIHVzZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCd1c2VyMicsIHVzZXIpO1xuICAgIH1cbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncGVuZGluZycpO1xuICAgIHF1ZXJ5LmZpbmQoKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICBQYXJzZS5PYmplY3QuZGVzdHJveUFsbChtYXRjaGVzKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0cnVlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuXG4gIH1cbn1cblxuZnVuY3Rpb24gTWF0Y2goUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTWF0Y2gnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbXG4gICAgJ3RvdXJuYW1lbnQnLCAncGxheWVyMScsICdwbGF5ZXIyJywgJ2hlcm8xJywgJ2hlcm8yJywgJ3VzZXJuYW1lMScsICd1c2VybmFtZTInLCAnYmF0dGxlVGFnMScsICdiYXR0bGVUYWcyJywgJ3N0YXR1cycsICd3aW5uZXInLCAnbG9zZXInLFxuICAgICdzY3JlZW5zaG90JywgJ3JlcG9ydCcsICdyZXBvcnRlZFNjcmVlbnNob3QnLCAnYWN0aXZlRGF0ZScsICd1c2VyMScsICd1c2VyMidcbiAgXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdRdWV1ZVNlcnZpY2VzJyxbUXVldWVTZXJ2aWNlc10pXG5cbmZ1bmN0aW9uIFF1ZXVlU2VydmljZXMoKSB7XG4gIHZhciBvcHBvbmVudCA9IHtcbiAgICBsaXN0OiBbJ0Vhc3kgUGlja2luZ3MnLCAnWW91ciBXb3JzdCBOaWdodG1hcmUnLCAnV29ybGQgY2xhc3MgcGFzdGUgZWF0ZXInLFxuICAgICAgJ0EgTXVybG9jJywgJ0dvdXJkIGNyaXRpYycsICdOb3NlIGFuZCBtb3V0aCBicmVhdGhlcicsICdIb2dnZXInLCAnQSBjYXJkaXNoIElhbicsXG4gICAgICAnTW9wZXkgTWFnZScsICdXb21iYXQgV2FybG9jaycsICdSb3VnZWQgdXAgUm9ndWUnLCAnV2FpZmlzaCBXYXJyaW9yJywgJ0RhbXAgRHJ1aWQnLFxuICAgICAgJ1NoYWJieSBTaGFtYW4nLCAnUGVubmlsZXNzIFBhbGFkaW4nLCAnSHVmZnkgSHVudGVyJywgJ1Blcmt5IFByaWVzdCcsICdUaGUgV29yc3QgUGxheWVyJyxcbiAgICAgICdZb3VyIE9sZCBSb29tbWF0ZScsICdTdGFyQ3JhZnQgUHJvJywgJ0Zpc2NhbGx5IHJlc3BvbnNpYmxlIG1pbWUnLCAnWW91ciBHdWlsZCBMZWFkZXInLFxuICAgICAgJ05vbmVjayBHZW9yZ2UnLCAnR3VtIFB1c2hlcicsICdDaGVhdGVyIE1jQ2hlYXRlcnNvbicsICdSZWFsbHkgc2xvdyBndXknLCAnUm9hY2ggQm95JyxcbiAgICAgICdPcmFuZ2UgUmh5bWVyJywgJ0NvZmZlZSBBZGRpY3QnLCAnSW53YXJkIFRhbGtlcicsICdCbGl6emFyZCBEZXZlbG9wZXInLCAnR3JhbmQgTWFzdGVyJyxcbiAgICAgICdEaWFtb25kIExlYWd1ZSBQbGF5ZXInLCAnQnJhbmQgTmV3IFBsYXllcicsICdEYXN0YXJkbHkgRGVhdGggS25pZ2h0JywgJ01lZGlvY3JlIE1vbmsnLFxuICAgICAgJ0EgTGl0dGxlIFB1cHB5J1xuICAgIF1cbiAgfTtcbiAgdmFyIGhlcm9lcyA9IFtcbiAgICB7dGV4dDogJ21hZ2UnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdodW50ZXInLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwYWxhZGluJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnd2FycmlvcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2RydWlkJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnd2FybG9jaycsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3NoYW1hbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3ByaWVzdCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3JvZ3VlJywgY2hlY2tlZDogZmFsc2V9XG4gIF1cbiAgcmV0dXJuIHtcbiAgICBvcHBvbmVudDogb3Bwb25lbnQsXG4gICAgaGVyb2VzOiBoZXJvZXNcbiAgfVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1RvdXJuYW1lbnRTZXJ2aWNlcycsIFsnUGFyc2UnLCAnJHEnLCAnVG91cm5hbWVudCcsICdEZXRhaWxzJywgJ0xhZGRlcicsIFRvdXJuYW1lbnRTZXJ2aWNlc10pXG5cbiAgLmZhY3RvcnkoJ1RvdXJuYW1lbnQnLCBbJ1BhcnNlJywgVG91cm5hbWVudF0pXG4gIC5mYWN0b3J5KCdEZXRhaWxzJywgWydQYXJzZScsIERldGFpbHNdKTtcblxuZnVuY3Rpb24gVG91cm5hbWVudFNlcnZpY2VzKFBhcnNlLCAkcSwgVG91cm5hbWVudCwgRGV0YWlscywgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0VG91cm5hbWVudDogZ2V0VG91cm5hbWVudCxcbiAgICBjcmVhdGVUb3VybmFtZW50OiBjcmVhdGVUb3VybmFtZW50LFxuICAgIGdldExhZGRlcjogZ2V0TGFkZGVyLFxuICAgIGpvaW5Ub3VybmFtZW50OiBqb2luVG91cm5hbWVudFxuICB9XG4gIGZ1bmN0aW9uIGpvaW5Ub3VybmFtZW50KHRvdXJuZXksIHBsYXllcikge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKHBsYXllcik7XG4gICAgcGxheWVyLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXInLCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgcGxheWVyLnNldCgndXNlcm5hbWUnLCBQYXJzZS5Vc2VyLmN1cnJlbnQoKS51c2VybmFtZSk7XG4gICAgcGxheWVyLnNldCgnbW1yJywgMTAwMCk7XG4gICAgcGxheWVyLnNldCgnd2lucycsIDApO1xuICAgIHBsYXllci5zZXQoJ2xvc3NlcycsIDApO1xuICAgIHBsYXllci5zZXQoJ3BvaW50cycsIDApO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFRvdXJuYW1lbnQoKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KERldGFpbHMuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3R5cGUnLCAnbGFkZGVyJyk7XG4gICAgcXVlcnkuaW5jbHVkZSgndG91cm5hbWVudCcpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlVG91cm5hbWVudCAoKSB7XG4gICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdG91cm5hbWVudCA9IG5ldyBUb3VybmFtZW50Lk1vZGVsKCk7XG4gICAgdG91cm5hbWVudC5zZXQoJ25hbWUnLCAnT05PRyBPUEVOJyk7XG4gICAgdG91cm5hbWVudC5zZXQoJ3N0YXR1cycsICdwZW5kaW5nJyk7XG4gICAgdG91cm5hbWVudC5zZXQoJ2dhbWUnLCAnaGVhcnRoc3RvbmUnKTtcbiAgICB0b3VybmFtZW50LnNhdmUoKS50aGVuKGZ1bmN0aW9uICh0b3VybmV5KSB7XG4gICAgICB2YXIgZGV0YWlscyA9IG5ldyBEZXRhaWxzLk1vZGVsKCk7XG4gICAgICBkZXRhaWxzLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgICAgZGV0YWlscy5zZXQoJ3R5cGUnLCAnbGFkZGVyJyk7XG4gICAgICBkZXRhaWxzLnNldCgncGxheWVyQ291bnQnLCAwKTtcbiAgICAgIGRldGFpbHMuc2V0KCdudW1PZkdhbWVzJywgNSk7XG4gICAgICBkZXRhaWxzLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChkZXRhaWxzKSB7XG4gICAgICAgIGRlZmVyLnJlc29sdmUoZGV0YWlscyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgfVxuICBmdW5jdGlvbiBnZXRMYWRkZXIgKHRvdXJuZXkpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuaW5jbHVkZSgncGxheWVyJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBUb3VybmFtZW50KFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ1RvdXJuYW1lbnQnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ25hbWUnLCAnZ2FtZScsICdzdGF0dXMnLCAnZGlzYWJsZWQnLCAnZGlzYWJsZWRSZWFzb24nXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuZnVuY3Rpb24gRGV0YWlscyhQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdEZXRhaWxzJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3R5cGUnLCAnbnVtT2ZHYW1lcycsICdwbGF5ZXJDb3VudCddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
