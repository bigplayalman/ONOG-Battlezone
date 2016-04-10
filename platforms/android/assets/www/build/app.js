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
  .run(['$ionicPlatform', run]);

function run ($ionicPlatform) {
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
        alert('yo i got this push notification:' + JSON.stringify(pn));
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
  $scope.myOpponent = {name:'PAX Attendee'};

  getCurrentStatus();

  $scope.startQueue = function () {
    joinQueuePopup().then(function (res) {
      if(res) {
        $scope.player.set('hero', res.text);
        $scope.player.set('status', 'queue');
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

  function savePlayer () {
    $scope.player.save().then(function (player) {
      $scope.player = player;
      status();
    });
  }

  function joinQueuePopup () {
    $scope.heroList = QueueServices.heroes;
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
              $ionicHistory.nextViewOptions({
                disableBack: true
              });
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

MenuCtrl.$inject = ['$scope','$ionicPopover', '$state', '$ionicHistory', 'Parse'];
function MenuCtrl($scope, $ionicPopover, $state, $ionicHistory, Parse) {
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
  var user = Parse.User.current();
  return {
    getMatch: getMatch,
    getConfirmedMatch: getConfirmedMatch
  }
  function getConfirmedMatch () {
    var player1 = new Parse.Query('Match');
    player1.equalTo('username1', user.username);
    var player2 = new Parse.Query('Match');
    player2.equalTo('username2', user.username);

    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.equalTo('status', 'active');
    mainQuery.equalTo('confirm1', true);
    mainQuery.equalTo('confirm2', true);
    return mainQuery.find();
  }
  function getMatch(status) {
    var player1 = new Parse.Query('Match');
    player1.equalTo('username1', user.username);
    var player2 = new Parse.Query('Match');
    player2.equalTo('username2', user.username);

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC52aWV3LmN0cmwuanMiLCJjb250cm9sbGVycy9tZW51LmN0cmwuanMiLCJjb250cm9sbGVycy9yZWdpc3Rlci5jdHJsLmpzIiwicm91dGVzL2FkbWluLnJvdXRlcy5qcyIsInJvdXRlcy9sYWRkZXIucm91dGVzLmpzIiwicm91dGVzL21hdGNoLnJvdXRlcy5qcyIsInNlcnZpY2VzL2xhZGRlci5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL21hdGNoLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzNCQTtBQUNBO0FBQ0E7QUNGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaFFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzdFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDakNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ09OT0cnLCBbXG4gICdpb25pYycsXG4gICduZ1BhcnNlJyxcbiAgJ25nQ29yZG92YScsXG4gICduZ0FuaW1hdGUnLFxuICAnT05PRy5Db250cm9sbGVycycsXG4gICdPTk9HLlNlcnZpY2VzJ1xuXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckaW9uaWNDb25maWdQcm92aWRlcicsICckY29tcGlsZVByb3ZpZGVyJywgJ1BhcnNlUHJvdmlkZXInLCBjb25maWddKTtcblxuZnVuY3Rpb24gY29uZmlnICgkaW9uaWNDb25maWdQcm92aWRlciwgJGNvbXBpbGVQcm92aWRlciwgUGFyc2VQcm92aWRlcikge1xuXG4gICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8YmxvYnxjb250ZW50fG1zLWFwcHh8eC13bWFwcDApOnxkYXRhOmltYWdlXFwvfGltZ1xcLy8pO1xuICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xmaWxlfGdodHRwcz98bXMtYXBweHx4LXdtYXBwMCk6Lyk7XG5cbiAgUGFyc2VQcm92aWRlci5pbml0aWFsaXplKFwibllzQjZ0bUJNWUtZTXpNNWlWOUJVY0J2SFdYODlJdFBYNUdmYk42UVwiLCBcInpyaW44R0VCRFZHYmtsMWlvR0V3bkh1UDcwRmRHNkhoelRTOHVHanpcIik7XG5cbiAgaWYgKGlvbmljLlBsYXRmb3JtLmlzSU9TKCkpIHtcbiAgICAkaW9uaWNDb25maWdQcm92aWRlci5zY3JvbGxpbmcuanNTY3JvbGxpbmcodHJ1ZSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJywgW10pO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInLCByb3V0ZXNdKTtcblxuZnVuY3Rpb24gcm91dGVzICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnYXBwL2Rhc2hib2FyZCcpO1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICB1cmw6ICcvYXBwJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWVudS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNZW51Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuZGFzaGJvYXJkJywge1xuICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAucmVnaXN0ZXInLCB7XG4gICAgICB1cmw6ICcvcmVnaXN0ZXInLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3JlZ2lzdGVyLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG5cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbnN0YW50KFwibW9tZW50XCIsIG1vbWVudClcbiAgLnJ1bihbJyRpb25pY1BsYXRmb3JtJywgcnVuXSk7XG5cbmZ1bmN0aW9uIHJ1biAoJGlvbmljUGxhdGZvcm0pIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblxuICAgICAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMgbGluZSB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UgYXJlIGRvaW5nLiBJdCBzdG9wcyB0aGUgdmlld3BvcnRcbiAgICAgIC8vIGZyb20gc25hcHBpbmcgd2hlbiB0ZXh0IGlucHV0cyBhcmUgZm9jdXNlZC4gSW9uaWMgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yXG4gICAgICAvLyBhIG11Y2ggbmljZXIga2V5Ym9hcmQgZXhwZXJpZW5jZS5cbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuICAgIH1cbiAgICBpZih3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbil7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTicsIGZ1bmN0aW9uKHBuKXtcbiAgICAgICAgYWxlcnQoJ3lvIGkgZ290IHRoaXMgcHVzaCBub3RpZmljYXRpb246JyArIEpTT04uc3RyaW5naWZ5KHBuKSk7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnLCBbXSk7XG5cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pbk1hdGNoZXNDdHJsJywgQWRtaW5NYXRjaGVzQ3RybCk7XG5cbkFkbWluTWF0Y2hlc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhcnNlJ107XG5mdW5jdGlvbiBBZG1pbk1hdGNoZXNDdHJsKCRzY29wZSwgUGFyc2UpIHtcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluUGxheWVyc0N0cmwnLCBBZG1pblBsYXllcnNDdHJsKTtcblxuQWRtaW5QbGF5ZXJzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFyc2UnXTtcbmZ1bmN0aW9uIEFkbWluUGxheWVyc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5TZXR0aW5nc0N0cmwnLCBBZG1pblNldHRpbmdzQ3RybCk7XG5cbkFkbWluU2V0dGluZ3NDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdUb3VybmFtZW50U2VydmljZXMnLCAnbmV3VG91cm5hbWVudCddO1xuXG5mdW5jdGlvbiBBZG1pblNldHRpbmdzQ3RybCgkc2NvcGUsIFRvdXJuYW1lbnRTZXJ2aWNlcywgbmV3VG91cm5hbWVudCkge1xuICAkc2NvcGUuZGV0YWlscyA9IG5ld1RvdXJuYW1lbnQ7XG4gIFxuICAvLyBUb3VybmFtZW50U2VydmljZXMuZ2V0TGFkZGVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQpLnRoZW4oZnVuY3Rpb24gKGxhZGRlcikge1xuICAvLyAgICRzY29wZS5sYWRkZXIgPSBsYWRkZXI7XG4gIC8vIH0pO1xuICBcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZEN0cmwnLFxuICAgIFtcbiAgICAgICckc2NvcGUnLCAnJHN0YXRlJywgJyRmaWx0ZXInLCAnJHRpbWVvdXQnLCAnJGludGVydmFsJywgJyRpb25pY1BvcHVwJyxcbiAgICAgICdQYXJzZScsICd0b3VybmFtZW50JywgJ01hdGNoU2VydmljZXMnLCAnUXVldWVTZXJ2aWNlcycsICdMYWRkZXJTZXJ2aWNlcycsXG4gICAgICBEYXNoYm9hcmRDdHJsXG4gICAgXSk7XG5cbmZ1bmN0aW9uIERhc2hib2FyZEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkZmlsdGVyLCAkdGltZW91dCwgJGludGVydmFsLCAkaW9uaWNQb3B1cCxcbiAgUGFyc2UsIHRvdXJuYW1lbnQsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMsIExhZGRlclNlcnZpY2VzXG4pIHtcbiAgXG4gIHZhciBwcm9taXNlID0gbnVsbDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUucHJldmlvdXNNYXRjaCA9IG51bGw7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUub3Bwb25lbnQgPSBRdWV1ZVNlcnZpY2VzLm9wcG9uZW50O1xuICAkc2NvcGUubXlPcHBvbmVudCA9IHtuYW1lOidQQVggQXR0ZW5kZWUnfTtcblxuICBnZXRDdXJyZW50U3RhdHVzKCk7XG5cbiAgJHNjb3BlLnN0YXJ0UXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgam9pblF1ZXVlUG9wdXAoKS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnaGVybycsIHJlcy50ZXh0KTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICB9XG4gICAgICB2YXIgaGVybyA9ICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5oZXJvTGlzdCwge2NoZWNrZWQ6IHRydWV9LCB0cnVlKTtcbiAgICAgIGhlcm9bMF0uY2hlY2tlZCA9IGZhbHNlO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5jYW5jZWxRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAkc2NvcGUucGxheWVyLnVuc2V0KCdoZXJvJyk7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBzYXZlUGxheWVyKCk7XG4gICAgXG4gIH07XG5cbiAgJHNjb3BlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHByb21pc2UpO1xuICB9O1xuICBcbiAgJHNjb3BlLnN0YXJ0U2VhcmNoID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBwcm9taXNlID0gJGludGVydmFsKGZ1bmN0aW9uICgpIHtjaGFuZ2VXb3JkKCl9LCAyMDAwKTtcbiAgfTtcblxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNhdmVQbGF5ZXIgKCkge1xuICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcjtcbiAgICAgIHN0YXR1cygpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblF1ZXVlUG9wdXAgKCkge1xuICAgICRzY29wZS5oZXJvTGlzdCA9IFF1ZXVlU2VydmljZXMuaGVyb2VzO1xuICAgICRzY29wZS5zZWxlY3RlZCA9IHtzdGF0dXM6IHRydWV9O1xuICAgICRzY29wZS5zZWxlY3RIZXJvID0gZnVuY3Rpb24gKGhlcm8pIHtcbiAgICAgICRzY29wZS5pbWFnZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb0NsYXNzJykpWzBdLmNsaWVudFdpZHRoO1xuXG4gICAgICBpZihoZXJvLmNoZWNrZWQpIHtcbiAgICAgICAgaGVyby5jaGVja2VkID0gIWhlcm8uY2hlY2tlZDtcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IHRydWU7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYoIWhlcm8uY2hlY2tlZCAmJiAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzKSB7XG4gICAgICAgIGhlcm8uY2hlY2tlZCA9ICFoZXJvLmNoZWNrZWQ7XG4gICAgICAgICRzY29wZS5zZWxlY3RlZC5zdGF0dXMgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH07XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLnNob3coXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy9zZWxlY3QuaGVyby5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdTZWxlY3QgSGVybyBDbGFzcycsXG4gICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdDYW5jZWwnfSxcbiAgICAgICAgICB7IHRleHQ6ICc8Yj5RdWV1ZTwvYj4nLCBcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgdmFyIGhlcm8gPSAkZmlsdGVyKCdmaWx0ZXInKSgkc2NvcGUuaGVyb0xpc3QsIHtjaGVja2VkOiB0cnVlfSwgdHJ1ZSk7XG4gICAgICAgICAgICAgIGlmICghaGVyby5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGhlcm9bMF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHN0YXR1cyAoKSB7XG4gICAgc3dpdGNoICgkc2NvcGUucGxheWVyLnN0YXR1cykge1xuICAgICAgY2FzZSAnb3Blbic6XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAncXVldWUnOlxuICAgICAgICAkdGltZW91dChtYXRjaE1ha2luZywgNzAwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZm91bmQnOlxuICAgICAgICBwbGF5ZXJGb3VuZCgpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbmZpcm1lZCc6XG4gICAgICAgICR0aW1lb3V0KHdhaXRpbmdGb3JPcHBvbmVudCwgNzAwMCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWZrJzpcbiAgICAgICAgYmFja1RvUXVldWUoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdwbGF5aW5nJzpcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICBwbGF5ZXJDYW5jZWxsZWQoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gYmFja1RvUXVldWUgKCkge1xuICAgICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaCBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+WW91ciBPcHBvbmVudDwvc3Ryb25nPjxicj4gZmFpbGVkIHRvIGNvbmZpcm0hPC9kaXY+JyxcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5CYWNrPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1hc3NlcnRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPlF1ZXVlIEFnYWluPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmNhbmNlbE1hdGNoKCRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIHdhaXRpbmdGb3JPcHBvbmVudCAoKSB7XG4gICAgUGFyc2UuQ2xvdWQucnVuKCdDb25maXJtTWF0Y2gnKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgIE1hdGNoU2VydmljZXMuZ2V0Q29uZmlybWVkTWF0Y2goKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgIGlmKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdwbGF5aW5nJyk7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldEN1cnJlbnRTdGF0dXMoKSB7XG4gICAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlci5jdXJyZW50KCkpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgICAgaWYgKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAgICAgc3RhdHVzKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYXRjaE1ha2luZygpIHtcbiAgICBQYXJzZS5DbG91ZC5ydW4oJ01hdGNoTWFraW5nJykudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICBnZXRDdXJyZW50U3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5ZXJGb3VuZCgpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+QSBXb3J0aHkgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGhhcyBiZWVuIGZvdW5kITwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+Q2FuY2VsPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1hc3NlcnRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCdwZW5kaW5nJykudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgIGlmKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgICAgICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgICAgICAgICBtYXRjaGVzWzBdLnNldCgnY29uZmlybTEnLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIG1hdGNoZXNbMF0uc2V0KCdjb25maXJtMicsIHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF0Y2hlc1swXS5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwbGF5ZXJDYW5jZWxsZWQoKTtcbiAgICAgIH1cblxuICAgIH0pO1xuICB9XG4gIFxuICBmdW5jdGlvbiBzdGFydFRpbWVyKCkge1xuICAgIC8vVE9ETyBkbyB0aW1lclxuICB9XG5cbiAgZnVuY3Rpb24gcGxheWVyQ2FuY2VsbGVkKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIuY2FuY2VsVGltZXIpIHtcbiAgICAgIGlmKG1vbWVudCgkc2NvcGUucGxheWVyLmNhbmNlbFRpbWVyKS5pc0FmdGVyKCkpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICRzY29wZS5wbGF5ZXIudW5zZXQoJ2NhbmNlbFRpbWVyJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHN0YXJ0VGltZXIoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIHRpbWUgPSBtb21lbnQoKS5hZGQoJzInLCAnbWludXRlcycpLmZvcm1hdCgpO1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdjYW5jZWxsZWQnKTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdjYW5jZWxUaW1lcicsIHRpbWUpO1xuICAgICAgc2F2ZVBsYXllcigpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5nZVdvcmQgKCkge1xuICAgICRzY29wZS5teU9wcG9uZW50Lm5hbWUgPSAkc2NvcGUub3Bwb25lbnQubGlzdFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqJHNjb3BlLm9wcG9uZW50Lmxpc3QubGVuZ3RoKV07XG5cbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVySm9pbkN0cmwnLCBbJyRzY29wZScsICckZmlsdGVyJywgJyRpb25pY1BvcHVwJywgJyRzdGF0ZScsICckaW9uaWNIaXN0b3J5JywgJyRxJywgJ1BhcnNlJywgJ3RvdXJuYW1lbnQnLCAnTGFkZGVyU2VydmljZXMnLCBMYWRkZXJKb2luQ3RybF0pO1xuXG5mdW5jdGlvbiBMYWRkZXJKb2luQ3RybFxuKCRzY29wZSwgJGZpbHRlciwgJGlvbmljUG9wdXAsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgJHEsIFBhcnNlLCAgdG91cm5hbWVudCwgTGFkZGVyU2VydmljZXMpIHtcbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnRbMF0udG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcbiAgJHNjb3BlLnBsYXllciA9IHtcbiAgICBiYXR0bGVUYWc6ICcnXG4gIH07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhbGlkYXRlQmF0dGxlVGFnKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci51c2VybmFtZSA9ICRzY29wZS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAkc2NvcGUucGxheWVyLnN0YXR1cyA9ICdvcGVuJztcbiAgICAgICAgTGFkZGVyU2VydmljZXMuam9pblRvdXJuYW1lbnQoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLCAkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICBTdWNjZXNzUG9wdXAocGxheWVyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBFcnJvclBvcHVwKGVycm9yKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQmF0dGxlVGFnICgpIHtcbiAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0YWcgPSAkc2NvcGUucGxheWVyLmJhdHRsZVRhZztcblxuICAgIGlmKHRhZy5sZW5ndGggPCA4KSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBiYXR0bGUgdGFnJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIHNwbGl0ID0gdGFnLnNwbGl0KCcjJyk7XG4gICAgaWYoc3BsaXQubGVuZ3RoICE9PSAyKSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBCQVRUTEVUQUfihKIgaW5jbHVkaW5nICMgYW5kIGZvdXIgZGlnaXRzJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoc3BsaXRbMV0ubGVuZ3RoIDwgMiB8fCBzcGxpdFsxXS5sZW5ndGggPiA0KSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIHVwIHRvIGZvdXIgZGlnaXRzIGFmdGVyICMhJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoaXNOYU4oc3BsaXRbMV0pKSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIGZvdXIgZGlnaXRzIGFmdGVyICMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBMYWRkZXJTZXJ2aWNlcy52YWxpZGF0ZVBsYXllcigkc2NvcGUudG91cm5hbWVudC50b3VybmFtZW50LCB0YWcpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgIGlmKHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIGNiLnJlamVjdCgnVGhlIEJBVFRMRVRBR+KEoiB5b3UgZW50ZXJlZCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiLnJlc29sdmUodGFnKTtcbiAgICAgIH0gXG4gICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1JlZ2lzdHJhdGlvbiBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFN1Y2Nlc3NQb3B1cCAocGxheWVyKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnQ29uZ3JhdHVsYXRpb25zICcgKyBwbGF5ZXIudXNlcm5hbWUgKyAnIScsXG4gICAgICB0ZW1wbGF0ZTogJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSBzaWduZWQgdXAhIE5vdyBnbyBmaW5kIGEgdmFsaWFudCBvcHBvbmVudC4nXG4gICAgfSk7XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkc0N0cmwnLCBMZWFkZXJCb2FyZHNDdHJsKTtcblxuTGVhZGVyQm9hcmRzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnTGFkZGVyU2VydmljZXMnLCAndG91cm5hbWVudCcsICdQYXJzZScsICckZmlsdGVyJywgJyRpb25pY1BvcHVwJ107XG5mdW5jdGlvbiBMZWFkZXJCb2FyZHNDdHJsKCRzY29wZSwgTGFkZGVyU2VydmljZXMsIHRvdXJuYW1lbnQsIFBhcnNlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudFswXS50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgdmFyIHJhbmsgPSAxO1xuICAgIGFuZ3VsYXIuZm9yRWFjaChwbGF5ZXJzLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICByYW5rKys7XG4gICAgfSk7XG4gICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICB9KTtcblxuICAkc2NvcGUuc2hvd0RldGFpbHMgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgJHNjb3BlLmhlcm9lcyA9IHBsYXllci5oZXJvZXM7XG4gICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6IHBsYXllci51c2VybmFtZSArICcgSGVyb2VzJyxcbiAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICB0ZW1wbGF0ZTpcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtMjUgdGV4dC1jZW50ZXJcIiBuZy1yZXBlYXQ9XCJoZXJvIGluIGhlcm9lc1wiPicgK1xuICAgICAgICAnPGltZyBuZy1zcmM9XCJpbWcvaWNvbnMve3toZXJvfX0ucG5nXCIgY2xhc3M9XCJyZXNwb25zaXZlLWltZ1wiIHN0eWxlPVwicGFkZGluZzozcHg7XCI+e3toZXJvfX0nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5Mb2dpbkN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNIaXN0b3J5J107XG5mdW5jdGlvbiBMb2dpbkN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICRzY29wZS51c2VyID0ge307XG4gIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2UuVXNlci5sb2dJbigkc2NvcGUudXNlci51c2VybmFtZSwgJHNjb3BlLnVzZXIucGFzc3dvcmQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24gKHVzZXIsIGVycm9yKSB7XG4gICAgICAgICRzY29wZS53YXJuaW5nID0gZXJyb3IubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndXNlcicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcbiAgICAkc2NvcGUud2FybmluZyA9IG51bGw7XG4gIH0sIHRydWUpO1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFZpZXdDdHJsJywgTWF0Y2hWaWV3Q3RybCk7XG5cbk1hdGNoVmlld0N0cmwuJGluamVjdCA9IFtcbiAgJyRzY29wZScsICckc3RhdGUnLCAnJHRpbWVvdXQnLCAnJGlvbmljUG9wdXAnLCAnJGlvbmljSGlzdG9yeScsICdQYXJzZScsICdMYWRkZXJTZXJ2aWNlcycsICdNYXRjaFNlcnZpY2VzJywgJ1F1ZXVlU2VydmljZXMnLCAndG91cm5hbWVudCcsICdtYXRjaCdcbl07XG5mdW5jdGlvbiBNYXRjaFZpZXdDdHJsKCRzY29wZSwgJHN0YXRlLCAkdGltZW91dCwgJGlvbmljUG9wdXAsICRpb25pY0hpc3RvcnksIFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcywgdG91cm5hbWVudCwgbWF0Y2gpIHtcbiAgJHNjb3BlLmNvdW50ID0gMDtcbiAgJHNjb3BlLm1hdGNoID0gbWF0Y2hbMF07XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXG5cbiAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlcikudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgIGlmICgkc2NvcGUucGxheWVyKSB7XG4gICAgICBnZXRNYXRjaERldGFpbHMoKTtcbiAgICB9XG4gIH0pO1xuXG4gICRzY29wZS5yZWNvcmQgPSBmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRNYXRjaCgnYWN0aXZlJykudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgaWYobWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIG1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgc3dpdGNoIChyZWNvcmQpIHtcbiAgICAgICAgICBjYXNlICd3aW4nOlxuICAgICAgICAgICAgbWF0Y2guc2V0KCd3aW5uZXInLCAkc2NvcGUudXNlcik7XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbG9zcyc6XG4gICAgICAgICAgICBtYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5vcHBvbmVudC51c2VyKTtcbiAgICAgICAgICAgIG1hdGNoLnNldCgnbG9zZXInLCAkc2NvcGUudXNlcik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBtYXRjaC5zZXQoJ3N0YXR1cycsICdjb21wbGV0ZWQnKTtcbiAgICAgICAgbWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgICB0aXRsZTogJ01hdGNoIFN1Ym1pdHRlZCcsXG4gICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+VGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHJlc3VsdHM8L2Rpdj4nXG4gICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICB0aXRsZTogJ01hdGNoIEVycm9yJyxcbiAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdXIgT3Bwb25lbnQgaGFzIGFscmVhZHkgdXBkYXRlZCByZXN1bHRzITwvZGl2PidcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldE1hdGNoRGV0YWlscygpIHtcbiAgICAkc2NvcGUub3Bwb25lbnQgPSB7XG4gICAgICBoZXJvOiBudWxsLFxuICAgICAgYmF0dGxlVGFnOiBudWxsXG4gICAgfVxuXG4gICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgJHNjb3BlLm9wcG9uZW50Lmhlcm8gPSAkc2NvcGUubWF0Y2guaGVybzI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWUgPSAkc2NvcGUubWF0Y2gudXNlcm5hbWUyO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LmJhdHRsZVRhZyA9ICRzY29wZS5tYXRjaC5iYXR0bGVUYWcyO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXIgPSAkc2NvcGUubWF0Y2gudXNlcjI7XG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMicpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8xO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnVzZXIxO1xuICAgIH1cbiAgfVxufTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcbiAgLmNvbnRyb2xsZXIoJ01lbnVDdHJsJywgTWVudUN0cmwpO1xuXG5NZW51Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCckaW9uaWNQb3BvdmVyJywgJyRzdGF0ZScsICckaW9uaWNIaXN0b3J5JywgJ1BhcnNlJ107XG5mdW5jdGlvbiBNZW51Q3RybCgkc2NvcGUsICRpb25pY1BvcG92ZXIsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgUGFyc2UpIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuXG4gICRpb25pY1BvcG92ZXIuZnJvbVRlbXBsYXRlVXJsKCd0ZW1wbGF0ZXMvcG9wb3ZlcnMvcHJvZmlsZS5wb3AuaHRtbCcsIHtcbiAgICBzY29wZTogJHNjb3BlLFxuICB9KS50aGVuKGZ1bmN0aW9uKHBvcG92ZXIpIHtcbiAgICAkc2NvcGUucG9wb3ZlciA9IHBvcG92ZXI7XG4gIH0pO1xuXG4gICRzY29wZS5tZW51ID0gZnVuY3Rpb24gKGxpbmspIHtcbiAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgIH0pO1xuICAgICRzdGF0ZS5nbygnYXBwLicgKyBsaW5rLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgJHNjb3BlLnBvcG92ZXIuaGlkZSgpO1xuICB9XG4gIC8vQ2xlYW51cCB0aGUgcG9wb3ZlciB3aGVuIHdlJ3JlIGRvbmUgd2l0aCBpdCFcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wb3Zlci5yZW1vdmUoKTtcbiAgfSk7XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgUmVnaXN0ZXJDdHJsKTtcblxuUmVnaXN0ZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIFJlZ2lzdGVyQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY1BvcHVwKSB7XG5cbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuUmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB2YXIgcmVnaXN0ZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgIHJlZ2lzdGVyLnNldCh1c2VyKTtcbiAgICByZWdpc3Rlci5zaWduVXAobnVsbCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgQWRtaW5Sb3V0ZXNdKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBMYWRkZXJSb3V0ZXNdKTtcblxuZnVuY3Rpb24gTGFkZGVyUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyJywge1xuICAgICAgdXJsOiAnL2xhZGRlcicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGFkZGVyLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIubGVhZGVyYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvbGVhZGVyYm9hcmRzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sZWFkZXJib2FyZC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZHNDdHJsJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmpvaW4nLCB7XG4gICAgICB1cmw6ICcvam9pbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvam9pbi5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMYWRkZXJKb2luQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBNYXRjaFJvdXRlc10pO1xuXG5mdW5jdGlvbiBNYXRjaFJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoJywge1xuICAgICAgdXJsOiAnL21hdGNoJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmh0bWwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnZpZXcnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC52aWV3Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoVmlld0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBtYXRjaDogZnVuY3Rpb24gKE1hdGNoU2VydmljZXMsICRzdGF0ZSwgJHEpIHtcbiAgICAgICAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJ2FjdGl2ZScpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIGlmKCFtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYi5yZWplY3QoKTtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYi5yZXNvbHZlKG1hdGNoZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdMYWRkZXJTZXJ2aWNlcycsIFsnUGFyc2UnLCAnTGFkZGVyJywgTGFkZGVyU2VydmljZXNdKVxuICAuZmFjdG9yeSgnTGFkZGVyJywgWydQYXJzZScsIExhZGRlcl0pO1xuXG5mdW5jdGlvbiBMYWRkZXJTZXJ2aWNlcyhQYXJzZSwgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UGxheWVyczogZ2V0UGxheWVycyxcbiAgICBnZXRQbGF5ZXI6IGdldFBsYXllcixcbiAgICB2YWxpZGF0ZVBsYXllcjogdmFsaWRhdGVQbGF5ZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVycyh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoJ3BvaW50cycsICdtbXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUGxheWVyKHRvdXJuZXksIGJhdHRsZVRhZykge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5lcXVhbFRvKCdiYXR0bGVUYWcnLCBiYXR0bGVUYWcpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyKHRvdXJuZXksIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCB1c2VyLCB1c2VyRGF0YSkge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKHVzZXJEYXRhKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIHVzZXIpO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBMYWRkZXIoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTGFkZGVyJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3VzZXInLCAnYmF0dGxlVGFnJywgJ3VzZXJuYW1lJywgJ2hlcm8nLCAncGxheWVyJywgJ3N0YXR1cycsICdjYW5jZWxUaW1lcicsICd3aW5zJywgJ2xvc3NlcycsICdtbXInLCAncG9pbnRzJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ01hdGNoU2VydmljZXMnLCBbJ1BhcnNlJywgJ01hdGNoJywgTWF0Y2hTZXJ2aWNlc10pXG4gIC5mYWN0b3J5KCdNYXRjaCcsIFsnUGFyc2UnLCBNYXRjaF0pO1xuXG5mdW5jdGlvbiBNYXRjaFNlcnZpY2VzKFBhcnNlLCBNYXRjaCkge1xuICB2YXIgdXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICByZXR1cm4ge1xuICAgIGdldE1hdGNoOiBnZXRNYXRjaCxcbiAgICBnZXRDb25maXJtZWRNYXRjaDogZ2V0Q29uZmlybWVkTWF0Y2hcbiAgfVxuICBmdW5jdGlvbiBnZXRDb25maXJtZWRNYXRjaCAoKSB7XG4gICAgdmFyIHBsYXllcjEgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcGxheWVyMS5lcXVhbFRvKCd1c2VybmFtZTEnLCB1c2VyLnVzZXJuYW1lKTtcbiAgICB2YXIgcGxheWVyMiA9IG5ldyBQYXJzZS5RdWVyeSgnTWF0Y2gnKTtcbiAgICBwbGF5ZXIyLmVxdWFsVG8oJ3VzZXJuYW1lMicsIHVzZXIudXNlcm5hbWUpO1xuXG4gICAgdmFyIG1haW5RdWVyeSA9IFBhcnNlLlF1ZXJ5Lm9yKHBsYXllcjEsIHBsYXllcjIpO1xuICAgIG1haW5RdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAnYWN0aXZlJyk7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0yJywgdHJ1ZSk7XG4gICAgcmV0dXJuIG1haW5RdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TWF0Y2goc3RhdHVzKSB7XG4gICAgdmFyIHBsYXllcjEgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcGxheWVyMS5lcXVhbFRvKCd1c2VybmFtZTEnLCB1c2VyLnVzZXJuYW1lKTtcbiAgICB2YXIgcGxheWVyMiA9IG5ldyBQYXJzZS5RdWVyeSgnTWF0Y2gnKTtcbiAgICBwbGF5ZXIyLmVxdWFsVG8oJ3VzZXJuYW1lMicsIHVzZXIudXNlcm5hbWUpO1xuXG4gICAgdmFyIG1haW5RdWVyeSA9IFBhcnNlLlF1ZXJ5Lm9yKHBsYXllcjEsIHBsYXllcjIpO1xuICAgIG1haW5RdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCBzdGF0dXMpO1xuICAgIHJldHVybiBtYWluUXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1hdGNoKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ01hdGNoJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gW1xuICAgICd0b3VybmFtZW50JywgJ3BsYXllcjEnLCAncGxheWVyMicsICdoZXJvMScsICdoZXJvMicsICd1c2VybmFtZTEnLCAndXNlcm5hbWUyJywgJ2JhdHRsZVRhZzEnLCAnYmF0dGxlVGFnMicsICdzdGF0dXMnLCAnd2lubmVyJywgJ2xvc2VyJyxcbiAgICAnc2NyZWVuc2hvdCcsICdyZXBvcnQnLCAncmVwb3J0ZWRTY3JlZW5zaG90JywgJ2FjdGl2ZURhdGUnLCAndXNlcjEnLCAndXNlcjInXG4gIF07XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnUXVldWVTZXJ2aWNlcycsW1F1ZXVlU2VydmljZXNdKVxuXG5mdW5jdGlvbiBRdWV1ZVNlcnZpY2VzKCkge1xuICB2YXIgb3Bwb25lbnQgPSB7XG4gICAgbGlzdDogWydFYXN5IFBpY2tpbmdzJywgJ1lvdXIgV29yc3QgTmlnaHRtYXJlJywgJ1dvcmxkIGNsYXNzIHBhc3RlIGVhdGVyJyxcbiAgICAgICdBIE11cmxvYycsICdHb3VyZCBjcml0aWMnLCAnTm9zZSBhbmQgbW91dGggYnJlYXRoZXInLCAnSG9nZ2VyJywgJ0EgY2FyZGlzaCBJYW4nLFxuICAgICAgJ01vcGV5IE1hZ2UnLCAnV29tYmF0IFdhcmxvY2snLCAnUm91Z2VkIHVwIFJvZ3VlJywgJ1dhaWZpc2ggV2FycmlvcicsICdEYW1wIERydWlkJyxcbiAgICAgICdTaGFiYnkgU2hhbWFuJywgJ1Blbm5pbGVzcyBQYWxhZGluJywgJ0h1ZmZ5IEh1bnRlcicsICdQZXJreSBQcmllc3QnLCAnVGhlIFdvcnN0IFBsYXllcicsXG4gICAgICAnWW91ciBPbGQgUm9vbW1hdGUnLCAnU3RhckNyYWZ0IFBybycsICdGaXNjYWxseSByZXNwb25zaWJsZSBtaW1lJywgJ1lvdXIgR3VpbGQgTGVhZGVyJyxcbiAgICAgICdOb25lY2sgR2VvcmdlJywgJ0d1bSBQdXNoZXInLCAnQ2hlYXRlciBNY0NoZWF0ZXJzb24nLCAnUmVhbGx5IHNsb3cgZ3V5JywgJ1JvYWNoIEJveScsXG4gICAgICAnT3JhbmdlIFJoeW1lcicsICdDb2ZmZWUgQWRkaWN0JywgJ0lud2FyZCBUYWxrZXInLCAnQmxpenphcmQgRGV2ZWxvcGVyJywgJ0dyYW5kIE1hc3RlcicsXG4gICAgICAnRGlhbW9uZCBMZWFndWUgUGxheWVyJywgJ0JyYW5kIE5ldyBQbGF5ZXInLCAnRGFzdGFyZGx5IERlYXRoIEtuaWdodCcsICdNZWRpb2NyZSBNb25rJyxcbiAgICAgICdBIExpdHRsZSBQdXBweSdcbiAgICBdXG4gIH07XG4gIHZhciBoZXJvZXMgPSBbXG4gICAge3RleHQ6ICdtYWdlJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnaHVudGVyJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncGFsYWRpbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcnJpb3InLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdkcnVpZCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcmxvY2snLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdzaGFtYW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwcmllc3QnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdyb2d1ZScsIGNoZWNrZWQ6IGZhbHNlfVxuICBdXG4gIHJldHVybiB7XG4gICAgb3Bwb25lbnQ6IG9wcG9uZW50LFxuICAgIGhlcm9lczogaGVyb2VzXG4gIH1cbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdUb3VybmFtZW50U2VydmljZXMnLCBbJ1BhcnNlJywgJyRxJywgJ1RvdXJuYW1lbnQnLCAnRGV0YWlscycsICdMYWRkZXInLCBUb3VybmFtZW50U2VydmljZXNdKVxuXG4gIC5mYWN0b3J5KCdUb3VybmFtZW50JywgWydQYXJzZScsIFRvdXJuYW1lbnRdKVxuICAuZmFjdG9yeSgnRGV0YWlscycsIFsnUGFyc2UnLCBEZXRhaWxzXSk7XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnRTZXJ2aWNlcyhQYXJzZSwgJHEsIFRvdXJuYW1lbnQsIERldGFpbHMsIExhZGRlcikge1xuICByZXR1cm4ge1xuICAgIGdldFRvdXJuYW1lbnQ6IGdldFRvdXJuYW1lbnQsXG4gICAgY3JlYXRlVG91cm5hbWVudDogY3JlYXRlVG91cm5hbWVudCxcbiAgICBnZXRMYWRkZXI6IGdldExhZGRlcixcbiAgICBqb2luVG91cm5hbWVudDogam9pblRvdXJuYW1lbnRcbiAgfVxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCBwbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbChwbGF5ZXIpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgUGFyc2UuVXNlci5jdXJyZW50KCkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXJuYW1lJywgUGFyc2UuVXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuICAgIHBsYXllci5zZXQoJ21tcicsIDEwMDApO1xuICAgIHBsYXllci5zZXQoJ3dpbnMnLCAwKTtcbiAgICBwbGF5ZXIuc2V0KCdsb3NzZXMnLCAwKTtcbiAgICBwbGF5ZXIuc2V0KCdwb2ludHMnLCAwKTtcbiAgICByZXR1cm4gcGxheWVyLnNhdmUoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRUb3VybmFtZW50KCkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShEZXRhaWxzLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0eXBlJywgJ2xhZGRlcicpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3RvdXJuYW1lbnQnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZVRvdXJuYW1lbnQgKCkge1xuICAgIHZhciBkZWZlciA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRvdXJuYW1lbnQgPSBuZXcgVG91cm5hbWVudC5Nb2RlbCgpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCduYW1lJywgJ09OT0cgT1BFTicpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCdzdGF0dXMnLCAncGVuZGluZycpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCdnYW1lJywgJ2hlYXJ0aHN0b25lJyk7XG4gICAgdG91cm5hbWVudC5zYXZlKCkudGhlbihmdW5jdGlvbiAodG91cm5leSkge1xuICAgICAgdmFyIGRldGFpbHMgPSBuZXcgRGV0YWlscy5Nb2RlbCgpO1xuICAgICAgZGV0YWlscy5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICAgIGRldGFpbHMuc2V0KCd0eXBlJywgJ2xhZGRlcicpO1xuICAgICAgZGV0YWlscy5zZXQoJ3BsYXllckNvdW50JywgMCk7XG4gICAgICBkZXRhaWxzLnNldCgnbnVtT2ZHYW1lcycsIDUpO1xuICAgICAgZGV0YWlscy5zYXZlKCkudGhlbihmdW5jdGlvbiAoZGV0YWlscykge1xuICAgICAgICBkZWZlci5yZXNvbHZlKGRldGFpbHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TGFkZGVyICh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3BsYXllcicpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gVG91cm5hbWVudChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdUb3VybmFtZW50Jyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyduYW1lJywgJ2dhbWUnLCAnc3RhdHVzJywgJ2Rpc2FibGVkJywgJ2Rpc2FibGVkUmVhc29uJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbmZ1bmN0aW9uIERldGFpbHMoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnRGV0YWlscycpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsndG91cm5hbWVudCcsICd0eXBlJywgJ251bU9mR2FtZXMnLCAncGxheWVyQ291bnQnXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
