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
  .run(['$ionicPlatform', '$state', run]);

function run ($ionicPlatform, $state) {
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

    if(window.ParsePushPlugin){
      ParsePushPlugin.on('receivePN', function(pn){
        if(pn.title) {
          switch (pn.title) {
            case 'matchmaking': $state.go('app.dashboard'); break;
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
  .factory('Ladder', ['Parse', Ladder]);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC52aWV3LmN0cmwuanMiLCJjb250cm9sbGVycy9tZW51LmN0cmwuanMiLCJjb250cm9sbGVycy9yZWdpc3Rlci5jdHJsLmpzIiwicm91dGVzL2FkbWluLnJvdXRlcy5qcyIsInJvdXRlcy9sYWRkZXIucm91dGVzLmpzIiwicm91dGVzL21hdGNoLnJvdXRlcy5qcyIsInNlcnZpY2VzL2xhZGRlci5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL21hdGNoLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOVRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ09OT0cnLCBbXG4gICdpb25pYycsXG4gICduZ1BhcnNlJyxcbiAgJ25nQ29yZG92YScsXG4gICduZ0FuaW1hdGUnLFxuICAnT05PRy5Db250cm9sbGVycycsXG4gICdPTk9HLlNlcnZpY2VzJ1xuXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckaW9uaWNDb25maWdQcm92aWRlcicsICckY29tcGlsZVByb3ZpZGVyJywgJ1BhcnNlUHJvdmlkZXInLCBjb25maWddKTtcblxuZnVuY3Rpb24gY29uZmlnICgkaW9uaWNDb25maWdQcm92aWRlciwgJGNvbXBpbGVQcm92aWRlciwgUGFyc2VQcm92aWRlcikge1xuXG4gICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8YmxvYnxjb250ZW50fG1zLWFwcHh8eC13bWFwcDApOnxkYXRhOmltYWdlXFwvfGltZ1xcLy8pO1xuICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xmaWxlfGdodHRwcz98bXMtYXBweHx4LXdtYXBwMCk6Lyk7XG5cbiAgUGFyc2VQcm92aWRlci5pbml0aWFsaXplKFwibllzQjZ0bUJNWUtZTXpNNWlWOUJVY0J2SFdYODlJdFBYNUdmYk42UVwiLCBcInpyaW44R0VCRFZHYmtsMWlvR0V3bkh1UDcwRmRHNkhoelRTOHVHanpcIik7XG5cbiAgaWYgKGlvbmljLlBsYXRmb3JtLmlzSU9TKCkpIHtcbiAgICAkaW9uaWNDb25maWdQcm92aWRlci5zY3JvbGxpbmcuanNTY3JvbGxpbmcodHJ1ZSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJywgW10pO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInLCByb3V0ZXNdKTtcblxuZnVuY3Rpb24gcm91dGVzICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnYXBwL2Rhc2hib2FyZCcpO1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICB1cmw6ICcvYXBwJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWVudS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNZW51Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuZGFzaGJvYXJkJywge1xuICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAucmVnaXN0ZXInLCB7XG4gICAgICB1cmw6ICcvcmVnaXN0ZXInLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3JlZ2lzdGVyLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG5cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbnN0YW50KFwibW9tZW50XCIsIG1vbWVudClcbiAgLnJ1bihbJyRpb25pY1BsYXRmb3JtJywgJyRzdGF0ZScsIHJ1bl0pO1xuXG5mdW5jdGlvbiBydW4gKCRpb25pY1BsYXRmb3JtLCAkc3RhdGUpIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblxuICAgICAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMgbGluZSB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UgYXJlIGRvaW5nLiBJdCBzdG9wcyB0aGUgdmlld3BvcnRcbiAgICAgIC8vIGZyb20gc25hcHBpbmcgd2hlbiB0ZXh0IGlucHV0cyBhcmUgZm9jdXNlZC4gSW9uaWMgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yXG4gICAgICAvLyBhIG11Y2ggbmljZXIga2V5Ym9hcmQgZXhwZXJpZW5jZS5cbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuICAgIH1cbiAgICBpZih3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbil7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTicsIGZ1bmN0aW9uKHBuKXtcbiAgICAgICAgaWYocG4udGl0bGUpIHtcbiAgICAgICAgICBzd2l0Y2ggKHBuLnRpdGxlKSB7XG4gICAgICAgICAgICBjYXNlICdtYXRjaG1ha2luZyc6ICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpOyBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycsIFtdKTtcblxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluTWF0Y2hlc0N0cmwnLCBBZG1pbk1hdGNoZXNDdHJsKTtcblxuQWRtaW5NYXRjaGVzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFyc2UnXTtcbmZ1bmN0aW9uIEFkbWluTWF0Y2hlc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5QbGF5ZXJzQ3RybCcsIEFkbWluUGxheWVyc0N0cmwpO1xuXG5BZG1pblBsYXllcnNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYXJzZSddO1xuZnVuY3Rpb24gQWRtaW5QbGF5ZXJzQ3RybCgkc2NvcGUsIFBhcnNlKSB7XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblNldHRpbmdzQ3RybCcsIEFkbWluU2V0dGluZ3NDdHJsKTtcblxuQWRtaW5TZXR0aW5nc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1RvdXJuYW1lbnRTZXJ2aWNlcycsICduZXdUb3VybmFtZW50J107XG5cbmZ1bmN0aW9uIEFkbWluU2V0dGluZ3NDdHJsKCRzY29wZSwgVG91cm5hbWVudFNlcnZpY2VzLCBuZXdUb3VybmFtZW50KSB7XG4gICRzY29wZS5kZXRhaWxzID0gbmV3VG91cm5hbWVudDtcbiAgXG4gIC8vIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRMYWRkZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCkudGhlbihmdW5jdGlvbiAobGFkZGVyKSB7XG4gIC8vICAgJHNjb3BlLmxhZGRlciA9IGxhZGRlcjtcbiAgLy8gfSk7XG4gIFxuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignRGFzaGJvYXJkQ3RybCcsXG4gICAgW1xuICAgICAgJyRzY29wZScsICckc3RhdGUnLCAnJGZpbHRlcicsICckdGltZW91dCcsICckaW50ZXJ2YWwnLCAnJGlvbmljUG9wdXAnLFxuICAgICAgJ1BhcnNlJywgJ3RvdXJuYW1lbnQnLCAnTWF0Y2hTZXJ2aWNlcycsICdRdWV1ZVNlcnZpY2VzJywgJ0xhZGRlclNlcnZpY2VzJyxcbiAgICAgIERhc2hib2FyZEN0cmxcbiAgICBdKTtcblxuZnVuY3Rpb24gRGFzaGJvYXJkQ3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRmaWx0ZXIsICR0aW1lb3V0LCAkaW50ZXJ2YWwsICRpb25pY1BvcHVwLFxuICBQYXJzZSwgdG91cm5hbWVudCwgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcywgTGFkZGVyU2VydmljZXMpIHtcblxuICB2YXIgcHJvbWlzZSA9IG51bGw7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQ7XG4gICRzY29wZS5vcHBvbmVudCA9IFF1ZXVlU2VydmljZXMub3Bwb25lbnQ7XG4gICRzY29wZS5oZXJvTGlzdCA9IFF1ZXVlU2VydmljZXMuaGVyb2VzO1xuICAkc2NvcGUubXlPcHBvbmVudCA9IHtuYW1lOidQQVggQXR0ZW5kZWUnfTtcblxuICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgUGFyc2VQdXNoUGx1Z2luLm9uKCdyZWNlaXZlUE4nLCBmdW5jdGlvbihwbil7XG4gICAgICBpZihwbi50aXRsZSkge1xuICAgICAgICBzd2l0Y2ggKHBuLnRpdGxlKSB7XG4gICAgICAgICAgY2FzZSAnb3Bwb25lbnQ6Zm91bmQnOiBvcHBvbmVudEZvdW5kKCk7IGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ29wcG9uZW50OmNvbmZpcm1lZCc6IG9wcG9uZW50Q29uZmlybWVkKCk7IGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZ2V0Q3VycmVudFN0YXR1cyhmYWxzZSk7XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIGdldEN1cnJlbnRTdGF0dXModHJ1ZSk7XG4gIH07XG5cbiAgJHNjb3BlLnN0YXJ0UXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGhlcm8gPSAkZmlsdGVyKCdmaWx0ZXInKSgkc2NvcGUuaGVyb0xpc3QsIHtjaGVja2VkOiB0cnVlfSwgdHJ1ZSk7XG4gICAgaWYoaGVyby5sZW5ndGgpIHtcbiAgICAgIGhlcm9bMF0uY2hlY2tlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBqb2luUXVldWVQb3B1cCgpLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgaWYocmVzKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdoZXJvJywgcmVzLnRleHQpO1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY2FuY2VsUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgJHNjb3BlLnBsYXllci51bnNldCgnaGVybycpO1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9O1xuXG4gICRzY29wZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgfTtcblxuICAkc2NvcGUuc2hvd09wcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgcHJvbWlzZSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7Y2hhbmdlV29yZCgpfSwgMjAwMCk7XG4gIH07XG5cbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICB9KTtcblxuXG4gIGZ1bmN0aW9uIHNhdmVQbGF5ZXIgKCkge1xuICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcjtcbiAgICAgIHN0YXR1cygpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblF1ZXVlUG9wdXAgKCkge1xuICAgIHN1YigpO1xuICAgICRzY29wZS5zZWxlY3RlZCA9IHtzdGF0dXM6IHRydWV9O1xuICAgICRzY29wZS5zZWxlY3RIZXJvID0gZnVuY3Rpb24gKGhlcm8pIHtcbiAgICAgICRzY29wZS5pbWFnZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb0NsYXNzJykpWzBdLmNsaWVudFdpZHRoO1xuXG4gICAgICBpZihoZXJvLmNoZWNrZWQpIHtcbiAgICAgICAgaGVyby5jaGVja2VkID0gIWhlcm8uY2hlY2tlZDtcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoIWhlcm8uY2hlY2tlZCAmJiAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzKSB7XG4gICAgICAgIGhlcm8uY2hlY2tlZCA9ICFoZXJvLmNoZWNrZWQ7XG4gICAgICAgICRzY29wZS5zZWxlY3RlZC5zdGF0dXMgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLnNob3coXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy9zZWxlY3QuaGVyby5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdTZWxlY3QgSGVybyBDbGFzcycsXG4gICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdDYW5jZWwnfSxcbiAgICAgICAgICB7IHRleHQ6ICc8Yj5RdWV1ZTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICB2YXIgaGVybyA9ICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5oZXJvTGlzdCwge2NoZWNrZWQ6IHRydWV9LCB0cnVlKTtcbiAgICAgICAgICAgICAgaWYgKCFoZXJvLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGVyb1swXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gc3RhdHVzICgpIHtcbiAgICBzd2l0Y2ggKCRzY29wZS5wbGF5ZXIuc3RhdHVzKSB7XG4gICAgICBjYXNlICdvcGVuJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdxdWV1ZSc6XG4gICAgICAgICRzY29wZS5zaG93T3Bwb25lbnRzKCk7XG4gICAgICAgIG1hdGNoTWFraW5nKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZm91bmQnOlxuICAgICAgICBwbGF5ZXJGb3VuZCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbmZpcm1lZCc6XG4gICAgICAgIHdhaXRpbmdGb3JPcHBvbmVudCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ25vT3Bwb25lbnQnOlxuICAgICAgICBub09wcG9uZW50KCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncGxheWluZyc6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2FuY2VsbGVkJzpcbiAgICAgICAgcGxheWVyQ2FuY2VsbGVkKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEN1cnJlbnRTdGF0dXMocmVmcmVzaCkge1xuICAgIHZhciByZWZyZXNoID0gcmVmcmVzaDtcbiAgICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnNbMF07XG4gICAgICBpZiAoJHNjb3BlLnBsYXllcikge1xuICAgICAgICBzdGF0dXMoKTtcbiAgICAgIH1cbiAgICAgIGlmKHJlZnJlc2gpIHtcbiAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoTWFraW5nKCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIFBhcnNlLkNsb3VkLnJ1bignbWF0Y2htYWtpbmcnKS50aGVuKGZ1bmN0aW9uIChzdGF0dXMpIHtcbiAgICAgICAgaWYoc3RhdHVzKSB7XG4gICAgICAgICAgZ2V0Q3VycmVudFN0YXR1cyhmYWxzZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmNhbmNlbFF1ZXVlKCk7XG4gICAgICAgICAgc2hvd0VtcHR5UXVldWUoKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSwgNzAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93RW1wdHlRdWV1ZSgpIHtcbiAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1BsZWFzZSB0cnkgYWdhaW4nLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5ObyBPcHBvbmVudHMgaGF2ZSBiZWVuIGZvdW5kIGF0IHRoaXMgdGltZS48L2Rpdj4nXG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gb3Bwb25lbnRGb3VuZCgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2ZvdW5kJyk7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxheWVyRm91bmQoKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICB2YXIgb3Bwb25lbnRGb3VuZCA9ICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+QSBXb3J0aHkgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGhhcyBiZWVuIGZvdW5kITwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+Q2FuY2VsPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1hc3NlcnRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSlcblxuICAgIG9wcG9uZW50Rm91bmQudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCdwZW5kaW5nJykudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgIGlmKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgICAgICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgICAgICAgICBtYXRjaGVzWzBdLnNldCgnY29uZmlybTEnLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1hdGNoZXNbMF0uc2V0KCdjb25maXJtMicsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF0Y2hlc1swXS5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXJDYW5jZWxsZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSAhPT0gJ2NvbmZpcm1lZCcpIHtcbiAgICAgICAgcGxheWVyRm91bmQuY2xvc2UoZmFsc2UpO1xuICAgICAgfVxuICAgIH0sIDYwMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXllckNhbmNlbGxlZCgpIHtcbiAgICBpZigkc2NvcGUucGxheWVyLmdldCgnY2FuY2VsVGltZXInKSkge1xuICAgICAgaWYobW9tZW50KCRzY29wZS5wbGF5ZXIuZ2V0KCdjYW5jZWxUaW1lcicpKS5pc0FmdGVyKCkpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICRzY29wZS5wbGF5ZXIudW5zZXQoJ2NhbmNlbFRpbWVyJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXJ0VGltZXIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRpbWUgPSBtb21lbnQoKS5hZGQoJzInLCAnbWludXRlcycpLmZvcm1hdCgpO1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdjYW5jZWxsZWQnKTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdjYW5jZWxUaW1lcicsIHRpbWUpO1xuICAgICAgc2F2ZVBsYXllcigpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0VGltZXIoKSB7XG4gICAgLy9UT0RPIGRvIHRpbWVyXG4gIH1cblxuICBmdW5jdGlvbiBvcHBvbmVudENvbmZpcm1lZCAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdwbGF5aW5nJyk7XG4gICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC52aWV3Jyk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB3YWl0aW5nRm9yT3Bwb25lbnQgKCkge1xuICAgIFBhcnNlLkNsb3VkLnJ1bignY29uZmlybU1hdGNoJyk7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRDb25maXJtZWRNYXRjaCgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgaWYoIW1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdub09wcG9uZW50Jyk7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCA3MDAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBub09wcG9uZW50ICgpIHtcbiAgICAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggRXJyb3InLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj48c3Ryb25nPllvdXIgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGZhaWxlZCB0byBjb25maXJtITwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+QmFjazwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tYXNzZXJ0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5RdWV1ZSBBZ2FpbjwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgaWYocmVzKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgICAgTWF0Y2hTZXJ2aWNlcy5jYW5jZWxNYXRjaCgkc2NvcGUudXNlci5jdXJyZW50KCksICRzY29wZS5wbGF5ZXIucGxheWVyKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN1YiAoKSB7XG4gICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgUGFyc2VQdXNoUGx1Z2luLnN1YnNjcmliZSgkc2NvcGUucGxheWVyLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3N1YmJlZCcpO1xuICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hhbmdlV29yZCAoKSB7XG4gICAgJHNjb3BlLm15T3Bwb25lbnQubmFtZSA9ICRzY29wZS5vcHBvbmVudC5saXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSokc2NvcGUub3Bwb25lbnQubGlzdC5sZW5ndGgpXTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVySm9pbkN0cmwnLCBbJyRzY29wZScsICckZmlsdGVyJywgJyRpb25pY1BvcHVwJywgJyRzdGF0ZScsICckaW9uaWNIaXN0b3J5JywgJyRxJywgJ1BhcnNlJywgJ3RvdXJuYW1lbnQnLCAnTGFkZGVyU2VydmljZXMnLCBMYWRkZXJKb2luQ3RybF0pO1xuXG5mdW5jdGlvbiBMYWRkZXJKb2luQ3RybFxuKCRzY29wZSwgJGZpbHRlciwgJGlvbmljUG9wdXAsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgJHEsIFBhcnNlLCAgdG91cm5hbWVudCwgTGFkZGVyU2VydmljZXMpIHtcbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnRbMF0udG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcbiAgJHNjb3BlLnBsYXllciA9IHtcbiAgICBiYXR0bGVUYWc6ICcnXG4gIH07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhbGlkYXRlQmF0dGxlVGFnKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci51c2VybmFtZSA9ICRzY29wZS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAkc2NvcGUucGxheWVyLnN0YXR1cyA9ICdvcGVuJztcbiAgICAgICAgTGFkZGVyU2VydmljZXMuam9pblRvdXJuYW1lbnQoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLCAkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICBTdWNjZXNzUG9wdXAocGxheWVyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBFcnJvclBvcHVwKGVycm9yKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQmF0dGxlVGFnICgpIHtcbiAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0YWcgPSAkc2NvcGUucGxheWVyLmJhdHRsZVRhZztcblxuICAgIGlmKHRhZy5sZW5ndGggPCA4KSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBiYXR0bGUgdGFnJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIHNwbGl0ID0gdGFnLnNwbGl0KCcjJyk7XG4gICAgaWYoc3BsaXQubGVuZ3RoICE9PSAyKSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBCQVRUTEVUQUfihKIgaW5jbHVkaW5nICMgYW5kIGZvdXIgZGlnaXRzJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoc3BsaXRbMV0ubGVuZ3RoIDwgMiB8fCBzcGxpdFsxXS5sZW5ndGggPiA0KSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIHVwIHRvIGZvdXIgZGlnaXRzIGFmdGVyICMhJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoaXNOYU4oc3BsaXRbMV0pKSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIGZvdXIgZGlnaXRzIGFmdGVyICMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBMYWRkZXJTZXJ2aWNlcy52YWxpZGF0ZVBsYXllcigkc2NvcGUudG91cm5hbWVudC50b3VybmFtZW50LCB0YWcpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgIGlmKHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIGNiLnJlamVjdCgnVGhlIEJBVFRMRVRBR+KEoiB5b3UgZW50ZXJlZCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiLnJlc29sdmUodGFnKTtcbiAgICAgIH0gXG4gICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1JlZ2lzdHJhdGlvbiBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFN1Y2Nlc3NQb3B1cCAocGxheWVyKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnQ29uZ3JhdHVsYXRpb25zICcgKyBwbGF5ZXIudXNlcm5hbWUgKyAnIScsXG4gICAgICB0ZW1wbGF0ZTogJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSBzaWduZWQgdXAhIE5vdyBnbyBmaW5kIGEgdmFsaWFudCBvcHBvbmVudC4nXG4gICAgfSk7XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkc0N0cmwnLCBMZWFkZXJCb2FyZHNDdHJsKTtcblxuTGVhZGVyQm9hcmRzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnTGFkZGVyU2VydmljZXMnLCAndG91cm5hbWVudCcsICdQYXJzZScsICckZmlsdGVyJywgJyRpb25pY1BvcHVwJ107XG5mdW5jdGlvbiBMZWFkZXJCb2FyZHNDdHJsKCRzY29wZSwgTGFkZGVyU2VydmljZXMsIHRvdXJuYW1lbnQsIFBhcnNlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudFswXS50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgdmFyIHJhbmsgPSAxO1xuICAgIGFuZ3VsYXIuZm9yRWFjaChwbGF5ZXJzLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICByYW5rKys7XG4gICAgfSk7XG4gICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICB9KTtcblxuICAkc2NvcGUuc2hvd0RldGFpbHMgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgJHNjb3BlLmhlcm9lcyA9IHBsYXllci5oZXJvZXM7XG4gICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6IHBsYXllci51c2VybmFtZSArICcgSGVyb2VzJyxcbiAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICB0ZW1wbGF0ZTpcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtMjUgdGV4dC1jZW50ZXJcIiBuZy1yZXBlYXQ9XCJoZXJvIGluIGhlcm9lc1wiPicgK1xuICAgICAgICAnPGltZyBuZy1zcmM9XCJpbWcvaWNvbnMve3toZXJvfX0ucG5nXCIgY2xhc3M9XCJyZXNwb25zaXZlLWltZ1wiIHN0eWxlPVwicGFkZGluZzozcHg7XCI+e3toZXJvfX0nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5Mb2dpbkN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNIaXN0b3J5J107XG5mdW5jdGlvbiBMb2dpbkN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICRzY29wZS51c2VyID0ge307XG4gIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2UuVXNlci5sb2dJbigkc2NvcGUudXNlci51c2VybmFtZSwgJHNjb3BlLnVzZXIucGFzc3dvcmQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24gKHVzZXIsIGVycm9yKSB7XG4gICAgICAgICRzY29wZS53YXJuaW5nID0gZXJyb3IubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndXNlcicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcbiAgICAkc2NvcGUud2FybmluZyA9IG51bGw7XG4gIH0sIHRydWUpO1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFZpZXdDdHJsJywgTWF0Y2hWaWV3Q3RybCk7XG5cbk1hdGNoVmlld0N0cmwuJGluamVjdCA9IFtcbiAgJyRzY29wZScsICckc3RhdGUnLCAnJHRpbWVvdXQnLCAnJGlvbmljUG9wdXAnLCAnJGlvbmljSGlzdG9yeScsICdQYXJzZScsICdMYWRkZXJTZXJ2aWNlcycsICdNYXRjaFNlcnZpY2VzJywgJ1F1ZXVlU2VydmljZXMnLCAndG91cm5hbWVudCcsICdtYXRjaCdcbl07XG5mdW5jdGlvbiBNYXRjaFZpZXdDdHJsKCRzY29wZSwgJHN0YXRlLCAkdGltZW91dCwgJGlvbmljUG9wdXAsICRpb25pY0hpc3RvcnksIFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcywgdG91cm5hbWVudCwgbWF0Y2gpIHtcbiAgJHNjb3BlLmNvdW50ID0gMDtcbiAgJHNjb3BlLm1hdGNoID0gbWF0Y2hbMF07XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcblxuICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKXtcbiAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTicsIGZ1bmN0aW9uKHBuKXtcbiAgICAgIGlmKHBuLnRpdGxlKSB7XG4gICAgICAgIHN3aXRjaCAocG4udGl0bGUpIHtcbiAgICAgICAgICBjYXNlICdtYXRjaDpyZXN1bHRzJzpcbiAgICAgICAgICAgIHNob3dSZXN1bHRzUG9wdXAoKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgIGlmICgkc2NvcGUucGxheWVyKSB7XG4gICAgICBnZXRNYXRjaERldGFpbHMoKTtcbiAgICB9XG4gIH0pO1xuICBmdW5jdGlvbiBzaG93UmVzdWx0c1BvcHVwKCkge1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggUmVzdWx0cycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdXIgT3Bwb25lbnQgaGFzIHVwZGF0ZWQgdGhlIHJlc3VsdHMhPC9kaXY+J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICB9KTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUucmVjb3JkID0gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJ2FjdGl2ZScpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgIHZhciB1c2VybmFtZSA9IG51bGw7XG4gICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICBzd2l0Y2ggKHJlY29yZCkge1xuICAgICAgICAgIGNhc2UgJ3dpbic6XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS51c2VyLmN1cnJlbnQoKSk7XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgdXNlcm5hbWUgPSAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWVcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgJ2xvc3MnOlxuICAgICAgICAgICAgbWF0Y2guc2V0KCd3aW5uZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLnVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLnVzZXIuY3VycmVudCgpLnVzZXJuYW1lXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBtYXRjaC5zZXQoJ3N0YXR1cycsICdjb21wbGV0ZWQnKTtcbiAgICAgICAgbWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgICB0aXRsZTogJ01hdGNoIFN1Ym1pdHRlZCcsXG4gICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+VGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHJlc3VsdHM8L2Rpdj4nXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaFJlc3VsdHMnLCB7dXNlcm5hbWU6IHVzZXJuYW1lfSkudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRNYXRjaERldGFpbHMoKSB7XG4gICAgJHNjb3BlLm9wcG9uZW50ID0ge1xuICAgICAgaGVybzogbnVsbCxcbiAgICAgIGJhdHRsZVRhZzogbnVsbFxuICAgIH1cbiAgICBpZigkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuaGVybyA9ICRzY29wZS5tYXRjaC5oZXJvMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VybmFtZSA9ICRzY29wZS5tYXRjaC51c2VybmFtZTI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuYmF0dGxlVGFnID0gJHNjb3BlLm1hdGNoLmJhdHRsZVRhZzI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlciA9ICRzY29wZS5tYXRjaC51c2VyMjtcbiAgICB9XG4gICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIyJykge1xuICAgICAgJHNjb3BlLm9wcG9uZW50Lmhlcm8gPSAkc2NvcGUubWF0Y2guaGVybzE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWUgPSAkc2NvcGUubWF0Y2gudXNlcm5hbWUxO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LmJhdHRsZVRhZyA9ICRzY29wZS5tYXRjaC5iYXR0bGVUYWcxO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXIgPSAkc2NvcGUubWF0Y2gudXNlcjE7XG4gICAgfVxuICB9XG59O1xuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignTWVudUN0cmwnLCBNZW51Q3RybCk7XG5cbk1lbnVDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsJyRpb25pY1BvcG92ZXInLCAnJHN0YXRlJywgJyRpb25pY0hpc3RvcnknLCAnUGFyc2UnLCAnJHRpbWVvdXQnXTtcbmZ1bmN0aW9uIE1lbnVDdHJsKCRzY29wZSwgJGlvbmljUG9wb3ZlciwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCBQYXJzZSwgJHRpbWVvdXQpIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuXG4gICRpb25pY1BvcG92ZXIuZnJvbVRlbXBsYXRlVXJsKCd0ZW1wbGF0ZXMvcG9wb3ZlcnMvcHJvZmlsZS5wb3AuaHRtbCcsIHtcbiAgICBzY29wZTogJHNjb3BlLFxuICB9KS50aGVuKGZ1bmN0aW9uKHBvcG92ZXIpIHtcbiAgICAkc2NvcGUucG9wb3ZlciA9IHBvcG92ZXI7XG4gIH0pO1xuXG4gICRzY29wZS5tZW51ID0gZnVuY3Rpb24gKGxpbmspIHtcbiAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgIH0pO1xuICAgICRzdGF0ZS5nbygnYXBwLicgKyBsaW5rLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgJHNjb3BlLnBvcG92ZXIuaGlkZSgpO1xuICB9XG4gIC8vQ2xlYW51cCB0aGUgcG9wb3ZlciB3aGVuIHdlJ3JlIGRvbmUgd2l0aCBpdCFcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wb3Zlci5yZW1vdmUoKTtcbiAgfSk7XG5cbiAgJHNjb3BlLiRvbignJGlvbmljVmlldy5sb2FkZWQnLCBmdW5jdGlvbigpIHtcbiAgICBpb25pYy5QbGF0Zm9ybS5yZWFkeSggZnVuY3Rpb24oKSB7XG4gICAgICBpZihuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuICAgICAgICBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgUmVnaXN0ZXJDdHJsKTtcblxuUmVnaXN0ZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIFJlZ2lzdGVyQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY1BvcHVwKSB7XG5cbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuUmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB2YXIgcmVnaXN0ZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgIHJlZ2lzdGVyLnNldCh1c2VyKTtcbiAgICByZWdpc3Rlci5zaWduVXAobnVsbCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgQWRtaW5Sb3V0ZXNdKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBMYWRkZXJSb3V0ZXNdKTtcblxuZnVuY3Rpb24gTGFkZGVyUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyJywge1xuICAgICAgdXJsOiAnL2xhZGRlcicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGFkZGVyLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIubGVhZGVyYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvbGVhZGVyYm9hcmRzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sZWFkZXJib2FyZC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZHNDdHJsJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmpvaW4nLCB7XG4gICAgICB1cmw6ICcvam9pbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvam9pbi5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMYWRkZXJKb2luQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBNYXRjaFJvdXRlc10pO1xuXG5mdW5jdGlvbiBNYXRjaFJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoJywge1xuICAgICAgdXJsOiAnL21hdGNoJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmh0bWwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnZpZXcnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC52aWV3Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoVmlld0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBtYXRjaDogZnVuY3Rpb24gKE1hdGNoU2VydmljZXMsICRzdGF0ZSwgJHEpIHtcbiAgICAgICAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJ2FjdGl2ZScpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIGlmKCFtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYi5yZWplY3QoKTtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYi5yZXNvbHZlKG1hdGNoZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdMYWRkZXJTZXJ2aWNlcycsIFsnUGFyc2UnLCAnTGFkZGVyJywgTGFkZGVyU2VydmljZXNdKVxuICAuZmFjdG9yeSgnTGFkZGVyJywgWydQYXJzZScsIExhZGRlcl0pO1xuXG5mdW5jdGlvbiBMYWRkZXJTZXJ2aWNlcyhQYXJzZSwgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UGxheWVyczogZ2V0UGxheWVycyxcbiAgICBnZXRQbGF5ZXI6IGdldFBsYXllcixcbiAgICB2YWxpZGF0ZVBsYXllcjogdmFsaWRhdGVQbGF5ZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50LFxuICAgIGdldFBlbmRpbmdQbGF5ZXJzOiBnZXRQZW5kaW5nUGxheWVyc1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBlbmRpbmdQbGF5ZXJzKHRvdXJuYW1lbnQsIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkubm90RXF1YWxUTygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVycyh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoJ3BvaW50cycsICdtbXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUGxheWVyKHRvdXJuZXksIGJhdHRsZVRhZykge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5lcXVhbFRvKCdiYXR0bGVUYWcnLCBiYXR0bGVUYWcpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyKHRvdXJuZXksIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCB1c2VyLCB1c2VyRGF0YSkge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKHVzZXJEYXRhKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIHVzZXIpO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBMYWRkZXIoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTGFkZGVyJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3VzZXInLCAnYmF0dGxlVGFnJywgJ3VzZXJuYW1lJywgJ2hlcm8nLCAncGxheWVyJywgJ3N0YXR1cycsICdjYW5jZWxUaW1lcicsICd3aW5zJywgJ2xvc3NlcycsICdtbXInLCAncG9pbnRzJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ01hdGNoU2VydmljZXMnLCBbJ1BhcnNlJywgJ01hdGNoJywgJyRxJywgTWF0Y2hTZXJ2aWNlc10pXG4gIC5mYWN0b3J5KCdNYXRjaCcsIFsnUGFyc2UnLCBNYXRjaF0pO1xuXG5mdW5jdGlvbiBNYXRjaFNlcnZpY2VzKFBhcnNlLCBNYXRjaCwgJHEpIHtcbiAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyO1xuICByZXR1cm4ge1xuICAgIGdldE1hdGNoOiBnZXRNYXRjaCxcbiAgICBnZXRDb25maXJtZWRNYXRjaDogZ2V0Q29uZmlybWVkTWF0Y2gsXG4gICAgY2FuY2VsTWF0Y2g6IGNhbmNlbE1hdGNoXG4gIH1cbiAgZnVuY3Rpb24gZ2V0Q29uZmlybWVkTWF0Y2ggKCkge1xuICAgIHZhciBwbGF5ZXIxID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHBsYXllcjEuZXF1YWxUbygndXNlcm5hbWUxJywgdXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuICAgIHZhciBwbGF5ZXIyID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHBsYXllcjIuZXF1YWxUbygndXNlcm5hbWUyJywgdXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuXG4gICAgdmFyIG1haW5RdWVyeSA9IFBhcnNlLlF1ZXJ5Lm9yKHBsYXllcjEsIHBsYXllcjIpO1xuICAgIG1haW5RdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAnYWN0aXZlJyk7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0yJywgdHJ1ZSk7XG4gICAgcmV0dXJuIG1haW5RdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TWF0Y2goc3RhdHVzKSB7XG4gICAgdmFyIHBsYXllcjEgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcGxheWVyMS5lcXVhbFRvKCd1c2VybmFtZTEnLCB1c2VyLmN1cnJlbnQoKS51c2VybmFtZSk7XG4gICAgdmFyIHBsYXllcjIgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcGxheWVyMi5lcXVhbFRvKCd1c2VybmFtZTInLCB1c2VyLmN1cnJlbnQoKS51c2VybmFtZSk7XG5cbiAgICB2YXIgbWFpblF1ZXJ5ID0gUGFyc2UuUXVlcnkub3IocGxheWVyMSwgcGxheWVyMik7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsIHN0YXR1cyk7XG4gICAgcmV0dXJuIG1haW5RdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gY2FuY2VsTWF0Y2ggKHVzZXIsIHBsYXllcikge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBpZihwbGF5ZXIgPSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXIxJywgdXNlcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXIyJywgdXNlcik7XG4gICAgfVxuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdwZW5kaW5nJyk7XG4gICAgcXVlcnkuZmluZCgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgIFBhcnNlLk9iamVjdC5kZXN0cm95QWxsKG1hdGNoZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICBjYi5yZXNvbHZlKHRydWUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG5cbiAgfVxufVxuXG5mdW5jdGlvbiBNYXRjaChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdNYXRjaCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFtcbiAgICAndG91cm5hbWVudCcsICdwbGF5ZXIxJywgJ3BsYXllcjInLCAnaGVybzEnLCAnaGVybzInLCAndXNlcm5hbWUxJywgJ3VzZXJuYW1lMicsICdiYXR0bGVUYWcxJywgJ2JhdHRsZVRhZzInLCAnc3RhdHVzJywgJ3dpbm5lcicsICdsb3NlcicsXG4gICAgJ3NjcmVlbnNob3QnLCAncmVwb3J0JywgJ3JlcG9ydGVkU2NyZWVuc2hvdCcsICdhY3RpdmVEYXRlJywgJ3VzZXIxJywgJ3VzZXIyJ1xuICBdO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1F1ZXVlU2VydmljZXMnLFtRdWV1ZVNlcnZpY2VzXSlcblxuZnVuY3Rpb24gUXVldWVTZXJ2aWNlcygpIHtcbiAgdmFyIG9wcG9uZW50ID0ge1xuICAgIGxpc3Q6IFsnRWFzeSBQaWNraW5ncycsICdZb3VyIFdvcnN0IE5pZ2h0bWFyZScsICdXb3JsZCBjbGFzcyBwYXN0ZSBlYXRlcicsXG4gICAgICAnQSBNdXJsb2MnLCAnR291cmQgY3JpdGljJywgJ05vc2UgYW5kIG1vdXRoIGJyZWF0aGVyJywgJ0hvZ2dlcicsICdBIGNhcmRpc2ggSWFuJyxcbiAgICAgICdNb3BleSBNYWdlJywgJ1dvbWJhdCBXYXJsb2NrJywgJ1JvdWdlZCB1cCBSb2d1ZScsICdXYWlmaXNoIFdhcnJpb3InLCAnRGFtcCBEcnVpZCcsXG4gICAgICAnU2hhYmJ5IFNoYW1hbicsICdQZW5uaWxlc3MgUGFsYWRpbicsICdIdWZmeSBIdW50ZXInLCAnUGVya3kgUHJpZXN0JywgJ1RoZSBXb3JzdCBQbGF5ZXInLFxuICAgICAgJ1lvdXIgT2xkIFJvb21tYXRlJywgJ1N0YXJDcmFmdCBQcm8nLCAnRmlzY2FsbHkgcmVzcG9uc2libGUgbWltZScsICdZb3VyIEd1aWxkIExlYWRlcicsXG4gICAgICAnTm9uZWNrIEdlb3JnZScsICdHdW0gUHVzaGVyJywgJ0NoZWF0ZXIgTWNDaGVhdGVyc29uJywgJ1JlYWxseSBzbG93IGd1eScsICdSb2FjaCBCb3knLFxuICAgICAgJ09yYW5nZSBSaHltZXInLCAnQ29mZmVlIEFkZGljdCcsICdJbndhcmQgVGFsa2VyJywgJ0JsaXp6YXJkIERldmVsb3BlcicsICdHcmFuZCBNYXN0ZXInLFxuICAgICAgJ0RpYW1vbmQgTGVhZ3VlIFBsYXllcicsICdCcmFuZCBOZXcgUGxheWVyJywgJ0Rhc3RhcmRseSBEZWF0aCBLbmlnaHQnLCAnTWVkaW9jcmUgTW9uaycsXG4gICAgICAnQSBMaXR0bGUgUHVwcHknXG4gICAgXVxuICB9O1xuICB2YXIgaGVyb2VzID0gW1xuICAgIHt0ZXh0OiAnbWFnZScsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2h1bnRlcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3BhbGFkaW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJyaW9yJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnZHJ1aWQnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJsb2NrJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnc2hhbWFuJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncHJpZXN0JywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncm9ndWUnLCBjaGVja2VkOiBmYWxzZX1cbiAgXVxuICByZXR1cm4ge1xuICAgIG9wcG9uZW50OiBvcHBvbmVudCxcbiAgICBoZXJvZXM6IGhlcm9lc1xuICB9XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnVG91cm5hbWVudFNlcnZpY2VzJywgWydQYXJzZScsICckcScsICdUb3VybmFtZW50JywgJ0RldGFpbHMnLCAnTGFkZGVyJywgVG91cm5hbWVudFNlcnZpY2VzXSlcblxuICAuZmFjdG9yeSgnVG91cm5hbWVudCcsIFsnUGFyc2UnLCBUb3VybmFtZW50XSlcbiAgLmZhY3RvcnkoJ0RldGFpbHMnLCBbJ1BhcnNlJywgRGV0YWlsc10pO1xuXG5mdW5jdGlvbiBUb3VybmFtZW50U2VydmljZXMoUGFyc2UsICRxLCBUb3VybmFtZW50LCBEZXRhaWxzLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb3VybmFtZW50OiBnZXRUb3VybmFtZW50LFxuICAgIGNyZWF0ZVRvdXJuYW1lbnQ6IGNyZWF0ZVRvdXJuYW1lbnQsXG4gICAgZ2V0TGFkZGVyOiBnZXRMYWRkZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH1cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgcGxheWVyKSB7XG4gICAgdmFyIHBsYXllciA9IG5ldyBMYWRkZXIuTW9kZWwocGxheWVyKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VybmFtZScsIFBhcnNlLlVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICBwbGF5ZXIuc2V0KCdtbXInLCAxMDAwKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VG91cm5hbWVudCgpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoRGV0YWlscy5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndHlwZScsICdsYWRkZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd0b3VybmFtZW50Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb3VybmFtZW50ICgpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0b3VybmFtZW50ID0gbmV3IFRvdXJuYW1lbnQuTW9kZWwoKTtcbiAgICB0b3VybmFtZW50LnNldCgnbmFtZScsICdPTk9HIE9QRU4nKTtcbiAgICB0b3VybmFtZW50LnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICB0b3VybmFtZW50LnNldCgnZ2FtZScsICdoZWFydGhzdG9uZScpO1xuICAgIHRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuZXkpIHtcbiAgICAgIHZhciBkZXRhaWxzID0gbmV3IERldGFpbHMuTW9kZWwoKTtcbiAgICAgIGRldGFpbHMuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgICBkZXRhaWxzLnNldCgndHlwZScsICdsYWRkZXInKTtcbiAgICAgIGRldGFpbHMuc2V0KCdwbGF5ZXJDb3VudCcsIDApO1xuICAgICAgZGV0YWlscy5zZXQoJ251bU9mR2FtZXMnLCA1KTtcbiAgICAgIGRldGFpbHMuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgZGVmZXIucmVzb2x2ZShkZXRhaWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhZGRlciAodG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5pbmNsdWRlKCdwbGF5ZXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnQoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVG91cm5hbWVudCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnbmFtZScsICdnYW1lJywgJ3N0YXR1cycsICdkaXNhYmxlZCcsICdkaXNhYmxlZFJlYXNvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG5mdW5jdGlvbiBEZXRhaWxzKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0RldGFpbHMnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndHlwZScsICdudW1PZkdhbWVzJywgJ3BsYXllckNvdW50J107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
