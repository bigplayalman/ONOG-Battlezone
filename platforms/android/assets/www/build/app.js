
config.$inject = ['$ionicConfigProvider', '$compileProvider', 'ParseProvider'];
routes.$inject = ['$stateProvider', '$urlRouterProvider'];
run.$inject = ['$ionicPlatform', '$state', '$rootScope', '$ionicLoading', '$ionicPopup', 'locationServices', '$ionicHistory', '$cordovaNetwork', '$window'];
LadderServices.$inject = ['Parse', 'Ladder'];
Ladder.$inject = ['Parse'];
locationServices.$inject = ['Parse', '$cordovaGeolocation', '$q'];
MatchServices.$inject = ['Parse', 'Match', '$q'];
Match.$inject = ['Parse'];
cameraServices.$inject = ['$window'];
TournamentServices.$inject = ['Parse', '$q', 'Tournament', 'Details', 'Ladder'];
Tournament.$inject = ['Parse'];
Details.$inject = ['Parse'];
AdminMatchCtrl.$inject = ['$scope', 'Parse', 'MatchServices', 'match', '$ionicPopup'];
AdminMatchesCtrl.$inject = ['$scope', 'Parse', 'MatchServices', 'moment'];
AdminPlayersCtrl.$inject = ['$scope', 'Parse', 'LadderServices'];
AdminSettingsCtrl.$inject = ['$scope', 'locationServices', 'newTournament', 'tournament'];
DashboardCtrl.$inject = ['$scope', '$state', '$filter', '$timeout', '$interval', '$ionicPopup', '$rootScope', 'moment', 'Parse', 'tournament', 'MatchServices', 'QueueServices', 'LadderServices', 'locationServices'];
LadderJoinCtrl.$inject = ['$scope', '$filter', '$ionicPopup', '$state', '$ionicHistory', '$q', 'Parse', 'tournament', 'LadderServices'];
LeaderBoardsCtrl.$inject = ['$scope', 'LadderServices', 'tournament', 'Parse'];
ResetPasswordCtrl.$inject = ['$scope', '$ionicPopup', '$state', '$ionicHistory', 'Parse'];
LadderProfileCtrl.$inject = ['$scope', '$filter', '$ionicPopup', '$state', '$ionicHistory', '$q', 'Parse', 'tournament', 'LadderServices', 'player'];
LoginCtrl.$inject = ['$scope', '$state', 'Parse', '$ionicHistory'];
MatchListCtrl.$inject = ['$scope', '$state', '$ionicPopup', '$rootScope', 'Parse', 'MatchServices', 'player'];
MatchReportCtrl.$inject = ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', 'Parse', 'MatchServices', 'cameraServices', 'report'];
MatchViewCtrl.$inject = ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$timeout', 'Parse', 'LadderServices', 'MatchServices', 'QueueServices', 'cameraServices', 'tournament'];
MenuCtrl.$inject = ['$scope', '$ionicPopover', '$state', '$ionicHistory', 'Parse', '$timeout'];
AdminRoutes.$inject = ['$stateProvider'];
LadderRoutes.$inject = ['$stateProvider'];
MatchRoutes.$inject = ['$stateProvider'];angular.module('ONOG.config', [])
  .config(config);

function config ($ionicConfigProvider, $compileProvider, ParseProvider) {

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

  ParseProvider.initialize('nYsB6tmBMYKYMzM5iV9BUcBvHWX89ItPX5GfbN6Q', 'zrin8GEBDVGbkl1ioGEwnHuP70FdG6HhzTS8uGjz');

  if (ionic.Platform.isIOS()) {
    $ionicConfigProvider.scrolling.jsScrolling(true);
  }
}

angular.module('ONOG.Controllers', []);


angular.module('ONOG', [
  'ionic',
  'ngParse',
  'timer',
  'ngCordova',
  'ngAnimate',
  'ONOG.config',
  'ONOG.routes',
  'ONOG.Controllers',
  'ONOG.Services'
]);

angular.module('ONOG.routes', [
  'ONOG.routes.matches',
  'ONOG.routes.ladder',
  'ONOG.routes.admin'
])
  .config(routes);

function routes ($stateProvider, $urlRouterProvider) {

  $urlRouterProvider.otherwise('app/loading');

  $stateProvider
    .state('app', {
      url: '/app',
      abstract: true,
      cache: false,
      templateUrl: 'templates/menu.html',
      controller: 'MenuCtrl',
      resolve: {
        tournament: ['TournamentServices', '$q', 'Parse', '$state', function (TournamentServices, $q, Parse, $state) {
          var cb = $q.defer();
          TournamentServices.getTournament().then(function (tournaments) {
            if(tournaments.length) {
              cb.resolve(tournaments[0]);
            }
          },
          function (error) {
            ionic.Platform.exitApp();
          });
          return cb.promise;
        }]
      }
    })
    .state('app.loading', {
      url: '/loading',
      views: {
        'menuContent': {
          templateUrl: 'templates/loading.html'
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
    .state('app.reset', {
      url: '/password',
      cache: false,
      views: {
        'menuContent': {
          templateUrl: 'templates/password.html',
          controller: 'ResetPasswordCtrl'
        }
      }
    });
}

angular.module('ONOG')
  .constant('moment', moment)
  .run(run);

function run (
  $ionicPlatform, $state, $rootScope, $ionicLoading, $ionicPopup,
  locationServices, $ionicHistory, $cordovaNetwork, $window
) {
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

    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      var onlineState = networkState;
    });

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      var offlineState = networkState;
      $ionicPopup.alert({
          title: 'Internet Disconnected',
          content: 'The internet is disconnected on your device.'
        })
        .then(function() {
          ionic.Platform.exitApp();
        });
    });


    $rootScope.$on('show:loading', function() {
      $ionicLoading.show({template: '<ion-spinner icon="spiral" class="spinner-calm"></ion-spinner>', showBackdrop: true, animation: 'fade-in'});
    });

    $rootScope.$on('hide:loading', function() {
      $ionicLoading.hide();
    });

    $ionicPlatform.on('resume', function(){
      //rock on
      //$state.go('app.dashboard', {reload: true});
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
              $state.go('app.dashboard', {reload: true});
              break;
            case 'Opponent Confirmed':
              $state.go('app.dashboard', {reload: true});
              break;
            case 'Results Entered':
              $ionicPopup.alert({
                title: 'Match Played',
                template: '<div class="text-center">Results have been submitted</div>'
              }).then(function(res) {
                $state.go('app.dashboard', {reload: true});
              });
              break;
          }
        }
      });
    }
    if(window.location.hash === '#/app/loading') {
      locationServices.getLocation().then(function (location) {
        locationServices.setLocation(location);
        $ionicHistory.nextViewOptions({
          disableBack: true
        });
        $state.go('app.dashboard');
      }, function (err) {
        if(navigator && navigator.splashscreen) {
          navigator.splashscreen.hide();
        }
        $state.go('app.dashboard');
      });
    }
  });
}

angular.module('ONOG.Services', []);



angular.module('ONOG.Services')

  .service('LadderServices', LadderServices)
  .factory('Ladder', Ladder);

function LadderServices(Parse, Ladder) {
  return {
    getPlayers: getPlayers,
    getPlayer: getPlayer,
    validatePlayer: validatePlayer,
    joinTournament: joinTournament,
    getPendingPlayers: getPendingPlayers,
    searchPlayers: searchPlayers
  };

  function searchPlayers(input) {
    var query = new Parse.Query(Ladder.Model);
    query.startsWith('username', input);
    return query.find();
  }

  function getPendingPlayers(tournament, user) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.notEqualTo('user', user);
    query.equalTo('status', 'queue');
    return query.find();
  }

  function getPlayers(tourney) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.descending('points', 'mmr');
    return query.find();
  }

  function validatePlayer(tourney, battleTag) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.equalTo('battleTag', battleTag);
    return query.find();
  }

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
}

function Ladder(Parse) {
  var Model = Parse.Object.extend('Ladder');
  var attributes = ['tournament', 'user', 'battleTag', 'username', 'location', 'banned',
    'hero', 'player', 'status', 'cancelTimer', 'wins', 'losses', 'mmr', 'points', 'banReason', 'admin'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}

angular.module('ONOG.Services')

  .service('locationServices', locationServices);

function locationServices (Parse, $cordovaGeolocation, $q) {

  var location = {coords: new Parse.GeoPoint()};
  return {
    location: location,
    getLocation: getLocation,
    setLocation: setLocation
  };
  
  function setLocation (coords) {
    location.coords = new Parse.GeoPoint({latitude: coords.latitude, longitude: coords.longitude});
  }

  function getLocation () {
    var cb = $q.defer();
    var posOptions = {enableHighAccuracy: false};
    $cordovaGeolocation
      .getCurrentPosition(posOptions)
      .then(function (position) {
        cb.resolve(position.coords);
      }, function(err) {
        console.log(err);
        cb.reject(err);
      });
    return cb.promise;
  }
}

angular.module('ONOG.Services')

  .service('MatchServices', MatchServices)
  .factory('Match', Match);

function MatchServices(Parse, Match, $q) {
  var user = Parse.User;
  return {
    getConfirmedMatch: getConfirmedMatch,
    getPendingMatch: getPendingMatch,
    getReportedMatches: getReportedMatches,
    getLatestMatch: getLatestMatch,
    getMatch: getMatch,
    getPlayerMatches: getPlayerMatches,
    getMatchDetails: getMatchDetails
  };

  function getPlayerMatches(player, status) {
    var player1 = new Parse.Query(Match.Model);
    player1.equalTo('player1', player);
    var player2 = new Parse.Query(Match.Model);
    player2.equalTo('player2', player);
    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.descending("createdAt");
    mainQuery.limit(10);
    if(status) {
      mainQuery.equalTo('status', status);
    }
    return mainQuery.find();
  }

  function getLatestMatch(player) {
    var type = player.get('player');
    var query = new Parse.Query(Match.Model);
    query.include('winner');
    query.include('loser');
    query.descending('createdAt');
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
    query.descending('createdAt');
    if(type === 'player1') {
      query.equalTo('player1', player);
    } else {
      query.equalTo('player2', player);
    }
    query.equalTo('confirm1', true);
    query.equalTo('confirm2', true);
    query.limit(1);

    return query.find();
  }
  function getReportedMatches() {
    var query = new Parse.Query('Match');
    query.equalTo('status', 'reported');
    query.descending('createdAt');
    return query.find();
  }
  function getPendingMatch(player) {
    var type = player.get('player');
    var query = new Parse.Query(Match.Model);
    query.descending('createdAt');
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
  function getMatchDetails(id) {
    var query = new Parse.Query(Match.Model);
    query.include('winner');
    query.include('loser');
    query.descending('createdAt');
    return query.get(id);
  }
}

function Match(Parse) {
  var Model = Parse.Object.extend('Match');
  var attributes = [
    'tournament', 'player1', 'player2', 'hero1', 'hero2', 'username1', 'username2', 'battleTag1', 'battleTag2', 'status', 'winner', 'loser',
    'winImage', 'reportReason', 'reportImage', 'activeDate', 'user1', 'user2', 'adminNote'
  ];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  };
}

angular.module('ONOG.Services')

  .service('cameraServices', cameraServices);

function cameraServices ($window) {

  var camera = {
    quality: 90,
    targetWidth: 320,
    targetHeight: 500,
    allowEdit: true,
    sourceType: 0,
  }
  if($window.Camera) {
    camera.destinationType = Camera.DestinationType.DATA_URL;
    camera.encodingType = Camera.EncodingType.JPEG;
  }

  return {
    camera: camera
  };

  // function getDataUri (url, callback) {
  //   var image = new Image();
  //   image.onload = function () {
  //     var canvas = document.createElement('canvas');
  //     canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
  //     canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size
  //
  //     canvas.getContext('2d').drawImage(this, 0, 0);
  //
  //     // Get raw image data
  //     callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));
  //
  //     // ... or get as Data URI
  //     //callback(canvas.toDataURL('image/png'));
  //   };
  //   image.src = url;
  // }

}

angular.module('ONOG.Services')

  .service('QueueServices', QueueServices)

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
  ];
  return {
    opponent: opponent,
    heroes: heroes
  };
}


angular.module('ONOG.Services')

  .service('TournamentServices', TournamentServices)
  .factory('Tournament', Tournament)
  .factory('Details', Details);

function TournamentServices(Parse, $q, Tournament, Details, Ladder) {
  return {
    getTournament: getTournament,
    createTournament: createTournament,
    getLadder: getLadder,
    joinTournament: joinTournament
  };
  function joinTournament(tourney, joinPlayer) {
    var player = new Ladder.Model(joinPlayer);
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
  var attributes = ['name', 'game', 'status', 'disabled', 'disabledReason', 'location'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  };
}
function Details(Parse) {
  var Model = Parse.Object.extend('Details');
  var attributes = ['tournament', 'type', 'numOfGames', 'playerCount'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  };
}


angular.module('ONOG.Controllers')

  .controller('AdminMatchCtrl', AdminMatchCtrl);

function AdminMatchCtrl($scope, Parse, MatchServices, match, $ionicPopup) {
  $scope.match = match;
  console.log($scope.match);

  $scope.showDate = function (date) {
    return moment(date).format('MM/DD hh:mm A');
  }
  $scope.changeWinner = function () {
    $ionicPopup.show(
      {
        templateUrl:'templates/popups/change.match.html',
        title: 'Confirm',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function(e) {
              if(!$scope.match.adminNote) {
                e.preventDefault();
              }
              return true;
            }
          }
        ]
      }).then(function (res) {
      if(res) {
        var winner = $scope.match.winner;
        var loser = $scope.match.loser;
        var winPoints = winner.get('points') - 450;
        var losePoints = loser.get('points') + 450;
        var winCount = winner.get('wins') - 1;
        var loseCount = loser.get('losses') - 1;
        winner.set('points', winPoints);
        loser.set('points', losePoints);
        winner.set('wins', winCount);
        loser.set('losses', loseCount);
        loser.increment('wins');
        winner.increment('losses');
        $scope.match.set('status', 'resolved')
        $scope.match.set('winner', loser);
        $scope.match.set('loser', winner);
        $scope.match.save().then(function () {
          $scope.match = match;
        })
      }
    });
  }
  
  $scope.keepWinner = function () {
    $ionicPopup.show(
      {
        templateUrl:'templates/popups/change.match.html',
        title: 'Confirm',
        scope: $scope,
        buttons: [
          { text: 'Cancel'},
          { text: '<b>Confirm</b>',
            type: 'button-positive',
            onTap: function(e) {
              if(!$scope.match.adminNote) {
                e.preventDefault();
              }
              return true;
            }
          }
        ]
      }).then(function (res) {
      if(res) {
        $scope.match.set('status', 'resolved')
        $scope.match.save().then(function () {
          $scope.match = match;
        });
      }
    });
  }
};


angular.module('ONOG.Controllers')

  .controller('AdminMatchesCtrl', AdminMatchesCtrl);

function AdminMatchesCtrl($scope, Parse, MatchServices, moment) {
  
  MatchServices.getReportedMatches().then(function (matches) {
    $scope.matches = matches;
  });

  $scope.showDate = function (date) {
    return moment(date).format('MM/DD hh:mm A');
  }
};


angular.module('ONOG.Controllers')

  .controller('AdminPlayersCtrl', AdminPlayersCtrl);

function AdminPlayersCtrl($scope, Parse, LadderServices) {
  $scope.search = {
    input: null
  }
  
  $scope.searchPlayer = function () {
    LadderServices.searchPlayers($scope.search.input).then(function (players) {
      $scope.players = players;
    });
  }
};


angular.module('ONOG.Controllers')

  .controller('AdminSettingsCtrl', AdminSettingsCtrl);

function AdminSettingsCtrl($scope, locationServices, newTournament, tournament) {
  $scope.details = newTournament;
  
  $scope.tournament = tournament.tournament;
  
  $scope.setTournamentLocation = function () {
    locationServices.getLocation().then(function (location) {
      var point = new Parse.GeoPoint({latitude: location.latitude, longitude: location.longitude});
      $scope.tournament.set("location", point);
      $scope.tournament.save().then(function (tournament) {
        $scope.tournament = tournament;
        alert('tournmanet location set');
      });
    });
  };
}


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
      if(players.length) {
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
      }
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


angular.module('ONOG.Controllers')

  .controller('LadderJoinCtrl', LadderJoinCtrl);

function LadderJoinCtrl(
  $scope, $filter, $ionicPopup, $state, $ionicHistory, $q, Parse,  tournament, LadderServices
) {
  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $scope.tournament = tournament.tournament;
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

function LeaderBoardsCtrl($scope, LadderServices, tournament, Parse) {
  $scope.user = Parse.User;
  getPlayers();
  $scope.doRefresh = function () {
    getPlayers();
  };
  
  function getPlayers() {
    LadderServices.getPlayers(tournament.tournament).then(function (players) {
      var rank = 1;
      angular.forEach(players, function (player) {
        player.rank = rank;
        rank++;
      });
      $scope.players = players;
      $scope.$broadcast('scroll.refreshComplete');
    });
  }
}


angular.module('ONOG.Controllers')

  .controller('ResetPasswordCtrl', ResetPasswordCtrl);

function ResetPasswordCtrl
($scope, $ionicPopup, $state, $ionicHistory, Parse) {

  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $scope.email = {};
  
  $scope.resetPassword = function (email) {
    Parse.User.requestPasswordReset(email.text, {
      success: function() {
        SuccessPopup();
      },
      error: function(error) {
        // Show the error message somewhere
        ErrorPopup(error.message);
      }
    });
  };
  
  function ErrorPopup (message) {
    return $ionicPopup.alert({
      title: 'Update Error',
      template: message
    });
  }

  function SuccessPopup () {
    return $ionicPopup.alert({
      title: 'Password Reset',
      template: 'An Email has been sent to reset your password'
    }).then(function (res) {
      $state.go('app.dashboard');
    })
  }
}


angular.module('ONOG.Controllers')

  .controller('LadderProfileCtrl', LadderProfileCtrl);

function LadderProfileCtrl(
  $scope, $filter, $ionicPopup, $state, $ionicHistory, $q, Parse,  tournament, LadderServices, player
) {

  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $scope.tournament = tournament.tournament;
  $scope.user = Parse.User.current();
  $scope.player = player[0];

  $scope.registerPlayer = function () {
    validateBattleTag().then(
      function (tag) {
        $scope.player.save().then(function () {
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
      title: 'Update Error',
      template: message
    });
  };

  function SuccessPopup (player) {
    return $ionicPopup.alert({
      title: 'Congratulations ' + player.username + '!',
      template: 'You have successfully updated! Now go and play!'
    });
  };
};


angular.module('ONOG.Controllers')

  .controller('LoginCtrl', LoginCtrl);

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

  .controller('MatchListCtrl', MatchListCtrl);

function MatchListCtrl(
  $scope, $state, $ionicPopup, $rootScope, Parse, MatchServices, player
) {
  $scope.matches = [];
  $scope.player = player[0];

  if($scope.player) {
    $rootScope.$broadcast('show:loading');
    MatchServices.getPlayerMatches($scope.player, null).then(function (matches) {
      console.log('matches fetched');
      $scope.matches = matches;
      MatchServices.getPlayerMatches($scope.player, 'reported').then(function (reported) {
        $scope.reported = reported;
        $rootScope.$broadcast('hide:loading');
      });
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
    if(match.status !== 'completed') {
      return;
    }
    $state.go('app.match.report', {id: match.id});
  };

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

function MatchReportCtrl(
  $scope, $state, $rootScope, $ionicPopup, $ionicHistory,
  Parse, MatchServices, cameraServices, report
) {

  $scope.match = report;

  $scope.picture = null;

  var parseFile = new Parse.File();
  var imgString = null;

  $scope.getPicture = function() {
    var options = cameraServices.camera;
    navigator.camera.getPicture(onSuccess,onFail,options);
  };
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

  };

}


angular.module('ONOG.Controllers')

  .controller('MatchViewCtrl', MatchViewCtrl);

function MatchViewCtrl(
  $scope, $state, $rootScope, $ionicPopup, $ionicHistory, $timeout,
  Parse, LadderServices, MatchServices, QueueServices, cameraServices, tournament
) {
  
  var parseFile = new Parse.File();
  var imgString = null;
  
  $scope.tournament = tournament.tournament;
  $scope.user = Parse.User;
  $scope.picture = null;

  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  
  $scope.$on("$ionicView.enter", function(event) {
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      MatchServices.getLatestMatch($scope.player).then(function (matches) {
        $scope.match = matches[0];
        if($scope.match.get('status') === 'cancelled') {
          $scope.player.set('status', 'open');
          $scope.player.save().then(function () {
            $state.go('app.dashboard');
          });
        }
        getMatchDetails();
      });
    });
  });
  
  $scope.$on('$ionicView.leave', function(event) {
    loseMatch().close();
    winMatch().close();
  });

  $scope.getPicture = function() {
    if(cameraServices.camera) {
      var options = cameraServices.camera;
      navigator.camera.getPicture(onSuccess,onFail,options);
    }
  };
  var onSuccess = function(imageData) {
    $scope.picture = 'data:image/png;base64,' + imageData;
    imgString = imageData;
    $scope.$apply();
  };
  var onFail = function(e) {
    console.log("On fail " + e);
  };

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
                if(imgString) {
                  parseFile = new Parse.File("winning.png", {base64:imgString});
                  $scope.match.set("winImage", parseFile);
                }
                $scope.match.set('winner', $scope.player);
                $scope.match.set('loser', $scope.opponent.user);
                username = $scope.opponent.username;
                recordMatch(username);
              }
            });
            break;
          case 'loss':
            loseMatch().then(function(res) {
              console.log(res);
              if(res) {
                $scope.match.set('winner', $scope.opponent.user);
                $scope.match.set('loser', $scope.player);
                username = $scope.opponent.username;
                recordMatch(username);
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
      console.log('match fetched');
      console.log($scope.match.get('winner'));
      if(refresh) {
        $scope.$broadcast('scroll.refreshComplete');
      }
    });
  }

  function recordMatch(username) {
    $rootScope.$broadcast('show:loading');
    $scope.match.set('status', 'completed');
    $scope.match.save().then(function (match) {
      $scope.match = match;
      $timeout(function () {
        Parse.Cloud.run('matchResults', {match: $scope.match.id, username: username})
          .then(function () {
            $scope.match.winner.fetch().then(function (winner) {
              console.log(winner);
              $scope.match.winner = winner;
            })
            $rootScope.$broadcast('hide:loading');
          }, function(err) {
          alert(err.message);
          $rootScope.$broadcast('hide:loading');
        });
      }, 2000);
    });
  }

  function getMatchDetails() {
    $scope.opponent = {
      hero: null,
      battleTag: null
    };
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
}

angular.module('ONOG.Controllers')
  .controller('MenuCtrl', MenuCtrl);

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
          console.log('unsubbed');
        }, function(e) {
          console.log('failed to sub');
        });
      }
      $timeout(function () {
        Parse.User.logOut().then(function (user) {
          $state.go('app.' + link, {reload: true});
        });
      }, 1000);
      
      
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

