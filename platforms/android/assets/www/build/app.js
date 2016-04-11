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
        console.log(pn);
        $state.go('app.dashboard');
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
  Parse, tournament, MatchServices, QueueServices, LadderServices
) {
  var promise = null;
  $scope.user = Parse.User;
  $scope.previousMatch = null;
  $scope.tournament = tournament[0].tournament;
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};

  if(window.ParsePushPlugin){
    ParsePushPlugin.on('receivePN', function(pn){
      console.log('triggered', pn);
    });
  }

  getCurrentStatus();

  $scope.startQueue = function () {
    joinQueuePopup().then(function (res) {
      if(res) {
        $scope.player.set('hero', res.text);
        $scope.player.set('status', 'queue');
        sub();
        savePlayer();
      }
      var hero = $filter('filter')($scope.heroList, {checked: true}, true);
      hero[0].checked = false;
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

  $scope.startSearch = function() {
    $scope.stop();
    promise = $interval(function () {changeWord()}, 2000);
  };

  $scope.$on('$destroy', function() {
    $scope.stop();
  });

  function sub () {
    if(window.ParsePushPlugin) {
      ParsePushPlugin.subscribe($scope.player.username, function(msg) {
        console.log('subbed');
      }, function(e) {
        console.log('failed to sub');
      });
    }
  }

  
  function savePlayer () {
    $scope.player.save().then(function (player) {
      $scope.player = player;
      status();
    });
  }

  function joinQueuePopup () {
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
        $scope.startSearch();
        $timeout(matchMaking, 7000);
        break;
      case 'found':
        playerFound();
        break;
      case 'confirmed':
        $timeout(waitingForOpponent, 7000);
        break;
      case 'afk':
        backToQueue();
        break;
      case 'playing':
        break;
      case 'cancelled':
        playerCancelled();
        break;
    }
  }

  function backToQueue () {
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
        MatchServices.cancelMatch($scope.user.current()).then(function () {
          savePlayer();
        });
      } else {
        $scope.player.set('status', 'open');
        savePlayer();
      }
    });
  }

  function waitingForOpponent () {
    Parse.Cloud.run('ConfirmMatch').then(function () {
      MatchServices.getConfirmedMatch().then(function (matches) {
        if(matches.length) {
          $scope.player.set('status', 'playing');
          savePlayer();
          
        }
      });
    });
  }

  function getCurrentStatus() {
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      if ($scope.player) {
        status();
      }
    });
  }

  function matchMaking() {
    Parse.Cloud.run('MatchMaking').then(function () {
      getCurrentStatus();
    });
  }

  function playerFound() {
    $scope.stop();
    $ionicPopup.show({
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
  }

  function startTimer() {
    //TODO do timer
  }

  function playerCancelled() {
    if($scope.player.cancelTimer) {
      if(moment($scope.player.cancelTimer).isAfter()) {
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
  $scope.user = Parse.User.current();
  $ionicHistory.nextViewOptions({
    disableBack: true
  });

  LadderServices.getPlayer($scope.tournament, $scope.user).then(function (players) {
    $scope.player = players[0];
    if ($scope.player) {
      getMatchDetails();
    }
  });

  $scope.record = function (record) {
    MatchServices.getMatch('active').then(function (matches) {
      if(matches.length) {
        var match = matches[0];
        switch (record) {
          case 'win':
            match.set('winner', $scope.user);
            match.set('loser', $scope.opponent.user);
            break;
          case 'loss':
            match.set('winner', $scope.opponent.user);
            match.set('loser', $scope.user);
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
              $state.go('app.dashboard');
            });
          });
        });
      } else {
        $ionicPopup.alert({
          title: 'Match Error',
          template: '<div class="text-center">Your Opponent has already updated results!</div>'
        }).then(function(res) {
          $ionicHistory.nextViewOptions({
            disableBack: true
          });
          $state.go('app.dashboard');
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
    joinTournament: joinTournament
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

  .service('MatchServices', ['Parse', 'Match', MatchServices])
  .factory('Match', ['Parse', Match]);

function MatchServices(Parse, Match) {
  var user = Parse.User;
  return {
    getMatch: getMatch,
    getConfirmedMatch: getConfirmedMatch
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC52aWV3LmN0cmwuanMiLCJjb250cm9sbGVycy9tZW51LmN0cmwuanMiLCJjb250cm9sbGVycy9yZWdpc3Rlci5jdHJsLmpzIiwicm91dGVzL2FkbWluLnJvdXRlcy5qcyIsInJvdXRlcy9sYWRkZXIucm91dGVzLmpzIiwicm91dGVzL21hdGNoLnJvdXRlcy5qcyIsInNlcnZpY2VzL2xhZGRlci5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL21hdGNoLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUJBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsUkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDN0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnT05PRycsIFtcbiAgJ2lvbmljJyxcbiAgJ25nUGFyc2UnLFxuICAnbmdDb3Jkb3ZhJyxcbiAgJ25nQW5pbWF0ZScsXG4gICdPTk9HLkNvbnRyb2xsZXJzJyxcbiAgJ09OT0cuU2VydmljZXMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRpb25pY0NvbmZpZ1Byb3ZpZGVyJywgJyRjb21waWxlUHJvdmlkZXInLCAnUGFyc2VQcm92aWRlcicsIGNvbmZpZ10pO1xuXG5mdW5jdGlvbiBjb25maWcgKCRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyLCBQYXJzZVByb3ZpZGVyKSB7XG5cbiAgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8ZmlsZXxibG9ifGNvbnRlbnR8bXMtYXBweHx4LXdtYXBwMCk6fGRhdGE6aW1hZ2VcXC98aW1nXFwvLyk7XG4gICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGZpbGV8Z2h0dHBzP3xtcy1hcHB4fHgtd21hcHAwKTovKTtcblxuICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJuWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRXCIsIFwienJpbjhHRUJEVkdia2wxaW9HRXduSHVQNzBGZEc2SGh6VFM4dUdqelwiKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsIHJvdXRlc10pO1xuXG5mdW5jdGlvbiByb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdhcHAvZGFzaGJvYXJkJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcykge1xuICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuZ2V0VG91cm5hbWVudCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5kYXNoYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kYXNoYm9hcmQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5yZWdpc3RlcicsIHtcbiAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cblxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uc3RhbnQoXCJtb21lbnRcIiwgbW9tZW50KVxuICAucnVuKFsnJGlvbmljUGxhdGZvcm0nLCAnJHN0YXRlJywgcnVuXSk7XG5cbmZ1bmN0aW9uIHJ1biAoJGlvbmljUGxhdGZvcm0sICRzdGF0ZSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKXtcbiAgICAgIFBhcnNlUHVzaFBsdWdpbi5vbigncmVjZWl2ZVBOJywgZnVuY3Rpb24ocG4pe1xuICAgICAgICBjb25zb2xlLmxvZyhwbik7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJywgW10pO1xuXG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5NYXRjaGVzQ3RybCcsIEFkbWluTWF0Y2hlc0N0cmwpO1xuXG5BZG1pbk1hdGNoZXNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYXJzZSddO1xuZnVuY3Rpb24gQWRtaW5NYXRjaGVzQ3RybCgkc2NvcGUsIFBhcnNlKSB7XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblBsYXllcnNDdHJsJywgQWRtaW5QbGF5ZXJzQ3RybCk7XG5cbkFkbWluUGxheWVyc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhcnNlJ107XG5mdW5jdGlvbiBBZG1pblBsYXllcnNDdHJsKCRzY29wZSwgUGFyc2UpIHtcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluU2V0dGluZ3NDdHJsJywgQWRtaW5TZXR0aW5nc0N0cmwpO1xuXG5BZG1pblNldHRpbmdzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnVG91cm5hbWVudFNlcnZpY2VzJywgJ25ld1RvdXJuYW1lbnQnXTtcblxuZnVuY3Rpb24gQWRtaW5TZXR0aW5nc0N0cmwoJHNjb3BlLCBUb3VybmFtZW50U2VydmljZXMsIG5ld1RvdXJuYW1lbnQpIHtcbiAgJHNjb3BlLmRldGFpbHMgPSBuZXdUb3VybmFtZW50O1xuICBcbiAgLy8gVG91cm5hbWVudFNlcnZpY2VzLmdldExhZGRlcigkc2NvcGUudG91cm5hbWVudC50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChsYWRkZXIpIHtcbiAgLy8gICAkc2NvcGUubGFkZGVyID0gbGFkZGVyO1xuICAvLyB9KTtcbiAgXG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDdHJsJyxcbiAgICBbXG4gICAgICAnJHNjb3BlJywgJyRzdGF0ZScsICckZmlsdGVyJywgJyR0aW1lb3V0JywgJyRpbnRlcnZhbCcsICckaW9uaWNQb3B1cCcsXG4gICAgICAnUGFyc2UnLCAndG91cm5hbWVudCcsICdNYXRjaFNlcnZpY2VzJywgJ1F1ZXVlU2VydmljZXMnLCAnTGFkZGVyU2VydmljZXMnLFxuICAgICAgRGFzaGJvYXJkQ3RybFxuICAgIF0pO1xuXG5mdW5jdGlvbiBEYXNoYm9hcmRDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGZpbHRlciwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJGlvbmljUG9wdXAsXG4gIFBhcnNlLCB0b3VybmFtZW50LCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCBMYWRkZXJTZXJ2aWNlc1xuKSB7XG4gIHZhciBwcm9taXNlID0gbnVsbDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUucHJldmlvdXNNYXRjaCA9IG51bGw7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUub3Bwb25lbnQgPSBRdWV1ZVNlcnZpY2VzLm9wcG9uZW50O1xuICAkc2NvcGUuaGVyb0xpc3QgPSBRdWV1ZVNlcnZpY2VzLmhlcm9lcztcbiAgJHNjb3BlLm15T3Bwb25lbnQgPSB7bmFtZTonUEFYIEF0dGVuZGVlJ307XG5cbiAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbil7XG4gICAgUGFyc2VQdXNoUGx1Z2luLm9uKCdyZWNlaXZlUE4nLCBmdW5jdGlvbihwbil7XG4gICAgICBjb25zb2xlLmxvZygndHJpZ2dlcmVkJywgcG4pO1xuICAgIH0pO1xuICB9XG5cbiAgZ2V0Q3VycmVudFN0YXR1cygpO1xuXG4gICRzY29wZS5zdGFydFF1ZXVlID0gZnVuY3Rpb24gKCkge1xuICAgIGpvaW5RdWV1ZVBvcHVwKCkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICBpZihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ2hlcm8nLCByZXMudGV4dCk7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgICAgc3ViKCk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH1cbiAgICAgIHZhciBoZXJvID0gJGZpbHRlcignZmlsdGVyJykoJHNjb3BlLmhlcm9MaXN0LCB7Y2hlY2tlZDogdHJ1ZX0sIHRydWUpO1xuICAgICAgaGVyb1swXS5jaGVja2VkID0gZmFsc2U7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmNhbmNlbFF1ZXVlID0gZnVuY3Rpb24gKCkge1xuICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICRzY29wZS5wbGF5ZXIudW5zZXQoJ2hlcm8nKTtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgIHNhdmVQbGF5ZXIoKTtcblxuICB9O1xuXG4gICRzY29wZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgfTtcblxuICAkc2NvcGUuc3RhcnRTZWFyY2ggPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgIHByb21pc2UgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge2NoYW5nZVdvcmQoKX0sIDIwMDApO1xuICB9O1xuXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc3ViICgpIHtcbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4uc3Vic2NyaWJlKCRzY29wZS5wbGF5ZXIudXNlcm5hbWUsIGZ1bmN0aW9uKG1zZykge1xuICAgICAgICBjb25zb2xlLmxvZygnc3ViYmVkJyk7XG4gICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBcbiAgZnVuY3Rpb24gc2F2ZVBsYXllciAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgc3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2luUXVldWVQb3B1cCAoKSB7XG4gICAgJHNjb3BlLnNlbGVjdGVkID0ge3N0YXR1czogdHJ1ZX07XG4gICAgJHNjb3BlLnNlbGVjdEhlcm8gPSBmdW5jdGlvbiAoaGVybykge1xuICAgICAgJHNjb3BlLmltYWdlID0gYW5ndWxhci5lbGVtZW50KGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5oZXJvQ2xhc3MnKSlbMF0uY2xpZW50V2lkdGg7XG5cbiAgICAgIGlmKGhlcm8uY2hlY2tlZCkge1xuICAgICAgICBoZXJvLmNoZWNrZWQgPSAhaGVyby5jaGVja2VkO1xuICAgICAgICAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZighaGVyby5jaGVja2VkICYmICRzY29wZS5zZWxlY3RlZC5zdGF0dXMpIHtcbiAgICAgICAgaGVyby5jaGVja2VkID0gIWhlcm8uY2hlY2tlZDtcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfTtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcG9wdXBzL3NlbGVjdC5oZXJvLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1NlbGVjdCBIZXJvIENsYXNzJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPlF1ZXVlPC9iPicsXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIHZhciBoZXJvID0gJGZpbHRlcignZmlsdGVyJykoJHNjb3BlLmhlcm9MaXN0LCB7Y2hlY2tlZDogdHJ1ZX0sIHRydWUpO1xuICAgICAgICAgICAgICBpZiAoIWhlcm8ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBoZXJvWzBdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBzdGF0dXMgKCkge1xuICAgIHN3aXRjaCAoJHNjb3BlLnBsYXllci5zdGF0dXMpIHtcbiAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3F1ZXVlJzpcbiAgICAgICAgJHNjb3BlLnN0YXJ0U2VhcmNoKCk7XG4gICAgICAgICR0aW1lb3V0KG1hdGNoTWFraW5nLCA3MDAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdmb3VuZCc6XG4gICAgICAgIHBsYXllckZvdW5kKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29uZmlybWVkJzpcbiAgICAgICAgJHRpbWVvdXQod2FpdGluZ0Zvck9wcG9uZW50LCA3MDAwKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdhZmsnOlxuICAgICAgICBiYWNrVG9RdWV1ZSgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3BsYXlpbmcnOlxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NhbmNlbGxlZCc6XG4gICAgICAgIHBsYXllckNhbmNlbGxlZCgpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBiYWNrVG9RdWV1ZSAoKSB7XG4gICAgJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICB0aXRsZTogJ01hdGNoIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+PHN0cm9uZz5Zb3VyIE9wcG9uZW50PC9zdHJvbmc+PGJyPiBmYWlsZWQgdG8gY29uZmlybSE8L2Rpdj4nLFxuICAgICAgYnV0dG9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPkJhY2s8L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLWFzc2VydGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+UXVldWUgQWdhaW48L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICAgIE1hdGNoU2VydmljZXMuY2FuY2VsTWF0Y2goJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhaXRpbmdGb3JPcHBvbmVudCAoKSB7XG4gICAgUGFyc2UuQ2xvdWQucnVuKCdDb25maXJtTWF0Y2gnKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIE1hdGNoU2VydmljZXMuZ2V0Q29uZmlybWVkTWF0Y2goKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgIGlmKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdwbGF5aW5nJyk7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEN1cnJlbnRTdGF0dXMoKSB7XG4gICAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlci5jdXJyZW50KCkpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgICAgaWYgKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAgICAgc3RhdHVzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYXRjaE1ha2luZygpIHtcbiAgICBQYXJzZS5DbG91ZC5ydW4oJ01hdGNoTWFraW5nJykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICBnZXRDdXJyZW50U3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5ZXJGb3VuZCgpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+QSBXb3J0aHkgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGhhcyBiZWVuIGZvdW5kITwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+Q2FuY2VsPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1hc3NlcnRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCdwZW5kaW5nJykudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgIGlmKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgICAgICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgICAgICAgICBtYXRjaGVzWzBdLnNldCgnY29uZmlybTEnLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1hdGNoZXNbMF0uc2V0KCdjb25maXJtMicsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF0Y2hlc1swXS5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXJDYW5jZWxsZWQoKTtcbiAgICAgIH1cblxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnRUaW1lcigpIHtcbiAgICAvL1RPRE8gZG8gdGltZXJcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXllckNhbmNlbGxlZCgpIHtcbiAgICBpZigkc2NvcGUucGxheWVyLmNhbmNlbFRpbWVyKSB7XG4gICAgICBpZihtb21lbnQoJHNjb3BlLnBsYXllci5jYW5jZWxUaW1lcikuaXNBZnRlcigpKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAkc2NvcGUucGxheWVyLnVuc2V0KCdjYW5jZWxUaW1lcicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzdGFydFRpbWVyKCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciB0aW1lID0gbW9tZW50KCkuYWRkKCcyJywgJ21pbnV0ZXMnKS5mb3JtYXQoKTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnY2FuY2VsbGVkJyk7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnY2FuY2VsVGltZXInLCB0aW1lKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGFuZ2VXb3JkICgpIHtcbiAgICAkc2NvcGUubXlPcHBvbmVudC5uYW1lID0gJHNjb3BlLm9wcG9uZW50Lmxpc3RbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKiRzY29wZS5vcHBvbmVudC5saXN0Lmxlbmd0aCldO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMYWRkZXJKb2luQ3RybCcsIFsnJHNjb3BlJywgJyRmaWx0ZXInLCAnJGlvbmljUG9wdXAnLCAnJHN0YXRlJywgJyRpb25pY0hpc3RvcnknLCAnJHEnLCAnUGFyc2UnLCAndG91cm5hbWVudCcsICdMYWRkZXJTZXJ2aWNlcycsIExhZGRlckpvaW5DdHJsXSk7XG5cbmZ1bmN0aW9uIExhZGRlckpvaW5DdHJsXG4oJHNjb3BlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCAkcSwgUGFyc2UsICB0b3VybmFtZW50LCBMYWRkZXJTZXJ2aWNlcykge1xuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICAkc2NvcGUucGxheWVyID0ge1xuICAgIGJhdHRsZVRhZzogJydcbiAgfTtcblxuICAkc2NvcGUucmVnaXN0ZXJQbGF5ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFsaWRhdGVCYXR0bGVUYWcoKS50aGVuKFxuICAgICAgZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnVzZXJuYW1lID0gJHNjb3BlLnVzZXIudXNlcm5hbWU7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc3RhdHVzID0gJ29wZW4nO1xuICAgICAgICBMYWRkZXJTZXJ2aWNlcy5qb2luVG91cm5hbWVudCgkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIsICRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgIFN1Y2Nlc3NQb3B1cChwbGF5ZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IpO1xuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVCYXR0bGVUYWcgKCkge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRhZyA9ICRzY29wZS5wbGF5ZXIuYmF0dGxlVGFnO1xuXG4gICAgaWYodGFnLmxlbmd0aCA8IDgpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIGJhdHRsZSB0YWcnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgc3BsaXQgPSB0YWcuc3BsaXQoJyMnKTtcbiAgICBpZihzcGxpdC5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIEJBVFRMRVRBR+KEoiBpbmNsdWRpbmcgIyBhbmQgZm91ciBkaWdpdHMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihzcGxpdFsxXS5sZW5ndGggPCAyIHx8IHNwbGl0WzFdLmxlbmd0aCA+IDQpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgdXAgdG8gZm91ciBkaWdpdHMgYWZ0ZXIgIyEnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihpc05hTihzcGxpdFsxXSkpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgZm91ciBkaWdpdHMgYWZ0ZXIgIycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLnZhbGlkYXRlUGxheWVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsIHRhZykudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgaWYocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgY2IucmVqZWN0KCdUaGUgQkFUVExFVEFH4oSiIHlvdSBlbnRlcmVkIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0YWcpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgfTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gU3VjY2Vzc1BvcHVwIChwbGF5ZXIpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdDb25ncmF0dWxhdGlvbnMgJyArIHBsYXllci51c2VybmFtZSArICchJyxcbiAgICAgIHRlbXBsYXRlOiAnWW91IGhhdmUgc3VjY2Vzc2Z1bGx5IHNpZ25lZCB1cCEgTm93IGdvIGZpbmQgYSB2YWxpYW50IG9wcG9uZW50LidcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGVhZGVyQm9hcmRzQ3RybCcsIExlYWRlckJvYXJkc0N0cmwpO1xuXG5MZWFkZXJCb2FyZHNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdMYWRkZXJTZXJ2aWNlcycsICd0b3VybmFtZW50JywgJ1BhcnNlJywgJyRmaWx0ZXInLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIExlYWRlckJvYXJkc0N0cmwoJHNjb3BlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCwgUGFyc2UsICRmaWx0ZXIsICRpb25pY1BvcHVwKSB7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcbiAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVycyh0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICB2YXIgcmFuayA9IDE7XG4gICAgYW5ndWxhci5mb3JFYWNoKHBsYXllcnMsIGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgIHBsYXllci5yYW5rID0gcmFuaztcbiAgICAgIHJhbmsrKztcbiAgICB9KTtcbiAgICAkc2NvcGUucGxheWVycyA9IHBsYXllcnM7XG4gIH0pO1xuXG4gICRzY29wZS5zaG93RGV0YWlscyA9IGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAkc2NvcGUuaGVyb2VzID0gcGxheWVyLmhlcm9lcztcbiAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogcGxheWVyLnVzZXJuYW1lICsgJyBIZXJvZXMnLFxuICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgIHRlbXBsYXRlOlxuICAgICAgICAnPGRpdiBjbGFzcz1cInJvd1wiPicgK1xuICAgICAgICAnPGRpdiBjbGFzcz1cImNvbC0yNSB0ZXh0LWNlbnRlclwiIG5nLXJlcGVhdD1cImhlcm8gaW4gaGVyb2VzXCI+JyArXG4gICAgICAgICc8aW1nIG5nLXNyYz1cImltZy9pY29ucy97e2hlcm99fS5wbmdcIiBjbGFzcz1cInJlc3BvbnNpdmUtaW1nXCIgc3R5bGU9XCJwYWRkaW5nOjNweDtcIj57e2hlcm99fScgK1xuICAgICAgICAnPC9kaXY+JyArXG4gICAgICAgICc8L2Rpdj4nXG4gICAgfSk7XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xvZ2luQ3RybCcsIExvZ2luQ3RybCk7XG5cbkxvZ2luQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJHN0YXRlJywgJ1BhcnNlJywgJyRpb25pY0hpc3RvcnknXTtcbmZ1bmN0aW9uIExvZ2luQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY0hpc3RvcnkpIHtcbiAgJHNjb3BlLnVzZXIgPSB7fTtcbiAgUGFyc2UuVXNlci5sb2dPdXQoKTtcbiAgJHNjb3BlLmxvZ2luVXNlciA9IGZ1bmN0aW9uICgpIHtcbiAgICBQYXJzZS5Vc2VyLmxvZ0luKCRzY29wZS51c2VyLnVzZXJuYW1lLCAkc2NvcGUudXNlci5wYXNzd29yZCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbiAodXNlciwgZXJyb3IpIHtcbiAgICAgICAgJHNjb3BlLndhcm5pbmcgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd1c2VyJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuICAgICRzY29wZS53YXJuaW5nID0gbnVsbDtcbiAgfSwgdHJ1ZSk7XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoVmlld0N0cmwnLCBNYXRjaFZpZXdDdHJsKTtcblxuTWF0Y2hWaWV3Q3RybC4kaW5qZWN0ID0gW1xuICAnJHNjb3BlJywgJyRzdGF0ZScsICckdGltZW91dCcsICckaW9uaWNQb3B1cCcsICckaW9uaWNIaXN0b3J5JywgJ1BhcnNlJywgJ0xhZGRlclNlcnZpY2VzJywgJ01hdGNoU2VydmljZXMnLCAnUXVldWVTZXJ2aWNlcycsICd0b3VybmFtZW50JywgJ21hdGNoJ1xuXTtcbmZ1bmN0aW9uIE1hdGNoVmlld0N0cmwoJHNjb3BlLCAkc3RhdGUsICR0aW1lb3V0LCAkaW9uaWNQb3B1cCwgJGlvbmljSGlzdG9yeSwgUGFyc2UsIExhZGRlclNlcnZpY2VzLCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCB0b3VybmFtZW50LCBtYXRjaCkge1xuICAkc2NvcGUuY291bnQgPSAwO1xuICAkc2NvcGUubWF0Y2ggPSBtYXRjaFswXTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50WzBdLnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcblxuICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnNbMF07XG4gICAgaWYgKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAgIGdldE1hdGNoRGV0YWlscygpO1xuICAgIH1cbiAgfSk7XG5cbiAgJHNjb3BlLnJlY29yZCA9IGZ1bmN0aW9uIChyZWNvcmQpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCdhY3RpdmUnKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICBzd2l0Y2ggKHJlY29yZCkge1xuICAgICAgICAgIGNhc2UgJ3dpbic6XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS51c2VyKTtcbiAgICAgICAgICAgIG1hdGNoLnNldCgnbG9zZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdsb3NzJzpcbiAgICAgICAgICAgIG1hdGNoLnNldCgnd2lubmVyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgbWF0Y2guc2V0KCdsb3NlcicsICRzY29wZS51c2VyKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIG1hdGNoLnNldCgnc3RhdHVzJywgJ2NvbXBsZXRlZCcpO1xuICAgICAgICBtYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICAgIHRpdGxlOiAnTWF0Y2ggU3VibWl0dGVkJyxcbiAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5UaGFuayB5b3UgZm9yIHN1Ym1pdHRpbmcgcmVzdWx0czwvZGl2PidcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICB0aXRsZTogJ01hdGNoIEVycm9yJyxcbiAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdXIgT3Bwb25lbnQgaGFzIGFscmVhZHkgdXBkYXRlZCByZXN1bHRzITwvZGl2PidcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldE1hdGNoRGV0YWlscygpIHtcbiAgICAkc2NvcGUub3Bwb25lbnQgPSB7XG4gICAgICBoZXJvOiBudWxsLFxuICAgICAgYmF0dGxlVGFnOiBudWxsXG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8yO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnVzZXIyO1xuICAgIH1cbiAgICBpZigkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjInKSB7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuaGVybyA9ICRzY29wZS5tYXRjaC5oZXJvMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VybmFtZSA9ICRzY29wZS5tYXRjaC51c2VybmFtZTE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuYmF0dGxlVGFnID0gJHNjb3BlLm1hdGNoLmJhdHRsZVRhZzE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlciA9ICRzY29wZS5tYXRjaC51c2VyMTtcbiAgICB9XG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdNZW51Q3RybCcsIE1lbnVDdHJsKTtcblxuTWVudUN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywnJGlvbmljUG9wb3ZlcicsICckc3RhdGUnLCAnJGlvbmljSGlzdG9yeScsICdQYXJzZScsICckdGltZW91dCddO1xuZnVuY3Rpb24gTWVudUN0cmwoJHNjb3BlLCAkaW9uaWNQb3BvdmVyLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlLCAkdGltZW91dCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJGlvbmljUG9wb3Zlci5mcm9tVGVtcGxhdGVVcmwoJ3RlbXBsYXRlcy9wb3BvdmVycy9wcm9maWxlLnBvcC5odG1sJywge1xuICAgIHNjb3BlOiAkc2NvcGUsXG4gIH0pLnRoZW4oZnVuY3Rpb24ocG9wb3Zlcikge1xuICAgICRzY29wZS5wb3BvdmVyID0gcG9wb3ZlcjtcbiAgfSk7XG5cbiAgJHNjb3BlLm1lbnUgPSBmdW5jdGlvbiAobGluaykge1xuICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgfSk7XG4gICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAkc2NvcGUucG9wb3Zlci5oaWRlKCk7XG4gIH1cbiAgLy9DbGVhbnVwIHRoZSBwb3BvdmVyIHdoZW4gd2UncmUgZG9uZSB3aXRoIGl0IVxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wb3BvdmVyLnJlbW92ZSgpO1xuICB9KTtcblxuICAkc2NvcGUuJG9uKCckaW9uaWNWaWV3LmxvYWRlZCcsIGZ1bmN0aW9uKCkge1xuICAgIGlvbmljLlBsYXRmb3JtLnJlYWR5KCBmdW5jdGlvbigpIHtcbiAgICAgIGlmKG5hdmlnYXRvciAmJiBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG4gICAgICAgIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBSZWdpc3RlckN0cmwpO1xuXG5SZWdpc3RlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNQb3B1cCddO1xuZnVuY3Rpb24gUmVnaXN0ZXJDdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljUG9wdXApIHtcblxuICAkc2NvcGUudXNlciA9IHt9O1xuXG4gICRzY29wZS5SZWdpc3RlclVzZXIgPSBmdW5jdGlvbiAodXNlcikge1xuICAgIHZhciByZWdpc3RlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgcmVnaXN0ZXIuc2V0KHVzZXIpO1xuICAgIHJlZ2lzdGVyLnNpZ25VcChudWxsLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuICAgICAgICAvLyBTaG93IHRoZSBlcnJvciBtZXNzYWdlIHNvbWV3aGVyZSBhbmQgbGV0IHRoZSB1c2VyIHRyeSBhZ2Fpbi5cbiAgICAgICAgRXJyb3JQb3B1cChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndXNlcicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcbiAgICAkc2NvcGUud2FybmluZyA9IG51bGw7XG4gIH0sIHRydWUpO1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBBZG1pblJvdXRlc10pO1xuXG5mdW5jdGlvbiBBZG1pblJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmFkbWluJywge1xuICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5zZXR0aW5ncycsIHtcbiAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5zZXR0aW5ncy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pblNldHRpbmdzQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuZXk6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV3VG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgdG91cm5leSkge1xuICAgICAgICAgIGlmKHRvdXJuZXkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdG91cm5leVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5jcmVhdGVUb3VybmFtZW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5tYXRjaGVzJywge1xuICAgICAgdXJsOiAnL21hdGNoZXMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4ubWF0Y2hlcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbk1hdGNoZXNDdHJsJ1xuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIExhZGRlclJvdXRlc10pO1xuXG5mdW5jdGlvbiBMYWRkZXJSb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXInLCB7XG4gICAgICB1cmw6ICcvbGFkZGVyJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sYWRkZXIuaHRtbCcsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5sZWFkZXJib2FyZCcsIHtcbiAgICAgIHVybDogJy9sZWFkZXJib2FyZHMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2xlYWRlcmJvYXJkLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xlYWRlckJvYXJkc0N0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIuam9pbicsIHtcbiAgICAgIHVybDogJy9qb2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9qb2luLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xhZGRlckpvaW5DdHJsJ1xuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIE1hdGNoUm91dGVzXSk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gudmlldycsIHtcbiAgICAgIHVybDogJy92aWV3JyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLnZpZXcuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hWaWV3Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlLCAkcSkge1xuICAgICAgICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRNYXRjaCgnYWN0aXZlJykudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgICAgaWYoIW1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgIGNiLnJlamVjdCgpO1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGNiLnJlc29sdmUobWF0Y2hlcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ0xhZGRlclNlcnZpY2VzJywgWydQYXJzZScsICdMYWRkZXInLCBMYWRkZXJTZXJ2aWNlc10pXG4gIC5mYWN0b3J5KCdMYWRkZXInLCBbJ1BhcnNlJywgTGFkZGVyXSk7XG5cbmZ1bmN0aW9uIExhZGRlclNlcnZpY2VzKFBhcnNlLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRQbGF5ZXJzOiBnZXRQbGF5ZXJzLFxuICAgIGdldFBsYXllcjogZ2V0UGxheWVyLFxuICAgIHZhbGlkYXRlUGxheWVyOiB2YWxpZGF0ZVBsYXllcixcbiAgICBqb2luVG91cm5hbWVudDogam9pblRvdXJuYW1lbnRcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKHRvdXJuZXkpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZGVzY2VuZGluZygncG9pbnRzJywgJ21tcicpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVQbGF5ZXIodG91cm5leSwgYmF0dGxlVGFnKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ2JhdHRsZVRhZycsIGJhdHRsZVRhZyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQbGF5ZXIodG91cm5leSwgdXNlcikge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5lcXVhbFRvKCd1c2VyJywgdXNlcik7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGpvaW5Ub3VybmFtZW50KHRvdXJuZXksIHVzZXIsIHVzZXJEYXRhKSB7XG4gICAgdmFyIHBsYXllciA9IG5ldyBMYWRkZXIuTW9kZWwodXNlckRhdGEpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgdXNlcik7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIExhZGRlcihQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdMYWRkZXInKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndXNlcicsICdiYXR0bGVUYWcnLCAndXNlcm5hbWUnLCAnaGVybycsICdwbGF5ZXInLCAnc3RhdHVzJywgJ2NhbmNlbFRpbWVyJywgJ3dpbnMnLCAnbG9zc2VzJywgJ21tcicsICdwb2ludHMnXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTWF0Y2hTZXJ2aWNlcycsIFsnUGFyc2UnLCAnTWF0Y2gnLCBNYXRjaFNlcnZpY2VzXSlcbiAgLmZhY3RvcnkoJ01hdGNoJywgWydQYXJzZScsIE1hdGNoXSk7XG5cbmZ1bmN0aW9uIE1hdGNoU2VydmljZXMoUGFyc2UsIE1hdGNoKSB7XG4gIHZhciB1c2VyID0gUGFyc2UuVXNlcjtcbiAgcmV0dXJuIHtcbiAgICBnZXRNYXRjaDogZ2V0TWF0Y2gsXG4gICAgZ2V0Q29uZmlybWVkTWF0Y2g6IGdldENvbmZpcm1lZE1hdGNoXG4gIH1cbiAgZnVuY3Rpb24gZ2V0Q29uZmlybWVkTWF0Y2ggKCkge1xuICAgIHZhciBwbGF5ZXIxID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHBsYXllcjEuZXF1YWxUbygndXNlcm5hbWUxJywgdXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuICAgIHZhciBwbGF5ZXIyID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHBsYXllcjIuZXF1YWxUbygndXNlcm5hbWUyJywgdXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuXG4gICAgdmFyIG1haW5RdWVyeSA9IFBhcnNlLlF1ZXJ5Lm9yKHBsYXllcjEsIHBsYXllcjIpO1xuICAgIG1haW5RdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAnYWN0aXZlJyk7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0yJywgdHJ1ZSk7XG4gICAgcmV0dXJuIG1haW5RdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TWF0Y2goc3RhdHVzKSB7XG4gICAgdmFyIHBsYXllcjEgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcGxheWVyMS5lcXVhbFRvKCd1c2VybmFtZTEnLCB1c2VyLmN1cnJlbnQoKS51c2VybmFtZSk7XG4gICAgdmFyIHBsYXllcjIgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcGxheWVyMi5lcXVhbFRvKCd1c2VybmFtZTInLCB1c2VyLmN1cnJlbnQoKS51c2VybmFtZSk7XG5cbiAgICB2YXIgbWFpblF1ZXJ5ID0gUGFyc2UuUXVlcnkub3IocGxheWVyMSwgcGxheWVyMik7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsIHN0YXR1cyk7XG4gICAgcmV0dXJuIG1haW5RdWVyeS5maW5kKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTWF0Y2goUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTWF0Y2gnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbXG4gICAgJ3RvdXJuYW1lbnQnLCAncGxheWVyMScsICdwbGF5ZXIyJywgJ2hlcm8xJywgJ2hlcm8yJywgJ3VzZXJuYW1lMScsICd1c2VybmFtZTInLCAnYmF0dGxlVGFnMScsICdiYXR0bGVUYWcyJywgJ3N0YXR1cycsICd3aW5uZXInLCAnbG9zZXInLFxuICAgICdzY3JlZW5zaG90JywgJ3JlcG9ydCcsICdyZXBvcnRlZFNjcmVlbnNob3QnLCAnYWN0aXZlRGF0ZScsICd1c2VyMScsICd1c2VyMidcbiAgXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdRdWV1ZVNlcnZpY2VzJyxbUXVldWVTZXJ2aWNlc10pXG5cbmZ1bmN0aW9uIFF1ZXVlU2VydmljZXMoKSB7XG4gIHZhciBvcHBvbmVudCA9IHtcbiAgICBsaXN0OiBbJ0Vhc3kgUGlja2luZ3MnLCAnWW91ciBXb3JzdCBOaWdodG1hcmUnLCAnV29ybGQgY2xhc3MgcGFzdGUgZWF0ZXInLFxuICAgICAgJ0EgTXVybG9jJywgJ0dvdXJkIGNyaXRpYycsICdOb3NlIGFuZCBtb3V0aCBicmVhdGhlcicsICdIb2dnZXInLCAnQSBjYXJkaXNoIElhbicsXG4gICAgICAnTW9wZXkgTWFnZScsICdXb21iYXQgV2FybG9jaycsICdSb3VnZWQgdXAgUm9ndWUnLCAnV2FpZmlzaCBXYXJyaW9yJywgJ0RhbXAgRHJ1aWQnLFxuICAgICAgJ1NoYWJieSBTaGFtYW4nLCAnUGVubmlsZXNzIFBhbGFkaW4nLCAnSHVmZnkgSHVudGVyJywgJ1Blcmt5IFByaWVzdCcsICdUaGUgV29yc3QgUGxheWVyJyxcbiAgICAgICdZb3VyIE9sZCBSb29tbWF0ZScsICdTdGFyQ3JhZnQgUHJvJywgJ0Zpc2NhbGx5IHJlc3BvbnNpYmxlIG1pbWUnLCAnWW91ciBHdWlsZCBMZWFkZXInLFxuICAgICAgJ05vbmVjayBHZW9yZ2UnLCAnR3VtIFB1c2hlcicsICdDaGVhdGVyIE1jQ2hlYXRlcnNvbicsICdSZWFsbHkgc2xvdyBndXknLCAnUm9hY2ggQm95JyxcbiAgICAgICdPcmFuZ2UgUmh5bWVyJywgJ0NvZmZlZSBBZGRpY3QnLCAnSW53YXJkIFRhbGtlcicsICdCbGl6emFyZCBEZXZlbG9wZXInLCAnR3JhbmQgTWFzdGVyJyxcbiAgICAgICdEaWFtb25kIExlYWd1ZSBQbGF5ZXInLCAnQnJhbmQgTmV3IFBsYXllcicsICdEYXN0YXJkbHkgRGVhdGggS25pZ2h0JywgJ01lZGlvY3JlIE1vbmsnLFxuICAgICAgJ0EgTGl0dGxlIFB1cHB5J1xuICAgIF1cbiAgfTtcbiAgdmFyIGhlcm9lcyA9IFtcbiAgICB7dGV4dDogJ21hZ2UnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdodW50ZXInLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwYWxhZGluJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnd2FycmlvcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2RydWlkJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnd2FybG9jaycsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3NoYW1hbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3ByaWVzdCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3JvZ3VlJywgY2hlY2tlZDogZmFsc2V9XG4gIF1cbiAgcmV0dXJuIHtcbiAgICBvcHBvbmVudDogb3Bwb25lbnQsXG4gICAgaGVyb2VzOiBoZXJvZXNcbiAgfVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1RvdXJuYW1lbnRTZXJ2aWNlcycsIFsnUGFyc2UnLCAnJHEnLCAnVG91cm5hbWVudCcsICdEZXRhaWxzJywgJ0xhZGRlcicsIFRvdXJuYW1lbnRTZXJ2aWNlc10pXG5cbiAgLmZhY3RvcnkoJ1RvdXJuYW1lbnQnLCBbJ1BhcnNlJywgVG91cm5hbWVudF0pXG4gIC5mYWN0b3J5KCdEZXRhaWxzJywgWydQYXJzZScsIERldGFpbHNdKTtcblxuZnVuY3Rpb24gVG91cm5hbWVudFNlcnZpY2VzKFBhcnNlLCAkcSwgVG91cm5hbWVudCwgRGV0YWlscywgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0VG91cm5hbWVudDogZ2V0VG91cm5hbWVudCxcbiAgICBjcmVhdGVUb3VybmFtZW50OiBjcmVhdGVUb3VybmFtZW50LFxuICAgIGdldExhZGRlcjogZ2V0TGFkZGVyLFxuICAgIGpvaW5Ub3VybmFtZW50OiBqb2luVG91cm5hbWVudFxuICB9XG4gIGZ1bmN0aW9uIGpvaW5Ub3VybmFtZW50KHRvdXJuZXksIHBsYXllcikge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKHBsYXllcik7XG4gICAgcGxheWVyLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXInLCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgcGxheWVyLnNldCgndXNlcm5hbWUnLCBQYXJzZS5Vc2VyLmN1cnJlbnQoKS51c2VybmFtZSk7XG4gICAgcGxheWVyLnNldCgnbW1yJywgMTAwMCk7XG4gICAgcGxheWVyLnNldCgnd2lucycsIDApO1xuICAgIHBsYXllci5zZXQoJ2xvc3NlcycsIDApO1xuICAgIHBsYXllci5zZXQoJ3BvaW50cycsIDApO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFRvdXJuYW1lbnQoKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KERldGFpbHMuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3R5cGUnLCAnbGFkZGVyJyk7XG4gICAgcXVlcnkuaW5jbHVkZSgndG91cm5hbWVudCcpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlVG91cm5hbWVudCAoKSB7XG4gICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdG91cm5hbWVudCA9IG5ldyBUb3VybmFtZW50Lk1vZGVsKCk7XG4gICAgdG91cm5hbWVudC5zZXQoJ25hbWUnLCAnT05PRyBPUEVOJyk7XG4gICAgdG91cm5hbWVudC5zZXQoJ3N0YXR1cycsICdwZW5kaW5nJyk7XG4gICAgdG91cm5hbWVudC5zZXQoJ2dhbWUnLCAnaGVhcnRoc3RvbmUnKTtcbiAgICB0b3VybmFtZW50LnNhdmUoKS50aGVuKGZ1bmN0aW9uICh0b3VybmV5KSB7XG4gICAgICB2YXIgZGV0YWlscyA9IG5ldyBEZXRhaWxzLk1vZGVsKCk7XG4gICAgICBkZXRhaWxzLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgICAgZGV0YWlscy5zZXQoJ3R5cGUnLCAnbGFkZGVyJyk7XG4gICAgICBkZXRhaWxzLnNldCgncGxheWVyQ291bnQnLCAwKTtcbiAgICAgIGRldGFpbHMuc2V0KCdudW1PZkdhbWVzJywgNSk7XG4gICAgICBkZXRhaWxzLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChkZXRhaWxzKSB7XG4gICAgICAgIGRlZmVyLnJlc29sdmUoZGV0YWlscyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgfVxuICBmdW5jdGlvbiBnZXRMYWRkZXIgKHRvdXJuZXkpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuaW5jbHVkZSgncGxheWVyJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBUb3VybmFtZW50KFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ1RvdXJuYW1lbnQnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ25hbWUnLCAnZ2FtZScsICdzdGF0dXMnLCAnZGlzYWJsZWQnLCAnZGlzYWJsZWRSZWFzb24nXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuZnVuY3Rpb24gRGV0YWlscyhQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdEZXRhaWxzJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3R5cGUnLCAnbnVtT2ZHYW1lcycsICdwbGF5ZXJDb3VudCddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
