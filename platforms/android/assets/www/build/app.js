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
      console.log('yes');
      ParsePushPlugin.on('receivePN', function(pn){
        alert('yo i got this push notification:' + JSON.stringify(pn));
      });

      //
      //you can also listen to your own custom subevents
      //
      ParsePushPlugin.on('receivePN:chat', chatEventHandler);
      ParsePushPlugin.on('receivePN:serverMaintenance', serverMaintenanceHandler);
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
  var promise;
  $scope.user = Parse.User;
  $scope.status = 'open';
  $scope.tournament = tournament[0].tournament;

  LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
    $scope.player = players;
    if($scope.player.length) {
      QueueServices.checkStatus($scope.tournament, $scope.user.current()).then(function (queues) {
        $scope.queue = queues;
        MatchServices.getMatch().then(function (matches) {
          $scope.match = matches;
          checkUserStatus();
        });
      });
    } else {
      $scope.queue = [];
      $scope.match = [];
      checkUserStatus();
    }
  });

  $scope.heroList = QueueServices.heroes;
  $scope.selected = {status: true};

  $scope.opponent = QueueServices.opponent;
  $scope.myOpponent = {name:'PAX Attendee'};

  $scope.startQueue = function () {
    joinQueuePopup();
  };

  $scope.cancelQueue = function () {
    QueueServices.cancelQueue($scope.queue[0]).then(function () {
      $scope.status = 'open';
      $scope.queue = [];
      $scope.stop();
    });
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

  function joinQueuePopup () {
    $scope.selected.status = true;
    var heroes = $filter('filter')($scope.heroList, {checked: true}, true);
    if(heroes.length) {
      heroes[0].checked = false;
    }
    $ionicPopup.show(
      {
        templateUrl: 'templates/popups/select.hero.html',
        title: 'Select Hero Class',
        scope: $scope,
        buttons: [
          { text: 'Cancel' },
          {
            text: '<b>Queue</b>',
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
      })
      .then(function (res) {
        if(res) {
          QueueServices.joinQueue($scope.tournament, $scope.user.current(), res.text, $scope.player[0].battleTag).then(function (queue) {
            $scope.status = 'queue';
            $scope.queue.push(queue);
            $scope.startSearch();
            checkStatus();
          });
        }

      });
  };

  function checkUserStatus() {
    if(!$scope.user.current()) {
      $scope.status = 'unauthorized';
      return;
    }
    if(!$scope.player.length) {
      $scope.status = 'unregistered'
      return;
    }
    if($scope.queue.length) {
      $scope.status = 'queue';
      checkStatus();
      return;
    }
    if($scope.match.length) {
      $scope.status = 'match';
      return;
    }
    $scope.status = 'open';
  };

  function checkStatus () {
    QueueServices.checkStatus($scope.tournament, $scope.user.current()).then(function (queue) {
      if(!queue.length) {
        $scope.searching = false;
        return;
      }

      if(queue[0].status === 'pending') {
        $scope.queue[0] = queue[0];
        $scope.startSearch();
      }


      if(queue[0].status === 'found') {
        $scope.status = 'match';
        worthyPopup(queue[0]);
        return;
      }

      if(queue[0].status === 'completed') {
        console.log(queue);
      }
      Parse.Cloud.run('MatchMaking').then(function(ratings) {
        console.log(ratings);
        $timeout(checkStatus, 7000);
      });

    });
  };

  function worthyPopup(queue) {
    var queue = queue;
    $ionicPopup.alert({
      title: 'Matchmaking',
      template: '<div class="text-center"><strong>A Worthy Opponent</strong><br> has been found!</div>'
    }).then(function(res) {
      queue.set('status', 'completed');
      queue.save().then(function () {
        $scope.status = 'match';
        $state.go('app.match.view');
      });
    });
  };

  function changeWord () {
    $scope.myOpponent.name = $scope.opponent.list[Math.floor(Math.random()*$scope.opponent.list.length)];

  };
};


angular.module('ONOG.Controllers')

  .controller('LadderJoinCtrl', LadderJoinCtrl);

LadderJoinCtrl.$inject =
  [
    '$scope', 'Parse', '$filter', '$ionicPopup', '$state', '$ionicHistory', 'tourney', 'TournamentServices', 'LadderServices', '$q'
  ];
function LadderJoinCtrl
($scope, Parse, $filter, $ionicPopup, $state, $ionicHistory, tourney, TourneyServices, LadderServices, $q) {
  $scope.tournament = tourney[0];
  $scope.user = Parse.User.current();
  $scope.player = {
    battleTag: ''
  };

  $scope.registerPlayer = function () {
    validateBattleTag().then(
      function (tag) {
        TourneyServices.joinTournament($scope.tournament.tournament, $scope.player).then(function (player) {
          $scope.tournament.increment('playerCount');
          $scope.tournament.save().then(function () {
            SuccessPopup(player).then(function(res) {
              $ionicHistory.nextViewOptions({
                disableBack: true
              });
              $state.go('app.dashboard');
            });
          })
        
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
      title: 'Congratulations ' + player.battleTag + '!',
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

MatchViewCtrl.$inject = ['$scope', '$state', '$timeout', '$ionicPopup', '$ionicHistory', 'Parse', 'LadderServices', 'MatchServices', 'QueueServices'];
function MatchViewCtrl($scope, $state, $timeout, $ionicPopup, $ionicHistory, Parse, LadderServices, MatchServices, QueueServices) {
  $scope.count = 0;
  $scope.user = Parse.User.current();
  
  MatchServices.getMatch().then(function (matches) {
    if(!matches.length) {
      $state.go('app.dashboard');
    } else {
      $scope.match = matches[0];
      getMatchDetails();
    }
  });
  
  $scope.record = function (record) {
    MatchServices.getMatch().then(function (matches) {
      if(matches.length) {
        var match = matches[0];
        if(match.get('status') === 'active') {
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
            $ionicPopup.alert({
              title: 'Match Submitted',
              template: '<div class="text-center">Thank you for submitting results</div>'
            }).then(function (res) {
              $ionicHistory.nextViewOptions({
                disableBack: true
              });
              $state.go('app.dashboard');
            });
          })
        }
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
    if($scope.match.player1.id === $scope.user.id) {
      $scope.opponent.hero = $scope.match.hero2;
      $scope.opponent.username = $scope.match.username2;
      $scope.opponent.battleTag = $scope.match.battleTag2;
      $scope.opponent.user = $scope.match.player2;
    }
    if($scope.match.player2.id === $scope.user.id) {
      $scope.opponent.hero = $scope.match.hero1;
      $scope.opponent.username = $scope.match.username1;
      $scope.opponent.battleTag = $scope.match.battleTag1;
      $scope.opponent.user = $scope.match.player1;
    }
    opponentFound();
  }
  function opponentFound() {
    QueueServices.opponentHasConfirmed($scope.opponent.user).then(function (queue) {
      if(queue.length) {
        $scope.noOpponent = true;
        if($scope.count < 2) {
          $scope.count++;
        } else {
          queue[0].destroy().then(function () {
            $scope.match.destroy().then(function () {
              $ionicPopup.alert({
                title: 'Match Error',
                template: '<div class="text-center">Your Opponent never confirmed!</div>'
              }).then(function(res) {
                $ionicHistory.nextViewOptions({
                  disableBack: true
                });
                $state.go('app.dashboard');
              });
            });
          });
        }
      } else {
        $scope.noOpponent = false;
        return;
      }
      $timeout(opponentFound, 15000);
    });
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
      controller: 'LadderJoinCtrl',
      resolve: {
        tourney: function (TournamentServices) {
          return TournamentServices.getTournament();
        }
      }
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
    })
}


angular.module('ONOG.Services')

  .service('LadderServices', ['Parse', 'Ladder', LadderServices])
  .factory('Ladder', ['Parse', Ladder]);

function LadderServices(Parse, Ladder) {
  return {
    getPlayers: getPlayers,
    getPlayer: getPlayer,
    validatePlayer: validatePlayer
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
    return query.find();
  }
};

function Ladder(Parse) {
  var Model = Parse.Object.extend('Ladder');
  var attributes = ['tournament', 'user','battleTag', 'username', 'heroes', 'wins', 'losses', 'mmr', 'points'];
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
    getMatch: getMatch
  }
  function getMatch() {
    var player1 = new Parse.Query('Match');
    player1.equalTo('username1', user.username);
    var player2 = new Parse.Query('Match');
    player2.equalTo('username2', user.username);
    
    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.equalTo('status', 'active');
    return mainQuery.find();
  }
}

function Match(Parse) {
  var Model = Parse.Object.extend('Match');
  var attributes = [
    'tournament', 'player1', 'player2', 'hero1', 'hero2', 'username1', 'username2', 'battleTag1', 'battleTag2', 'status', 'winner', 'loser',
    'screenshot', 'report', 'reportedScreenshot'
  ];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}

angular.module('ONOG.Services')

  .service('QueueServices',['Parse', 'Queue',  QueueServices])
  .factory('Queue', ['Parse', Queue]);

function QueueServices(Parse, Queue) {
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
    heroes: heroes,
    checkStatus: checkStatus,
    joinQueue: joinQueue,
    cancelQueue: cancelQueue,
    opponentHasConfirmed: opponentHasConfirmed
  }
  
  function opponentHasConfirmed(user) {
    var query = new Parse.Query(Queue.Model);
    query.equalTo('user', user);
    query.equalTo('status', 'found');
    return query.find();
  }

  function checkStatus(tournament, user) {
    var query = new Parse.Query(Queue.Model);
    query.equalTo('user', user);
    query.containedIn('status', ['pending', 'found']);
    query.equalTo('tournament', tournament);
    return query.find();
  }

  function joinQueue(tournament, user, hero, battleTag) {
    var queue = new Queue.Model();
    queue.set('user', user);
    queue.set('tournament', tournament);
    queue.set('status', 'pending');
    queue.set('battleTag', battleTag);
    queue.set('hero', hero);
    return queue.save();
  }

  function cancelQueue(cancel) {
    var queue = new Queue.Model();
    queue.id = cancel.id;
    return queue.destroy();
  }
}

function Queue(Parse) {
  var Model = Parse.Object.extend('Queue');
  var attributes = ['tournament', 'user', 'status', 'hero', 'battleTag'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC52aWV3LmN0cmwuanMiLCJjb250cm9sbGVycy9tZW51LmN0cmwuanMiLCJjb250cm9sbGVycy9yZWdpc3Rlci5jdHJsLmpzIiwicm91dGVzL2FkbWluLnJvdXRlcy5qcyIsInJvdXRlcy9sYWRkZXIucm91dGVzLmpzIiwicm91dGVzL21hdGNoLnJvdXRlcy5qcyIsInNlcnZpY2VzL2xhZGRlci5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL21hdGNoLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDaEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5R0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ09OT0cnLCBbXG4gICdpb25pYycsXG4gICduZ1BhcnNlJyxcbiAgJ25nQ29yZG92YScsXG4gICduZ0FuaW1hdGUnLFxuICAnT05PRy5Db250cm9sbGVycycsXG4gICdPTk9HLlNlcnZpY2VzJ1xuXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckaW9uaWNDb25maWdQcm92aWRlcicsICckY29tcGlsZVByb3ZpZGVyJywgJ1BhcnNlUHJvdmlkZXInLCBjb25maWddKTtcblxuZnVuY3Rpb24gY29uZmlnICgkaW9uaWNDb25maWdQcm92aWRlciwgJGNvbXBpbGVQcm92aWRlciwgUGFyc2VQcm92aWRlcikge1xuXG4gICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8YmxvYnxjb250ZW50fG1zLWFwcHh8eC13bWFwcDApOnxkYXRhOmltYWdlXFwvfGltZ1xcLy8pO1xuICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xmaWxlfGdodHRwcz98bXMtYXBweHx4LXdtYXBwMCk6Lyk7XG5cbiAgUGFyc2VQcm92aWRlci5pbml0aWFsaXplKFwibllzQjZ0bUJNWUtZTXpNNWlWOUJVY0J2SFdYODlJdFBYNUdmYk42UVwiLCBcInpyaW44R0VCRFZHYmtsMWlvR0V3bkh1UDcwRmRHNkhoelRTOHVHanpcIik7XG5cbiAgaWYgKGlvbmljLlBsYXRmb3JtLmlzSU9TKCkpIHtcbiAgICAkaW9uaWNDb25maWdQcm92aWRlci5zY3JvbGxpbmcuanNTY3JvbGxpbmcodHJ1ZSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJywgW10pO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsICckdXJsUm91dGVyUHJvdmlkZXInLCByb3V0ZXNdKTtcblxuZnVuY3Rpb24gcm91dGVzICgkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyKSB7XG5cbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnYXBwL2Rhc2hib2FyZCcpO1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICB1cmw6ICcvYXBwJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWVudS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNZW51Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuZGFzaGJvYXJkJywge1xuICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAucmVnaXN0ZXInLCB7XG4gICAgICB1cmw6ICcvcmVnaXN0ZXInLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3JlZ2lzdGVyLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG5cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcblxuICAucnVuKFsnJGlvbmljUGxhdGZvcm0nLCBydW5dKTtcblxuZnVuY3Rpb24gcnVuICgkaW9uaWNQbGF0Zm9ybSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKXtcbiAgICAgIGNvbnNvbGUubG9nKCd5ZXMnKTtcbiAgICAgIFBhcnNlUHVzaFBsdWdpbi5vbigncmVjZWl2ZVBOJywgZnVuY3Rpb24ocG4pe1xuICAgICAgICBhbGVydCgneW8gaSBnb3QgdGhpcyBwdXNoIG5vdGlmaWNhdGlvbjonICsgSlNPTi5zdHJpbmdpZnkocG4pKTtcbiAgICAgIH0pO1xuXG4gICAgICAvL1xuICAgICAgLy95b3UgY2FuIGFsc28gbGlzdGVuIHRvIHlvdXIgb3duIGN1c3RvbSBzdWJldmVudHNcbiAgICAgIC8vXG4gICAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTjpjaGF0JywgY2hhdEV2ZW50SGFuZGxlcik7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTjpzZXJ2ZXJNYWludGVuYW5jZScsIHNlcnZlck1haW50ZW5hbmNlSGFuZGxlcik7XG4gICAgfVxuICB9KTtcbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJywgW10pO1xuXG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5NYXRjaGVzQ3RybCcsIEFkbWluTWF0Y2hlc0N0cmwpO1xuXG5BZG1pbk1hdGNoZXNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYXJzZSddO1xuZnVuY3Rpb24gQWRtaW5NYXRjaGVzQ3RybCgkc2NvcGUsIFBhcnNlKSB7XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblBsYXllcnNDdHJsJywgQWRtaW5QbGF5ZXJzQ3RybCk7XG5cbkFkbWluUGxheWVyc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ1BhcnNlJ107XG5mdW5jdGlvbiBBZG1pblBsYXllcnNDdHJsKCRzY29wZSwgUGFyc2UpIHtcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluU2V0dGluZ3NDdHJsJywgQWRtaW5TZXR0aW5nc0N0cmwpO1xuXG5BZG1pblNldHRpbmdzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnVG91cm5hbWVudFNlcnZpY2VzJywgJ25ld1RvdXJuYW1lbnQnXTtcblxuZnVuY3Rpb24gQWRtaW5TZXR0aW5nc0N0cmwoJHNjb3BlLCBUb3VybmFtZW50U2VydmljZXMsIG5ld1RvdXJuYW1lbnQpIHtcbiAgJHNjb3BlLmRldGFpbHMgPSBuZXdUb3VybmFtZW50O1xuICBcbiAgLy8gVG91cm5hbWVudFNlcnZpY2VzLmdldExhZGRlcigkc2NvcGUudG91cm5hbWVudC50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChsYWRkZXIpIHtcbiAgLy8gICAkc2NvcGUubGFkZGVyID0gbGFkZGVyO1xuICAvLyB9KTtcbiAgXG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDdHJsJyxcbiAgICBbXG4gICAgICAnJHNjb3BlJywgJyRzdGF0ZScsICckZmlsdGVyJywgJyR0aW1lb3V0JywgJyRpbnRlcnZhbCcsICckaW9uaWNQb3B1cCcsXG4gICAgICAnUGFyc2UnLCAndG91cm5hbWVudCcsICdNYXRjaFNlcnZpY2VzJywgJ1F1ZXVlU2VydmljZXMnLCAnTGFkZGVyU2VydmljZXMnLFxuICAgICAgRGFzaGJvYXJkQ3RybFxuICAgIF0pO1xuXG5mdW5jdGlvbiBEYXNoYm9hcmRDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGZpbHRlciwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJGlvbmljUG9wdXAsXG4gIFBhcnNlLCB0b3VybmFtZW50LCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCBMYWRkZXJTZXJ2aWNlc1xuKSB7XG4gIHZhciBwcm9taXNlO1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gICRzY29wZS5zdGF0dXMgPSAnb3Blbic7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudFswXS50b3VybmFtZW50O1xuXG4gIExhZGRlclNlcnZpY2VzLmdldFBsYXllcigkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnM7XG4gICAgaWYoJHNjb3BlLnBsYXllci5sZW5ndGgpIHtcbiAgICAgIFF1ZXVlU2VydmljZXMuY2hlY2tTdGF0dXMoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocXVldWVzKSB7XG4gICAgICAgICRzY29wZS5xdWV1ZSA9IHF1ZXVlcztcbiAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRNYXRjaCgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzO1xuICAgICAgICAgIGNoZWNrVXNlclN0YXR1cygpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucXVldWUgPSBbXTtcbiAgICAgICRzY29wZS5tYXRjaCA9IFtdO1xuICAgICAgY2hlY2tVc2VyU3RhdHVzKCk7XG4gICAgfVxuICB9KTtcblxuICAkc2NvcGUuaGVyb0xpc3QgPSBRdWV1ZVNlcnZpY2VzLmhlcm9lcztcbiAgJHNjb3BlLnNlbGVjdGVkID0ge3N0YXR1czogdHJ1ZX07XG5cbiAgJHNjb3BlLm9wcG9uZW50ID0gUXVldWVTZXJ2aWNlcy5vcHBvbmVudDtcbiAgJHNjb3BlLm15T3Bwb25lbnQgPSB7bmFtZTonUEFYIEF0dGVuZGVlJ307XG5cbiAgJHNjb3BlLnN0YXJ0UXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgam9pblF1ZXVlUG9wdXAoKTtcbiAgfTtcblxuICAkc2NvcGUuY2FuY2VsUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgUXVldWVTZXJ2aWNlcy5jYW5jZWxRdWV1ZSgkc2NvcGUucXVldWVbMF0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLnN0YXR1cyA9ICdvcGVuJztcbiAgICAgICRzY29wZS5xdWV1ZSA9IFtdO1xuICAgICAgJHNjb3BlLnN0b3AoKTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgICRpbnRlcnZhbC5jYW5jZWwocHJvbWlzZSk7XG4gIH07XG5cblxuICAkc2NvcGUuc3RhcnRTZWFyY2ggPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgIHByb21pc2UgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge2NoYW5nZVdvcmQoKX0sIDIwMDApO1xuICB9O1xuXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgfSk7XG5cbiAgJHNjb3BlLnNlbGVjdEhlcm8gPSBmdW5jdGlvbiAoaGVybykge1xuICAgICRzY29wZS5pbWFnZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb0NsYXNzJykpWzBdLmNsaWVudFdpZHRoO1xuXG4gICAgaWYoaGVyby5jaGVja2VkKSB7XG4gICAgICBoZXJvLmNoZWNrZWQgPSAhaGVyby5jaGVja2VkO1xuICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYoIWhlcm8uY2hlY2tlZCAmJiAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzKSB7XG4gICAgICBoZXJvLmNoZWNrZWQgPSAhaGVyby5jaGVja2VkO1xuICAgICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IGZhbHNlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfTtcblxuICBmdW5jdGlvbiBqb2luUXVldWVQb3B1cCAoKSB7XG4gICAgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cyA9IHRydWU7XG4gICAgdmFyIGhlcm9lcyA9ICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5oZXJvTGlzdCwge2NoZWNrZWQ6IHRydWV9LCB0cnVlKTtcbiAgICBpZihoZXJvZXMubGVuZ3RoKSB7XG4gICAgICBoZXJvZXNbMF0uY2hlY2tlZCA9IGZhbHNlO1xuICAgIH1cbiAgICAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvc2VsZWN0Lmhlcm8uaHRtbCcsXG4gICAgICAgIHRpdGxlOiAnU2VsZWN0IEhlcm8gQ2xhc3MnLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJyB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHRleHQ6ICc8Yj5RdWV1ZTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICB2YXIgaGVybyA9ICRmaWx0ZXIoJ2ZpbHRlcicpKCRzY29wZS5oZXJvTGlzdCwge2NoZWNrZWQ6IHRydWV9LCB0cnVlKTtcbiAgICAgICAgICAgICAgaWYgKCFoZXJvLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaGVyb1swXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgaWYocmVzKSB7XG4gICAgICAgICAgUXVldWVTZXJ2aWNlcy5qb2luUXVldWUoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSwgcmVzLnRleHQsICRzY29wZS5wbGF5ZXJbMF0uYmF0dGxlVGFnKS50aGVuKGZ1bmN0aW9uIChxdWV1ZSkge1xuICAgICAgICAgICAgJHNjb3BlLnN0YXR1cyA9ICdxdWV1ZSc7XG4gICAgICAgICAgICAkc2NvcGUucXVldWUucHVzaChxdWV1ZSk7XG4gICAgICAgICAgICAkc2NvcGUuc3RhcnRTZWFyY2goKTtcbiAgICAgICAgICAgIGNoZWNrU3RhdHVzKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gY2hlY2tVc2VyU3RhdHVzKCkge1xuICAgIGlmKCEkc2NvcGUudXNlci5jdXJyZW50KCkpIHtcbiAgICAgICRzY29wZS5zdGF0dXMgPSAndW5hdXRob3JpemVkJztcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYoISRzY29wZS5wbGF5ZXIubGVuZ3RoKSB7XG4gICAgICAkc2NvcGUuc3RhdHVzID0gJ3VucmVnaXN0ZXJlZCdcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYoJHNjb3BlLnF1ZXVlLmxlbmd0aCkge1xuICAgICAgJHNjb3BlLnN0YXR1cyA9ICdxdWV1ZSc7XG4gICAgICBjaGVja1N0YXR1cygpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZigkc2NvcGUubWF0Y2gubGVuZ3RoKSB7XG4gICAgICAkc2NvcGUuc3RhdHVzID0gJ21hdGNoJztcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJHNjb3BlLnN0YXR1cyA9ICdvcGVuJztcbiAgfTtcblxuICBmdW5jdGlvbiBjaGVja1N0YXR1cyAoKSB7XG4gICAgUXVldWVTZXJ2aWNlcy5jaGVja1N0YXR1cygkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChxdWV1ZSkge1xuICAgICAgaWYoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAkc2NvcGUuc2VhcmNoaW5nID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYocXVldWVbMF0uc3RhdHVzID09PSAncGVuZGluZycpIHtcbiAgICAgICAgJHNjb3BlLnF1ZXVlWzBdID0gcXVldWVbMF07XG4gICAgICAgICRzY29wZS5zdGFydFNlYXJjaCgpO1xuICAgICAgfVxuXG5cbiAgICAgIGlmKHF1ZXVlWzBdLnN0YXR1cyA9PT0gJ2ZvdW5kJykge1xuICAgICAgICAkc2NvcGUuc3RhdHVzID0gJ21hdGNoJztcbiAgICAgICAgd29ydGh5UG9wdXAocXVldWVbMF0pO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmKHF1ZXVlWzBdLnN0YXR1cyA9PT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgICAgY29uc29sZS5sb2cocXVldWUpO1xuICAgICAgfVxuICAgICAgUGFyc2UuQ2xvdWQucnVuKCdNYXRjaE1ha2luZycpLnRoZW4oZnVuY3Rpb24ocmF0aW5ncykge1xuICAgICAgICBjb25zb2xlLmxvZyhyYXRpbmdzKTtcbiAgICAgICAgJHRpbWVvdXQoY2hlY2tTdGF0dXMsIDcwMDApO1xuICAgICAgfSk7XG5cbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB3b3J0aHlQb3B1cChxdWV1ZSkge1xuICAgIHZhciBxdWV1ZSA9IHF1ZXVlO1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2htYWtpbmcnLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj48c3Ryb25nPkEgV29ydGh5IE9wcG9uZW50PC9zdHJvbmc+PGJyPiBoYXMgYmVlbiBmb3VuZCE8L2Rpdj4nXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIHF1ZXVlLnNldCgnc3RhdHVzJywgJ2NvbXBsZXRlZCcpO1xuICAgICAgcXVldWUuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAkc2NvcGUuc3RhdHVzID0gJ21hdGNoJztcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gY2hhbmdlV29yZCAoKSB7XG4gICAgJHNjb3BlLm15T3Bwb25lbnQubmFtZSA9ICRzY29wZS5vcHBvbmVudC5saXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSokc2NvcGUub3Bwb25lbnQubGlzdC5sZW5ndGgpXTtcblxuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMYWRkZXJKb2luQ3RybCcsIExhZGRlckpvaW5DdHJsKTtcblxuTGFkZGVySm9pbkN0cmwuJGluamVjdCA9XG4gIFtcbiAgICAnJHNjb3BlJywgJ1BhcnNlJywgJyRmaWx0ZXInLCAnJGlvbmljUG9wdXAnLCAnJHN0YXRlJywgJyRpb25pY0hpc3RvcnknLCAndG91cm5leScsICdUb3VybmFtZW50U2VydmljZXMnLCAnTGFkZGVyU2VydmljZXMnLCAnJHEnXG4gIF07XG5mdW5jdGlvbiBMYWRkZXJKb2luQ3RybFxuKCRzY29wZSwgUGFyc2UsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIHRvdXJuZXksIFRvdXJuZXlTZXJ2aWNlcywgTGFkZGVyU2VydmljZXMsICRxKSB7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5leVswXTtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcbiAgJHNjb3BlLnBsYXllciA9IHtcbiAgICBiYXR0bGVUYWc6ICcnXG4gIH07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhbGlkYXRlQmF0dGxlVGFnKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgVG91cm5leVNlcnZpY2VzLmpvaW5Ub3VybmFtZW50KCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsICRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICRzY29wZS50b3VybmFtZW50LmluY3JlbWVudCgncGxheWVyQ291bnQnKTtcbiAgICAgICAgICAkc2NvcGUudG91cm5hbWVudC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBTdWNjZXNzUG9wdXAocGxheWVyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBFcnJvclBvcHVwKGVycm9yKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQmF0dGxlVGFnICgpIHtcbiAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuXG4gICAgdmFyIHRhZyA9ICRzY29wZS5wbGF5ZXIuYmF0dGxlVGFnO1xuXG4gICAgaWYodGFnLmxlbmd0aCA8IDgpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIGJhdHRsZSB0YWcnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgc3BsaXQgPSB0YWcuc3BsaXQoJyMnKTtcbiAgICBpZihzcGxpdC5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIEJBVFRMRVRBR+KEoiBpbmNsdWRpbmcgIyBhbmQgZm91ciBkaWdpdHMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihzcGxpdFsxXS5sZW5ndGggPCAyIHx8IHNwbGl0WzFdLmxlbmd0aCA+IDQpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgdXAgdG8gZm91ciBkaWdpdHMgYWZ0ZXIgIyEnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihpc05hTihzcGxpdFsxXSkpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgZm91ciBkaWdpdHMgYWZ0ZXIgIycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLnZhbGlkYXRlUGxheWVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsIHRhZykudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgaWYocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgY2IucmVqZWN0KCdUaGUgQkFUVExFVEFH4oSiIHlvdSBlbnRlcmVkIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0YWcpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgfTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gU3VjY2Vzc1BvcHVwIChwbGF5ZXIpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdDb25ncmF0dWxhdGlvbnMgJyArIHBsYXllci5iYXR0bGVUYWcgKyAnIScsXG4gICAgICB0ZW1wbGF0ZTogJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSBzaWduZWQgdXAhIE5vdyBnbyBmaW5kIGEgdmFsaWFudCBvcHBvbmVudC4nXG4gICAgfSk7XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkc0N0cmwnLCBMZWFkZXJCb2FyZHNDdHJsKTtcblxuTGVhZGVyQm9hcmRzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnTGFkZGVyU2VydmljZXMnLCAndG91cm5hbWVudCcsICdQYXJzZScsICckZmlsdGVyJywgJyRpb25pY1BvcHVwJ107XG5mdW5jdGlvbiBMZWFkZXJCb2FyZHNDdHJsKCRzY29wZSwgTGFkZGVyU2VydmljZXMsIHRvdXJuYW1lbnQsIFBhcnNlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudFswXS50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgdmFyIHJhbmsgPSAxO1xuICAgIGFuZ3VsYXIuZm9yRWFjaChwbGF5ZXJzLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICByYW5rKys7XG4gICAgfSk7XG4gICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICB9KTtcblxuICAkc2NvcGUuc2hvd0RldGFpbHMgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgJHNjb3BlLmhlcm9lcyA9IHBsYXllci5oZXJvZXM7XG4gICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6IHBsYXllci51c2VybmFtZSArICcgSGVyb2VzJyxcbiAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICB0ZW1wbGF0ZTpcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJyb3dcIj4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJjb2wtMjUgdGV4dC1jZW50ZXJcIiBuZy1yZXBlYXQ9XCJoZXJvIGluIGhlcm9lc1wiPicgK1xuICAgICAgICAnPGltZyBuZy1zcmM9XCJpbWcvaWNvbnMve3toZXJvfX0ucG5nXCIgY2xhc3M9XCJyZXNwb25zaXZlLWltZ1wiIHN0eWxlPVwicGFkZGluZzozcHg7XCI+e3toZXJvfX0nICtcbiAgICAgICAgJzwvZGl2PicgK1xuICAgICAgICAnPC9kaXY+J1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5Mb2dpbkN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNIaXN0b3J5J107XG5mdW5jdGlvbiBMb2dpbkN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICRzY29wZS51c2VyID0ge307XG4gIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2UuVXNlci5sb2dJbigkc2NvcGUudXNlci51c2VybmFtZSwgJHNjb3BlLnVzZXIucGFzc3dvcmQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24gKHVzZXIsIGVycm9yKSB7XG4gICAgICAgICRzY29wZS53YXJuaW5nID0gZXJyb3IubWVzc2FnZTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndXNlcicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcbiAgICAkc2NvcGUud2FybmluZyA9IG51bGw7XG4gIH0sIHRydWUpO1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFZpZXdDdHJsJywgTWF0Y2hWaWV3Q3RybCk7XG5cbk1hdGNoVmlld0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICckdGltZW91dCcsICckaW9uaWNQb3B1cCcsICckaW9uaWNIaXN0b3J5JywgJ1BhcnNlJywgJ0xhZGRlclNlcnZpY2VzJywgJ01hdGNoU2VydmljZXMnLCAnUXVldWVTZXJ2aWNlcyddO1xuZnVuY3Rpb24gTWF0Y2hWaWV3Q3RybCgkc2NvcGUsICRzdGF0ZSwgJHRpbWVvdXQsICRpb25pY1BvcHVwLCAkaW9uaWNIaXN0b3J5LCBQYXJzZSwgTGFkZGVyU2VydmljZXMsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMpIHtcbiAgJHNjb3BlLmNvdW50ID0gMDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcbiAgXG4gIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgaWYoIW1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgIGdldE1hdGNoRGV0YWlscygpO1xuICAgIH1cbiAgfSk7XG4gIFxuICAkc2NvcGUucmVjb3JkID0gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICB2YXIgbWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICBpZihtYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnYWN0aXZlJykge1xuICAgICAgICAgIHN3aXRjaCAocmVjb3JkKSB7XG4gICAgICAgICAgICBjYXNlICd3aW4nOlxuICAgICAgICAgICAgICBtYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS51c2VyKTtcbiAgICAgICAgICAgICAgbWF0Y2guc2V0KCdsb3NlcicsICRzY29wZS5vcHBvbmVudC51c2VyKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsb3NzJzpcbiAgICAgICAgICAgICAgbWF0Y2guc2V0KCd3aW5uZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICAgIG1hdGNoLnNldCgnbG9zZXInLCAkc2NvcGUudXNlcik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBtYXRjaC5zZXQoJ3N0YXR1cycsICdjb21wbGV0ZWQnKTtcbiAgICAgICAgICBtYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICAgIHRpdGxlOiAnTWF0Y2ggU3VibWl0dGVkJyxcbiAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5UaGFuayB5b3UgZm9yIHN1Ym1pdHRpbmcgcmVzdWx0czwvZGl2PidcbiAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgICAgICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgIHRpdGxlOiAnTWF0Y2ggRXJyb3InLFxuICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+WW91ciBPcHBvbmVudCBoYXMgYWxyZWFkeSB1cGRhdGVkIHJlc3VsdHMhPC9kaXY+J1xuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0TWF0Y2hEZXRhaWxzKCkge1xuICAgICRzY29wZS5vcHBvbmVudCA9IHtcbiAgICAgIGhlcm86IG51bGwsXG4gICAgICBiYXR0bGVUYWc6IG51bGxcbiAgICB9XG4gICAgaWYoJHNjb3BlLm1hdGNoLnBsYXllcjEuaWQgPT09ICRzY29wZS51c2VyLmlkKSB7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuaGVybyA9ICRzY29wZS5tYXRjaC5oZXJvMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VybmFtZSA9ICRzY29wZS5tYXRjaC51c2VybmFtZTI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuYmF0dGxlVGFnID0gJHNjb3BlLm1hdGNoLmJhdHRsZVRhZzI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlciA9ICRzY29wZS5tYXRjaC5wbGF5ZXIyO1xuICAgIH1cbiAgICBpZigkc2NvcGUubWF0Y2gucGxheWVyMi5pZCA9PT0gJHNjb3BlLnVzZXIuaWQpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8xO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjE7XG4gICAgfVxuICAgIG9wcG9uZW50Rm91bmQoKTtcbiAgfVxuICBmdW5jdGlvbiBvcHBvbmVudEZvdW5kKCkge1xuICAgIFF1ZXVlU2VydmljZXMub3Bwb25lbnRIYXNDb25maXJtZWQoJHNjb3BlLm9wcG9uZW50LnVzZXIpLnRoZW4oZnVuY3Rpb24gKHF1ZXVlKSB7XG4gICAgICBpZihxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgJHNjb3BlLm5vT3Bwb25lbnQgPSB0cnVlO1xuICAgICAgICBpZigkc2NvcGUuY291bnQgPCAyKSB7XG4gICAgICAgICAgJHNjb3BlLmNvdW50Kys7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcXVldWVbMF0uZGVzdHJveSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHNjb3BlLm1hdGNoLmRlc3Ryb3koKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnTWF0Y2ggRXJyb3InLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+WW91ciBPcHBvbmVudCBuZXZlciBjb25maXJtZWQhPC9kaXY+J1xuICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5ub09wcG9uZW50ID0gZmFsc2U7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgICR0aW1lb3V0KG9wcG9uZW50Rm91bmQsIDE1MDAwKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcbiAgLmNvbnRyb2xsZXIoJ01lbnVDdHJsJywgTWVudUN0cmwpO1xuXG5NZW51Q3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCckaW9uaWNQb3BvdmVyJywgJyRzdGF0ZScsICckaW9uaWNIaXN0b3J5JywgJ1BhcnNlJ107XG5mdW5jdGlvbiBNZW51Q3RybCgkc2NvcGUsICRpb25pY1BvcG92ZXIsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgUGFyc2UpIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuXG4gICRpb25pY1BvcG92ZXIuZnJvbVRlbXBsYXRlVXJsKCd0ZW1wbGF0ZXMvcG9wb3ZlcnMvcHJvZmlsZS5wb3AuaHRtbCcsIHtcbiAgICBzY29wZTogJHNjb3BlLFxuICB9KS50aGVuKGZ1bmN0aW9uKHBvcG92ZXIpIHtcbiAgICAkc2NvcGUucG9wb3ZlciA9IHBvcG92ZXI7XG4gIH0pO1xuXG4gICRzY29wZS5tZW51ID0gZnVuY3Rpb24gKGxpbmspIHtcbiAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgIH0pO1xuICAgICRzdGF0ZS5nbygnYXBwLicgKyBsaW5rLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgJHNjb3BlLnBvcG92ZXIuaGlkZSgpO1xuICB9XG4gIC8vQ2xlYW51cCB0aGUgcG9wb3ZlciB3aGVuIHdlJ3JlIGRvbmUgd2l0aCBpdCFcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wb3Zlci5yZW1vdmUoKTtcbiAgfSk7XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgUmVnaXN0ZXJDdHJsKTtcblxuUmVnaXN0ZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIFJlZ2lzdGVyQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY1BvcHVwKSB7XG5cbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuUmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB2YXIgcmVnaXN0ZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgIHJlZ2lzdGVyLnNldCh1c2VyKTtcbiAgICByZWdpc3Rlci5zaWduVXAobnVsbCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgQWRtaW5Sb3V0ZXNdKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBMYWRkZXJSb3V0ZXNdKTtcblxuZnVuY3Rpb24gTGFkZGVyUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyJywge1xuICAgICAgdXJsOiAnL2xhZGRlcicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGFkZGVyLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIubGVhZGVyYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvbGVhZGVyYm9hcmRzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sZWFkZXJib2FyZC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZHNDdHJsJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmpvaW4nLCB7XG4gICAgICB1cmw6ICcvam9pbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvam9pbi5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMYWRkZXJKb2luQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuZXk6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIE1hdGNoUm91dGVzXSk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gudmlldycsIHtcbiAgICAgIHVybDogJy92aWV3JyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLnZpZXcuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hWaWV3Q3RybCcsXG4gICAgfSlcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdMYWRkZXJTZXJ2aWNlcycsIFsnUGFyc2UnLCAnTGFkZGVyJywgTGFkZGVyU2VydmljZXNdKVxuICAuZmFjdG9yeSgnTGFkZGVyJywgWydQYXJzZScsIExhZGRlcl0pO1xuXG5mdW5jdGlvbiBMYWRkZXJTZXJ2aWNlcyhQYXJzZSwgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UGxheWVyczogZ2V0UGxheWVycyxcbiAgICBnZXRQbGF5ZXI6IGdldFBsYXllcixcbiAgICB2YWxpZGF0ZVBsYXllcjogdmFsaWRhdGVQbGF5ZXJcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKHRvdXJuZXkpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZGVzY2VuZGluZygncG9pbnRzJywgJ21tcicpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVQbGF5ZXIodG91cm5leSwgYmF0dGxlVGFnKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ2JhdHRsZVRhZycsIGJhdHRsZVRhZyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQbGF5ZXIodG91cm5leSwgdXNlcikge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5lcXVhbFRvKCd1c2VyJywgdXNlcik7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gTGFkZGVyKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0xhZGRlcicpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsndG91cm5hbWVudCcsICd1c2VyJywnYmF0dGxlVGFnJywgJ3VzZXJuYW1lJywgJ2hlcm9lcycsICd3aW5zJywgJ2xvc3NlcycsICdtbXInLCAncG9pbnRzJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ01hdGNoU2VydmljZXMnLCBbJ1BhcnNlJywgJ01hdGNoJywgTWF0Y2hTZXJ2aWNlc10pXG4gIC5mYWN0b3J5KCdNYXRjaCcsIFsnUGFyc2UnLCBNYXRjaF0pO1xuXG5mdW5jdGlvbiBNYXRjaFNlcnZpY2VzKFBhcnNlLCBNYXRjaCkge1xuICB2YXIgdXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICByZXR1cm4ge1xuICAgIGdldE1hdGNoOiBnZXRNYXRjaFxuICB9XG4gIGZ1bmN0aW9uIGdldE1hdGNoKCkge1xuICAgIHZhciBwbGF5ZXIxID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHBsYXllcjEuZXF1YWxUbygndXNlcm5hbWUxJywgdXNlci51c2VybmFtZSk7XG4gICAgdmFyIHBsYXllcjIgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcGxheWVyMi5lcXVhbFRvKCd1c2VybmFtZTInLCB1c2VyLnVzZXJuYW1lKTtcbiAgICBcbiAgICB2YXIgbWFpblF1ZXJ5ID0gUGFyc2UuUXVlcnkub3IocGxheWVyMSwgcGxheWVyMik7XG4gICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdhY3RpdmUnKTtcbiAgICByZXR1cm4gbWFpblF1ZXJ5LmZpbmQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNYXRjaChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdNYXRjaCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFtcbiAgICAndG91cm5hbWVudCcsICdwbGF5ZXIxJywgJ3BsYXllcjInLCAnaGVybzEnLCAnaGVybzInLCAndXNlcm5hbWUxJywgJ3VzZXJuYW1lMicsICdiYXR0bGVUYWcxJywgJ2JhdHRsZVRhZzInLCAnc3RhdHVzJywgJ3dpbm5lcicsICdsb3NlcicsXG4gICAgJ3NjcmVlbnNob3QnLCAncmVwb3J0JywgJ3JlcG9ydGVkU2NyZWVuc2hvdCdcbiAgXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdRdWV1ZVNlcnZpY2VzJyxbJ1BhcnNlJywgJ1F1ZXVlJywgIFF1ZXVlU2VydmljZXNdKVxuICAuZmFjdG9yeSgnUXVldWUnLCBbJ1BhcnNlJywgUXVldWVdKTtcblxuZnVuY3Rpb24gUXVldWVTZXJ2aWNlcyhQYXJzZSwgUXVldWUpIHtcbiAgdmFyIG9wcG9uZW50ID0ge1xuICAgIGxpc3Q6IFsnRWFzeSBQaWNraW5ncycsICdZb3VyIFdvcnN0IE5pZ2h0bWFyZScsICdXb3JsZCBjbGFzcyBwYXN0ZSBlYXRlcicsXG4gICAgICAnQSBNdXJsb2MnLCAnR291cmQgY3JpdGljJywgJ05vc2UgYW5kIG1vdXRoIGJyZWF0aGVyJywgJ0hvZ2dlcicsICdBIGNhcmRpc2ggSWFuJyxcbiAgICAgICdNb3BleSBNYWdlJywgJ1dvbWJhdCBXYXJsb2NrJywgJ1JvdWdlZCB1cCBSb2d1ZScsICdXYWlmaXNoIFdhcnJpb3InLCAnRGFtcCBEcnVpZCcsXG4gICAgICAnU2hhYmJ5IFNoYW1hbicsICdQZW5uaWxlc3MgUGFsYWRpbicsICdIdWZmeSBIdW50ZXInLCAnUGVya3kgUHJpZXN0JywgJ1RoZSBXb3JzdCBQbGF5ZXInLFxuICAgICAgJ1lvdXIgT2xkIFJvb21tYXRlJywgJ1N0YXJDcmFmdCBQcm8nLCAnRmlzY2FsbHkgcmVzcG9uc2libGUgbWltZScsICdZb3VyIEd1aWxkIExlYWRlcicsXG4gICAgICAnTm9uZWNrIEdlb3JnZScsICdHdW0gUHVzaGVyJywgJ0NoZWF0ZXIgTWNDaGVhdGVyc29uJywgJ1JlYWxseSBzbG93IGd1eScsICdSb2FjaCBCb3knLFxuICAgICAgJ09yYW5nZSBSaHltZXInLCAnQ29mZmVlIEFkZGljdCcsICdJbndhcmQgVGFsa2VyJywgJ0JsaXp6YXJkIERldmVsb3BlcicsICdHcmFuZCBNYXN0ZXInLFxuICAgICAgJ0RpYW1vbmQgTGVhZ3VlIFBsYXllcicsICdCcmFuZCBOZXcgUGxheWVyJywgJ0Rhc3RhcmRseSBEZWF0aCBLbmlnaHQnLCAnTWVkaW9jcmUgTW9uaycsXG4gICAgICAnQSBMaXR0bGUgUHVwcHknXG4gICAgXVxuICB9O1xuICB2YXIgaGVyb2VzID0gW1xuICAgIHt0ZXh0OiAnbWFnZScsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2h1bnRlcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3BhbGFkaW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJyaW9yJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnZHJ1aWQnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJsb2NrJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnc2hhbWFuJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncHJpZXN0JywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncm9ndWUnLCBjaGVja2VkOiBmYWxzZX1cbiAgXVxuICByZXR1cm4ge1xuICAgIG9wcG9uZW50OiBvcHBvbmVudCxcbiAgICBoZXJvZXM6IGhlcm9lcyxcbiAgICBjaGVja1N0YXR1czogY2hlY2tTdGF0dXMsXG4gICAgam9pblF1ZXVlOiBqb2luUXVldWUsXG4gICAgY2FuY2VsUXVldWU6IGNhbmNlbFF1ZXVlLFxuICAgIG9wcG9uZW50SGFzQ29uZmlybWVkOiBvcHBvbmVudEhhc0NvbmZpcm1lZFxuICB9XG4gIFxuICBmdW5jdGlvbiBvcHBvbmVudEhhc0NvbmZpcm1lZCh1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KFF1ZXVlLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd1c2VyJywgdXNlcik7XG4gICAgcXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ2ZvdW5kJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrU3RhdHVzKHRvdXJuYW1lbnQsIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoUXVldWUuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5jb250YWluZWRJbignc3RhdHVzJywgWydwZW5kaW5nJywgJ2ZvdW5kJ10pO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmFtZW50KTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblF1ZXVlKHRvdXJuYW1lbnQsIHVzZXIsIGhlcm8sIGJhdHRsZVRhZykge1xuICAgIHZhciBxdWV1ZSA9IG5ldyBRdWV1ZS5Nb2RlbCgpO1xuICAgIHF1ZXVlLnNldCgndXNlcicsIHVzZXIpO1xuICAgIHF1ZXVlLnNldCgndG91cm5hbWVudCcsIHRvdXJuYW1lbnQpO1xuICAgIHF1ZXVlLnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICBxdWV1ZS5zZXQoJ2JhdHRsZVRhZycsIGJhdHRsZVRhZyk7XG4gICAgcXVldWUuc2V0KCdoZXJvJywgaGVybyk7XG4gICAgcmV0dXJuIHF1ZXVlLnNhdmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbFF1ZXVlKGNhbmNlbCkge1xuICAgIHZhciBxdWV1ZSA9IG5ldyBRdWV1ZS5Nb2RlbCgpO1xuICAgIHF1ZXVlLmlkID0gY2FuY2VsLmlkO1xuICAgIHJldHVybiBxdWV1ZS5kZXN0cm95KCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gUXVldWUoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnUXVldWUnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndXNlcicsICdzdGF0dXMnLCAnaGVybycsICdiYXR0bGVUYWcnXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1RvdXJuYW1lbnRTZXJ2aWNlcycsIFsnUGFyc2UnLCAnJHEnLCAnVG91cm5hbWVudCcsICdEZXRhaWxzJywgJ0xhZGRlcicsIFRvdXJuYW1lbnRTZXJ2aWNlc10pXG5cbiAgLmZhY3RvcnkoJ1RvdXJuYW1lbnQnLCBbJ1BhcnNlJywgVG91cm5hbWVudF0pXG4gIC5mYWN0b3J5KCdEZXRhaWxzJywgWydQYXJzZScsIERldGFpbHNdKTtcblxuZnVuY3Rpb24gVG91cm5hbWVudFNlcnZpY2VzKFBhcnNlLCAkcSwgVG91cm5hbWVudCwgRGV0YWlscywgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0VG91cm5hbWVudDogZ2V0VG91cm5hbWVudCxcbiAgICBjcmVhdGVUb3VybmFtZW50OiBjcmVhdGVUb3VybmFtZW50LFxuICAgIGdldExhZGRlcjogZ2V0TGFkZGVyLFxuICAgIGpvaW5Ub3VybmFtZW50OiBqb2luVG91cm5hbWVudFxuICB9XG4gIGZ1bmN0aW9uIGpvaW5Ub3VybmFtZW50KHRvdXJuZXksIHBsYXllcikge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKHBsYXllcik7XG4gICAgcGxheWVyLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXInLCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgcGxheWVyLnNldCgndXNlcm5hbWUnLCBQYXJzZS5Vc2VyLmN1cnJlbnQoKS51c2VybmFtZSk7XG4gICAgcGxheWVyLnNldCgnbW1yJywgMTAwMCk7XG4gICAgcGxheWVyLnNldCgnd2lucycsIDApO1xuICAgIHBsYXllci5zZXQoJ2xvc3NlcycsIDApO1xuICAgIHBsYXllci5zZXQoJ3BvaW50cycsIDApO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFRvdXJuYW1lbnQoKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KERldGFpbHMuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3R5cGUnLCAnbGFkZGVyJyk7XG4gICAgcXVlcnkuaW5jbHVkZSgndG91cm5hbWVudCcpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gY3JlYXRlVG91cm5hbWVudCAoKSB7XG4gICAgdmFyIGRlZmVyID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdG91cm5hbWVudCA9IG5ldyBUb3VybmFtZW50Lk1vZGVsKCk7XG4gICAgdG91cm5hbWVudC5zZXQoJ25hbWUnLCAnT05PRyBPUEVOJyk7XG4gICAgdG91cm5hbWVudC5zZXQoJ3N0YXR1cycsICdwZW5kaW5nJyk7XG4gICAgdG91cm5hbWVudC5zZXQoJ2dhbWUnLCAnaGVhcnRoc3RvbmUnKTtcbiAgICB0b3VybmFtZW50LnNhdmUoKS50aGVuKGZ1bmN0aW9uICh0b3VybmV5KSB7XG4gICAgICB2YXIgZGV0YWlscyA9IG5ldyBEZXRhaWxzLk1vZGVsKCk7XG4gICAgICBkZXRhaWxzLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgICAgZGV0YWlscy5zZXQoJ3R5cGUnLCAnbGFkZGVyJyk7XG4gICAgICBkZXRhaWxzLnNldCgncGxheWVyQ291bnQnLCAwKTtcbiAgICAgIGRldGFpbHMuc2V0KCdudW1PZkdhbWVzJywgNSk7XG4gICAgICBkZXRhaWxzLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChkZXRhaWxzKSB7XG4gICAgICAgIGRlZmVyLnJlc29sdmUoZGV0YWlscyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXIucHJvbWlzZTtcbiAgfVxuICBmdW5jdGlvbiBnZXRMYWRkZXIgKHRvdXJuZXkpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuaW5jbHVkZSgncGxheWVyJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBUb3VybmFtZW50KFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ1RvdXJuYW1lbnQnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ25hbWUnLCAnZ2FtZScsICdzdGF0dXMnLCAnZGlzYWJsZWQnLCAnZGlzYWJsZWRSZWFzb24nXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuZnVuY3Rpb24gRGV0YWlscyhQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdEZXRhaWxzJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3R5cGUnLCAnbnVtT2ZHYW1lcycsICdwbGF5ZXJDb3VudCddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