angular.module('ONOG.routes.admin', [])
  .config(AdminRoutes);

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
        tourney: ['TournamentServices', function (TournamentServices) {
          return TournamentServices.getTournament();
        }],
        newTournament: ['TournamentServices', 'tourney', function (TournamentServices, tourney) {
          if(tourney.length) {
            return tourney[0];
          } else {
            return TournamentServices.createTournament();
          }
        }]
      }
    })
    .state('app.admin.matches', {
      url: '/matches',
      cache: false,
      templateUrl: 'templates/admin/admin.matches.html',
      controller: 'AdminMatchesCtrl'
    })
    .state('app.admin.match', {
      url: '/match/:id',
      cache: false,
      templateUrl: 'templates/admin/admin.match.html',
      controller: 'AdminMatchCtrl',
      resolve: {
        match: ['MatchServices', '$stateParams', function (MatchServices, $stateParams) {
          return MatchServices.getMatchDetails($stateParams.id);
        }]
      }
    })
    .state('app.admin.players', {
      url: '/players',
      cache: false,
      templateUrl: 'templates/admin/admin.players.html',
      controller: 'AdminPlayersCtrl'
    });
  
}

angular.module('ONOG.routes.ladder', [])
  .config(LadderRoutes);

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
    .state('app.ladder.profile', {
      url: '/profile',
      cache: false,
      templateUrl: 'templates/ladder/profile.html',
      controller: 'LadderProfileCtrl',
      resolve: {
        player: ['Parse', 'LadderServices', 'tournament', function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament.tournament, Parse.User.current());
        }]
      }
    });
}

angular.module('ONOG.routes.matches', [])
  .config(MatchRoutes);

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
      url: '/list',
      templateUrl: 'templates/match/match.list.html',
      controller: 'MatchListCtrl',
      cache: false,
      resolve: {
        player: ['Parse', 'LadderServices', 'tournament', function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament.tournament, Parse.User.current());
        }]
      }
    })
    .state('app.match.view', {
      url: '/view',
      templateUrl: 'templates/match/match.view.html',
      controller: 'MatchViewCtrl'
    })
    .state('app.match.report', {
      url: '/report/:id',
      cache: false,
      templateUrl: 'templates/match/match.report.html',
      controller: 'MatchReportCtrl',
      resolve: {
        report: ['MatchServices', '$stateParams', function (MatchServices, $stateParams) {
          return MatchServices.getMatch($stateParams.id);
        }]
      }
    });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL2xhZGRlci5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL2xvY2F0aW9uLnNlcnZpY2VzLmpzIiwic2VydmljZXMvbWF0Y2guc2VydmljZXMuanMiLCJzZXJ2aWNlcy9waG90by5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL3F1ZXVlLnNlcnZpY2VzLmpzIiwic2VydmljZXMvdG91cm5hbWVudC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoLmN0cmwuanMiLCJjb250cm9sbGVycy9hZG1pbi5tYXRjaGVzLmN0cmwuanMiLCJjb250cm9sbGVycy9hZG1pbi5wbGF5ZXJzLmN0cmwuanMiLCJjb250cm9sbGVycy9hZG1pbi5zZXR0aW5ncy5jdHJsLmpzIiwiY29udHJvbGxlcnMvZGFzaGJvYXJkLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIuam9pbi5jdHJsLmpzIiwiY29udHJvbGxlcnMvbGFkZGVyLmxlYWRlcmJvYXJkLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIucGFzc3dvcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5wcm9maWxlLmN0cmwuanMiLCJjb250cm9sbGVycy9sb2dpbi5jdHJsLmpzIiwiY29udHJvbGxlcnMvbWF0Y2gubGlzdC5jdHJsLmpzIiwiY29udHJvbGxlcnMvbWF0Y2gucmVwb3J0LmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC52aWV3LmN0cmwuanMiLCJjb250cm9sbGVycy9tZW51LmN0cmwuanMiLCJjb250cm9sbGVycy9yZWdpc3Rlci5jdHJsLmpzIiwicm91dGVzL2FkbWluLnJvdXRlcy5qcyIsInJvdXRlcy9sYWRkZXIucm91dGVzLmpzIiwicm91dGVzL21hdGNoLnJvdXRlcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt5Q0FBQSxRQUFBLE9BQUEsZUFBQTtHQUNBLE9BQUE7O0FBRUEsU0FBQSxRQUFBLHNCQUFBLGtCQUFBLGVBQUE7O0VBRUEsaUJBQUEsNEJBQUE7RUFDQSxpQkFBQSwyQkFBQTs7RUFFQSxjQUFBLFdBQUEsNENBQUE7O0VBRUEsSUFBQSxNQUFBLFNBQUEsU0FBQTtJQUNBLHFCQUFBLFVBQUEsWUFBQTs7OztBQ1hBLFFBQUEsT0FBQSxvQkFBQTs7O0FDQUEsUUFBQSxPQUFBLFFBQUE7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7OztBQ1RBLFFBQUEsT0FBQSxlQUFBO0VBQ0E7RUFDQTtFQUNBOztHQUVBLE9BQUE7O0FBRUEsU0FBQSxRQUFBLGdCQUFBLG9CQUFBOztFQUVBLG1CQUFBLFVBQUE7O0VBRUE7S0FDQSxNQUFBLE9BQUE7TUFDQSxLQUFBO01BQ0EsVUFBQTtNQUNBLE9BQUE7TUFDQSxhQUFBO01BQ0EsWUFBQTtNQUNBLFNBQUE7UUFDQSw0REFBQSxVQUFBLG9CQUFBLElBQUEsT0FBQSxRQUFBO1VBQ0EsSUFBQSxLQUFBLEdBQUE7VUFDQSxtQkFBQSxnQkFBQSxLQUFBLFVBQUEsYUFBQTtZQUNBLEdBQUEsWUFBQSxRQUFBO2NBQ0EsR0FBQSxRQUFBLFlBQUE7OztVQUdBLFVBQUEsT0FBQTtZQUNBLE1BQUEsU0FBQTs7VUFFQSxPQUFBLEdBQUE7Ozs7S0FJQSxNQUFBLGVBQUE7TUFDQSxLQUFBO01BQ0EsT0FBQTtRQUNBLGVBQUE7VUFDQSxhQUFBOzs7O0tBSUEsTUFBQSxpQkFBQTtNQUNBLEtBQUE7TUFDQSxPQUFBO1FBQ0EsZUFBQTtVQUNBLGFBQUE7VUFDQSxZQUFBOzs7O0tBSUEsTUFBQSxhQUFBO01BQ0EsS0FBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO1FBQ0EsZUFBQTtVQUNBLGFBQUE7VUFDQSxZQUFBOzs7O0tBSUEsTUFBQSxnQkFBQTtNQUNBLEtBQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtRQUNBLGVBQUE7VUFDQSxhQUFBO1VBQ0EsWUFBQTs7OztLQUlBLE1BQUEsYUFBQTtNQUNBLEtBQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtRQUNBLGVBQUE7VUFDQSxhQUFBO1VBQ0EsWUFBQTs7Ozs7O0FDNUVBLFFBQUEsT0FBQTtHQUNBLFNBQUEsVUFBQTtHQUNBLElBQUE7O0FBRUEsU0FBQTtFQUNBLGdCQUFBLFFBQUEsWUFBQSxlQUFBO0VBQ0Esa0JBQUEsZUFBQSxpQkFBQTtFQUNBO0VBQ0EsZUFBQSxNQUFBLFdBQUE7SUFDQSxHQUFBLE9BQUEsV0FBQSxPQUFBLFFBQUEsUUFBQSxVQUFBOzs7TUFHQSxRQUFBLFFBQUEsU0FBQSx5QkFBQTs7Ozs7TUFLQSxRQUFBLFFBQUEsU0FBQSxjQUFBOztJQUVBLEdBQUEsT0FBQSxXQUFBO01BQ0EsVUFBQTs7OztJQUlBLFdBQUEsSUFBQSwwQkFBQSxTQUFBLE9BQUEsYUFBQTtNQUNBLElBQUEsY0FBQTs7OztJQUlBLFdBQUEsSUFBQSwyQkFBQSxTQUFBLE9BQUEsYUFBQTtNQUNBLElBQUEsZUFBQTtNQUNBLFlBQUEsTUFBQTtVQUNBLE9BQUE7VUFDQSxTQUFBOztTQUVBLEtBQUEsV0FBQTtVQUNBLE1BQUEsU0FBQTs7Ozs7SUFLQSxXQUFBLElBQUEsZ0JBQUEsV0FBQTtNQUNBLGNBQUEsS0FBQSxDQUFBLFVBQUEsa0VBQUEsY0FBQSxNQUFBLFdBQUE7OztJQUdBLFdBQUEsSUFBQSxnQkFBQSxXQUFBO01BQ0EsY0FBQTs7O0lBR0EsZUFBQSxHQUFBLFVBQUEsVUFBQTs7Ozs7O0lBTUEsR0FBQSxPQUFBLGlCQUFBO01BQ0EsUUFBQSxJQUFBO01BQ0EsZ0JBQUEsR0FBQSxhQUFBLFNBQUEsR0FBQTtRQUNBLFFBQUEsSUFBQTtRQUNBLEdBQUEsQ0FBQSxHQUFBLE9BQUE7VUFDQSxZQUFBLE1BQUE7WUFDQSxPQUFBO1lBQ0EsVUFBQSw2QkFBQSxHQUFBLFFBQUE7YUFDQSxLQUFBLFNBQUEsS0FBQTs7O2VBR0E7VUFDQSxRQUFBLEdBQUE7WUFDQSxLQUFBO2NBQ0EsT0FBQSxHQUFBLGlCQUFBLENBQUEsUUFBQTtjQUNBO1lBQ0EsS0FBQTtjQUNBLE9BQUEsR0FBQSxpQkFBQSxDQUFBLFFBQUE7Y0FDQTtZQUNBLEtBQUE7Y0FDQSxZQUFBLE1BQUE7Z0JBQ0EsT0FBQTtnQkFDQSxVQUFBO2lCQUNBLEtBQUEsU0FBQSxLQUFBO2dCQUNBLE9BQUEsR0FBQSxpQkFBQSxDQUFBLFFBQUE7O2NBRUE7Ozs7O0lBS0EsR0FBQSxPQUFBLFNBQUEsU0FBQSxpQkFBQTtNQUNBLGlCQUFBLGNBQUEsS0FBQSxVQUFBLFVBQUE7UUFDQSxpQkFBQSxZQUFBO1FBQ0EsY0FBQSxnQkFBQTtVQUNBLGFBQUE7O1FBRUEsT0FBQSxHQUFBO1NBQ0EsVUFBQSxLQUFBO1FBQ0EsR0FBQSxhQUFBLFVBQUEsY0FBQTtVQUNBLFVBQUEsYUFBQTs7UUFFQSxPQUFBLEdBQUE7Ozs7OztBQ2pHQSxRQUFBLE9BQUEsaUJBQUE7Ozs7QUNDQSxRQUFBLE9BQUE7O0dBRUEsUUFBQSxrQkFBQTtHQUNBLFFBQUEsVUFBQTs7QUFFQSxTQUFBLGVBQUEsT0FBQSxRQUFBO0VBQ0EsT0FBQTtJQUNBLFlBQUE7SUFDQSxXQUFBO0lBQ0EsZ0JBQUE7SUFDQSxnQkFBQTtJQUNBLG1CQUFBO0lBQ0EsZUFBQTs7O0VBR0EsU0FBQSxjQUFBLE9BQUE7SUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUEsT0FBQTtJQUNBLE1BQUEsV0FBQSxZQUFBO0lBQ0EsT0FBQSxNQUFBOzs7RUFHQSxTQUFBLGtCQUFBLFlBQUEsTUFBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQSxPQUFBO0lBQ0EsTUFBQSxRQUFBLGNBQUE7SUFDQSxNQUFBLFdBQUEsUUFBQTtJQUNBLE1BQUEsUUFBQSxVQUFBO0lBQ0EsT0FBQSxNQUFBOzs7RUFHQSxTQUFBLFdBQUEsU0FBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQSxPQUFBO0lBQ0EsTUFBQSxRQUFBLGNBQUE7SUFDQSxNQUFBLFdBQUEsVUFBQTtJQUNBLE9BQUEsTUFBQTs7O0VBR0EsU0FBQSxlQUFBLFNBQUEsV0FBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQSxPQUFBO0lBQ0EsTUFBQSxRQUFBLGNBQUE7SUFDQSxNQUFBLFFBQUEsYUFBQTtJQUNBLE9BQUEsTUFBQTs7O0VBR0EsU0FBQSxVQUFBLFNBQUEsTUFBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQSxPQUFBO0lBQ0EsTUFBQSxRQUFBLGNBQUE7SUFDQSxNQUFBLFFBQUEsUUFBQTtJQUNBLE1BQUEsTUFBQTtJQUNBLE9BQUEsTUFBQTs7O0VBR0EsU0FBQSxlQUFBLFNBQUEsTUFBQSxVQUFBO0lBQ0EsSUFBQSxTQUFBLElBQUEsT0FBQTtJQUNBLE9BQUEsSUFBQSxjQUFBO0lBQ0EsT0FBQSxJQUFBLFFBQUE7SUFDQSxPQUFBLElBQUE7SUFDQSxPQUFBLElBQUEsUUFBQTtJQUNBLE9BQUEsSUFBQSxVQUFBO0lBQ0EsT0FBQSxJQUFBLFVBQUE7SUFDQSxPQUFBLE9BQUE7Ozs7QUFJQSxTQUFBLE9BQUEsT0FBQTtFQUNBLElBQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtFQUNBLElBQUEsYUFBQSxDQUFBLGNBQUEsUUFBQSxhQUFBLFlBQUEsWUFBQTtJQUNBLFFBQUEsVUFBQSxVQUFBLGVBQUEsUUFBQSxVQUFBLE9BQUEsVUFBQSxhQUFBO0VBQ0EsTUFBQSxpQkFBQSxPQUFBOztFQUVBLE9BQUE7SUFDQSxPQUFBOzs7O0FDdkVBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLG9CQUFBOztBQUVBLFNBQUEsa0JBQUEsT0FBQSxxQkFBQSxJQUFBOztFQUVBLElBQUEsV0FBQSxDQUFBLFFBQUEsSUFBQSxNQUFBO0VBQ0EsT0FBQTtJQUNBLFVBQUE7SUFDQSxhQUFBO0lBQ0EsYUFBQTs7O0VBR0EsU0FBQSxhQUFBLFFBQUE7SUFDQSxTQUFBLFNBQUEsSUFBQSxNQUFBLFNBQUEsQ0FBQSxVQUFBLE9BQUEsVUFBQSxXQUFBLE9BQUE7OztFQUdBLFNBQUEsZUFBQTtJQUNBLElBQUEsS0FBQSxHQUFBO0lBQ0EsSUFBQSxhQUFBLENBQUEsb0JBQUE7SUFDQTtPQUNBLG1CQUFBO09BQ0EsS0FBQSxVQUFBLFVBQUE7UUFDQSxHQUFBLFFBQUEsU0FBQTtTQUNBLFNBQUEsS0FBQTtRQUNBLFFBQUEsSUFBQTtRQUNBLEdBQUEsT0FBQTs7SUFFQSxPQUFBLEdBQUE7Ozs7QUM1QkEsUUFBQSxPQUFBOztHQUVBLFFBQUEsaUJBQUE7R0FDQSxRQUFBLFNBQUE7O0FBRUEsU0FBQSxjQUFBLE9BQUEsT0FBQSxJQUFBO0VBQ0EsSUFBQSxPQUFBLE1BQUE7RUFDQSxPQUFBO0lBQ0EsbUJBQUE7SUFDQSxpQkFBQTtJQUNBLG9CQUFBO0lBQ0EsZ0JBQUE7SUFDQSxVQUFBO0lBQ0Esa0JBQUE7SUFDQSxpQkFBQTs7O0VBR0EsU0FBQSxpQkFBQSxRQUFBLFFBQUE7SUFDQSxJQUFBLFVBQUEsSUFBQSxNQUFBLE1BQUEsTUFBQTtJQUNBLFFBQUEsUUFBQSxXQUFBO0lBQ0EsSUFBQSxVQUFBLElBQUEsTUFBQSxNQUFBLE1BQUE7SUFDQSxRQUFBLFFBQUEsV0FBQTtJQUNBLElBQUEsWUFBQSxNQUFBLE1BQUEsR0FBQSxTQUFBO0lBQ0EsVUFBQSxXQUFBO0lBQ0EsVUFBQSxNQUFBO0lBQ0EsR0FBQSxRQUFBO01BQ0EsVUFBQSxRQUFBLFVBQUE7O0lBRUEsT0FBQSxVQUFBOzs7RUFHQSxTQUFBLGVBQUEsUUFBQTtJQUNBLElBQUEsT0FBQSxPQUFBLElBQUE7SUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsUUFBQTtJQUNBLE1BQUEsUUFBQTtJQUNBLE1BQUEsV0FBQTtJQUNBLE1BQUEsTUFBQTtJQUNBLEdBQUEsU0FBQSxXQUFBO01BQ0EsTUFBQSxRQUFBLFdBQUE7V0FDQTtNQUNBLE1BQUEsUUFBQSxXQUFBOztJQUVBLE9BQUEsTUFBQTs7O0VBR0EsU0FBQSxtQkFBQSxRQUFBO0lBQ0EsSUFBQSxPQUFBLE9BQUEsSUFBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsUUFBQSxVQUFBO0lBQ0EsTUFBQSxXQUFBO0lBQ0EsR0FBQSxTQUFBLFdBQUE7TUFDQSxNQUFBLFFBQUEsV0FBQTtXQUNBO01BQ0EsTUFBQSxRQUFBLFdBQUE7O0lBRUEsTUFBQSxRQUFBLFlBQUE7SUFDQSxNQUFBLFFBQUEsWUFBQTtJQUNBLE1BQUEsTUFBQTs7SUFFQSxPQUFBLE1BQUE7O0VBRUEsU0FBQSxxQkFBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsUUFBQSxVQUFBO0lBQ0EsTUFBQSxXQUFBO0lBQ0EsT0FBQSxNQUFBOztFQUVBLFNBQUEsZ0JBQUEsUUFBQTtJQUNBLElBQUEsT0FBQSxPQUFBLElBQUE7SUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsV0FBQTtJQUNBLE1BQUEsTUFBQTtJQUNBLEdBQUEsU0FBQSxXQUFBO01BQ0EsTUFBQSxRQUFBLFdBQUE7V0FDQTtNQUNBLE1BQUEsUUFBQSxXQUFBOztJQUVBLE1BQUEsUUFBQSxVQUFBO0lBQ0EsTUFBQSxNQUFBO0lBQ0EsT0FBQSxNQUFBOztFQUVBLFNBQUEsU0FBQSxJQUFBO0lBQ0EsSUFBQSxRQUFBLElBQUEsTUFBQTtJQUNBLE1BQUEsS0FBQTtJQUNBLE9BQUEsTUFBQTs7RUFFQSxTQUFBLGdCQUFBLElBQUE7SUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsUUFBQTtJQUNBLE1BQUEsUUFBQTtJQUNBLE1BQUEsV0FBQTtJQUNBLE9BQUEsTUFBQSxJQUFBOzs7O0FBSUEsU0FBQSxNQUFBLE9BQUE7RUFDQSxJQUFBLFFBQUEsTUFBQSxPQUFBLE9BQUE7RUFDQSxJQUFBLGFBQUE7SUFDQSxjQUFBLFdBQUEsV0FBQSxTQUFBLFNBQUEsYUFBQSxhQUFBLGNBQUEsY0FBQSxVQUFBLFVBQUE7SUFDQSxZQUFBLGdCQUFBLGVBQUEsY0FBQSxTQUFBLFNBQUE7O0VBRUEsTUFBQSxpQkFBQSxPQUFBOztFQUVBLE9BQUE7SUFDQSxPQUFBOzs7O0FDekdBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLGtCQUFBOztBQUVBLFNBQUEsZ0JBQUEsU0FBQTs7RUFFQSxJQUFBLFNBQUE7SUFDQSxTQUFBO0lBQ0EsYUFBQTtJQUNBLGNBQUE7SUFDQSxXQUFBO0lBQ0EsWUFBQTs7RUFFQSxHQUFBLFFBQUEsUUFBQTtJQUNBLE9BQUEsa0JBQUEsT0FBQSxnQkFBQTtJQUNBLE9BQUEsZUFBQSxPQUFBLGFBQUE7OztFQUdBLE9BQUE7SUFDQSxRQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ25CQSxRQUFBLE9BQUE7O0dBRUEsUUFBQSxpQkFBQTs7QUFFQSxTQUFBLGdCQUFBO0VBQ0EsSUFBQSxXQUFBO0lBQ0EsTUFBQSxDQUFBLGlCQUFBLHdCQUFBO01BQ0EsWUFBQSxnQkFBQSwyQkFBQSxVQUFBO01BQ0EsY0FBQSxrQkFBQSxtQkFBQSxtQkFBQTtNQUNBLGlCQUFBLHFCQUFBLGdCQUFBLGdCQUFBO01BQ0EscUJBQUEsaUJBQUEsNkJBQUE7TUFDQSxpQkFBQSxjQUFBLHdCQUFBLG1CQUFBO01BQ0EsaUJBQUEsaUJBQUEsaUJBQUEsc0JBQUE7TUFDQSx5QkFBQSxvQkFBQSwwQkFBQTtNQUNBOzs7RUFHQSxJQUFBLFNBQUE7SUFDQSxDQUFBLE1BQUEsUUFBQSxTQUFBO0lBQ0EsQ0FBQSxNQUFBLFVBQUEsU0FBQTtJQUNBLENBQUEsTUFBQSxXQUFBLFNBQUE7SUFDQSxDQUFBLE1BQUEsV0FBQSxTQUFBO0lBQ0EsQ0FBQSxNQUFBLFNBQUEsU0FBQTtJQUNBLENBQUEsTUFBQSxXQUFBLFNBQUE7SUFDQSxDQUFBLE1BQUEsVUFBQSxTQUFBO0lBQ0EsQ0FBQSxNQUFBLFVBQUEsU0FBQTtJQUNBLENBQUEsTUFBQSxTQUFBLFNBQUE7O0VBRUEsT0FBQTtJQUNBLFVBQUE7SUFDQSxRQUFBOzs7OztBQzdCQSxRQUFBLE9BQUE7O0dBRUEsUUFBQSxzQkFBQTtHQUNBLFFBQUEsY0FBQTtHQUNBLFFBQUEsV0FBQTs7QUFFQSxTQUFBLG1CQUFBLE9BQUEsSUFBQSxZQUFBLFNBQUEsUUFBQTtFQUNBLE9BQUE7SUFDQSxlQUFBO0lBQ0Esa0JBQUE7SUFDQSxXQUFBO0lBQ0EsZ0JBQUE7O0VBRUEsU0FBQSxlQUFBLFNBQUEsWUFBQTtJQUNBLElBQUEsU0FBQSxJQUFBLE9BQUEsTUFBQTtJQUNBLE9BQUEsSUFBQSxjQUFBO0lBQ0EsT0FBQSxJQUFBLFFBQUEsTUFBQSxLQUFBO0lBQ0EsT0FBQSxJQUFBLFlBQUEsTUFBQSxLQUFBLFVBQUE7SUFDQSxPQUFBLElBQUEsT0FBQTtJQUNBLE9BQUEsSUFBQSxRQUFBO0lBQ0EsT0FBQSxJQUFBLFVBQUE7SUFDQSxPQUFBLElBQUEsVUFBQTtJQUNBLE9BQUEsT0FBQTs7RUFFQSxTQUFBLGdCQUFBO0lBQ0EsSUFBQSxRQUFBLElBQUEsTUFBQSxNQUFBLFFBQUE7SUFDQSxNQUFBLFFBQUEsUUFBQTtJQUNBLE1BQUEsUUFBQTtJQUNBLE9BQUEsTUFBQTs7RUFFQSxTQUFBLG9CQUFBO0lBQ0EsSUFBQSxRQUFBLEdBQUE7SUFDQSxJQUFBLGFBQUEsSUFBQSxXQUFBO0lBQ0EsV0FBQSxJQUFBLFFBQUE7SUFDQSxXQUFBLElBQUEsVUFBQTtJQUNBLFdBQUEsSUFBQSxRQUFBO0lBQ0EsV0FBQSxPQUFBLEtBQUEsVUFBQSxTQUFBO01BQ0EsSUFBQSxVQUFBLElBQUEsUUFBQTtNQUNBLFFBQUEsSUFBQSxjQUFBO01BQ0EsUUFBQSxJQUFBLFFBQUE7TUFDQSxRQUFBLElBQUEsZUFBQTtNQUNBLFFBQUEsSUFBQSxjQUFBO01BQ0EsUUFBQSxPQUFBLEtBQUEsVUFBQSxTQUFBO1FBQ0EsTUFBQSxRQUFBOzs7SUFHQSxPQUFBLE1BQUE7O0VBRUEsU0FBQSxXQUFBLFNBQUE7SUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUEsT0FBQTtJQUNBLE1BQUEsUUFBQSxjQUFBO0lBQ0EsTUFBQSxRQUFBO0lBQ0EsT0FBQSxNQUFBOzs7O0FBSUEsU0FBQSxXQUFBLE9BQUE7RUFDQSxJQUFBLFFBQUEsTUFBQSxPQUFBLE9BQUE7RUFDQSxJQUFBLGFBQUEsQ0FBQSxRQUFBLFFBQUEsVUFBQSxZQUFBLGtCQUFBO0VBQ0EsTUFBQSxpQkFBQSxPQUFBOztFQUVBLE9BQUE7SUFDQSxPQUFBOzs7QUFHQSxTQUFBLFFBQUEsT0FBQTtFQUNBLElBQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtFQUNBLElBQUEsYUFBQSxDQUFBLGNBQUEsUUFBQSxjQUFBO0VBQ0EsTUFBQSxpQkFBQSxPQUFBOztFQUVBLE9BQUE7SUFDQSxPQUFBOzs7OztBQ3ZFQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxrQkFBQTs7QUFFQSxTQUFBLGVBQUEsUUFBQSxPQUFBLGVBQUEsT0FBQSxhQUFBO0VBQ0EsT0FBQSxRQUFBO0VBQ0EsUUFBQSxJQUFBLE9BQUE7O0VBRUEsT0FBQSxXQUFBLFVBQUEsTUFBQTtJQUNBLE9BQUEsT0FBQSxNQUFBLE9BQUE7O0VBRUEsT0FBQSxlQUFBLFlBQUE7SUFDQSxZQUFBO01BQ0E7UUFDQSxZQUFBO1FBQ0EsT0FBQTtRQUNBLE9BQUE7UUFDQSxTQUFBO1VBQ0EsRUFBQSxNQUFBO1VBQ0EsRUFBQSxNQUFBO1lBQ0EsTUFBQTtZQUNBLE9BQUEsU0FBQSxHQUFBO2NBQ0EsR0FBQSxDQUFBLE9BQUEsTUFBQSxXQUFBO2dCQUNBLEVBQUE7O2NBRUEsT0FBQTs7OztTQUlBLEtBQUEsVUFBQSxLQUFBO01BQ0EsR0FBQSxLQUFBO1FBQ0EsSUFBQSxTQUFBLE9BQUEsTUFBQTtRQUNBLElBQUEsUUFBQSxPQUFBLE1BQUE7UUFDQSxJQUFBLFlBQUEsT0FBQSxJQUFBLFlBQUE7UUFDQSxJQUFBLGFBQUEsTUFBQSxJQUFBLFlBQUE7UUFDQSxJQUFBLFdBQUEsT0FBQSxJQUFBLFVBQUE7UUFDQSxJQUFBLFlBQUEsTUFBQSxJQUFBLFlBQUE7UUFDQSxPQUFBLElBQUEsVUFBQTtRQUNBLE1BQUEsSUFBQSxVQUFBO1FBQ0EsT0FBQSxJQUFBLFFBQUE7UUFDQSxNQUFBLElBQUEsVUFBQTtRQUNBLE1BQUEsVUFBQTtRQUNBLE9BQUEsVUFBQTtRQUNBLE9BQUEsTUFBQSxJQUFBLFVBQUE7UUFDQSxPQUFBLE1BQUEsSUFBQSxVQUFBO1FBQ0EsT0FBQSxNQUFBLElBQUEsU0FBQTtRQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUEsWUFBQTtVQUNBLE9BQUEsUUFBQTs7Ozs7O0VBTUEsT0FBQSxhQUFBLFlBQUE7SUFDQSxZQUFBO01BQ0E7UUFDQSxZQUFBO1FBQ0EsT0FBQTtRQUNBLE9BQUE7UUFDQSxTQUFBO1VBQ0EsRUFBQSxNQUFBO1VBQ0EsRUFBQSxNQUFBO1lBQ0EsTUFBQTtZQUNBLE9BQUEsU0FBQSxHQUFBO2NBQ0EsR0FBQSxDQUFBLE9BQUEsTUFBQSxXQUFBO2dCQUNBLEVBQUE7O2NBRUEsT0FBQTs7OztTQUlBLEtBQUEsVUFBQSxLQUFBO01BQ0EsR0FBQSxLQUFBO1FBQ0EsT0FBQSxNQUFBLElBQUEsVUFBQTtRQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUEsWUFBQTtVQUNBLE9BQUEsUUFBQTs7Ozs7Q0FLQTs7O0FDaEZBLFFBQUEsT0FBQTs7R0FFQSxXQUFBLG9CQUFBOztBQUVBLFNBQUEsaUJBQUEsUUFBQSxPQUFBLGVBQUEsUUFBQTs7RUFFQSxjQUFBLHFCQUFBLEtBQUEsVUFBQSxTQUFBO0lBQ0EsT0FBQSxVQUFBOzs7RUFHQSxPQUFBLFdBQUEsVUFBQSxNQUFBO0lBQ0EsT0FBQSxPQUFBLE1BQUEsT0FBQTs7Q0FFQTs7O0FDYkEsUUFBQSxPQUFBOztHQUVBLFdBQUEsb0JBQUE7O0FBRUEsU0FBQSxpQkFBQSxRQUFBLE9BQUEsZ0JBQUE7RUFDQSxPQUFBLFNBQUE7SUFDQSxPQUFBOzs7RUFHQSxPQUFBLGVBQUEsWUFBQTtJQUNBLGVBQUEsY0FBQSxPQUFBLE9BQUEsT0FBQSxLQUFBLFVBQUEsU0FBQTtNQUNBLE9BQUEsVUFBQTs7O0NBR0E7OztBQ2RBLFFBQUEsT0FBQTs7R0FFQSxXQUFBLHFCQUFBOztBQUVBLFNBQUEsa0JBQUEsUUFBQSxrQkFBQSxlQUFBLFlBQUE7RUFDQSxPQUFBLFVBQUE7O0VBRUEsT0FBQSxhQUFBLFdBQUE7O0VBRUEsT0FBQSx3QkFBQSxZQUFBO0lBQ0EsaUJBQUEsY0FBQSxLQUFBLFVBQUEsVUFBQTtNQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsU0FBQSxDQUFBLFVBQUEsU0FBQSxVQUFBLFdBQUEsU0FBQTtNQUNBLE9BQUEsV0FBQSxJQUFBLFlBQUE7TUFDQSxPQUFBLFdBQUEsT0FBQSxLQUFBLFVBQUEsWUFBQTtRQUNBLE9BQUEsYUFBQTtRQUNBLE1BQUE7Ozs7Ozs7QUNmQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxpQkFBQTs7QUFFQSxTQUFBO0VBQ0EsUUFBQSxRQUFBLFNBQUEsVUFBQSxXQUFBLGFBQUEsWUFBQTtFQUNBLE9BQUEsWUFBQSxlQUFBLGVBQUEsZ0JBQUE7RUFDQTtFQUNBLElBQUEsVUFBQTtFQUNBLE9BQUEsYUFBQSxXQUFBO0VBQ0EsT0FBQSxPQUFBLE1BQUE7O0VBRUEsT0FBQSxNQUFBO0lBQ0EsU0FBQTtJQUNBLE1BQUEsV0FBQSxTQUFBLE9BQUE7OztFQUdBLE9BQUEsV0FBQSxpQkFBQTtFQUNBLE9BQUEsV0FBQSxjQUFBO0VBQ0EsT0FBQSxXQUFBLGNBQUE7RUFDQSxPQUFBLGFBQUEsQ0FBQSxLQUFBOztFQUVBLE9BQUEsSUFBQSxvQkFBQSxTQUFBLE9BQUE7SUFDQSxHQUFBLGFBQUEsVUFBQSxjQUFBO01BQ0EsVUFBQSxhQUFBOztJQUVBLGVBQUEsVUFBQSxPQUFBLFlBQUEsT0FBQSxLQUFBLFdBQUEsS0FBQSxVQUFBLFNBQUE7TUFDQSxHQUFBLFFBQUEsUUFBQTtRQUNBLE9BQUEsU0FBQSxRQUFBO1FBQ0EsT0FBQSxPQUFBLElBQUEsWUFBQSxPQUFBLFNBQUE7UUFDQSxPQUFBLE9BQUEsT0FBQSxLQUFBLFVBQUEsUUFBQTtVQUNBLE9BQUEsU0FBQTtVQUNBLGNBQUEsZUFBQSxPQUFBLFFBQUEsS0FBQSxVQUFBLFNBQUE7WUFDQSxHQUFBLFFBQUEsUUFBQTtjQUNBLE9BQUEsUUFBQSxRQUFBO2NBQ0E7O1lBRUE7WUFDQTtZQUNBLE9BQUEsV0FBQTs7Ozs7OztFQU9BLE9BQUEsWUFBQSxXQUFBO0lBQ0EsT0FBQSxPQUFBOztFQUVBLE9BQUEsYUFBQSxZQUFBO0lBQ0EsR0FBQSxPQUFBLElBQUEsU0FBQTtNQUNBLE9BQUEsT0FBQSxJQUFBLFVBQUE7TUFDQTs7O0VBR0EsT0FBQSxjQUFBLFlBQUE7SUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO0lBQ0EsT0FBQTtJQUNBOzs7RUFHQSxPQUFBLGdCQUFBLFlBQUE7SUFDQSxPQUFBLE1BQUEsUUFBQSxLQUFBLFVBQUEsT0FBQTtNQUNBLE9BQUEsUUFBQTtNQUNBLFFBQUEsT0FBQSxNQUFBLElBQUE7UUFDQSxLQUFBO1VBQ0E7VUFDQTtRQUNBLEtBQUE7VUFDQTtVQUNBOzs7OztFQUtBLE9BQUEsT0FBQSxXQUFBO0lBQ0EsVUFBQSxPQUFBOzs7RUFHQSxPQUFBLGdCQUFBLFdBQUE7SUFDQSxPQUFBO0lBQ0EsVUFBQSxVQUFBLFlBQUEsQ0FBQSxnQkFBQTs7O0VBR0EsT0FBQSxZQUFBLFdBQUE7SUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO0lBQ0E7OztFQUdBLE9BQUEsV0FBQSxZQUFBO0lBQ0EsU0FBQSxPQUFBOzs7RUFHQSxPQUFBLElBQUEsWUFBQSxXQUFBO0lBQ0EsT0FBQTs7O0VBR0EsT0FBQSxJQUFBLFdBQUEsWUFBQTtJQUNBLFFBQUEsSUFBQTs7O0VBR0EsU0FBQSxtQkFBQTtJQUNBLEdBQUEsT0FBQSxpQkFBQTtNQUNBLGdCQUFBLFVBQUEsT0FBQSxPQUFBLFVBQUEsU0FBQSxLQUFBO1FBQ0EsUUFBQSxJQUFBLGVBQUEsT0FBQSxPQUFBO1NBQ0EsU0FBQSxHQUFBO1FBQ0EsUUFBQSxJQUFBOzs7SUFHQSxJQUFBLGVBQUEsT0FBQSxPQUFBLElBQUE7SUFDQSxHQUFBLGNBQUE7TUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUE7TUFDQSxNQUFBLFlBQUEsWUFBQSxjQUFBO01BQ0EsTUFBQSxNQUFBO01BQ0EsTUFBQSxLQUFBO1FBQ0EsU0FBQSxTQUFBLGVBQUE7VUFDQSxRQUFBLElBQUE7VUFDQSxHQUFBLE9BQUEsbUJBQUEsY0FBQSxRQUFBO1lBQ0EsZ0JBQUEsVUFBQSxZQUFBLFNBQUEsS0FBQTtjQUNBLFFBQUEsSUFBQTtlQUNBLFNBQUEsR0FBQTtjQUNBLFFBQUEsSUFBQTs7Ozs7OztFQU9BLFNBQUEsWUFBQTtJQUNBLFNBQUEsWUFBQTtNQUNBLE9BQUEsT0FBQSxRQUFBLEtBQUEsVUFBQSxRQUFBO1FBQ0E7O09BRUE7OztFQUdBLFNBQUEsU0FBQTtJQUNBLEdBQUEsT0FBQSxRQUFBO01BQ0EsUUFBQSxPQUFBLE9BQUEsSUFBQTtRQUNBLEtBQUE7VUFDQSxPQUFBO1VBQ0E7UUFDQSxLQUFBO1VBQ0EsT0FBQTtVQUNBO1VBQ0E7UUFDQSxLQUFBO1VBQ0E7UUFDQSxLQUFBO1VBQ0E7VUFDQTtRQUNBLEtBQUE7VUFDQTtVQUNBO1FBQ0EsS0FBQTtVQUNBO1VBQ0E7UUFDQSxLQUFBO1VBQ0E7VUFDQTs7TUFFQSxRQUFBLElBQUEsT0FBQSxPQUFBLElBQUE7Ozs7RUFJQSxTQUFBLFNBQUE7SUFDQSxJQUFBLE1BQUE7SUFDQSxJQUFBLE9BQUEsT0FBQSxNQUFBLElBQUE7SUFDQSxHQUFBLE1BQUE7TUFDQSxJQUFBLGNBQUEsT0FBQSxNQUFBLElBQUEsR0FBQTtNQUNBLE9BQUEsSUFBQSxPQUFBLFdBQUEsWUFBQSxPQUFBO01BQ0EsT0FBQSxJQUFBLFVBQUEsSUFBQSxRQUFBLGFBQUE7Ozs7RUFJQSxTQUFBLGNBQUE7SUFDQSxPQUFBLE9BQUEsT0FBQSxLQUFBLFVBQUEsUUFBQTtNQUNBLE9BQUEsU0FBQTtNQUNBOzs7O0VBSUEsU0FBQSxjQUFBO0lBQ0EsU0FBQSxZQUFBO01BQ0EsTUFBQSxNQUFBLElBQUEsZUFBQSxLQUFBLFVBQUEsSUFBQTtRQUNBLFFBQUEsSUFBQTtRQUNBLGNBQUEsZUFBQSxPQUFBLFFBQUEsS0FBQSxVQUFBLFNBQUE7VUFDQSxHQUFBLFFBQUEsUUFBQTtZQUNBLE9BQUEsUUFBQSxRQUFBOztVQUVBOzs7T0FHQTs7O0VBR0EsU0FBQSxxQkFBQTtJQUNBLFlBQUEsTUFBQTtNQUNBLE9BQUE7TUFDQSxVQUFBO09BQ0EsS0FBQSxTQUFBLEtBQUE7TUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO01BQ0E7Ozs7RUFJQSxTQUFBLGdCQUFBO0lBQ0EsSUFBQSxPQUFBLE9BQUEsV0FBQSxXQUFBO01BQ0EsT0FBQSxNQUFBLElBQUEsWUFBQTtXQUNBO01BQ0EsT0FBQSxNQUFBLElBQUEsWUFBQTs7SUFFQSxPQUFBLE1BQUEsT0FBQSxLQUFBLFVBQUEsT0FBQTtNQUNBLE9BQUEsUUFBQTtNQUNBLE9BQUEsT0FBQSxJQUFBLFVBQUE7TUFDQTs7OztFQUlBLFNBQUEscUJBQUE7SUFDQSxTQUFBLFlBQUE7TUFDQSxHQUFBLE9BQUEsTUFBQSxJQUFBLGNBQUEsVUFBQTtRQUNBLE9BQUEsR0FBQTs7T0FFQTs7O0VBR0EsU0FBQSxzQkFBQTtJQUNBLE1BQUEsTUFBQSxJQUFBLGdCQUFBLEtBQUEsVUFBQSxLQUFBO01BQ0EsY0FBQSxNQUFBO01BQ0EsY0FBQSxPQUFBOzs7O0VBSUEsU0FBQSxlQUFBLFNBQUEsZ0JBQUE7SUFDQSxTQUFBLFlBQUE7TUFDQSxHQUFBLE9BQUEsT0FBQSxJQUFBLGNBQUEsYUFBQTtRQUNBLE9BQUEsTUFBQSxRQUFBLEtBQUEsVUFBQSxPQUFBO1VBQ0EsT0FBQSxRQUFBO1VBQ0EsaUJBQUE7OztPQUdBOzs7RUFHQSxTQUFBLGlCQUFBLGdCQUFBO0lBQ0EsUUFBQSxPQUFBLE1BQUEsSUFBQTtNQUNBLEtBQUE7UUFDQSxHQUFBLGdCQUFBO1VBQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtVQUNBOztRQUVBO01BQ0EsS0FBQTtRQUNBLE9BQUEsT0FBQSxJQUFBLFVBQUE7UUFDQSxXQUFBLFdBQUE7UUFDQSxPQUFBLE9BQUEsT0FBQSxLQUFBLFlBQUE7VUFDQSxXQUFBLFdBQUE7VUFDQSxPQUFBLEdBQUE7O1FBRUE7TUFDQSxLQUFBO1FBQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtRQUNBO1FBQ0E7TUFDQSxLQUFBO1FBQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtRQUNBO1FBQ0E7Ozs7O0VBS0EsU0FBQSxjQUFBO0lBQ0EsWUFBQSxLQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7TUFDQSxTQUFBO1FBQ0E7VUFDQSxNQUFBO1VBQ0EsTUFBQTtVQUNBLE9BQUEsU0FBQSxHQUFBO1lBQ0EsT0FBQTs7O1FBR0E7VUFDQSxNQUFBO1VBQ0EsTUFBQTtVQUNBLE9BQUEsU0FBQSxHQUFBO1lBQ0EsT0FBQTs7OztPQUlBLEtBQUEsU0FBQSxLQUFBO01BQ0EsR0FBQSxLQUFBO1FBQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtRQUNBLE9BQUEsTUFBQSxJQUFBLFVBQUE7UUFDQSxPQUFBLE1BQUEsT0FBQSxLQUFBLFlBQUE7VUFDQTs7YUFFQTtRQUNBLE9BQUEsT0FBQSxJQUFBLFVBQUE7UUFDQSxPQUFBLE1BQUEsSUFBQSxVQUFBO1FBQ0EsT0FBQSxNQUFBLE9BQUEsS0FBQSxZQUFBO1VBQ0E7Ozs7OztFQU1BLFNBQUEsZUFBQTtJQUNBLEdBQUEsT0FBQSxNQUFBLElBQUEsY0FBQSxhQUFBO01BQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtNQUNBOzs7O0VBSUEsU0FBQSxjQUFBO0lBQ0EsT0FBQSxXQUFBLE9BQUEsT0FBQSxTQUFBLEtBQUEsS0FBQSxNQUFBLEtBQUEsU0FBQSxPQUFBLFNBQUEsS0FBQTs7Q0FFQTs7O0FDaFVBLFFBQUEsT0FBQTs7R0FFQSxXQUFBLGtCQUFBOztBQUVBLFNBQUE7RUFDQSxRQUFBLFNBQUEsYUFBQSxRQUFBLGVBQUEsSUFBQSxRQUFBLFlBQUE7RUFDQTtFQUNBLGNBQUEsZ0JBQUE7SUFDQSxhQUFBOztFQUVBLE9BQUEsYUFBQSxXQUFBO0VBQ0EsT0FBQSxPQUFBLE1BQUEsS0FBQTtFQUNBLE9BQUEsU0FBQTtJQUNBLFdBQUE7OztFQUdBLE9BQUEsaUJBQUEsWUFBQTtJQUNBLG9CQUFBO01BQ0EsVUFBQSxLQUFBO1FBQ0EsT0FBQSxPQUFBLFdBQUEsT0FBQSxLQUFBO1FBQ0EsT0FBQSxPQUFBLFNBQUE7UUFDQSxlQUFBLGVBQUEsT0FBQSxZQUFBLE9BQUEsTUFBQSxPQUFBLFFBQUEsS0FBQSxVQUFBLFFBQUE7VUFDQSxhQUFBLFFBQUEsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLEdBQUE7Ozs7TUFJQSxVQUFBLE9BQUE7UUFDQSxXQUFBOzs7O0VBSUEsU0FBQSxxQkFBQTtJQUNBLElBQUEsS0FBQSxHQUFBO0lBQ0EsSUFBQSxNQUFBLE9BQUEsT0FBQTs7SUFFQSxHQUFBLElBQUEsU0FBQSxHQUFBO01BQ0EsR0FBQSxPQUFBO01BQ0EsT0FBQSxHQUFBOztJQUVBLElBQUEsUUFBQSxJQUFBLE1BQUE7SUFDQSxHQUFBLE1BQUEsV0FBQSxHQUFBO01BQ0EsR0FBQSxPQUFBO01BQ0EsT0FBQSxHQUFBOztJQUVBLEdBQUEsTUFBQSxHQUFBLFNBQUEsS0FBQSxNQUFBLEdBQUEsU0FBQSxHQUFBO01BQ0EsR0FBQSxPQUFBO01BQ0EsT0FBQSxHQUFBOztJQUVBLEdBQUEsTUFBQSxNQUFBLEtBQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxPQUFBLEdBQUE7O0lBRUEsZUFBQSxlQUFBLE9BQUEsV0FBQSxZQUFBLEtBQUEsS0FBQSxVQUFBLFNBQUE7TUFDQSxHQUFBLFFBQUEsUUFBQTtRQUNBLEdBQUEsT0FBQTthQUNBO1FBQ0EsR0FBQSxRQUFBOzs7SUFHQSxPQUFBLEdBQUE7R0FDQTs7RUFFQSxTQUFBLFlBQUEsU0FBQTtJQUNBLE9BQUEsWUFBQSxNQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7O0dBRUE7O0VBRUEsU0FBQSxjQUFBLFFBQUE7SUFDQSxPQUFBLFlBQUEsTUFBQTtNQUNBLE9BQUEscUJBQUEsT0FBQSxXQUFBO01BQ0EsVUFBQTs7R0FFQTtDQUNBOzs7QUM1RUEsUUFBQSxPQUFBOztHQUVBLFdBQUEsb0JBQUE7O0FBRUEsU0FBQSxpQkFBQSxRQUFBLGdCQUFBLFlBQUEsT0FBQTtFQUNBLE9BQUEsT0FBQSxNQUFBO0VBQ0E7RUFDQSxPQUFBLFlBQUEsWUFBQTtJQUNBOzs7RUFHQSxTQUFBLGFBQUE7SUFDQSxlQUFBLFdBQUEsV0FBQSxZQUFBLEtBQUEsVUFBQSxTQUFBO01BQ0EsSUFBQSxPQUFBO01BQ0EsUUFBQSxRQUFBLFNBQUEsVUFBQSxRQUFBO1FBQ0EsT0FBQSxPQUFBO1FBQ0E7O01BRUEsT0FBQSxVQUFBO01BQ0EsT0FBQSxXQUFBOzs7Ozs7QUNuQkEsUUFBQSxPQUFBOztHQUVBLFdBQUEscUJBQUE7O0FBRUEsU0FBQTtDQUNBLFFBQUEsYUFBQSxRQUFBLGVBQUEsT0FBQTs7RUFFQSxjQUFBLGdCQUFBO0lBQ0EsYUFBQTs7RUFFQSxPQUFBLFFBQUE7O0VBRUEsT0FBQSxnQkFBQSxVQUFBLE9BQUE7SUFDQSxNQUFBLEtBQUEscUJBQUEsTUFBQSxNQUFBO01BQ0EsU0FBQSxXQUFBO1FBQ0E7O01BRUEsT0FBQSxTQUFBLE9BQUE7O1FBRUEsV0FBQSxNQUFBOzs7OztFQUtBLFNBQUEsWUFBQSxTQUFBO0lBQ0EsT0FBQSxZQUFBLE1BQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTs7OztFQUlBLFNBQUEsZ0JBQUE7SUFDQSxPQUFBLFlBQUEsTUFBQTtNQUNBLE9BQUE7TUFDQSxVQUFBO09BQ0EsS0FBQSxVQUFBLEtBQUE7TUFDQSxPQUFBLEdBQUE7Ozs7OztBQ3BDQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxxQkFBQTs7QUFFQSxTQUFBO0VBQ0EsUUFBQSxTQUFBLGFBQUEsUUFBQSxlQUFBLElBQUEsUUFBQSxZQUFBLGdCQUFBO0VBQ0E7O0VBRUEsY0FBQSxnQkFBQTtJQUNBLGFBQUE7O0VBRUEsT0FBQSxhQUFBLFdBQUE7RUFDQSxPQUFBLE9BQUEsTUFBQSxLQUFBO0VBQ0EsT0FBQSxTQUFBLE9BQUE7O0VBRUEsT0FBQSxpQkFBQSxZQUFBO0lBQ0Esb0JBQUE7TUFDQSxVQUFBLEtBQUE7UUFDQSxPQUFBLE9BQUEsT0FBQSxLQUFBLFlBQUE7VUFDQSxhQUFBLFFBQUEsS0FBQSxTQUFBLEtBQUE7WUFDQSxPQUFBLEdBQUE7Ozs7TUFJQSxVQUFBLE9BQUE7UUFDQSxXQUFBOzs7O0VBSUEsU0FBQSxxQkFBQTtJQUNBLElBQUEsS0FBQSxHQUFBO0lBQ0EsSUFBQSxNQUFBLE9BQUEsT0FBQTs7SUFFQSxHQUFBLElBQUEsU0FBQSxHQUFBO01BQ0EsR0FBQSxPQUFBO01BQ0EsT0FBQSxHQUFBOztJQUVBLElBQUEsUUFBQSxJQUFBLE1BQUE7SUFDQSxHQUFBLE1BQUEsV0FBQSxHQUFBO01BQ0EsR0FBQSxPQUFBO01BQ0EsT0FBQSxHQUFBOztJQUVBLEdBQUEsTUFBQSxHQUFBLFNBQUEsS0FBQSxNQUFBLEdBQUEsU0FBQSxHQUFBO01BQ0EsR0FBQSxPQUFBO01BQ0EsT0FBQSxHQUFBOztJQUVBLEdBQUEsTUFBQSxNQUFBLEtBQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxPQUFBLEdBQUE7O0lBRUEsZUFBQSxlQUFBLE9BQUEsV0FBQSxZQUFBLEtBQUEsS0FBQSxVQUFBLFNBQUE7TUFDQSxHQUFBLFFBQUEsUUFBQTtRQUNBLEdBQUEsT0FBQTthQUNBO1FBQ0EsR0FBQSxRQUFBOzs7SUFHQSxPQUFBLEdBQUE7R0FDQTs7RUFFQSxTQUFBLFlBQUEsU0FBQTtJQUNBLE9BQUEsWUFBQSxNQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7O0dBRUE7O0VBRUEsU0FBQSxjQUFBLFFBQUE7SUFDQSxPQUFBLFlBQUEsTUFBQTtNQUNBLE9BQUEscUJBQUEsT0FBQSxXQUFBO01BQ0EsVUFBQTs7R0FFQTtDQUNBOzs7QUN6RUEsUUFBQSxPQUFBOztHQUVBLFdBQUEsYUFBQTs7QUFFQSxTQUFBLFVBQUEsUUFBQSxRQUFBLE9BQUEsZUFBQTtFQUNBLE9BQUEsT0FBQTtFQUNBLE1BQUEsS0FBQTtFQUNBLE9BQUEsWUFBQSxZQUFBO0lBQ0EsTUFBQSxLQUFBLE1BQUEsT0FBQSxLQUFBLFVBQUEsT0FBQSxLQUFBLFVBQUE7TUFDQSxTQUFBLFNBQUEsTUFBQTtRQUNBLGNBQUEsZ0JBQUE7VUFDQSxhQUFBOzs7UUFHQSxPQUFBLEdBQUE7O01BRUEsT0FBQSxVQUFBLE1BQUEsT0FBQTtRQUNBLE9BQUEsVUFBQSxNQUFBOzs7O0VBSUEsT0FBQSxPQUFBLFFBQUEsU0FBQSxRQUFBLE9BQUE7SUFDQSxPQUFBLFVBQUE7S0FDQTtDQUNBOzs7QUN4QkEsUUFBQSxPQUFBOztHQUVBLFdBQUEsaUJBQUE7O0FBRUEsU0FBQTtFQUNBLFFBQUEsUUFBQSxhQUFBLFlBQUEsT0FBQSxlQUFBO0VBQ0E7RUFDQSxPQUFBLFVBQUE7RUFDQSxPQUFBLFNBQUEsT0FBQTs7RUFFQSxHQUFBLE9BQUEsUUFBQTtJQUNBLFdBQUEsV0FBQTtJQUNBLGNBQUEsaUJBQUEsT0FBQSxRQUFBLE1BQUEsS0FBQSxVQUFBLFNBQUE7TUFDQSxRQUFBLElBQUE7TUFDQSxPQUFBLFVBQUE7TUFDQSxjQUFBLGlCQUFBLE9BQUEsUUFBQSxZQUFBLEtBQUEsVUFBQSxVQUFBO1FBQ0EsT0FBQSxXQUFBO1FBQ0EsV0FBQSxXQUFBOzs7Ozs7RUFNQSxPQUFBLGVBQUEsVUFBQSxPQUFBO0lBQ0EsR0FBQSxNQUFBLE9BQUEsT0FBQSxPQUFBLE9BQUEsSUFBQTtNQUNBOztJQUVBLEdBQUEsTUFBQSxNQUFBLE9BQUEsT0FBQSxPQUFBLElBQUE7TUFDQSxHQUFBLE1BQUEsYUFBQTtRQUNBOzs7SUFHQSxHQUFBLE9BQUEsU0FBQSxRQUFBO01BQ0E7TUFDQTs7SUFFQSxHQUFBLE1BQUEsV0FBQSxhQUFBO01BQ0E7O0lBRUEsT0FBQSxHQUFBLG9CQUFBLENBQUEsSUFBQSxNQUFBOzs7RUFHQSxTQUFBLGVBQUE7SUFDQSxZQUFBLE1BQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTtPQUNBLEtBQUEsWUFBQTs7OztDQUlBOzs7QUNsREEsUUFBQSxPQUFBOztHQUVBLFdBQUEsbUJBQUE7O0FBRUEsU0FBQTtFQUNBLFFBQUEsUUFBQSxZQUFBLGFBQUE7RUFDQSxPQUFBLGVBQUEsZ0JBQUE7RUFDQTs7RUFFQSxPQUFBLFFBQUE7O0VBRUEsT0FBQSxVQUFBOztFQUVBLElBQUEsWUFBQSxJQUFBLE1BQUE7RUFDQSxJQUFBLFlBQUE7O0VBRUEsT0FBQSxhQUFBLFdBQUE7SUFDQSxJQUFBLFVBQUEsZUFBQTtJQUNBLFVBQUEsT0FBQSxXQUFBLFVBQUEsT0FBQTs7RUFFQSxJQUFBLFlBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLDJCQUFBO0lBQ0EsWUFBQTtJQUNBLE9BQUE7O0VBRUEsSUFBQSxTQUFBLFNBQUEsR0FBQTtJQUNBLFFBQUEsSUFBQSxhQUFBOzs7RUFHQSxPQUFBLGdCQUFBLFVBQUEsTUFBQTtJQUNBLEdBQUEsV0FBQTtNQUNBLFlBQUEsSUFBQSxNQUFBLEtBQUEsY0FBQSxDQUFBLE9BQUE7V0FDQTtNQUNBLFlBQUE7O0lBRUEsT0FBQSxNQUFBLElBQUEsZUFBQTtJQUNBLE9BQUEsTUFBQSxJQUFBLFVBQUE7SUFDQSxPQUFBLE1BQUEsT0FBQSxLQUFBLFVBQUEsT0FBQTtNQUNBLGNBQUEsZ0JBQUE7UUFDQSxhQUFBOztNQUVBLFlBQUEsTUFBQTtRQUNBLE9BQUE7UUFDQSxVQUFBO1NBQ0EsS0FBQSxZQUFBO1FBQ0EsT0FBQSxHQUFBOzs7Ozs7Ozs7QUM3Q0EsUUFBQSxPQUFBOztHQUVBLFdBQUEsaUJBQUE7O0FBRUEsU0FBQTtFQUNBLFFBQUEsUUFBQSxZQUFBLGFBQUEsZUFBQTtFQUNBLE9BQUEsZ0JBQUEsZUFBQSxlQUFBLGdCQUFBO0VBQ0E7O0VBRUEsSUFBQSxZQUFBLElBQUEsTUFBQTtFQUNBLElBQUEsWUFBQTs7RUFFQSxPQUFBLGFBQUEsV0FBQTtFQUNBLE9BQUEsT0FBQSxNQUFBO0VBQ0EsT0FBQSxVQUFBOztFQUVBLGNBQUEsZ0JBQUE7SUFDQSxhQUFBOzs7RUFHQSxPQUFBLElBQUEsb0JBQUEsU0FBQSxPQUFBO0lBQ0EsZUFBQSxVQUFBLE9BQUEsWUFBQSxPQUFBLEtBQUEsV0FBQSxLQUFBLFVBQUEsU0FBQTtNQUNBLE9BQUEsU0FBQSxRQUFBO01BQ0EsY0FBQSxlQUFBLE9BQUEsUUFBQSxLQUFBLFVBQUEsU0FBQTtRQUNBLE9BQUEsUUFBQSxRQUFBO1FBQ0EsR0FBQSxPQUFBLE1BQUEsSUFBQSxjQUFBLGFBQUE7VUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO1VBQ0EsT0FBQSxPQUFBLE9BQUEsS0FBQSxZQUFBO1lBQ0EsT0FBQSxHQUFBOzs7UUFHQTs7Ozs7RUFLQSxPQUFBLElBQUEsb0JBQUEsU0FBQSxPQUFBO0lBQ0EsWUFBQTtJQUNBLFdBQUE7OztFQUdBLE9BQUEsYUFBQSxXQUFBO0lBQ0EsR0FBQSxlQUFBLFFBQUE7TUFDQSxJQUFBLFVBQUEsZUFBQTtNQUNBLFVBQUEsT0FBQSxXQUFBLFVBQUEsT0FBQTs7O0VBR0EsSUFBQSxZQUFBLFNBQUEsV0FBQTtJQUNBLE9BQUEsVUFBQSwyQkFBQTtJQUNBLFlBQUE7SUFDQSxPQUFBOztFQUVBLElBQUEsU0FBQSxTQUFBLEdBQUE7SUFDQSxRQUFBLElBQUEsYUFBQTs7O0VBR0EsT0FBQSxZQUFBLFdBQUE7SUFDQSxTQUFBOzs7RUFHQSxPQUFBLFNBQUEsVUFBQSxRQUFBO0lBQ0EsY0FBQSxlQUFBLE9BQUEsUUFBQSxLQUFBLFVBQUEsU0FBQTtNQUNBLElBQUEsV0FBQTtNQUNBLE9BQUEsUUFBQSxRQUFBO01BQ0EsR0FBQSxPQUFBLE1BQUEsSUFBQSxjQUFBLFVBQUE7UUFDQSxRQUFBO1VBQ0EsS0FBQTtZQUNBLFdBQUEsS0FBQSxTQUFBLEtBQUE7Y0FDQSxRQUFBLElBQUE7Y0FDQSxHQUFBLEtBQUE7Z0JBQ0EsR0FBQSxXQUFBO2tCQUNBLFlBQUEsSUFBQSxNQUFBLEtBQUEsZUFBQSxDQUFBLE9BQUE7a0JBQ0EsT0FBQSxNQUFBLElBQUEsWUFBQTs7Z0JBRUEsT0FBQSxNQUFBLElBQUEsVUFBQSxPQUFBO2dCQUNBLE9BQUEsTUFBQSxJQUFBLFNBQUEsT0FBQSxTQUFBO2dCQUNBLFdBQUEsT0FBQSxTQUFBO2dCQUNBLFlBQUE7OztZQUdBO1VBQ0EsS0FBQTtZQUNBLFlBQUEsS0FBQSxTQUFBLEtBQUE7Y0FDQSxRQUFBLElBQUE7Y0FDQSxHQUFBLEtBQUE7Z0JBQ0EsT0FBQSxNQUFBLElBQUEsVUFBQSxPQUFBLFNBQUE7Z0JBQ0EsT0FBQSxNQUFBLElBQUEsU0FBQSxPQUFBO2dCQUNBLFdBQUEsT0FBQSxTQUFBO2dCQUNBLFlBQUE7OztZQUdBOzs7Ozs7RUFNQSxTQUFBLFlBQUE7SUFDQSxPQUFBLFVBQUE7SUFDQSxPQUFBLGVBQUE7O0lBRUEsT0FBQSxZQUFBO01BQ0E7UUFDQSxhQUFBO1FBQ0EsT0FBQTtRQUNBLE9BQUE7UUFDQSxTQUFBO1VBQ0EsRUFBQSxNQUFBO1VBQ0EsRUFBQSxNQUFBO1lBQ0EsTUFBQTtZQUNBLE9BQUEsU0FBQSxHQUFBO2NBQ0EsSUFBQSxDQUFBLE9BQUEsU0FBQTtnQkFDQSxPQUFBLGVBQUE7Z0JBQ0EsRUFBQTtxQkFDQTtnQkFDQSxPQUFBOzs7Ozs7OztFQVFBLFNBQUEsWUFBQTtJQUNBLE9BQUEsWUFBQTtNQUNBO1FBQ0EsYUFBQTtRQUNBLE9BQUE7UUFDQSxPQUFBO1FBQ0EsU0FBQTtVQUNBLEVBQUEsTUFBQTtVQUNBLEVBQUEsTUFBQTtZQUNBLE1BQUE7WUFDQSxPQUFBLFNBQUEsR0FBQTtjQUNBLE9BQUE7Ozs7Ozs7RUFPQSxTQUFBLFNBQUEsU0FBQTtJQUNBLGNBQUEsU0FBQSxPQUFBLE1BQUEsSUFBQSxLQUFBLFVBQUEsT0FBQTtNQUNBLE9BQUEsUUFBQTtNQUNBLFFBQUEsSUFBQSxVQUFBLE9BQUEsTUFBQSxJQUFBO01BQ0EsUUFBQSxJQUFBO01BQ0EsUUFBQSxJQUFBLE9BQUEsTUFBQSxJQUFBO01BQ0EsR0FBQSxTQUFBO1FBQ0EsT0FBQSxXQUFBOzs7OztFQUtBLFNBQUEsWUFBQSxVQUFBO0lBQ0EsV0FBQSxXQUFBO0lBQ0EsT0FBQSxNQUFBLElBQUEsVUFBQTtJQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUEsVUFBQSxPQUFBO01BQ0EsT0FBQSxRQUFBO01BQ0EsU0FBQSxZQUFBO1FBQ0EsTUFBQSxNQUFBLElBQUEsZ0JBQUEsQ0FBQSxPQUFBLE9BQUEsTUFBQSxJQUFBLFVBQUE7V0FDQSxLQUFBLFlBQUE7WUFDQSxPQUFBLE1BQUEsT0FBQSxRQUFBLEtBQUEsVUFBQSxRQUFBO2NBQ0EsUUFBQSxJQUFBO2NBQ0EsT0FBQSxNQUFBLFNBQUE7O1lBRUEsV0FBQSxXQUFBO2FBQ0EsU0FBQSxLQUFBO1VBQ0EsTUFBQSxJQUFBO1VBQ0EsV0FBQSxXQUFBOztTQUVBOzs7O0VBSUEsU0FBQSxrQkFBQTtJQUNBLE9BQUEsV0FBQTtNQUNBLE1BQUE7TUFDQSxXQUFBOztJQUVBLEdBQUEsT0FBQSxPQUFBLFdBQUEsV0FBQTtNQUNBLE9BQUEsU0FBQSxPQUFBLE9BQUEsTUFBQTtNQUNBLE9BQUEsU0FBQSxXQUFBLE9BQUEsTUFBQTtNQUNBLE9BQUEsU0FBQSxZQUFBLE9BQUEsTUFBQTtNQUNBLE9BQUEsU0FBQSxPQUFBLE9BQUEsTUFBQTs7SUFFQSxHQUFBLE9BQUEsT0FBQSxXQUFBLFdBQUE7TUFDQSxPQUFBLFNBQUEsT0FBQSxPQUFBLE1BQUE7TUFDQSxPQUFBLFNBQUEsV0FBQSxPQUFBLE1BQUE7TUFDQSxPQUFBLFNBQUEsWUFBQSxPQUFBLE1BQUE7TUFDQSxPQUFBLFNBQUEsT0FBQSxPQUFBLE1BQUE7Ozs7O0FDOUxBLFFBQUEsT0FBQTtHQUNBLFdBQUEsWUFBQTs7QUFFQSxTQUFBLFNBQUEsUUFBQSxlQUFBLFFBQUEsZUFBQSxPQUFBLFVBQUE7RUFDQSxPQUFBLE9BQUEsTUFBQTs7RUFFQSxjQUFBLGdCQUFBLHVDQUFBO0lBQ0EsT0FBQTtLQUNBLEtBQUEsU0FBQSxTQUFBO0lBQ0EsT0FBQSxVQUFBOzs7RUFHQSxPQUFBLE9BQUEsVUFBQSxNQUFBO0lBQ0EsY0FBQSxnQkFBQTtNQUNBLGFBQUE7O0lBRUEsR0FBQSxTQUFBLFNBQUE7TUFDQSxHQUFBLE9BQUEsaUJBQUE7UUFDQSxnQkFBQSxZQUFBLE9BQUEsS0FBQSxVQUFBLFVBQUEsU0FBQSxLQUFBO1VBQ0EsUUFBQSxJQUFBO1dBQ0EsU0FBQSxHQUFBO1VBQ0EsUUFBQSxJQUFBOzs7TUFHQSxTQUFBLFlBQUE7UUFDQSxNQUFBLEtBQUEsU0FBQSxLQUFBLFVBQUEsTUFBQTtVQUNBLE9BQUEsR0FBQSxTQUFBLE1BQUEsQ0FBQSxRQUFBOztTQUVBOzs7V0FHQTtNQUNBLE9BQUEsR0FBQSxTQUFBLE1BQUEsQ0FBQSxRQUFBOztJQUVBLE9BQUEsUUFBQTs7O0VBR0EsT0FBQSxJQUFBLFlBQUEsV0FBQTtJQUNBLE9BQUEsUUFBQTs7Ozs7QUNyQ0EsUUFBQSxPQUFBOztHQUVBLFdBQUEsZ0JBQUE7O0FBRUEsYUFBQSxVQUFBLENBQUEsVUFBQSxVQUFBLFNBQUE7QUFDQSxTQUFBLGFBQUEsUUFBQSxRQUFBLE9BQUEsYUFBQTs7RUFFQSxPQUFBLE9BQUE7O0VBRUEsT0FBQSxlQUFBLFVBQUEsTUFBQTtJQUNBLElBQUEsV0FBQSxJQUFBLE1BQUE7SUFDQSxTQUFBLElBQUE7SUFDQSxTQUFBLE9BQUEsTUFBQTtNQUNBLFNBQUEsU0FBQSxNQUFBO1FBQ0EsT0FBQSxHQUFBOztNQUVBLE9BQUEsU0FBQSxNQUFBLE9BQUE7O1FBRUEsV0FBQSxNQUFBOzs7O0VBSUEsT0FBQSxPQUFBLFFBQUEsU0FBQSxRQUFBLE9BQUE7SUFDQSxPQUFBLFVBQUE7S0FDQTs7RUFFQSxTQUFBLFlBQUEsU0FBQTtJQUNBLE9BQUEsWUFBQSxNQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7Ozs7O0FDOUJBLFFBQUEsT0FBQSxxQkFBQTtHQUNBLE9BQUE7O0FBRUEsU0FBQSxhQUFBLGdCQUFBOztFQUVBO0tBQ0EsTUFBQSxhQUFBO01BQ0EsS0FBQTtNQUNBLFVBQUE7TUFDQSxPQUFBO01BQ0EsT0FBQTtRQUNBLGVBQUE7VUFDQSxhQUFBOzs7O0tBSUEsTUFBQSxzQkFBQTtNQUNBLEtBQUE7TUFDQSxPQUFBO01BQ0EsYUFBQTtNQUNBLFlBQUE7TUFDQSxTQUFBO1FBQ0EsZ0NBQUEsVUFBQSxvQkFBQTtVQUNBLE9BQUEsbUJBQUE7O1FBRUEsaURBQUEsVUFBQSxvQkFBQSxTQUFBO1VBQ0EsR0FBQSxRQUFBLFFBQUE7WUFDQSxPQUFBLFFBQUE7aUJBQ0E7WUFDQSxPQUFBLG1CQUFBOzs7OztLQUtBLE1BQUEscUJBQUE7TUFDQSxLQUFBO01BQ0EsT0FBQTtNQUNBLGFBQUE7TUFDQSxZQUFBOztLQUVBLE1BQUEsbUJBQUE7TUFDQSxLQUFBO01BQ0EsT0FBQTtNQUNBLGFBQUE7TUFDQSxZQUFBO01BQ0EsU0FBQTtRQUNBLHlDQUFBLFVBQUEsZUFBQSxjQUFBO1VBQ0EsT0FBQSxjQUFBLGdCQUFBLGFBQUE7Ozs7S0FJQSxNQUFBLHFCQUFBO01BQ0EsS0FBQTtNQUNBLE9BQUE7TUFDQSxhQUFBO01BQ0EsWUFBQTs7Ozs7QUN2REEsUUFBQSxPQUFBLHNCQUFBO0dBQ0EsT0FBQTs7QUFFQSxTQUFBLGNBQUEsZ0JBQUE7O0VBRUE7S0FDQSxNQUFBLGNBQUE7TUFDQSxLQUFBO01BQ0EsVUFBQTtNQUNBLE9BQUE7TUFDQSxPQUFBO1FBQ0EsZUFBQTtVQUNBLGFBQUE7Ozs7S0FJQSxNQUFBLDBCQUFBO01BQ0EsS0FBQTtNQUNBLE9BQUE7TUFDQSxhQUFBO01BQ0EsWUFBQTs7S0FFQSxNQUFBLG1CQUFBO01BQ0EsS0FBQTtNQUNBLE9BQUE7TUFDQSxhQUFBO01BQ0EsWUFBQTs7S0FFQSxNQUFBLHNCQUFBO01BQ0EsS0FBQTtNQUNBLE9BQUE7TUFDQSxhQUFBO01BQ0EsWUFBQTtNQUNBLFNBQUE7UUFDQSxrREFBQSxVQUFBLE9BQUEsZ0JBQUEsWUFBQTtVQUNBLE9BQUEsZUFBQSxVQUFBLFdBQUEsWUFBQSxNQUFBLEtBQUE7Ozs7OztBQ25DQSxRQUFBLE9BQUEsdUJBQUE7R0FDQSxPQUFBOztBQUVBLFNBQUEsYUFBQSxnQkFBQTs7RUFFQTtLQUNBLE1BQUEsYUFBQTtNQUNBLEtBQUE7TUFDQSxVQUFBO01BQ0EsT0FBQTtRQUNBLGVBQUE7VUFDQSxhQUFBOzs7O0tBSUEsTUFBQSxrQkFBQTtNQUNBLEtBQUE7TUFDQSxhQUFBO01BQ0EsWUFBQTtNQUNBLE9BQUE7TUFDQSxTQUFBO1FBQ0Esa0RBQUEsVUFBQSxPQUFBLGdCQUFBLFlBQUE7VUFDQSxPQUFBLGVBQUEsVUFBQSxXQUFBLFlBQUEsTUFBQSxLQUFBOzs7O0tBSUEsTUFBQSxrQkFBQTtNQUNBLEtBQUE7TUFDQSxhQUFBO01BQ0EsWUFBQTs7S0FFQSxNQUFBLG9CQUFBO01BQ0EsS0FBQTtNQUNBLE9BQUE7TUFDQSxhQUFBO01BQ0EsWUFBQTtNQUNBLFNBQUE7UUFDQSwwQ0FBQSxVQUFBLGVBQUEsY0FBQTtVQUNBLE9BQUEsY0FBQSxTQUFBLGFBQUE7Ozs7O0FBS0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ09OT0cuY29uZmlnJywgW10pXG4gIC5jb25maWcoY29uZmlnKTtcblxuZnVuY3Rpb24gY29uZmlnICgkaW9uaWNDb25maWdQcm92aWRlciwgJGNvbXBpbGVQcm92aWRlciwgUGFyc2VQcm92aWRlcikge1xuXG4gICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8YmxvYnxjb250ZW50fG1zLWFwcHh8eC13bWFwcDApOnxkYXRhOmltYWdlXFwvfGltZ1xcLy8pO1xuICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xmaWxlfGdodHRwcz98bXMtYXBweHx4LXdtYXBwMCk6Lyk7XG5cbiAgUGFyc2VQcm92aWRlci5pbml0aWFsaXplKCduWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRJywgJ3pyaW44R0VCRFZHYmtsMWlvR0V3bkh1UDcwRmRHNkhoelRTOHVHanonKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJywgW1xuICAnaW9uaWMnLFxuICAnbmdQYXJzZScsXG4gICd0aW1lcicsXG4gICduZ0NvcmRvdmEnLFxuICAnbmdBbmltYXRlJyxcbiAgJ09OT0cuY29uZmlnJyxcbiAgJ09OT0cucm91dGVzJyxcbiAgJ09OT0cuQ29udHJvbGxlcnMnLFxuICAnT05PRy5TZXJ2aWNlcydcbl0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzJywgW1xuICAnT05PRy5yb3V0ZXMubWF0Y2hlcycsXG4gICdPTk9HLnJvdXRlcy5sYWRkZXInLFxuICAnT05PRy5yb3V0ZXMuYWRtaW4nXG5dKVxuICAuY29uZmlnKHJvdXRlcyk7XG5cbmZ1bmN0aW9uIHJvdXRlcyAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJ2FwcC9sb2FkaW5nJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgJHEsIFBhcnNlLCAkc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCkudGhlbihmdW5jdGlvbiAodG91cm5hbWVudHMpIHtcbiAgICAgICAgICAgIGlmKHRvdXJuYW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYi5yZXNvbHZlKHRvdXJuYW1lbnRzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgaW9uaWMuUGxhdGZvcm0uZXhpdEFwcCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2FkaW5nJywge1xuICAgICAgdXJsOiAnL2xvYWRpbmcnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xvYWRpbmcuaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuZGFzaGJvYXJkJywge1xuICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAucmVnaXN0ZXInLCB7XG4gICAgICB1cmw6ICcvcmVnaXN0ZXInLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3JlZ2lzdGVyLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLnJlc2V0Jywge1xuICAgICAgdXJsOiAnL3Bhc3N3b3JkJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wYXNzd29yZC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnUmVzZXRQYXNzd29yZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbnN0YW50KCdtb21lbnQnLCBtb21lbnQpXG4gIC5ydW4ocnVuKTtcblxuZnVuY3Rpb24gcnVuIChcbiAgJGlvbmljUGxhdGZvcm0sICRzdGF0ZSwgJHJvb3RTY29wZSwgJGlvbmljTG9hZGluZywgJGlvbmljUG9wdXAsXG4gIGxvY2F0aW9uU2VydmljZXMsICRpb25pY0hpc3RvcnksICRjb3Jkb3ZhTmV0d29yaywgJHdpbmRvd1xuKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cbiAgICAgIC8vIERvbid0IHJlbW92ZSB0aGlzIGxpbmUgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91IGFyZSBkb2luZy4gSXQgc3RvcHMgdGhlIHZpZXdwb3J0XG4gICAgICAvLyBmcm9tIHNuYXBwaW5nIHdoZW4gdGV4dCBpbnB1dHMgYXJlIGZvY3VzZWQuIElvbmljIGhhbmRsZXMgdGhpcyBpbnRlcm5hbGx5IGZvclxuICAgICAgLy8gYSBtdWNoIG5pY2VyIGtleWJvYXJkIGV4cGVyaWVuY2UuXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcbiAgICB9XG4gICAgaWYod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cblxuICAgIC8vIGxpc3RlbiBmb3IgT25saW5lIGV2ZW50XG4gICAgJHJvb3RTY29wZS4kb24oJyRjb3Jkb3ZhTmV0d29yazpvbmxpbmUnLCBmdW5jdGlvbihldmVudCwgbmV0d29ya1N0YXRlKXtcbiAgICAgIHZhciBvbmxpbmVTdGF0ZSA9IG5ldHdvcmtTdGF0ZTtcbiAgICB9KTtcblxuICAgIC8vIGxpc3RlbiBmb3IgT2ZmbGluZSBldmVudFxuICAgICRyb290U2NvcGUuJG9uKCckY29yZG92YU5ldHdvcms6b2ZmbGluZScsIGZ1bmN0aW9uKGV2ZW50LCBuZXR3b3JrU3RhdGUpe1xuICAgICAgdmFyIG9mZmxpbmVTdGF0ZSA9IG5ldHdvcmtTdGF0ZTtcbiAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICB0aXRsZTogJ0ludGVybmV0IERpc2Nvbm5lY3RlZCcsXG4gICAgICAgICAgY29udGVudDogJ1RoZSBpbnRlcm5ldCBpcyBkaXNjb25uZWN0ZWQgb24geW91ciBkZXZpY2UuJ1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICBpb25pYy5QbGF0Zm9ybS5leGl0QXBwKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG5cbiAgICAkcm9vdFNjb3BlLiRvbignc2hvdzpsb2FkaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAkaW9uaWNMb2FkaW5nLnNob3coe3RlbXBsYXRlOiAnPGlvbi1zcGlubmVyIGljb249XCJzcGlyYWxcIiBjbGFzcz1cInNwaW5uZXItY2FsbVwiPjwvaW9uLXNwaW5uZXI+Jywgc2hvd0JhY2tkcm9wOiB0cnVlLCBhbmltYXRpb246ICdmYWRlLWluJ30pO1xuICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS4kb24oJ2hpZGU6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XG4gICAgfSk7XG5cbiAgICAkaW9uaWNQbGF0Zm9ybS5vbigncmVzdW1lJywgZnVuY3Rpb24oKXtcbiAgICAgIC8vcm9jayBvblxuICAgICAgLy8kc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgfSk7XG5cblxuICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4pIHtcbiAgICAgIGNvbnNvbGUubG9nKCduZXcgdmVyc2lvbiAxJyk7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTicsIGZ1bmN0aW9uKHBuKXtcbiAgICAgICAgY29uc29sZS5sb2cocG4pO1xuICAgICAgICBpZighcG4udGl0bGUpIHtcbiAgICAgICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICB0aXRsZTogJ0Fubm91bmNlbWVudCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPicrIHBuLmFsZXJ0ICsgJzwvZGl2PidcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3dpdGNoIChwbi50aXRsZSkge1xuICAgICAgICAgICAgY2FzZSAnT3Bwb25lbnQgRm91bmQnOlxuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnT3Bwb25lbnQgQ29uZmlybWVkJzpcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ1Jlc3VsdHMgRW50ZXJlZCc6XG4gICAgICAgICAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICAgICAgICB0aXRsZTogJ01hdGNoIFBsYXllZCcsXG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5SZXN1bHRzIGhhdmUgYmVlbiBzdWJtaXR0ZWQ8L2Rpdj4nXG4gICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYod2luZG93LmxvY2F0aW9uLmhhc2ggPT09ICcjL2FwcC9sb2FkaW5nJykge1xuICAgICAgbG9jYXRpb25TZXJ2aWNlcy5nZXRMb2NhdGlvbigpLnRoZW4oZnVuY3Rpb24gKGxvY2F0aW9uKSB7XG4gICAgICAgIGxvY2F0aW9uU2VydmljZXMuc2V0TG9jYXRpb24obG9jYXRpb24pO1xuICAgICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICAgICAgfSk7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICBpZihuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuICAgICAgICAgIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuICAgICAgICB9XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSk7XG4gICAgfVxuICB9KTtcbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJywgW10pO1xuXG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTGFkZGVyU2VydmljZXMnLCBMYWRkZXJTZXJ2aWNlcylcbiAgLmZhY3RvcnkoJ0xhZGRlcicsIExhZGRlcik7XG5cbmZ1bmN0aW9uIExhZGRlclNlcnZpY2VzKFBhcnNlLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRQbGF5ZXJzOiBnZXRQbGF5ZXJzLFxuICAgIGdldFBsYXllcjogZ2V0UGxheWVyLFxuICAgIHZhbGlkYXRlUGxheWVyOiB2YWxpZGF0ZVBsYXllcixcbiAgICBqb2luVG91cm5hbWVudDogam9pblRvdXJuYW1lbnQsXG4gICAgZ2V0UGVuZGluZ1BsYXllcnM6IGdldFBlbmRpbmdQbGF5ZXJzLFxuICAgIHNlYXJjaFBsYXllcnM6IHNlYXJjaFBsYXllcnNcbiAgfTtcblxuICBmdW5jdGlvbiBzZWFyY2hQbGF5ZXJzKGlucHV0KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuc3RhcnRzV2l0aCgndXNlcm5hbWUnLCBpbnB1dCk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBlbmRpbmdQbGF5ZXJzKHRvdXJuYW1lbnQsIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkubm90RXF1YWxUbygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKHRvdXJuZXkpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZGVzY2VuZGluZygncG9pbnRzJywgJ21tcicpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZVBsYXllcih0b3VybmV5LCBiYXR0bGVUYWcpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygnYmF0dGxlVGFnJywgYmF0dGxlVGFnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyKHRvdXJuZXksIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCB1c2VyLCB1c2VyRGF0YSkge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKCk7XG4gICAgcGxheWVyLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXInLCB1c2VyKTtcbiAgICBwbGF5ZXIuc2V0KHVzZXJEYXRhKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTGFkZGVyKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0xhZGRlcicpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsndG91cm5hbWVudCcsICd1c2VyJywgJ2JhdHRsZVRhZycsICd1c2VybmFtZScsICdsb2NhdGlvbicsICdiYW5uZWQnLFxuICAgICdoZXJvJywgJ3BsYXllcicsICdzdGF0dXMnLCAnY2FuY2VsVGltZXInLCAnd2lucycsICdsb3NzZXMnLCAnbW1yJywgJ3BvaW50cycsICdiYW5SZWFzb24nLCAnYWRtaW4nXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdsb2NhdGlvblNlcnZpY2VzJywgbG9jYXRpb25TZXJ2aWNlcyk7XG5cbmZ1bmN0aW9uIGxvY2F0aW9uU2VydmljZXMgKFBhcnNlLCAkY29yZG92YUdlb2xvY2F0aW9uLCAkcSkge1xuXG4gIHZhciBsb2NhdGlvbiA9IHtjb29yZHM6IG5ldyBQYXJzZS5HZW9Qb2ludCgpfTtcbiAgcmV0dXJuIHtcbiAgICBsb2NhdGlvbjogbG9jYXRpb24sXG4gICAgZ2V0TG9jYXRpb246IGdldExvY2F0aW9uLFxuICAgIHNldExvY2F0aW9uOiBzZXRMb2NhdGlvblxuICB9O1xuICBcbiAgZnVuY3Rpb24gc2V0TG9jYXRpb24gKGNvb3Jkcykge1xuICAgIGxvY2F0aW9uLmNvb3JkcyA9IG5ldyBQYXJzZS5HZW9Qb2ludCh7bGF0aXR1ZGU6IGNvb3Jkcy5sYXRpdHVkZSwgbG9uZ2l0dWRlOiBjb29yZHMubG9uZ2l0dWRlfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMb2NhdGlvbiAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgcG9zT3B0aW9ucyA9IHtlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlfTtcbiAgICAkY29yZG92YUdlb2xvY2F0aW9uXG4gICAgICAuZ2V0Q3VycmVudFBvc2l0aW9uKHBvc09wdGlvbnMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgY2IucmVzb2x2ZShwb3NpdGlvbi5jb29yZHMpO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGNiLnJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTWF0Y2hTZXJ2aWNlcycsIE1hdGNoU2VydmljZXMpXG4gIC5mYWN0b3J5KCdNYXRjaCcsIE1hdGNoKTtcblxuZnVuY3Rpb24gTWF0Y2hTZXJ2aWNlcyhQYXJzZSwgTWF0Y2gsICRxKSB7XG4gIHZhciB1c2VyID0gUGFyc2UuVXNlcjtcbiAgcmV0dXJuIHtcbiAgICBnZXRDb25maXJtZWRNYXRjaDogZ2V0Q29uZmlybWVkTWF0Y2gsXG4gICAgZ2V0UGVuZGluZ01hdGNoOiBnZXRQZW5kaW5nTWF0Y2gsXG4gICAgZ2V0UmVwb3J0ZWRNYXRjaGVzOiBnZXRSZXBvcnRlZE1hdGNoZXMsXG4gICAgZ2V0TGF0ZXN0TWF0Y2g6IGdldExhdGVzdE1hdGNoLFxuICAgIGdldE1hdGNoOiBnZXRNYXRjaCxcbiAgICBnZXRQbGF5ZXJNYXRjaGVzOiBnZXRQbGF5ZXJNYXRjaGVzLFxuICAgIGdldE1hdGNoRGV0YWlsczogZ2V0TWF0Y2hEZXRhaWxzXG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyTWF0Y2hlcyhwbGF5ZXIsIHN0YXR1cykge1xuICAgIHZhciBwbGF5ZXIxID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBwbGF5ZXIxLmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIHZhciBwbGF5ZXIyID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBwbGF5ZXIyLmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIHZhciBtYWluUXVlcnkgPSBQYXJzZS5RdWVyeS5vcihwbGF5ZXIxLCBwbGF5ZXIyKTtcbiAgICBtYWluUXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBtYWluUXVlcnkubGltaXQoMTApO1xuICAgIGlmKHN0YXR1cykge1xuICAgICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsIHN0YXR1cyk7XG4gICAgfVxuICAgIHJldHVybiBtYWluUXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGF0ZXN0TWF0Y2gocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKTtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3dpbm5lcicpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ2xvc2VyJyk7XG4gICAgcXVlcnkuZGVzY2VuZGluZygnY3JlYXRlZEF0Jyk7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgaWYodHlwZSA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgfVxuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDb25maXJtZWRNYXRjaCAocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKTtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ2FjdGl2ZScpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoJ2NyZWF0ZWRBdCcpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIH1cbiAgICBxdWVyeS5lcXVhbFRvKCdjb25maXJtMScsIHRydWUpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0yJywgdHJ1ZSk7XG4gICAgcXVlcnkubGltaXQoMSk7XG5cbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFJlcG9ydGVkTWF0Y2hlcygpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ3JlcG9ydGVkJyk7XG4gICAgcXVlcnkuZGVzY2VuZGluZygnY3JlYXRlZEF0Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRQZW5kaW5nTWF0Y2gocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKTtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoJ2NyZWF0ZWRBdCcpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIH1cbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncGVuZGluZycpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TWF0Y2goaWQpIHtcbiAgICB2YXIgbWF0Y2ggPSBuZXcgTWF0Y2guTW9kZWwoKTtcbiAgICBtYXRjaC5pZCA9IGlkO1xuICAgIHJldHVybiBtYXRjaC5mZXRjaCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE1hdGNoRGV0YWlscyhpZCkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuaW5jbHVkZSgnd2lubmVyJyk7XG4gICAgcXVlcnkuaW5jbHVkZSgnbG9zZXInKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKCdjcmVhdGVkQXQnKTtcbiAgICByZXR1cm4gcXVlcnkuZ2V0KGlkKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNYXRjaChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdNYXRjaCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFtcbiAgICAndG91cm5hbWVudCcsICdwbGF5ZXIxJywgJ3BsYXllcjInLCAnaGVybzEnLCAnaGVybzInLCAndXNlcm5hbWUxJywgJ3VzZXJuYW1lMicsICdiYXR0bGVUYWcxJywgJ2JhdHRsZVRhZzInLCAnc3RhdHVzJywgJ3dpbm5lcicsICdsb3NlcicsXG4gICAgJ3dpbkltYWdlJywgJ3JlcG9ydFJlYXNvbicsICdyZXBvcnRJbWFnZScsICdhY3RpdmVEYXRlJywgJ3VzZXIxJywgJ3VzZXIyJywgJ2FkbWluTm90ZSdcbiAgXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfTtcbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnY2FtZXJhU2VydmljZXMnLCBjYW1lcmFTZXJ2aWNlcyk7XG5cbmZ1bmN0aW9uIGNhbWVyYVNlcnZpY2VzICgkd2luZG93KSB7XG5cbiAgdmFyIGNhbWVyYSA9IHtcbiAgICBxdWFsaXR5OiA5MCxcbiAgICB0YXJnZXRXaWR0aDogMzIwLFxuICAgIHRhcmdldEhlaWdodDogNTAwLFxuICAgIGFsbG93RWRpdDogdHJ1ZSxcbiAgICBzb3VyY2VUeXBlOiAwLFxuICB9XG4gIGlmKCR3aW5kb3cuQ2FtZXJhKSB7XG4gICAgY2FtZXJhLmRlc3RpbmF0aW9uVHlwZSA9IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuREFUQV9VUkw7XG4gICAgY2FtZXJhLmVuY29kaW5nVHlwZSA9IENhbWVyYS5FbmNvZGluZ1R5cGUuSlBFRztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2FtZXJhOiBjYW1lcmFcbiAgfTtcblxuICAvLyBmdW5jdGlvbiBnZXREYXRhVXJpICh1cmwsIGNhbGxiYWNrKSB7XG4gIC8vICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gIC8vICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAvLyAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAvLyAgICAgY2FudmFzLndpZHRoID0gdGhpcy5uYXR1cmFsV2lkdGg7IC8vIG9yICd3aWR0aCcgaWYgeW91IHdhbnQgYSBzcGVjaWFsL3NjYWxlZCBzaXplXG4gIC8vICAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5uYXR1cmFsSGVpZ2h0OyAvLyBvciAnaGVpZ2h0JyBpZiB5b3Ugd2FudCBhIHNwZWNpYWwvc2NhbGVkIHNpemVcbiAgLy9cbiAgLy8gICAgIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmRyYXdJbWFnZSh0aGlzLCAwLCAwKTtcbiAgLy9cbiAgLy8gICAgIC8vIEdldCByYXcgaW1hZ2UgZGF0YVxuICAvLyAgICAgY2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJykucmVwbGFjZSgvXmRhdGE6aW1hZ2VcXC8ocG5nfGpwZyk7YmFzZTY0LC8sICcnKSk7XG4gIC8vXG4gIC8vICAgICAvLyAuLi4gb3IgZ2V0IGFzIERhdGEgVVJJXG4gIC8vICAgICAvL2NhbGxiYWNrKGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpKTtcbiAgLy8gICB9O1xuICAvLyAgIGltYWdlLnNyYyA9IHVybDtcbiAgLy8gfVxuXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1F1ZXVlU2VydmljZXMnLCBRdWV1ZVNlcnZpY2VzKVxuXG5mdW5jdGlvbiBRdWV1ZVNlcnZpY2VzKCkge1xuICB2YXIgb3Bwb25lbnQgPSB7XG4gICAgbGlzdDogWydFYXN5IFBpY2tpbmdzJywgJ1lvdXIgV29yc3QgTmlnaHRtYXJlJywgJ1dvcmxkIGNsYXNzIHBhc3RlIGVhdGVyJyxcbiAgICAgICdBIE11cmxvYycsICdHb3VyZCBjcml0aWMnLCAnTm9zZSBhbmQgbW91dGggYnJlYXRoZXInLCAnSG9nZ2VyJywgJ0EgY2FyZGlzaCBJYW4nLFxuICAgICAgJ01vcGV5IE1hZ2UnLCAnV29tYmF0IFdhcmxvY2snLCAnUm91Z2VkIHVwIFJvZ3VlJywgJ1dhaWZpc2ggV2FycmlvcicsICdEYW1wIERydWlkJyxcbiAgICAgICdTaGFiYnkgU2hhbWFuJywgJ1Blbm5pbGVzcyBQYWxhZGluJywgJ0h1ZmZ5IEh1bnRlcicsICdQZXJreSBQcmllc3QnLCAnVGhlIFdvcnN0IFBsYXllcicsXG4gICAgICAnWW91ciBPbGQgUm9vbW1hdGUnLCAnU3RhckNyYWZ0IFBybycsICdGaXNjYWxseSByZXNwb25zaWJsZSBtaW1lJywgJ1lvdXIgR3VpbGQgTGVhZGVyJyxcbiAgICAgICdOb25lY2sgR2VvcmdlJywgJ0d1bSBQdXNoZXInLCAnQ2hlYXRlciBNY0NoZWF0ZXJzb24nLCAnUmVhbGx5IHNsb3cgZ3V5JywgJ1JvYWNoIEJveScsXG4gICAgICAnT3JhbmdlIFJoeW1lcicsICdDb2ZmZWUgQWRkaWN0JywgJ0lud2FyZCBUYWxrZXInLCAnQmxpenphcmQgRGV2ZWxvcGVyJywgJ0dyYW5kIE1hc3RlcicsXG4gICAgICAnRGlhbW9uZCBMZWFndWUgUGxheWVyJywgJ0JyYW5kIE5ldyBQbGF5ZXInLCAnRGFzdGFyZGx5IERlYXRoIEtuaWdodCcsICdNZWRpb2NyZSBNb25rJyxcbiAgICAgICdBIExpdHRsZSBQdXBweSdcbiAgICBdXG4gIH07XG4gIHZhciBoZXJvZXMgPSBbXG4gICAge3RleHQ6ICdtYWdlJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnaHVudGVyJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncGFsYWRpbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcnJpb3InLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdkcnVpZCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcmxvY2snLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdzaGFtYW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwcmllc3QnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdyb2d1ZScsIGNoZWNrZWQ6IGZhbHNlfVxuICBdO1xuICByZXR1cm4ge1xuICAgIG9wcG9uZW50OiBvcHBvbmVudCxcbiAgICBoZXJvZXM6IGhlcm9lc1xuICB9O1xufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1RvdXJuYW1lbnRTZXJ2aWNlcycsIFRvdXJuYW1lbnRTZXJ2aWNlcylcbiAgLmZhY3RvcnkoJ1RvdXJuYW1lbnQnLCBUb3VybmFtZW50KVxuICAuZmFjdG9yeSgnRGV0YWlscycsIERldGFpbHMpO1xuXG5mdW5jdGlvbiBUb3VybmFtZW50U2VydmljZXMoUGFyc2UsICRxLCBUb3VybmFtZW50LCBEZXRhaWxzLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb3VybmFtZW50OiBnZXRUb3VybmFtZW50LFxuICAgIGNyZWF0ZVRvdXJuYW1lbnQ6IGNyZWF0ZVRvdXJuYW1lbnQsXG4gICAgZ2V0TGFkZGVyOiBnZXRMYWRkZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH07XG4gIGZ1bmN0aW9uIGpvaW5Ub3VybmFtZW50KHRvdXJuZXksIGpvaW5QbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbChqb2luUGxheWVyKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VybmFtZScsIFBhcnNlLlVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICBwbGF5ZXIuc2V0KCdtbXInLCAxMDAwKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VG91cm5hbWVudCgpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoRGV0YWlscy5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndHlwZScsICdsYWRkZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd0b3VybmFtZW50Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb3VybmFtZW50ICgpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0b3VybmFtZW50ID0gbmV3IFRvdXJuYW1lbnQuTW9kZWwoKTtcbiAgICB0b3VybmFtZW50LnNldCgnbmFtZScsICdPTk9HIE9QRU4nKTtcbiAgICB0b3VybmFtZW50LnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICB0b3VybmFtZW50LnNldCgnZ2FtZScsICdoZWFydGhzdG9uZScpO1xuICAgIHRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuZXkpIHtcbiAgICAgIHZhciBkZXRhaWxzID0gbmV3IERldGFpbHMuTW9kZWwoKTtcbiAgICAgIGRldGFpbHMuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgICBkZXRhaWxzLnNldCgndHlwZScsICdsYWRkZXInKTtcbiAgICAgIGRldGFpbHMuc2V0KCdwbGF5ZXJDb3VudCcsIDApO1xuICAgICAgZGV0YWlscy5zZXQoJ251bU9mR2FtZXMnLCA1KTtcbiAgICAgIGRldGFpbHMuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgZGVmZXIucmVzb2x2ZShkZXRhaWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhZGRlciAodG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5pbmNsdWRlKCdwbGF5ZXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnQoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVG91cm5hbWVudCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnbmFtZScsICdnYW1lJywgJ3N0YXR1cycsICdkaXNhYmxlZCcsICdkaXNhYmxlZFJlYXNvbicsICdsb2NhdGlvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9O1xufVxuZnVuY3Rpb24gRGV0YWlscyhQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdEZXRhaWxzJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3R5cGUnLCAnbnVtT2ZHYW1lcycsICdwbGF5ZXJDb3VudCddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9O1xufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluTWF0Y2hDdHJsJywgQWRtaW5NYXRjaEN0cmwpO1xuXG5mdW5jdGlvbiBBZG1pbk1hdGNoQ3RybCgkc2NvcGUsIFBhcnNlLCBNYXRjaFNlcnZpY2VzLCBtYXRjaCwgJGlvbmljUG9wdXApIHtcbiAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gIGNvbnNvbGUubG9nKCRzY29wZS5tYXRjaCk7XG5cbiAgJHNjb3BlLnNob3dEYXRlID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnTU0vREQgaGg6bW0gQScpO1xuICB9XG4gICRzY29wZS5jaGFuZ2VXaW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6J3RlbXBsYXRlcy9wb3B1cHMvY2hhbmdlLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ0NvbmZpcm0nLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZighJHNjb3BlLm1hdGNoLmFkbWluTm90ZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgaWYocmVzKSB7XG4gICAgICAgIHZhciB3aW5uZXIgPSAkc2NvcGUubWF0Y2gud2lubmVyO1xuICAgICAgICB2YXIgbG9zZXIgPSAkc2NvcGUubWF0Y2gubG9zZXI7XG4gICAgICAgIHZhciB3aW5Qb2ludHMgPSB3aW5uZXIuZ2V0KCdwb2ludHMnKSAtIDQ1MDtcbiAgICAgICAgdmFyIGxvc2VQb2ludHMgPSBsb3Nlci5nZXQoJ3BvaW50cycpICsgNDUwO1xuICAgICAgICB2YXIgd2luQ291bnQgPSB3aW5uZXIuZ2V0KCd3aW5zJykgLSAxO1xuICAgICAgICB2YXIgbG9zZUNvdW50ID0gbG9zZXIuZ2V0KCdsb3NzZXMnKSAtIDE7XG4gICAgICAgIHdpbm5lci5zZXQoJ3BvaW50cycsIHdpblBvaW50cyk7XG4gICAgICAgIGxvc2VyLnNldCgncG9pbnRzJywgbG9zZVBvaW50cyk7XG4gICAgICAgIHdpbm5lci5zZXQoJ3dpbnMnLCB3aW5Db3VudCk7XG4gICAgICAgIGxvc2VyLnNldCgnbG9zc2VzJywgbG9zZUNvdW50KTtcbiAgICAgICAgbG9zZXIuaW5jcmVtZW50KCd3aW5zJyk7XG4gICAgICAgIHdpbm5lci5pbmNyZW1lbnQoJ2xvc3NlcycpO1xuICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdzdGF0dXMnLCAncmVzb2x2ZWQnKVxuICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCd3aW5uZXInLCBsb3Nlcik7XG4gICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2xvc2VyJywgd2lubmVyKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaDtcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICBcbiAgJHNjb3BlLmtlZXBXaW5uZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6J3RlbXBsYXRlcy9wb3B1cHMvY2hhbmdlLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ0NvbmZpcm0nLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZighJHNjb3BlLm1hdGNoLmFkbWluTm90ZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgaWYocmVzKSB7XG4gICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3N0YXR1cycsICdyZXNvbHZlZCcpXG4gICAgICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluTWF0Y2hlc0N0cmwnLCBBZG1pbk1hdGNoZXNDdHJsKTtcblxuZnVuY3Rpb24gQWRtaW5NYXRjaGVzQ3RybCgkc2NvcGUsIFBhcnNlLCBNYXRjaFNlcnZpY2VzLCBtb21lbnQpIHtcbiAgXG4gIE1hdGNoU2VydmljZXMuZ2V0UmVwb3J0ZWRNYXRjaGVzKCkudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICRzY29wZS5tYXRjaGVzID0gbWF0Y2hlcztcbiAgfSk7XG5cbiAgJHNjb3BlLnNob3dEYXRlID0gZnVuY3Rpb24gKGRhdGUpIHtcbiAgICByZXR1cm4gbW9tZW50KGRhdGUpLmZvcm1hdCgnTU0vREQgaGg6bW0gQScpO1xuICB9XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluUGxheWVyc0N0cmwnLCBBZG1pblBsYXllcnNDdHJsKTtcblxuZnVuY3Rpb24gQWRtaW5QbGF5ZXJzQ3RybCgkc2NvcGUsIFBhcnNlLCBMYWRkZXJTZXJ2aWNlcykge1xuICAkc2NvcGUuc2VhcmNoID0ge1xuICAgIGlucHV0OiBudWxsXG4gIH1cbiAgXG4gICRzY29wZS5zZWFyY2hQbGF5ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgTGFkZGVyU2VydmljZXMuc2VhcmNoUGxheWVycygkc2NvcGUuc2VhcmNoLmlucHV0KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAkc2NvcGUucGxheWVycyA9IHBsYXllcnM7XG4gICAgfSk7XG4gIH1cbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5TZXR0aW5nc0N0cmwnLCBBZG1pblNldHRpbmdzQ3RybCk7XG5cbmZ1bmN0aW9uIEFkbWluU2V0dGluZ3NDdHJsKCRzY29wZSwgbG9jYXRpb25TZXJ2aWNlcywgbmV3VG91cm5hbWVudCwgdG91cm5hbWVudCkge1xuICAkc2NvcGUuZGV0YWlscyA9IG5ld1RvdXJuYW1lbnQ7XG4gIFxuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgXG4gICRzY29wZS5zZXRUb3VybmFtZW50TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgbG9jYXRpb25TZXJ2aWNlcy5nZXRMb2NhdGlvbigpLnRoZW4oZnVuY3Rpb24gKGxvY2F0aW9uKSB7XG4gICAgICB2YXIgcG9pbnQgPSBuZXcgUGFyc2UuR2VvUG9pbnQoe2xhdGl0dWRlOiBsb2NhdGlvbi5sYXRpdHVkZSwgbG9uZ2l0dWRlOiBsb2NhdGlvbi5sb25naXR1ZGV9KTtcbiAgICAgICRzY29wZS50b3VybmFtZW50LnNldChcImxvY2F0aW9uXCIsIHBvaW50KTtcbiAgICAgICRzY29wZS50b3VybmFtZW50LnNhdmUoKS50aGVuKGZ1bmN0aW9uICh0b3VybmFtZW50KSB7XG4gICAgICAgICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudDtcbiAgICAgICAgYWxlcnQoJ3RvdXJubWFuZXQgbG9jYXRpb24gc2V0Jyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDdHJsJywgRGFzaGJvYXJkQ3RybCk7XG5cbmZ1bmN0aW9uIERhc2hib2FyZEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkZmlsdGVyLCAkdGltZW91dCwgJGludGVydmFsLCAkaW9uaWNQb3B1cCwgJHJvb3RTY29wZSwgbW9tZW50LFxuICBQYXJzZSwgdG91cm5hbWVudCwgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcywgTGFkZGVyU2VydmljZXMsIGxvY2F0aW9uU2VydmljZXNcbikge1xuICB2YXIgcHJvbWlzZSA9IG51bGw7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJHNjb3BlLmVuZCA9IHtcbiAgICBjYW5QbGF5OiB0cnVlLFxuICAgIHRpbWU6IHBhcnNlRmxvYXQobW9tZW50KCkuZm9ybWF0KCd4JykpXG4gIH07XG5cbiAgJHNjb3BlLmxvY2F0aW9uID0gbG9jYXRpb25TZXJ2aWNlcy5sb2NhdGlvbjtcbiAgJHNjb3BlLm9wcG9uZW50ID0gUXVldWVTZXJ2aWNlcy5vcHBvbmVudDtcbiAgJHNjb3BlLmhlcm9MaXN0ID0gUXVldWVTZXJ2aWNlcy5oZXJvZXM7XG4gICRzY29wZS5teU9wcG9uZW50ID0ge25hbWU6J1BBWCBBdHRlbmRlZSd9O1xuXG4gICRzY29wZS4kb24oJyRpb25pY1ZpZXcuZW50ZXInLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKG5hdmlnYXRvciAmJiBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG4gICAgICBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlci5jdXJyZW50KCkpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgIGlmKHBsYXllcnMubGVuZ3RoKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnbG9jYXRpb24nLCAkc2NvcGUubG9jYXRpb24uY29vcmRzKTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIGlmKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgICAgICAgIHRpbWVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXROb3RpZmljYXRpb25zKCk7XG4gICAgICAgICAgICBzdGF0dXMoKTtcbiAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgJHN0YXRlLnJlbG9hZCgnYXBwLmRhc2hib2FyZCcpO1xuICB9O1xuICAkc2NvcGUuc3RhcnRRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZigkc2NvcGUuZW5kLmNhblBsYXkpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5jYW5jZWxRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgIHNhdmVQbGF5ZXIoKTtcbiAgfTtcblxuICAkc2NvcGUucGxheWVyQ29uZmlybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkc2NvcGUubWF0Y2guZmV0Y2goKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICBzd2l0Y2ggKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpKSB7XG4gICAgICAgIGNhc2UgJ3BlbmRpbmcnOiBcbiAgICAgICAgICBjb25maXJtUGxheWVyKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbGxlZCc6XG4gICAgICAgICAgc2hvd0NhbmNlbGxlZE1hdGNoKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIFxuICAkc2NvcGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgICRpbnRlcnZhbC5jYW5jZWwocHJvbWlzZSk7XG4gIH07XG4gIFxuICAkc2NvcGUuc2hvd09wcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgcHJvbWlzZSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7Y2hhbmdlV29yZCgpO30sIDIwMDApO1xuICB9O1xuXG4gICRzY29wZS5zZXRUb09wZW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICBzYXZlUGxheWVyKCk7XG4gIH1cblxuICAkc2NvcGUuZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgJHRpbWVvdXQodGltZXIsIDE1MDApO1xuICB9XG4gIFxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gIH0pO1xuICBcbiAgJHNjb3BlLiRvbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnY29udHJvbGxlciBkZXN0cm95ZWQnKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gc2V0Tm90aWZpY2F0aW9ucygpIHtcbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4uc3Vic2NyaWJlKCRzY29wZS5wbGF5ZXIudXNlcm5hbWUsIGZ1bmN0aW9uKG1zZykge1xuICAgICAgICBjb25zb2xlLmxvZygnc3ViYmVkIHRvICcgKyAkc2NvcGUucGxheWVyLnVzZXJuYW1lKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCB0byBzdWInKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICB2YXIgdXNlckdlb1BvaW50ID0gJHNjb3BlLnBsYXllci5nZXQoXCJsb2NhdGlvblwiKTtcbiAgICBpZih1c2VyR2VvUG9pbnQpIHtcbiAgICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSgnVG91cm5hbWVudCcpO1xuICAgICAgcXVlcnkud2l0aGluTWlsZXMoXCJsb2NhdGlvblwiLCB1c2VyR2VvUG9pbnQsIDUwKTtcbiAgICAgIHF1ZXJ5LmxpbWl0KDEwKTtcbiAgICAgIHF1ZXJ5LmZpbmQoe1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbihwbGFjZXNPYmplY3RzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2cocGxhY2VzT2JqZWN0cyk7XG4gICAgICAgICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbiAmJiBwbGFjZXNPYmplY3RzLmxlbmd0aCkge1xuICAgICAgICAgICAgUGFyc2VQdXNoUGx1Z2luLnN1YnNjcmliZSgncGF4LWVhc3QnLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3BheGVkJyk7XG4gICAgICAgICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuICBmdW5jdGlvbiBnZXRTdGF0dXMoKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgJHNjb3BlLnBsYXllci5mZXRjaCgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBzdGF0dXMoKTtcbiAgICAgIH0pO1xuICAgIH0sIDIwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhdHVzKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAgIHN3aXRjaCAoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpKSB7XG4gICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgICRzY29wZS5zdG9wKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3F1ZXVlJzpcbiAgICAgICAgICAkc2NvcGUuc2hvd09wcG9uZW50cygpO1xuICAgICAgICAgIG1hdGNoTWFraW5nKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZvdW5kJzpcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29uZmlybWVkJzpcbiAgICAgICAgICB3YWl0aW5nRm9yT3Bwb25lbnQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbm9PcHBvbmVudCc6XG4gICAgICAgICAgbm9PcHBvbmVudCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwbGF5aW5nJzpcbiAgICAgICAgICBnZXRMYXN0TWF0Y2goKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2FuY2VsbGVkJzpcbiAgICAgICAgICBwbGF5ZXJDYW5jZWxsZWQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gdGltZXIgKCkge1xuICAgIHZhciBub3cgPSBtb21lbnQoKTtcbiAgICB2YXIgdGltZSA9ICRzY29wZS5tYXRjaC5nZXQoJ2FjdGl2ZURhdGUnKTtcbiAgICBpZih0aW1lKSB7XG4gICAgICB2YXIgZml2ZU1pbnV0ZXMgPSBtb21lbnQodGltZSkuYWRkKDUsICdtaW51dGVzJyk7XG4gICAgICAkc2NvcGUuZW5kLnRpbWUgPSBwYXJzZUZsb2F0KGZpdmVNaW51dGVzLmZvcm1hdCgneCcpKTtcbiAgICAgICRzY29wZS5lbmQuY2FuUGxheSA9IG5vdy5pc0FmdGVyKGZpdmVNaW51dGVzLCAnc2Vjb25kcycpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNhdmVQbGF5ZXIgKCkge1xuICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcjtcbiAgICAgIHN0YXR1cygpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbWF0Y2hNYWtpbmcoKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaG1ha2luZycpLnRoZW4oZnVuY3Rpb24gKHJlcyl7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtYXRjaG1ha2luZyBzdGFydGVkJyk7XG4gICAgICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAgIGlmKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICAgIH1cbiAgICAgICAgICBnZXRTdGF0dXMoKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCAxNTAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93Q2FuY2VsbGVkTWF0Y2goKSB7XG4gICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdNYXRjaCBDYW5jZWxsZWQnLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5Zb3UgaGF2ZSBmYWlsZWQgdG8gY29uZmlybTwvZGl2PidcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICBzYXZlUGxheWVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjb25maXJtUGxheWVyKCkge1xuICAgIGlmICgkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICAkc2NvcGUubWF0Y2guc2V0KCdjb25maXJtMScsIHRydWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubWF0Y2guc2V0KCdjb25maXJtMicsIHRydWUpO1xuICAgIH1cbiAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaDtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnY29uZmlybWVkJyk7XG4gICAgICBzYXZlUGxheWVyKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBvcHBvbmVudENvbmZpcm1lZCAoKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdhY3RpdmUnKSB7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLm1hdGNoLnZpZXcnKTtcbiAgICAgIH1cbiAgICB9LCAxMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHdhaXRpbmdGb3JPcHBvbmVudCAoKSB7XG4gICAgUGFyc2UuQ2xvdWQucnVuKCdjb25maXJtTWF0Y2gnKS50aGVuKGZ1bmN0aW9uIChudW0pIHtcbiAgICAgIGNoZWNrT3Bwb25lbnQoNTAwMCwgZmFsc2UpO1xuICAgICAgY2hlY2tPcHBvbmVudCgyMDAwMCwgdHJ1ZSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja09wcG9uZW50ICh0aW1lb3V0LCBhbHJlYWR5Q2hlY2tlZCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSA9PT0gJ2NvbmZpcm1lZCcpIHtcbiAgICAgICAgJHNjb3BlLm1hdGNoLmZldGNoKCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaDtcbiAgICAgICAgICBjaGVja01hdGNoU3RhdHVzKGFscmVhZHlDaGVja2VkKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSwgdGltZW91dCk7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGNoZWNrTWF0Y2hTdGF0dXMoYWxyZWFkeUNoZWNrZWQpIHtcbiAgICBzd2l0Y2ggKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpKSB7XG4gICAgICBjYXNlICdwZW5kaW5nJzpcbiAgICAgICAgaWYoYWxyZWFkeUNoZWNrZWQpIHtcbiAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ25vT3Bwb25lbnQnKTtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdhY3RpdmUnOlxuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3BsYXlpbmcnKTtcbiAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzaG93OmxvYWRpbmcnKTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdoaWRlOmxvYWRpbmcnKTtcbiAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC52aWV3Jyk7XG4gICAgICAgIH0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NhbmNlbGxlZCc6XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY29tcGxldGVkJzpcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIFxuXG4gIGZ1bmN0aW9uIG5vT3Bwb25lbnQgKCkge1xuICAgICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaCBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+WW91ciBPcHBvbmVudDwvc3Ryb25nPjxicj4gZmFpbGVkIHRvIGNvbmZpcm0hPC9kaXY+JyxcbiAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5CYWNrPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1hc3NlcnRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPlF1ZXVlIEFnYWluPC9iPicsXG4gICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgXVxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICBpZihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdzdGF0dXMnLCAnY2FuY2VsbGVkJyk7XG4gICAgICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdzdGF0dXMnLCAnY2FuY2VsbGVkJyk7XG4gICAgICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExhc3RNYXRjaCgpIHtcbiAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSA9PT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgc2F2ZVBsYXllcigpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoYW5nZVdvcmQgKCkge1xuICAgICRzY29wZS5teU9wcG9uZW50Lm5hbWUgPSAkc2NvcGUub3Bwb25lbnQubGlzdFtNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkqJHNjb3BlLm9wcG9uZW50Lmxpc3QubGVuZ3RoKV07XG4gIH1cbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVySm9pbkN0cmwnLCBMYWRkZXJKb2luQ3RybCk7XG5cbmZ1bmN0aW9uIExhZGRlckpvaW5DdHJsKFxuICAkc2NvcGUsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksICRxLCBQYXJzZSwgIHRvdXJuYW1lbnQsIExhZGRlclNlcnZpY2VzXG4pIHtcbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcbiAgJHNjb3BlLnBsYXllciA9IHtcbiAgICBiYXR0bGVUYWc6ICcnXG4gIH07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhbGlkYXRlQmF0dGxlVGFnKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci51c2VybmFtZSA9ICRzY29wZS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAkc2NvcGUucGxheWVyLnN0YXR1cyA9ICdvcGVuJztcbiAgICAgICAgTGFkZGVyU2VydmljZXMuam9pblRvdXJuYW1lbnQoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLCAkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICBTdWNjZXNzUG9wdXAocGxheWVyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBFcnJvclBvcHVwKGVycm9yKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQmF0dGxlVGFnICgpIHtcbiAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0YWcgPSAkc2NvcGUucGxheWVyLmJhdHRsZVRhZztcblxuICAgIGlmKHRhZy5sZW5ndGggPCA4KSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBiYXR0bGUgdGFnJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIHNwbGl0ID0gdGFnLnNwbGl0KCcjJyk7XG4gICAgaWYoc3BsaXQubGVuZ3RoICE9PSAyKSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBCQVRUTEVUQUfihKIgaW5jbHVkaW5nICMgYW5kIGZvdXIgZGlnaXRzJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoc3BsaXRbMV0ubGVuZ3RoIDwgMiB8fCBzcGxpdFsxXS5sZW5ndGggPiA0KSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIHVwIHRvIGZvdXIgZGlnaXRzIGFmdGVyICMhJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoaXNOYU4oc3BsaXRbMV0pKSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIGZvdXIgZGlnaXRzIGFmdGVyICMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBMYWRkZXJTZXJ2aWNlcy52YWxpZGF0ZVBsYXllcigkc2NvcGUudG91cm5hbWVudC50b3VybmFtZW50LCB0YWcpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgIGlmKHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIGNiLnJlamVjdCgnVGhlIEJBVFRMRVRBR+KEoiB5b3UgZW50ZXJlZCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiLnJlc29sdmUodGFnKTtcbiAgICAgIH0gXG4gICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1JlZ2lzdHJhdGlvbiBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFN1Y2Nlc3NQb3B1cCAocGxheWVyKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnQ29uZ3JhdHVsYXRpb25zICcgKyBwbGF5ZXIudXNlcm5hbWUgKyAnIScsXG4gICAgICB0ZW1wbGF0ZTogJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSBzaWduZWQgdXAhIE5vdyBnbyBmaW5kIGEgdmFsaWFudCBvcHBvbmVudC4nXG4gICAgfSk7XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkc0N0cmwnLCBMZWFkZXJCb2FyZHNDdHJsKTtcblxuZnVuY3Rpb24gTGVhZGVyQm9hcmRzQ3RybCgkc2NvcGUsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50LCBQYXJzZSkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gIGdldFBsYXllcnMoKTtcbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICBnZXRQbGF5ZXJzKCk7XG4gIH07XG4gIFxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKCkge1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudC50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICB2YXIgcmFuayA9IDE7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGxheWVycywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICAgIHJhbmsrKztcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICB9KTtcbiAgfVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ1Jlc2V0UGFzc3dvcmRDdHJsJywgUmVzZXRQYXNzd29yZEN0cmwpO1xuXG5mdW5jdGlvbiBSZXNldFBhc3N3b3JkQ3RybFxuKCRzY29wZSwgJGlvbmljUG9wdXAsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgUGFyc2UpIHtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS5lbWFpbCA9IHt9O1xuICBcbiAgJHNjb3BlLnJlc2V0UGFzc3dvcmQgPSBmdW5jdGlvbiAoZW1haWwpIHtcbiAgICBQYXJzZS5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0KGVtYWlsLnRleHQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTdWNjZXNzUG9wdXAoKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmVcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdVcGRhdGUgRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIFN1Y2Nlc3NQb3B1cCAoKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUGFzc3dvcmQgUmVzZXQnLFxuICAgICAgdGVtcGxhdGU6ICdBbiBFbWFpbCBoYXMgYmVlbiBzZW50IHRvIHJlc2V0IHlvdXIgcGFzc3dvcmQnXG4gICAgfSkudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICB9KVxuICB9XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVyUHJvZmlsZUN0cmwnLCBMYWRkZXJQcm9maWxlQ3RybCk7XG5cbmZ1bmN0aW9uIExhZGRlclByb2ZpbGVDdHJsKFxuICAkc2NvcGUsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksICRxLCBQYXJzZSwgIHRvdXJuYW1lbnQsIExhZGRlclNlcnZpY2VzLCBwbGF5ZXJcbikge1xuXG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50LnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG4gICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJbMF07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhbGlkYXRlQmF0dGxlVGFnKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgU3VjY2Vzc1BvcHVwKHBsYXllcikudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvcik7XG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZUJhdHRsZVRhZyAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdGFnID0gJHNjb3BlLnBsYXllci5iYXR0bGVUYWc7XG5cbiAgICBpZih0YWcubGVuZ3RoIDwgOCkge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgYmF0dGxlIHRhZycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBzcGxpdCA9IHRhZy5zcGxpdCgnIycpO1xuICAgIGlmKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgQkFUVExFVEFH4oSiIGluY2x1ZGluZyAjIGFuZCBmb3VyIGRpZ2l0cycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKHNwbGl0WzFdLmxlbmd0aCA8IDIgfHwgc3BsaXRbMV0ubGVuZ3RoID4gNCkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyB1cCB0byBmb3VyIGRpZ2l0cyBhZnRlciAjIScpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKGlzTmFOKHNwbGl0WzFdKSkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyBmb3VyIGRpZ2l0cyBhZnRlciAjJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMudmFsaWRhdGVQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCwgdGFnKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICBpZihyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBjYi5yZWplY3QoJ1RoZSBCQVRUTEVUQUfihKIgeW91IGVudGVyZWQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYi5yZXNvbHZlKHRhZyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1VwZGF0ZSBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFN1Y2Nlc3NQb3B1cCAocGxheWVyKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnQ29uZ3JhdHVsYXRpb25zICcgKyBwbGF5ZXIudXNlcm5hbWUgKyAnIScsXG4gICAgICB0ZW1wbGF0ZTogJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSB1cGRhdGVkISBOb3cgZ28gYW5kIHBsYXkhJ1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5mdW5jdGlvbiBMb2dpbkN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICRzY29wZS51c2VyID0ge307XG4gIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2UuVXNlci5sb2dJbigkc2NvcGUudXNlci51c2VybmFtZSwgJHNjb3BlLnVzZXIucGFzc3dvcmQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uICh1c2VyLCBlcnJvcikge1xuICAgICAgICAkc2NvcGUud2FybmluZyA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTWF0Y2hMaXN0Q3RybCcsIE1hdGNoTGlzdEN0cmwpO1xuXG5mdW5jdGlvbiBNYXRjaExpc3RDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGlvbmljUG9wdXAsICRyb290U2NvcGUsIFBhcnNlLCBNYXRjaFNlcnZpY2VzLCBwbGF5ZXJcbikge1xuICAkc2NvcGUubWF0Y2hlcyA9IFtdO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuXG4gIGlmKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgIE1hdGNoU2VydmljZXMuZ2V0UGxheWVyTWF0Y2hlcygkc2NvcGUucGxheWVyLCBudWxsKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICBjb25zb2xlLmxvZygnbWF0Y2hlcyBmZXRjaGVkJyk7XG4gICAgICAkc2NvcGUubWF0Y2hlcyA9IG1hdGNoZXM7XG4gICAgICBNYXRjaFNlcnZpY2VzLmdldFBsYXllck1hdGNoZXMoJHNjb3BlLnBsYXllciwgJ3JlcG9ydGVkJykudGhlbihmdW5jdGlvbiAocmVwb3J0ZWQpIHtcbiAgICAgICAgJHNjb3BlLnJlcG9ydGVkID0gcmVwb3J0ZWQ7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICB9XG5cbiAgJHNjb3BlLnByb2Nlc3NNYXRjaCA9IGZ1bmN0aW9uIChtYXRjaCkge1xuICAgIGlmKG1hdGNoLndpbm5lci5pZCA9PT0gJHNjb3BlLnBsYXllci5pZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZihtYXRjaC5sb3Nlci5pZCA9PT0gJHNjb3BlLnBsYXllci5pZCkge1xuICAgICAgaWYobWF0Y2gucmVwb3J0UmVhc29uKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBpZigkc2NvcGUucmVwb3J0ZWQubGVuZ3RoKSB7XG4gICAgICBzaG93UmVwb3J0ZWQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYobWF0Y2guc3RhdHVzICE9PSAnY29tcGxldGVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC5yZXBvcnQnLCB7aWQ6IG1hdGNoLmlkfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gc2hvd1JlcG9ydGVkKCkge1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnVG9vIE1hbnkgUmVwb3J0cycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdSBoYXZlIHRvbyBtYW55IHBlbmRpbmcgcmVwb3J0cy4gUGxlYXNlIHdhaXQuPC9kaXY+J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgfSlcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFJlcG9ydEN0cmwnLCBNYXRjaFJlcG9ydEN0cmwpO1xuXG5mdW5jdGlvbiBNYXRjaFJlcG9ydEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCwgJGlvbmljSGlzdG9yeSxcbiAgUGFyc2UsIE1hdGNoU2VydmljZXMsIGNhbWVyYVNlcnZpY2VzLCByZXBvcnRcbikge1xuXG4gICRzY29wZS5tYXRjaCA9IHJlcG9ydDtcblxuICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG5cbiAgdmFyIHBhcnNlRmlsZSA9IG5ldyBQYXJzZS5GaWxlKCk7XG4gIHZhciBpbWdTdHJpbmcgPSBudWxsO1xuXG4gICRzY29wZS5nZXRQaWN0dXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBjYW1lcmFTZXJ2aWNlcy5jYW1lcmE7XG4gICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKG9uU3VjY2VzcyxvbkZhaWwsb3B0aW9ucyk7XG4gIH07XG4gIHZhciBvblN1Y2Nlc3MgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlRGF0YTtcbiAgICBpbWdTdHJpbmcgPSBpbWFnZURhdGE7XG4gICAgJHNjb3BlLiRhcHBseSgpO1xuICB9O1xuICB2YXIgb25GYWlsID0gZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUubG9nKFwiT24gZmFpbCBcIiArIGUpO1xuICB9XG5cbiAgJHNjb3BlLnByb2Nlc3NSZXBvcnQgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIGlmKGltZ1N0cmluZykge1xuICAgICAgcGFyc2VGaWxlID0gbmV3IFBhcnNlLkZpbGUoXCJyZXBvcnQucG5nXCIsIHtiYXNlNjQ6aW1nU3RyaW5nfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcnNlRmlsZSA9IG51bGw7XG4gICAgfVxuICAgICRzY29wZS5tYXRjaC5zZXQoXCJyZXBvcnRJbWFnZVwiLCBwYXJzZUZpbGUpO1xuICAgICRzY29wZS5tYXRjaC5zZXQoJ3N0YXR1cycsICdyZXBvcnRlZCcpO1xuICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICAgIH0pO1xuICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICB0aXRsZTogJ01hdGNoIFJlcG9ydGVkJyxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5UaGFuayB5b3UgZm9yIHN1Ym1pdHRpbmcgdGhlIHJlcG9ydC48L2Rpdj4nXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICB9O1xuXG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTWF0Y2hWaWV3Q3RybCcsIE1hdGNoVmlld0N0cmwpO1xuXG5mdW5jdGlvbiBNYXRjaFZpZXdDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJHJvb3RTY29wZSwgJGlvbmljUG9wdXAsICRpb25pY0hpc3RvcnksICR0aW1lb3V0LFxuICBQYXJzZSwgTGFkZGVyU2VydmljZXMsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMsIGNhbWVyYVNlcnZpY2VzLCB0b3VybmFtZW50XG4pIHtcbiAgXG4gIHZhciBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZSgpO1xuICB2YXIgaW1nU3RyaW5nID0gbnVsbDtcbiAgXG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gICRzY29wZS5waWN0dXJlID0gbnVsbDtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gIFxuICAkc2NvcGUuJG9uKFwiJGlvbmljVmlldy5lbnRlclwiLCBmdW5jdGlvbihldmVudCkge1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcigkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyc1swXTtcbiAgICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSA9PT0gJ2NhbmNlbGxlZCcpIHtcbiAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGdldE1hdGNoRGV0YWlscygpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xuICBcbiAgJHNjb3BlLiRvbignJGlvbmljVmlldy5sZWF2ZScsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgbG9zZU1hdGNoKCkuY2xvc2UoKTtcbiAgICB3aW5NYXRjaCgpLmNsb3NlKCk7XG4gIH0pO1xuXG4gICRzY29wZS5nZXRQaWN0dXJlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYoY2FtZXJhU2VydmljZXMuY2FtZXJhKSB7XG4gICAgICB2YXIgb3B0aW9ucyA9IGNhbWVyYVNlcnZpY2VzLmNhbWVyYTtcbiAgICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZShvblN1Y2Nlc3Msb25GYWlsLG9wdGlvbnMpO1xuICAgIH1cbiAgfTtcbiAgdmFyIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuICAgICRzY29wZS5waWN0dXJlID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnICsgaW1hZ2VEYXRhO1xuICAgIGltZ1N0cmluZyA9IGltYWdlRGF0YTtcbiAgICAkc2NvcGUuJGFwcGx5KCk7XG4gIH07XG4gIHZhciBvbkZhaWwgPSBmdW5jdGlvbihlKSB7XG4gICAgY29uc29sZS5sb2coXCJPbiBmYWlsIFwiICsgZSk7XG4gIH07XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIGdldE1hdGNoKHRydWUpO1xuICB9O1xuXG4gICRzY29wZS5yZWNvcmQgPSBmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBudWxsO1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnYWN0aXZlJykge1xuICAgICAgICBzd2l0Y2ggKHJlY29yZCkge1xuICAgICAgICAgIGNhc2UgJ3dpbic6XG4gICAgICAgICAgICB3aW5NYXRjaCgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgIGlmKHJlcykge1xuICAgICAgICAgICAgICAgIGlmKGltZ1N0cmluZykge1xuICAgICAgICAgICAgICAgICAgcGFyc2VGaWxlID0gbmV3IFBhcnNlLkZpbGUoXCJ3aW5uaW5nLnBuZ1wiLCB7YmFzZTY0OmltZ1N0cmluZ30pO1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldChcIndpbkltYWdlXCIsIHBhcnNlRmlsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJlY29yZE1hdGNoKHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdsb3NzJzpcbiAgICAgICAgICAgIGxvc2VNYXRjaCgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgIGlmKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5vcHBvbmVudC51c2VyKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdsb3NlcicsICRzY29wZS5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJlY29yZE1hdGNoKHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHdpbk1hdGNoICgpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG4gICAgJHNjb3BlLmVycm9yTWVzc2FnZSA9IG51bGw7XG5cbiAgICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcG9wdXBzL3dpbi5tYXRjaC5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQgYSBXaW4nLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZiAoISRzY29wZS5waWN0dXJlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yTWVzc2FnZSA9ICdVcGxvYWQgYSBTY3JlZW5zaG90JztcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9zZU1hdGNoKCkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvbG9zZS5tYXRjaC5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQgYSBMb3NzJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1hdGNoKHJlZnJlc2gpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCRzY29wZS5tYXRjaC5pZCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoJyArICRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpKTtcbiAgICAgIGNvbnNvbGUubG9nKCdtYXRjaCBmZXRjaGVkJyk7XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUubWF0Y2guZ2V0KCd3aW5uZXInKSk7XG4gICAgICBpZihyZWZyZXNoKSB7XG4gICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWNvcmRNYXRjaCh1c2VybmFtZSkge1xuICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2hvdzpsb2FkaW5nJyk7XG4gICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ2NvbXBsZXRlZCcpO1xuICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBQYXJzZS5DbG91ZC5ydW4oJ21hdGNoUmVzdWx0cycsIHttYXRjaDogJHNjb3BlLm1hdGNoLmlkLCB1c2VybmFtZTogdXNlcm5hbWV9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5tYXRjaC53aW5uZXIuZmV0Y2goKS50aGVuKGZ1bmN0aW9uICh3aW5uZXIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cod2lubmVyKTtcbiAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLndpbm5lciA9IHdpbm5lcjtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDIwMDApO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWF0Y2hEZXRhaWxzKCkge1xuICAgICRzY29wZS5vcHBvbmVudCA9IHtcbiAgICAgIGhlcm86IG51bGwsXG4gICAgICBiYXR0bGVUYWc6IG51bGxcbiAgICB9O1xuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8yO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjI7XG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMicpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8xO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjE7XG4gICAgfVxuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdNZW51Q3RybCcsIE1lbnVDdHJsKTtcblxuZnVuY3Rpb24gTWVudUN0cmwoJHNjb3BlLCAkaW9uaWNQb3BvdmVyLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlLCAkdGltZW91dCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJGlvbmljUG9wb3Zlci5mcm9tVGVtcGxhdGVVcmwoJ3RlbXBsYXRlcy9wb3BvdmVycy9wcm9maWxlLnBvcC5odG1sJywge1xuICAgIHNjb3BlOiAkc2NvcGUsXG4gIH0pLnRoZW4oZnVuY3Rpb24ocG9wb3Zlcikge1xuICAgICRzY29wZS5wb3BvdmVyID0gcG9wb3ZlcjtcbiAgfSk7XG5cbiAgJHNjb3BlLm1lbnUgPSBmdW5jdGlvbiAobGluaykge1xuICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgfSk7XG4gICAgaWYobGluayA9PT0gJ2xvZ2luJykge1xuICAgICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgICBQYXJzZVB1c2hQbHVnaW4udW5zdWJzY3JpYmUoJHNjb3BlLnVzZXIuY3VycmVudCgpLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5zdWJiZWQnKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBQYXJzZS5Vc2VyLmxvZ091dCgpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC4nICsgbGluaywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDEwMDApO1xuICAgICAgXG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICB9XG4gICAgJHNjb3BlLnBvcG92ZXIuaGlkZSgpO1xuICB9XG4gIC8vQ2xlYW51cCB0aGUgcG9wb3ZlciB3aGVuIHdlJ3JlIGRvbmUgd2l0aCBpdCFcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wb3Zlci5yZW1vdmUoKTtcbiAgfSk7XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgUmVnaXN0ZXJDdHJsKTtcblxuUmVnaXN0ZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIFJlZ2lzdGVyQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY1BvcHVwKSB7XG5cbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuUmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB2YXIgcmVnaXN0ZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgIHJlZ2lzdGVyLnNldCh1c2VyKTtcbiAgICByZWdpc3Rlci5zaWduVXAobnVsbCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcy5hZG1pbicsIFtdKVxuICAuY29uZmlnKEFkbWluUm91dGVzKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmFkbWluLm1hdGNoJywge1xuICAgICAgdXJsOiAnL21hdGNoLzppZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5tYXRjaC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbk1hdGNoQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2hEZXRhaWxzKCRzdGF0ZVBhcmFtcy5pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmFkbWluLnBsYXllcnMnLCB7XG4gICAgICB1cmw6ICcvcGxheWVycycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5wbGF5ZXJzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0FkbWluUGxheWVyc0N0cmwnXG4gICAgfSk7XG4gIFxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLmxhZGRlcicsIFtdKVxuICAuY29uZmlnKExhZGRlclJvdXRlcyk7XG5cbmZ1bmN0aW9uIExhZGRlclJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlcicsIHtcbiAgICAgIHVybDogJy9sYWRkZXInLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2xhZGRlci5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmxlYWRlcmJvYXJkJywge1xuICAgICAgdXJsOiAnL2xlYWRlcmJvYXJkcycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGVhZGVyYm9hcmQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGVhZGVyQm9hcmRzQ3RybCdcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5qb2luJywge1xuICAgICAgdXJsOiAnL2pvaW4nLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2pvaW4uaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGFkZGVySm9pbkN0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIucHJvZmlsZScsIHtcbiAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9wcm9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xhZGRlclByb2ZpbGVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcGxheWVyOiBmdW5jdGlvbiAoUGFyc2UsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIExhZGRlclNlcnZpY2VzLmdldFBsYXllcih0b3VybmFtZW50LnRvdXJuYW1lbnQsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLm1hdGNoZXMnLCBbXSlcbiAgLmNvbmZpZyhNYXRjaFJvdXRlcyk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gubGlzdCcsIHtcbiAgICAgIHVybDogJy9saXN0JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmxpc3QuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hMaXN0Q3RybCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHBsYXllcjogZnVuY3Rpb24gKFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCkge1xuICAgICAgICAgIHJldHVybiBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIodG91cm5hbWVudC50b3VybmFtZW50LCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnZpZXcnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC52aWV3Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoVmlld0N0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5tYXRjaC5yZXBvcnQnLCB7XG4gICAgICB1cmw6ICcvcmVwb3J0LzppZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC5yZXBvcnQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hSZXBvcnRDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcmVwb3J0OiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJHN0YXRlUGFyYW1zLmlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
