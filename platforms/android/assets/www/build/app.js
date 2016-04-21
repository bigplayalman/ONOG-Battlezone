
config.$inject = ['$ionicConfigProvider', '$compileProvider', 'ParseProvider'];
routes.$inject = ['$stateProvider', '$urlRouterProvider'];
run.$inject = ['$ionicPlatform', '$state', '$rootScope', '$ionicLoading', '$ionicPopup', 'locationServices', '$ionicHistory', '$cordovaNetwork', '$window'];
AdminMatchesCtrl.$inject = ['$scope', 'Parse', 'MatchServices'];
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
MatchRoutes.$inject = ['$stateProvider'];
LadderServices.$inject = ['Parse', 'Ladder'];
Ladder.$inject = ['Parse'];
locationServices.$inject = ['Parse', '$cordovaGeolocation', '$q'];
MatchServices.$inject = ['Parse', 'Match', '$q'];
Match.$inject = ['Parse'];
cameraServices.$inject = ['$window'];
TournamentServices.$inject = ['Parse', '$q', 'Tournament', 'Details', 'Ladder'];
Tournament.$inject = ['Parse'];
Details.$inject = ['Parse'];angular.module('ONOG.config', [])
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



angular.module('ONOG.Controllers')

  .controller('AdminMatchesCtrl', AdminMatchesCtrl);

function AdminMatchesCtrl($scope, Parse, MatchServices) {
  
  MatchServices.getReportedMatches().then(function (matches) {
    $scope.matches = matches;
  });
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
                  parseFile = new Parse.File("report.png", {base64:imgString});
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5wYXNzd29yZC5jdHJsLmpzIiwiY29udHJvbGxlcnMvbGFkZGVyLnByb2ZpbGUuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5saXN0LmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5yZXBvcnQuY3RybC5qcyIsImNvbnRyb2xsZXJzL21hdGNoLnZpZXcuY3RybC5qcyIsImNvbnRyb2xsZXJzL21lbnUuY3RybC5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmN0cmwuanMiLCJyb3V0ZXMvYWRtaW4ucm91dGVzLmpzIiwicm91dGVzL2xhZGRlci5yb3V0ZXMuanMiLCJyb3V0ZXMvbWF0Y2gucm91dGVzLmpzIiwic2VydmljZXMvbGFkZGVyLnNlcnZpY2VzLmpzIiwic2VydmljZXMvbG9jYXRpb24uc2VydmljZXMuanMiLCJzZXJ2aWNlcy9tYXRjaC5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL3Bob3RvLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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Q0EsT0FBQSxXQUFBLElBQUEsWUFBQTtNQUNBLE9BQUEsV0FBQSxPQUFBLEtBQUEsVUFBQSxZQUFBO1FBQ0EsT0FBQSxhQUFBO1FBQ0EsTUFBQTs7Ozs7OztBQ2ZBLFFBQUEsT0FBQTs7R0FFQSxXQUFBLGlCQUFBOztBQUVBLFNBQUE7RUFDQSxRQUFBLFFBQUEsU0FBQSxVQUFBLFdBQUEsYUFBQSxZQUFBO0VBQ0EsT0FBQSxZQUFBLGVBQUEsZUFBQSxnQkFBQTtFQUNBO0VBQ0EsSUFBQSxVQUFBO0VBQ0EsT0FBQSxhQUFBLFdBQUE7RUFDQSxPQUFBLE9BQUEsTUFBQTs7RUFFQSxPQUFBLE1BQUE7SUFDQSxTQUFBO0lBQ0EsTUFBQSxXQUFBLFNBQUEsT0FBQTs7O0VBR0EsT0FBQSxXQUFBLGlCQUFBO0VBQ0EsT0FBQSxXQUFBLGNBQUE7RUFDQSxPQUFBLFdBQUEsY0FBQTtFQUNBLE9BQUEsYUFBQSxDQUFBLEtBQUE7O0VBRUEsT0FBQSxJQUFBLG9CQUFBLFNBQUEsT0FBQTtJQUNBLEdBQUEsYUFBQSxVQUFBLGNBQUE7TUFDQSxVQUFBLGFBQUE7O0lBRUEsZUFBQSxVQUFBLE9BQUEsWUFBQSxPQUFBLEtBQUEsV0FBQSxLQUFBLFVBQUEsU0FBQTtNQUNBLEdBQUEsUUFBQSxRQUFBO1FBQ0EsT0FBQSxTQUFBLFFBQUE7UUFDQSxPQUFBLE9BQUEsSUFBQSxZQUFBLE9BQUEsU0FBQTtRQUNBLE9BQUEsT0FBQSxPQUFBLEtBQUEsVUFBQSxRQUFBO1VBQ0EsT0FBQSxTQUFBO1VBQ0EsY0FBQSxlQUFBLE9BQUEsUUFBQSxLQUFBLFVBQUEsU0FBQTtZQUNBLEdBQUEsUUFBQSxRQUFBO2NBQ0EsT0FBQSxRQUFBLFFBQUE7Y0FDQTs7WUFFQTtZQUNBO1lBQ0EsT0FBQSxXQUFBOzs7Ozs7O0VBT0EsT0FBQSxZQUFBLFdBQUE7SUFDQSxPQUFBLE9BQUE7O0VBRUEsT0FBQSxhQUFBLFlBQUE7SUFDQSxHQUFBLE9BQUEsSUFBQSxTQUFBO01BQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtNQUNBOzs7RUFHQSxPQUFBLGNBQUEsWUFBQTtJQUNBLE9BQUEsT0FBQSxJQUFBLFVBQUE7SUFDQSxPQUFBO0lBQ0E7OztFQUdBLE9BQUEsZ0JBQUEsWUFBQTtJQUNBLE9BQUEsTUFBQSxRQUFBLEtBQUEsVUFBQSxPQUFBO01BQ0EsT0FBQSxRQUFBO01BQ0EsUUFBQSxPQUFBLE1BQUEsSUFBQTtRQUNBLEtBQUE7VUFDQTtVQUNBO1FBQ0EsS0FBQTtVQUNBO1VBQ0E7Ozs7O0VBS0EsT0FBQSxPQUFBLFdBQUE7SUFDQSxVQUFBLE9BQUE7OztFQUdBLE9BQUEsZ0JBQUEsV0FBQTtJQUNBLE9BQUE7SUFDQSxVQUFBLFVBQUEsWUFBQSxDQUFBLGdCQUFBOzs7RUFHQSxPQUFBLFlBQUEsV0FBQTtJQUNBLE9BQUEsT0FBQSxJQUFBLFVBQUE7SUFDQTs7O0VBR0EsT0FBQSxXQUFBLFlBQUE7SUFDQSxTQUFBLE9BQUE7OztFQUdBLE9BQUEsSUFBQSxZQUFBLFdBQUE7SUFDQSxPQUFBOzs7RUFHQSxPQUFBLElBQUEsV0FBQSxZQUFBO0lBQ0EsUUFBQSxJQUFBOzs7RUFHQSxTQUFBLG1CQUFBO0lBQ0EsR0FBQSxPQUFBLGlCQUFBO01BQ0EsZ0JBQUEsVUFBQSxPQUFBLE9BQUEsVUFBQSxTQUFBLEtBQUE7UUFDQSxRQUFBLElBQUEsZUFBQSxPQUFBLE9BQUE7U0FDQSxTQUFBLEdBQUE7UUFDQSxRQUFBLElBQUE7OztJQUdBLElBQUEsZUFBQSxPQUFBLE9BQUEsSUFBQTtJQUNBLEdBQUEsY0FBQTtNQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQTtNQUNBLE1BQUEsWUFBQSxZQUFBLGNBQUE7TUFDQSxNQUFBLE1BQUE7TUFDQSxNQUFBLEtBQUE7UUFDQSxTQUFBLFNBQUEsZUFBQTtVQUNBLFFBQUEsSUFBQTtVQUNBLEdBQUEsT0FBQSxtQkFBQSxjQUFBLFFBQUE7WUFDQSxnQkFBQSxVQUFBLFlBQUEsU0FBQSxLQUFBO2NBQ0EsUUFBQSxJQUFBO2VBQ0EsU0FBQSxHQUFBO2NBQ0EsUUFBQSxJQUFBOzs7Ozs7O0VBT0EsU0FBQSxZQUFBO0lBQ0EsU0FBQSxZQUFBO01BQ0EsT0FBQSxPQUFBLFFBQUEsS0FBQSxVQUFBLFFBQUE7UUFDQTs7T0FFQTs7O0VBR0EsU0FBQSxTQUFBO0lBQ0EsR0FBQSxPQUFBLFFBQUE7TUFDQSxRQUFBLE9BQUEsT0FBQSxJQUFBO1FBQ0EsS0FBQTtVQUNBLE9BQUE7VUFDQTtRQUNBLEtBQUE7VUFDQSxPQUFBO1VBQ0E7VUFDQTtRQUNBLEtBQUE7VUFDQTtRQUNBLEtBQUE7VUFDQTtVQUNBO1FBQ0EsS0FBQTtVQUNBO1VBQ0E7UUFDQSxLQUFBO1VBQ0E7VUFDQTtRQUNBLEtBQUE7VUFDQTtVQUNBOztNQUVBLFFBQUEsSUFBQSxPQUFBLE9BQUEsSUFBQTs7OztFQUlBLFNBQUEsU0FBQTtJQUNBLElBQUEsTUFBQTtJQUNBLElBQUEsT0FBQSxPQUFBLE1BQUEsSUFBQTtJQUNBLEdBQUEsTUFBQTtNQUNBLElBQUEsY0FBQSxPQUFBLE1BQUEsSUFBQSxHQUFBO01BQ0EsT0FBQSxJQUFBLE9BQUEsV0FBQSxZQUFBLE9BQUE7TUFDQSxPQUFBLElBQUEsVUFBQSxJQUFBLFFBQUEsYUFBQTs7OztFQUlBLFNBQUEsY0FBQTtJQUNBLE9BQUEsT0FBQSxPQUFBLEtBQUEsVUFBQSxRQUFBO01BQ0EsT0FBQSxTQUFBO01BQ0E7Ozs7RUFJQSxTQUFBLGNBQUE7SUFDQSxTQUFBLFlBQUE7TUFDQSxNQUFBLE1BQUEsSUFBQSxlQUFBLEtBQUEsVUFBQSxJQUFBO1FBQ0EsUUFBQSxJQUFBO1FBQ0EsY0FBQSxlQUFBLE9BQUEsUUFBQSxLQUFBLFVBQUEsU0FBQTtVQUNBLEdBQUEsUUFBQSxRQUFBO1lBQ0EsT0FBQSxRQUFBLFFBQUE7O1VBRUE7OztPQUdBOzs7RUFHQSxTQUFBLHFCQUFBO0lBQ0EsWUFBQSxNQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7T0FDQSxLQUFBLFNBQUEsS0FBQTtNQUNBLE9BQUEsT0FBQSxJQUFBLFVBQUE7TUFDQTs7OztFQUlBLFNBQUEsZ0JBQUE7SUFDQSxJQUFBLE9BQUEsT0FBQSxXQUFBLFdBQUE7TUFDQSxPQUFBLE1BQUEsSUFBQSxZQUFBO1dBQ0E7TUFDQSxPQUFBLE1BQUEsSUFBQSxZQUFBOztJQUVBLE9BQUEsTUFBQSxPQUFBLEtBQUEsVUFBQSxPQUFBO01BQ0EsT0FBQSxRQUFBO01BQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtNQUNBOzs7O0VBSUEsU0FBQSxxQkFBQTtJQUNBLFNBQUEsWUFBQTtNQUNBLEdBQUEsT0FBQSxNQUFBLElBQUEsY0FBQSxVQUFBO1FBQ0EsT0FBQSxHQUFBOztPQUVBOzs7RUFHQSxTQUFBLHNCQUFBO0lBQ0EsTUFBQSxNQUFBLElBQUEsZ0JBQUEsS0FBQSxVQUFBLEtBQUE7TUFDQSxjQUFBLE1BQUE7TUFDQSxjQUFBLE9BQUE7Ozs7RUFJQSxTQUFBLGVBQUEsU0FBQSxnQkFBQTtJQUNBLFNBQUEsWUFBQTtNQUNBLEdBQUEsT0FBQSxPQUFBLElBQUEsY0FBQSxhQUFBO1FBQ0EsT0FBQSxNQUFBLFFBQUEsS0FBQSxVQUFBLE9BQUE7VUFDQSxPQUFBLFFBQUE7VUFDQSxpQkFBQTs7O09BR0E7OztFQUdBLFNBQUEsaUJBQUEsZ0JBQUE7SUFDQSxRQUFBLE9BQUEsTUFBQSxJQUFBO01BQ0EsS0FBQTtRQUNBLEdBQUEsZ0JBQUE7VUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO1VBQ0E7O1FBRUE7TUFDQSxLQUFBO1FBQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtRQUNBLFdBQUEsV0FBQTtRQUNBLE9BQUEsT0FBQSxPQUFBLEtBQUEsWUFBQTtVQUNBLFdBQUEsV0FBQTtVQUNBLE9BQUEsR0FBQTs7UUFFQTtNQUNBLEtBQUE7UUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO1FBQ0E7UUFDQTtNQUNBLEtBQUE7UUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO1FBQ0E7UUFDQTs7Ozs7RUFLQSxTQUFBLGNBQUE7SUFDQSxZQUFBLEtBQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTtNQUNBLFNBQUE7UUFDQTtVQUNBLE1BQUE7VUFDQSxNQUFBO1VBQ0EsT0FBQSxTQUFBLEdBQUE7WUFDQSxPQUFBOzs7UUFHQTtVQUNBLE1BQUE7VUFDQSxNQUFBO1VBQ0EsT0FBQSxTQUFBLEdBQUE7WUFDQSxPQUFBOzs7O09BSUEsS0FBQSxTQUFBLEtBQUE7TUFDQSxHQUFBLEtBQUE7UUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO1FBQ0EsT0FBQSxNQUFBLElBQUEsVUFBQTtRQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUEsWUFBQTtVQUNBOzthQUVBO1FBQ0EsT0FBQSxPQUFBLElBQUEsVUFBQTtRQUNBLE9BQUEsTUFBQSxJQUFBLFVBQUE7UUFDQSxPQUFBLE1BQUEsT0FBQSxLQUFBLFlBQUE7VUFDQTs7Ozs7O0VBTUEsU0FBQSxlQUFBO0lBQ0EsR0FBQSxPQUFBLE1BQUEsSUFBQSxjQUFBLGFBQUE7TUFDQSxPQUFBLE9BQUEsSUFBQSxVQUFBO01BQ0E7Ozs7RUFJQSxTQUFBLGNBQUE7SUFDQSxPQUFBLFdBQUEsT0FBQSxPQUFBLFNBQUEsS0FBQSxLQUFBLE1BQUEsS0FBQSxTQUFBLE9BQUEsU0FBQSxLQUFBOztDQUVBOzs7QUNoVUEsUUFBQSxPQUFBOztHQUVBLFdBQUEsa0JBQUE7O0FBRUEsU0FBQTtFQUNBLFFBQUEsU0FBQSxhQUFBLFFBQUEsZUFBQSxJQUFBLFFBQUEsWUFBQTtFQUNBO0VBQ0EsY0FBQSxnQkFBQTtJQUNBLGFBQUE7O0VBRUEsT0FBQSxhQUFBLFdBQUE7RUFDQSxPQUFBLE9BQUEsTUFBQSxLQUFBO0VBQ0EsT0FBQSxTQUFBO0lBQ0EsV0FBQTs7O0VBR0EsT0FBQSxpQkFBQSxZQUFBO0lBQ0Esb0JBQUE7TUFDQSxVQUFBLEtBQUE7UUFDQSxPQUFBLE9BQUEsV0FBQSxPQUFBLEtBQUE7UUFDQSxPQUFBLE9BQUEsU0FBQTtRQUNBLGVBQUEsZUFBQSxPQUFBLFlBQUEsT0FBQSxNQUFBLE9BQUEsUUFBQSxLQUFBLFVBQUEsUUFBQTtVQUNBLGFBQUEsUUFBQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsR0FBQTs7OztNQUlBLFVBQUEsT0FBQTtRQUNBLFdBQUE7Ozs7RUFJQSxTQUFBLHFCQUFBO0lBQ0EsSUFBQSxLQUFBLEdBQUE7SUFDQSxJQUFBLE1BQUEsT0FBQSxPQUFBOztJQUVBLEdBQUEsSUFBQSxTQUFBLEdBQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxPQUFBLEdBQUE7O0lBRUEsSUFBQSxRQUFBLElBQUEsTUFBQTtJQUNBLEdBQUEsTUFBQSxXQUFBLEdBQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxPQUFBLEdBQUE7O0lBRUEsR0FBQSxNQUFBLEdBQUEsU0FBQSxLQUFBLE1BQUEsR0FBQSxTQUFBLEdBQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxPQUFBLEdBQUE7O0lBRUEsR0FBQSxNQUFBLE1BQUEsS0FBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLE9BQUEsR0FBQTs7SUFFQSxlQUFBLGVBQUEsT0FBQSxXQUFBLFlBQUEsS0FBQSxLQUFBLFVBQUEsU0FBQTtNQUNBLEdBQUEsUUFBQSxRQUFBO1FBQ0EsR0FBQSxPQUFBO2FBQ0E7UUFDQSxHQUFBLFFBQUE7OztJQUdBLE9BQUEsR0FBQTtHQUNBOztFQUVBLFNBQUEsWUFBQSxTQUFBO0lBQ0EsT0FBQSxZQUFBLE1BQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTs7R0FFQTs7RUFFQSxTQUFBLGNBQUEsUUFBQTtJQUNBLE9BQUEsWUFBQSxNQUFBO01BQ0EsT0FBQSxxQkFBQSxPQUFBLFdBQUE7TUFDQSxVQUFBOztHQUVBO0NBQ0E7OztBQzVFQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxvQkFBQTs7QUFFQSxTQUFBLGlCQUFBLFFBQUEsZ0JBQUEsWUFBQSxPQUFBO0VBQ0EsT0FBQSxPQUFBLE1BQUE7RUFDQTtFQUNBLE9BQUEsWUFBQSxZQUFBO0lBQ0E7OztFQUdBLFNBQUEsYUFBQTtJQUNBLGVBQUEsV0FBQSxXQUFBLFlBQUEsS0FBQSxVQUFBLFNBQUE7TUFDQSxJQUFBLE9BQUE7TUFDQSxRQUFBLFFBQUEsU0FBQSxVQUFBLFFBQUE7UUFDQSxPQUFBLE9BQUE7UUFDQTs7TUFFQSxPQUFBLFVBQUE7TUFDQSxPQUFBLFdBQUE7Ozs7OztBQ25CQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxxQkFBQTs7QUFFQSxTQUFBO0NBQ0EsUUFBQSxhQUFBLFFBQUEsZUFBQSxPQUFBOztFQUVBLGNBQUEsZ0JBQUE7SUFDQSxhQUFBOztFQUVBLE9BQUEsUUFBQTs7RUFFQSxPQUFBLGdCQUFBLFVBQUEsT0FBQTtJQUNBLE1BQUEsS0FBQSxxQkFBQSxNQUFBLE1BQUE7TUFDQSxTQUFBLFdBQUE7UUFDQTs7TUFFQSxPQUFBLFNBQUEsT0FBQTs7UUFFQSxXQUFBLE1BQUE7Ozs7O0VBS0EsU0FBQSxZQUFBLFNBQUE7SUFDQSxPQUFBLFlBQUEsTUFBQTtNQUNBLE9BQUE7TUFDQSxVQUFBOzs7O0VBSUEsU0FBQSxnQkFBQTtJQUNBLE9BQUEsWUFBQSxNQUFBO01BQ0EsT0FBQTtNQUNBLFVBQUE7T0FDQSxLQUFBLFVBQUEsS0FBQTtNQUNBLE9BQUEsR0FBQTs7Ozs7O0FDcENBLFFBQUEsT0FBQTs7R0FFQSxXQUFBLHFCQUFBOztBQUVBLFNBQUE7RUFDQSxRQUFBLFNBQUEsYUFBQSxRQUFBLGVBQUEsSUFBQSxRQUFBLFlBQUEsZ0JBQUE7RUFDQTs7RUFFQSxjQUFBLGdCQUFBO0lBQ0EsYUFBQTs7RUFFQSxPQUFBLGFBQUEsV0FBQTtFQUNBLE9BQUEsT0FBQSxNQUFBLEtBQUE7RUFDQSxPQUFBLFNBQUEsT0FBQTs7RUFFQSxPQUFBLGlCQUFBLFlBQUE7SUFDQSxvQkFBQTtNQUNBLFVBQUEsS0FBQTtRQUNBLE9BQUEsT0FBQSxPQUFBLEtBQUEsWUFBQTtVQUNBLGFBQUEsUUFBQSxLQUFBLFNBQUEsS0FBQTtZQUNBLE9BQUEsR0FBQTs7OztNQUlBLFVBQUEsT0FBQTtRQUNBLFdBQUE7Ozs7RUFJQSxTQUFBLHFCQUFBO0lBQ0EsSUFBQSxLQUFBLEdBQUE7SUFDQSxJQUFBLE1BQUEsT0FBQSxPQUFBOztJQUVBLEdBQUEsSUFBQSxTQUFBLEdBQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxPQUFBLEdBQUE7O0lBRUEsSUFBQSxRQUFBLElBQUEsTUFBQTtJQUNBLEdBQUEsTUFBQSxXQUFBLEdBQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxPQUFBLEdBQUE7O0lBRUEsR0FBQSxNQUFBLEdBQUEsU0FBQSxLQUFBLE1BQUEsR0FBQSxTQUFBLEdBQUE7TUFDQSxHQUFBLE9BQUE7TUFDQSxPQUFBLEdBQUE7O0lBRUEsR0FBQSxNQUFBLE1BQUEsS0FBQTtNQUNBLEdBQUEsT0FBQTtNQUNBLE9BQUEsR0FBQTs7SUFFQSxlQUFBLGVBQUEsT0FBQSxXQUFBLFlBQUEsS0FBQSxLQUFBLFVBQUEsU0FBQTtNQUNBLEdBQUEsUUFBQSxRQUFBO1FBQ0EsR0FBQSxPQUFBO2FBQ0E7UUFDQSxHQUFBLFFBQUE7OztJQUdBLE9BQUEsR0FBQTtHQUNBOztFQUVBLFNBQUEsWUFBQSxTQUFBO0lBQ0EsT0FBQSxZQUFBLE1BQUE7TUFDQSxPQUFBO01BQ0EsVUFBQTs7R0FFQTs7RUFFQSxTQUFBLGNBQUEsUUFBQTtJQUNBLE9BQUEsWUFBQSxNQUFBO01BQ0EsT0FBQSxxQkFBQSxPQUFBLFdBQUE7TUFDQSxVQUFBOztHQUVBO0NBQ0E7OztBQ3pFQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxhQUFBOztBQUVBLFNBQUEsVUFBQSxRQUFBLFFBQUEsT0FBQSxlQUFBO0VBQ0EsT0FBQSxPQUFBO0VBQ0EsTUFBQSxLQUFBO0VBQ0EsT0FBQSxZQUFBLFlBQUE7SUFDQSxNQUFBLEtBQUEsTUFBQSxPQUFBLEtBQUEsVUFBQSxPQUFBLEtBQUEsVUFBQTtNQUNBLFNBQUEsU0FBQSxNQUFBO1FBQ0EsY0FBQSxnQkFBQTtVQUNBLGFBQUE7OztRQUdBLE9BQUEsR0FBQTs7TUFFQSxPQUFBLFVBQUEsTUFBQSxPQUFBO1FBQ0EsT0FBQSxVQUFBLE1BQUE7Ozs7RUFJQSxPQUFBLE9BQUEsUUFBQSxTQUFBLFFBQUEsT0FBQTtJQUNBLE9BQUEsVUFBQTtLQUNBO0NBQ0E7OztBQ3hCQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxpQkFBQTs7QUFFQSxTQUFBO0VBQ0EsUUFBQSxRQUFBLGFBQUEsWUFBQSxPQUFBLGVBQUE7RUFDQTtFQUNBLE9BQUEsVUFBQTtFQUNBLE9BQUEsU0FBQSxPQUFBOztFQUVBLEdBQUEsT0FBQSxRQUFBO0lBQ0EsV0FBQSxXQUFBO0lBQ0EsY0FBQSxpQkFBQSxPQUFBLFFBQUEsTUFBQSxLQUFBLFVBQUEsU0FBQTtNQUNBLFFBQUEsSUFBQTtNQUNBLE9BQUEsVUFBQTtNQUNBLGNBQUEsaUJBQUEsT0FBQSxRQUFBLFlBQUEsS0FBQSxVQUFBLFVBQUE7UUFDQSxPQUFBLFdBQUE7UUFDQSxXQUFBLFdBQUE7Ozs7OztFQU1BLE9BQUEsZUFBQSxVQUFBLE9BQUE7SUFDQSxHQUFBLE1BQUEsT0FBQSxPQUFBLE9BQUEsT0FBQSxJQUFBO01BQ0E7O0lBRUEsR0FBQSxNQUFBLE1BQUEsT0FBQSxPQUFBLE9BQUEsSUFBQTtNQUNBLEdBQUEsTUFBQSxhQUFBO1FBQ0E7OztJQUdBLEdBQUEsT0FBQSxTQUFBLFFBQUE7TUFDQTtNQUNBOztJQUVBLEdBQUEsTUFBQSxXQUFBLGFBQUE7TUFDQTs7SUFFQSxPQUFBLEdBQUEsb0JBQUEsQ0FBQSxJQUFBLE1BQUE7OztFQUdBLFNBQUEsZUFBQTtJQUNBLFlBQUEsTUFBQTtNQUNBLE9BQUE7TUFDQSxVQUFBO09BQ0EsS0FBQSxZQUFBOzs7O0NBSUE7OztBQ2xEQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxtQkFBQTs7QUFFQSxTQUFBO0VBQ0EsUUFBQSxRQUFBLFlBQUEsYUFBQTtFQUNBLE9BQUEsZUFBQSxnQkFBQTtFQUNBOztFQUVBLE9BQUEsUUFBQTs7RUFFQSxPQUFBLFVBQUE7O0VBRUEsSUFBQSxZQUFBLElBQUEsTUFBQTtFQUNBLElBQUEsWUFBQTs7RUFFQSxPQUFBLGFBQUEsV0FBQTtJQUNBLElBQUEsVUFBQSxlQUFBO0lBQ0EsVUFBQSxPQUFBLFdBQUEsVUFBQSxPQUFBOztFQUVBLElBQUEsWUFBQSxTQUFBLFdBQUE7SUFDQSxPQUFBLFVBQUEsMkJBQUE7SUFDQSxZQUFBO0lBQ0EsT0FBQTs7RUFFQSxJQUFBLFNBQUEsU0FBQSxHQUFBO0lBQ0EsUUFBQSxJQUFBLGFBQUE7OztFQUdBLE9BQUEsZ0JBQUEsVUFBQSxNQUFBO0lBQ0EsR0FBQSxXQUFBO01BQ0EsWUFBQSxJQUFBLE1BQUEsS0FBQSxjQUFBLENBQUEsT0FBQTtXQUNBO01BQ0EsWUFBQTs7SUFFQSxPQUFBLE1BQUEsSUFBQSxlQUFBO0lBQ0EsT0FBQSxNQUFBLElBQUEsVUFBQTtJQUNBLE9BQUEsTUFBQSxPQUFBLEtBQUEsVUFBQSxPQUFBO01BQ0EsY0FBQSxnQkFBQTtRQUNBLGFBQUE7O01BRUEsWUFBQSxNQUFBO1FBQ0EsT0FBQTtRQUNBLFVBQUE7U0FDQSxLQUFBLFlBQUE7UUFDQSxPQUFBLEdBQUE7Ozs7Ozs7OztBQzdDQSxRQUFBLE9BQUE7O0dBRUEsV0FBQSxpQkFBQTs7QUFFQSxTQUFBO0VBQ0EsUUFBQSxRQUFBLFlBQUEsYUFBQSxlQUFBO0VBQ0EsT0FBQSxnQkFBQSxlQUFBLGVBQUEsZ0JBQUE7RUFDQTs7RUFFQSxJQUFBLFlBQUEsSUFBQSxNQUFBO0VBQ0EsSUFBQSxZQUFBOztFQUVBLE9BQUEsYUFBQSxXQUFBO0VBQ0EsT0FBQSxPQUFBLE1BQUE7RUFDQSxPQUFBLFVBQUE7O0VBRUEsY0FBQSxnQkFBQTtJQUNBLGFBQUE7OztFQUdBLE9BQUEsSUFBQSxvQkFBQSxTQUFBLE9BQUE7SUFDQSxlQUFBLFVBQUEsT0FBQSxZQUFBLE9BQUEsS0FBQSxXQUFBLEtBQUEsVUFBQSxTQUFBO01BQ0EsT0FBQSxTQUFBLFFBQUE7TUFDQSxjQUFBLGVBQUEsT0FBQSxRQUFBLEtBQUEsVUFBQSxTQUFBO1FBQ0EsT0FBQSxRQUFBLFFBQUE7UUFDQSxHQUFBLE9BQUEsTUFBQSxJQUFBLGNBQUEsYUFBQTtVQUNBLE9BQUEsT0FBQSxJQUFBLFVBQUE7VUFDQSxPQUFBLE9BQUEsT0FBQSxLQUFBLFlBQUE7WUFDQSxPQUFBLEdBQUE7OztRQUdBOzs7OztFQUtBLE9BQUEsSUFBQSxvQkFBQSxTQUFBLE9BQUE7SUFDQSxZQUFBO0lBQ0EsV0FBQTs7O0VBR0EsT0FBQSxhQUFBLFdBQUE7SUFDQSxHQUFBLGVBQUEsUUFBQTtNQUNBLElBQUEsVUFBQSxlQUFBO01BQ0EsVUFBQSxPQUFBLFdBQUEsVUFBQSxPQUFBOzs7RUFHQSxJQUFBLFlBQUEsU0FBQSxXQUFBO0lBQ0EsT0FBQSxVQUFBLDJCQUFBO0lBQ0EsWUFBQTtJQUNBLE9BQUE7O0VBRUEsSUFBQSxTQUFBLFNBQUEsR0FBQTtJQUNBLFFBQUEsSUFBQSxhQUFBOzs7RUFHQSxPQUFBLFlBQUEsV0FBQTtJQUNBLFNBQUE7OztFQUdBLE9BQUEsU0FBQSxVQUFBLFFBQUE7SUFDQSxjQUFBLGVBQUEsT0FBQSxRQUFBLEtBQUEsVUFBQSxTQUFBO01BQ0EsSUFBQSxXQUFBO01BQ0EsT0FBQSxRQUFBLFFBQUE7TUFDQSxHQUFBLE9BQUEsTUFBQSxJQUFBLGNBQUEsVUFBQTtRQUNBLFFBQUE7VUFDQSxLQUFBO1lBQ0EsV0FBQSxLQUFBLFNBQUEsS0FBQTtjQUNBLFFBQUEsSUFBQTtjQUNBLEdBQUEsS0FBQTtnQkFDQSxHQUFBLFdBQUE7a0JBQ0EsWUFBQSxJQUFBLE1BQUEsS0FBQSxjQUFBLENBQUEsT0FBQTtrQkFDQSxPQUFBLE1BQUEsSUFBQSxZQUFBOztnQkFFQSxPQUFBLE1BQUEsSUFBQSxVQUFBLE9BQUE7Z0JBQ0EsT0FBQSxNQUFBLElBQUEsU0FBQSxPQUFBLFNBQUE7Z0JBQ0EsV0FBQSxPQUFBLFNBQUE7Z0JBQ0EsWUFBQTs7O1lBR0E7VUFDQSxLQUFBO1lBQ0EsWUFBQSxLQUFBLFNBQUEsS0FBQTtjQUNBLFFBQUEsSUFBQTtjQUNBLEdBQUEsS0FBQTtnQkFDQSxPQUFBLE1BQUEsSUFBQSxVQUFBLE9BQUEsU0FBQTtnQkFDQSxPQUFBLE1BQUEsSUFBQSxTQUFBLE9BQUE7Z0JBQ0EsV0FBQSxPQUFBLFNBQUE7Z0JBQ0EsWUFBQTs7O1lBR0E7Ozs7OztFQU1BLFNBQUEsWUFBQTtJQUNBLE9BQUEsVUFBQTtJQUNBLE9BQUEsZUFBQTs7SUFFQSxPQUFBLFlBQUE7TUFDQTtRQUNBLGFBQUE7UUFDQSxPQUFBO1FBQ0EsT0FBQTtRQUNBLFNBQUE7VUFDQSxFQUFBLE1BQUE7VUFDQSxFQUFBLE1BQUE7WUFDQSxNQUFBO1lBQ0EsT0FBQSxTQUFBLEdBQUE7Y0FDQSxJQUFBLENBQUEsT0FBQSxTQUFBO2dCQUNBLE9BQUEsZUFBQTtnQkFDQSxFQUFBO3FCQUNBO2dCQUNBLE9BQUE7Ozs7Ozs7O0VBUUEsU0FBQSxZQUFBO0lBQ0EsT0FBQSxZQUFBO01BQ0E7UUFDQSxhQUFBO1FBQ0EsT0FBQTtRQUNBLE9BQUE7UUFDQSxTQUFBO1VBQ0EsRUFBQSxNQUFBO1VBQ0EsRUFBQSxNQUFBO1lBQ0EsTUFBQTtZQUNBLE9BQUEsU0FBQSxHQUFBO2NBQ0EsT0FBQTs7Ozs7OztFQU9BLFNBQUEsU0FBQSxTQUFBO0lBQ0EsY0FBQSxTQUFBLE9BQUEsTUFBQSxJQUFBLEtBQUEsVUFBQSxPQUFBO01BQ0EsT0FBQSxRQUFBO01BQ0EsUUFBQSxJQUFBLFVBQUEsT0FBQSxNQUFBLElBQUE7TUFDQSxRQUFBLElBQUE7TUFDQSxRQUFBLElBQUEsT0FBQSxNQUFBLElBQUE7TUFDQSxHQUFBLFNBQUE7UUFDQSxPQUFBLFdBQUE7Ozs7O0VBS0EsU0FBQSxZQUFBLFVBQUE7SUFDQSxXQUFBLFdBQUE7SUFDQSxPQUFBLE1BQUEsSUFBQSxVQUFBO0lBQ0EsT0FBQSxNQUFBLE9BQUEsS0FBQSxVQUFBLE9BQUE7TUFDQSxPQUFBLFFBQUE7TUFDQSxTQUFBLFlBQUE7UUFDQSxNQUFBLE1BQUEsSUFBQSxnQkFBQSxDQUFBLE9BQUEsT0FBQSxNQUFBLElBQUEsVUFBQTtXQUNBLEtBQUEsWUFBQTtZQUNBLE9BQUEsTUFBQSxPQUFBLFFBQUEsS0FBQSxVQUFBLFFBQUE7Y0FDQSxRQUFBLElBQUE7Y0FDQSxPQUFBLE1BQUEsU0FBQTs7WUFFQSxXQUFBLFdBQUE7YUFDQSxTQUFBLEtBQUE7VUFDQSxNQUFBLElBQUE7VUFDQSxXQUFBLFdBQUE7O1NBRUE7Ozs7RUFJQSxTQUFBLGtCQUFBO0lBQ0EsT0FBQSxXQUFBO01BQ0EsTUFBQTtNQUNBLFdBQUE7O0lBRUEsR0FBQSxPQUFBLE9BQUEsV0FBQSxXQUFBO01BQ0EsT0FBQSxTQUFBLE9BQUEsT0FBQSxNQUFBO01BQ0EsT0FBQSxTQUFBLFdBQUEsT0FBQSxNQUFBO01BQ0EsT0FBQSxTQUFBLFlB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O0lBQ0EsSUFBQSxRQUFBLElBQUEsTUFBQSxNQUFBLE9BQUE7SUFDQSxNQUFBLFFBQUEsY0FBQTtJQUNBLE1BQUEsV0FBQSxRQUFBO0lBQ0EsTUFBQSxRQUFBLFVBQUE7SUFDQSxPQUFBLE1BQUE7OztFQUdBLFNBQUEsV0FBQSxTQUFBO0lBQ0EsSUFBQSxRQUFBLElBQUEsTUFBQSxNQUFBLE9BQUE7SUFDQSxNQUFBLFFBQUEsY0FBQTtJQUNBLE1BQUEsV0FBQSxVQUFBO0lBQ0EsT0FBQSxNQUFBOzs7RUFHQSxTQUFBLGVBQUEsU0FBQSxXQUFBO0lBQ0EsSUFBQSxRQUFBLElBQUEsTUFBQSxNQUFBLE9BQUE7SUFDQSxNQUFBLFFBQUEsY0FBQTtJQUNBLE1BQUEsUUFBQSxhQUFBO0lBQ0EsT0FBQSxNQUFBOzs7RUFHQSxTQUFBLFVBQUEsU0FBQSxNQUFBO0lBQ0EsSUFBQSxRQUFBLElBQUEsTUFBQSxNQUFBLE9BQUE7SUFDQSxNQUFBLFFBQUEsY0FBQTtJQUNBLE1BQUEsUUFBQSxRQUFBO0lBQ0EsTUFBQSxNQUFBO0lBQ0EsT0FBQSxNQUFBOzs7RUFHQSxTQUFBLGVBQUEsU0FBQSxNQUFBLFVBQUE7SUFDQSxJQUFBLFNBQUEsSUFBQSxPQUFBO0lBQ0EsT0FBQSxJQUFBLGNBQUE7SUFDQSxPQUFBLElBQUEsUUFBQTtJQUNBLE9BQUEsSUFBQTtJQUNBLE9BQUEsSUFBQSxRQUFBO0lBQ0EsT0FBQSxJQUFBLFVBQUE7SUFDQSxPQUFBLElBQUEsVUFBQTtJQUNBLE9BQUEsT0FBQTs7OztBQUlBLFNBQUEsT0FBQSxPQUFBO0VBQ0EsSUFBQSxRQUFBLE1BQUEsT0FBQSxPQUFBO0VBQ0EsSUFBQSxhQUFBLENBQUEsY0FBQSxRQUFBLGFBQUEsWUFBQSxZQUFBO0lBQ0EsUUFBQSxVQUFBLFVBQUEsZUFBQSxRQUFBLFVBQUEsT0FBQSxVQUFBLGFBQUE7RUFDQSxNQUFBLGlCQUFBLE9BQUE7O0VBRUEsT0FBQTtJQUNBLE9BQUE7Ozs7QUN2RUEsUUFBQSxPQUFBOztHQUVBLFFBQUEsb0JBQUE7O0FBRUEsU0FBQSxrQkFBQSxPQUFBLHFCQUFBLElBQUE7O0VBRUEsSUFBQSxXQUFBLENBQUEsUUFBQSxJQUFBLE1BQUE7RUFDQSxPQUFBO0lBQ0EsVUFBQTtJQUNBLGFBQUE7SUFDQSxhQUFBOzs7RUFHQSxTQUFBLGFBQUEsUUFBQTtJQUNBLFNBQUEsU0FBQSxJQUFBLE1BQUEsU0FBQSxDQUFBLFVBQUEsT0FBQSxVQUFBLFdBQUEsT0FBQTs7O0VBR0EsU0FBQSxlQUFBO0lBQ0EsSUFBQSxLQUFBLEdBQUE7SUFDQSxJQUFBLGFBQUEsQ0FBQSxvQkFBQTtJQUNBO09BQ0EsbUJBQUE7T0FDQSxLQUFBLFVBQUEsVUFBQTtRQUNBLEdBQUEsUUFBQSxTQUFBO1NBQ0EsU0FBQSxLQUFBO1FBQ0EsUUFBQSxJQUFBO1FBQ0EsR0FBQSxPQUFBOztJQUVBLE9BQUEsR0FBQTs7OztBQzVCQSxRQUFBLE9BQUE7O0dBRUEsUUFBQSxpQkFBQTtHQUNBLFFBQUEsU0FBQTs7QUFFQSxTQUFBLGNBQUEsT0FBQSxPQUFBLElBQUE7RUFDQSxJQUFBLE9BQUEsTUFBQTtFQUNBLE9BQUE7SUFDQSxtQkFBQTtJQUNBLGlCQUFBO0lBQ0Esb0JBQUE7SUFDQSxnQkFBQTtJQUNBLFVBQUE7SUFDQSxrQkFBQTs7O0VBR0EsU0FBQSxpQkFBQSxRQUFBLFFBQUE7SUFDQSxJQUFBLFVBQUEsSUFBQSxNQUFBLE1BQUEsTUFBQTtJQUNBLFFBQUEsUUFBQSxXQUFBO0lBQ0EsSUFBQSxVQUFBLElBQUEsTUFBQSxNQUFBLE1BQUE7SUFDQSxRQUFBLFFBQUEsV0FBQTtJQUNBLElBQUEsWUFBQSxNQUFBLE1BQUEsR0FBQSxTQUFBO0lBQ0EsVUFBQSxXQUFBO0lBQ0EsVUFBQSxNQUFBO0lBQ0EsR0FBQSxRQUFBO01BQ0EsVUFBQSxRQUFBLFVBQUE7O0lBRUEsT0FBQSxVQUFBOzs7RUFHQSxTQUFBLGVBQUEsUUFBQTtJQUNBLElBQUEsT0FBQSxPQUFBLElBQUE7SUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsUUFBQTtJQUNBLE1BQUEsUUFBQTtJQUNBLE1BQUEsV0FBQTtJQUNBLE1BQUEsTUFBQTtJQUNBLEdBQUEsU0FBQSxXQUFBO01BQ0EsTUFBQSxRQUFBLFdBQUE7V0FDQTtNQUNBLE1BQUEsUUFBQSxXQUFBOztJQUVBLE9BQUEsTUFBQTs7O0VBR0EsU0FBQSxtQkFBQSxRQUFBO0lBQ0EsSUFBQSxPQUFBLE9BQUEsSUFBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsUUFBQSxVQUFBO0lBQ0EsTUFBQSxXQUFBO0lBQ0EsR0FBQSxTQUFBLFdBQUE7TUFDQSxNQUFBLFFBQUEsV0FBQTtXQUNBO01BQ0EsTUFBQSxRQUFBLFdBQUE7O0lBRUEsTUFBQSxRQUFBLFlBQUE7SUFDQSxNQUFBLFFBQUEsWUFBQTtJQUNBLE1BQUEsTUFBQTs7SUFFQSxPQUFBLE1BQUE7O0VBRUEsU0FBQSxxQkFBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsUUFBQSxVQUFBO0lBQ0EsTUFBQSxXQUFBO0lBQ0EsT0FBQSxNQUFBOztFQUVBLFNBQUEsZ0JBQUEsUUFBQTtJQUNBLElBQUEsT0FBQSxPQUFBLElBQUE7SUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUEsTUFBQTtJQUNBLE1BQUEsV0FBQTtJQUNBLE1BQUEsTUFBQTtJQUNBLEdBQUEsU0FBQSxXQUFBO01BQ0EsTUFBQSxRQUFBLFdBQUE7V0FDQTtNQUNBLE1BQUEsUUFBQSxXQUFBOztJQUVBLE1BQUEsUUFBQSxVQUFBO0lBQ0EsTUFBQSxNQUFBO0lBQ0EsT0FBQSxNQUFBOztFQUVBLFNBQUEsU0FBQSxJQUFBO0lBQ0EsSUFBQSxRQUFBLElBQUEsTUFBQTtJQUNBLE1BQUEsS0FBQTtJQUNBLE9BQUEsTUFBQTs7OztBQUlBLFNBQUEsTUFBQSxPQUFBO0VBQ0EsSUFBQSxRQUFBLE1BQUEsT0FBQSxPQUFBO0VBQ0EsSUFBQSxhQUFBO0lBQ0EsY0FBQSxXQUFBLFdBQUEsU0FBQSxTQUFBLGFBQUEsYUFBQSxjQUFBLGNBQUEsVUFBQSxVQUFBO0lBQ0EsWUFBQSxnQkFBQSxlQUFBLGNBQUEsU0FBQTs7RUFFQSxNQUFBLGlCQUFBLE9BQUE7O0VBRUEsT0FBQTtJQUNBLE9BQUE7Ozs7QUNqR0EsUUFBQSxPQUFBOztHQUVBLFFBQUEsa0JBQUE7O0FBRUEsU0FBQSxnQkFBQSxTQUFBOztFQUVBLElBQUEsU0FBQTtJQUNBLFNBQUE7SUFDQSxhQUFBO0lBQ0EsY0FBQTtJQUNBLFdBQUE7SUFDQSxZQUFBOztFQUVBLEdBQUEsUUFBQSxRQUFBO0lBQ0EsT0FBQSxrQkFBQSxPQUFBLGdCQUFBO0lBQ0EsT0FBQSxlQUFBLE9BQUEsYUFBQTs7O0VBR0EsT0FBQTtJQUNBLFFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDbkJBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLGlCQUFBOztBQUVBLFNBQUEsZ0JBQUE7RUFDQSxJQUFBLFdBQUE7SUFDQSxNQUFBLENBQUEsaUJBQUEsd0JBQUE7TUFDQSxZQUFBLGdCQUFBLDJCQUFBLFVBQUE7TUFDQSxjQUFBLGtCQUFBLG1CQUFBLG1CQUFBO01BQ0EsaUJBQUEscUJBQUEsZ0JBQUEsZ0JBQUE7TUFDQSxxQkFBQSxpQkFBQSw2QkFBQTtNQUNBLGlCQUFBLGNBQUEsd0JBQUEsbUJBQUE7TUFDQSxpQkFBQSxpQkFBQSxpQkFBQSxzQkFBQTtNQUNBLHlCQUFBLG9CQUFBLDBCQUFBO01BQ0E7OztFQUdBLElBQUEsU0FBQTtJQUNBLENBQUEsTUFBQSxRQUFBLFNBQUE7SUFDQSxDQUFBLE1BQUEsVUFBQSxTQUFBO0lBQ0EsQ0FBQSxNQUFBLFdBQUEsU0FBQTtJQUNBLENBQUEsTUFBQSxXQUFBLFNBQUE7SUFDQSxDQUFBLE1BQUEsU0FBQSxTQUFBO0lBQ0EsQ0FBQSxNQUFBLFdBQUEsU0FBQTtJQUNBLENBQUEsTUFBQSxVQUFBLFNBQUE7SUFDQSxDQUFBLE1BQUEsVUFBQSxTQUFBO0lBQ0EsQ0FBQSxNQUFBLFNBQUEsU0FBQTs7RUFFQSxPQUFBO0lBQ0EsVUFBQTtJQUNBLFFBQUE7Ozs7O0FDN0JBLFFBQUEsT0FBQTs7R0FFQSxRQUFBLHNCQUFBO0dBQ0EsUUFBQSxjQUFBO0dBQ0EsUUFBQSxXQUFBOztBQUVBLFNBQUEsbUJBQUEsT0FBQSxJQUFBLFlBQUEsU0FBQSxRQUFBO0VBQ0EsT0FBQTtJQUNBLGVBQUE7SUFDQSxrQkFBQTtJQUNBLFdBQUE7SUFDQSxnQkFBQTs7RUFFQSxTQUFBLGVBQUEsU0FBQSxZQUFBO0lBQ0EsSUFBQSxTQUFBLElBQUEsT0FBQSxNQUFBO0lBQ0EsT0FBQSxJQUFBLGNBQUE7SUFDQSxPQUFBLElBQUEsUUFBQSxNQUFBLEtBQUE7SUFDQSxPQUFBLElBQUEsWUFBQSxNQUFBLEtBQUEsVUFBQTtJQUNBLE9BQUEsSUFBQSxPQUFBO0lBQ0EsT0FBQSxJQUFBLFFBQUE7SUFDQSxPQUFBLElBQUEsVUFBQTtJQUNBLE9BQUEsSUFBQSxVQUFBO0lBQ0EsT0FBQSxPQUFBOztFQUVBLFNBQUEsZ0JBQUE7SUFDQSxJQUFBLFFBQUEsSUFBQSxNQUFBLE1BQUEsUUFBQTtJQUNBLE1BQUEsUUFBQSxRQUFBO0lBQ0EsTUFBQSxRQUFBO0lBQ0EsT0FBQSxNQUFBOztFQUVBLFNBQUEsb0JBQUE7SUFDQSxJQUFBLFFBQUEsR0FBQTtJQUNBLElBQUEsYUFBQSxJQUFBLFdBQUE7SUFDQSxXQUFBLElBQUEsUUFBQTtJQUNBLFdBQUEsSUFBQSxVQUFBO0lBQ0EsV0FBQSxJQUFBLFFBQUE7SUFDQSxXQUFBLE9BQUEsS0FBQSxVQUFBLFNBQUE7TUFDQSxJQUFBLFVBQUEsSUFBQSxRQUFBO01BQ0EsUUFBQSxJQUFBLGNBQUE7TUFDQSxRQUFBLElBQUEsUUFBQTtNQUNBLFFBQUEsSUFBQSxlQUFBO01BQ0EsUUFBQSxJQUFBLGNBQUE7TUFDQSxRQUFBLE9BQUEsS0FBQSxVQUFBLFNBQUE7UUFDQSxNQUFBLFFBQUE7OztJQUdBLE9BQUEsTUFBQTs7RUFFQSxTQUFBLFdBQUEsU0FBQTtJQUNBLElBQUEsUUFBQSxJQUFBLE1BQUEsTUFBQSxPQUFBO0lBQ0EsTUFBQSxRQUFBLGNBQUE7SUFDQSxNQUFBLFFBQUE7SUFDQSxPQUFBLE1BQUE7Ozs7QUFJQSxTQUFBLFdBQUEsT0FBQTtFQUNBLElBQUEsUUFBQSxNQUFBLE9BQUEsT0FBQTtFQUNBLElBQUEsYUFBQSxDQUFBLFFBQUEsUUFBQSxVQUFBLFlBQUEsa0JBQUE7RUFDQSxNQUFBLGlCQUFBLE9BQUE7O0VBRUEsT0FBQTtJQUNBLE9BQUE7OztBQUdBLFNBQUEsUUFBQSxPQUFBO0VBQ0EsSUFBQSxRQUFBLE1BQUEsT0FBQSxPQUFBO0VBQ0EsSUFBQSxhQUFBLENBQUEsY0FBQSxRQUFBLGNBQUE7RUFDQSxNQUFBLGlCQUFBLE9BQUE7O0VBRUEsT0FBQTtJQUNBLE9BQUE7OztBQUdBIiwiZmlsZSI6ImFwcC5qcyIsInNvdXJjZXNDb250ZW50IjpbImFuZ3VsYXIubW9kdWxlKCdPTk9HLmNvbmZpZycsIFtdKVxuICAuY29uZmlnKGNvbmZpZyk7XG5cbmZ1bmN0aW9uIGNvbmZpZyAoJGlvbmljQ29uZmlnUHJvdmlkZXIsICRjb21waWxlUHJvdmlkZXIsIFBhcnNlUHJvdmlkZXIpIHtcblxuICAkY29tcGlsZVByb3ZpZGVyLmltZ1NyY1Nhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxmaWxlfGJsb2J8Y29udGVudHxtcy1hcHB4fHgtd21hcHAwKTp8ZGF0YTppbWFnZVxcL3xpbWdcXC8vKTtcbiAgJGNvbXBpbGVQcm92aWRlci5hSHJlZlNhbml0aXphdGlvbldoaXRlbGlzdCgvXlxccyooaHR0cHM/fGZ0cHxtYWlsdG98ZmlsZXxnaHR0cHM/fG1zLWFwcHh8eC13bWFwcDApOi8pO1xuXG4gIFBhcnNlUHJvdmlkZXIuaW5pdGlhbGl6ZSgnbllzQjZ0bUJNWUtZTXpNNWlWOUJVY0J2SFdYODlJdFBYNUdmYk42UScsICd6cmluOEdFQkRWR2JrbDFpb0dFd25IdVA3MEZkRzZIaHpUUzh1R2p6Jyk7XG5cbiAgaWYgKGlvbmljLlBsYXRmb3JtLmlzSU9TKCkpIHtcbiAgICAkaW9uaWNDb25maWdQcm92aWRlci5zY3JvbGxpbmcuanNTY3JvbGxpbmcodHJ1ZSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJywgW10pO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycsIFtcbiAgJ2lvbmljJyxcbiAgJ25nUGFyc2UnLFxuICAndGltZXInLFxuICAnbmdDb3Jkb3ZhJyxcbiAgJ25nQW5pbWF0ZScsXG4gICdPTk9HLmNvbmZpZycsXG4gICdPTk9HLnJvdXRlcycsXG4gICdPTk9HLkNvbnRyb2xsZXJzJyxcbiAgJ09OT0cuU2VydmljZXMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcycsIFtcbiAgJ09OT0cucm91dGVzLm1hdGNoZXMnLFxuICAnT05PRy5yb3V0ZXMubGFkZGVyJyxcbiAgJ09OT0cucm91dGVzLmFkbWluJ1xuXSlcbiAgLmNvbmZpZyhyb3V0ZXMpO1xuXG5mdW5jdGlvbiByb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdhcHAvbG9hZGluZycpO1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICB1cmw6ICcvYXBwJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWVudS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNZW51Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsICRxLCBQYXJzZSwgJHN0YXRlKSB7XG4gICAgICAgICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBUb3VybmFtZW50U2VydmljZXMuZ2V0VG91cm5hbWVudCgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuYW1lbnRzKSB7XG4gICAgICAgICAgICBpZih0b3VybmFtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY2IucmVzb2x2ZSh0b3VybmFtZW50c1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlvbmljLlBsYXRmb3JtLmV4aXRBcHAoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubG9hZGluZycsIHtcbiAgICAgIHVybDogJy9sb2FkaW5nJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2FkaW5nLmh0bWwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmRhc2hib2FyZCcsIHtcbiAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2Rhc2hib2FyZC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubG9naW4nLCB7XG4gICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xvZ2luLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLnJlZ2lzdGVyJywge1xuICAgICAgdXJsOiAnL3JlZ2lzdGVyJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9yZWdpc3Rlci5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5yZXNldCcsIHtcbiAgICAgIHVybDogJy9wYXNzd29yZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcGFzc3dvcmQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1Jlc2V0UGFzc3dvcmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25zdGFudCgnbW9tZW50JywgbW9tZW50KVxuICAucnVuKHJ1bik7XG5cbmZ1bmN0aW9uIHJ1biAoXG4gICRpb25pY1BsYXRmb3JtLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY0xvYWRpbmcsICRpb25pY1BvcHVwLFxuICBsb2NhdGlvblNlcnZpY2VzLCAkaW9uaWNIaXN0b3J5LCAkY29yZG92YU5ldHdvcmssICR3aW5kb3dcbikge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG5cbiAgICAvLyBsaXN0ZW4gZm9yIE9ubGluZSBldmVudFxuICAgICRyb290U2NvcGUuJG9uKCckY29yZG92YU5ldHdvcms6b25saW5lJywgZnVuY3Rpb24oZXZlbnQsIG5ldHdvcmtTdGF0ZSl7XG4gICAgICB2YXIgb25saW5lU3RhdGUgPSBuZXR3b3JrU3RhdGU7XG4gICAgfSk7XG5cbiAgICAvLyBsaXN0ZW4gZm9yIE9mZmxpbmUgZXZlbnRcbiAgICAkcm9vdFNjb3BlLiRvbignJGNvcmRvdmFOZXR3b3JrOm9mZmxpbmUnLCBmdW5jdGlvbihldmVudCwgbmV0d29ya1N0YXRlKXtcbiAgICAgIHZhciBvZmZsaW5lU3RhdGUgPSBuZXR3b3JrU3RhdGU7XG4gICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgdGl0bGU6ICdJbnRlcm5ldCBEaXNjb25uZWN0ZWQnLFxuICAgICAgICAgIGNvbnRlbnQ6ICdUaGUgaW50ZXJuZXQgaXMgZGlzY29ubmVjdGVkIG9uIHlvdXIgZGV2aWNlLidcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaW9uaWMuUGxhdGZvcm0uZXhpdEFwcCgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuXG4gICAgJHJvb3RTY29wZS4kb24oJ3Nob3c6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5zaG93KHt0ZW1wbGF0ZTogJzxpb24tc3Bpbm5lciBpY29uPVwic3BpcmFsXCIgY2xhc3M9XCJzcGlubmVyLWNhbG1cIj48L2lvbi1zcGlubmVyPicsIHNob3dCYWNrZHJvcDogdHJ1ZSwgYW5pbWF0aW9uOiAnZmFkZS1pbid9KTtcbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuJG9uKCdoaWRlOmxvYWRpbmcnLCBmdW5jdGlvbigpIHtcbiAgICAgICRpb25pY0xvYWRpbmcuaGlkZSgpO1xuICAgIH0pO1xuXG4gICAgJGlvbmljUGxhdGZvcm0ub24oJ3Jlc3VtZScsIGZ1bmN0aW9uKCl7XG4gICAgICAvL3JvY2sgb25cbiAgICAgIC8vJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJywge3JlbG9hZDogdHJ1ZX0pO1xuICAgIH0pO1xuXG5cbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICBjb25zb2xlLmxvZygnbmV3IHZlcnNpb24gMScpO1xuICAgICAgUGFyc2VQdXNoUGx1Z2luLm9uKCdyZWNlaXZlUE4nLCBmdW5jdGlvbihwbil7XG4gICAgICAgIGNvbnNvbGUubG9nKHBuKTtcbiAgICAgICAgaWYoIXBuLnRpdGxlKSB7XG4gICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgdGl0bGU6ICdBbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj4nKyBwbi5hbGVydCArICc8L2Rpdj4nXG4gICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcblxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN3aXRjaCAocG4udGl0bGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ09wcG9uZW50IEZvdW5kJzpcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ09wcG9uZW50IENvbmZpcm1lZCc6XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcsIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdSZXN1bHRzIEVudGVyZWQnOlxuICAgICAgICAgICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdNYXRjaCBQbGF5ZWQnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+UmVzdWx0cyBoYXZlIGJlZW4gc3VibWl0dGVkPC9kaXY+J1xuICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcsIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSAnIy9hcHAvbG9hZGluZycpIHtcbiAgICAgIGxvY2F0aW9uU2VydmljZXMuZ2V0TG9jYXRpb24oKS50aGVuKGZ1bmN0aW9uIChsb2NhdGlvbikge1xuICAgICAgICBsb2NhdGlvblNlcnZpY2VzLnNldExvY2F0aW9uKGxvY2F0aW9uKTtcbiAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgaWYobmF2aWdhdG9yICYmIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4pIHtcbiAgICAgICAgICBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycsIFtdKTtcblxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluTWF0Y2hlc0N0cmwnLCBBZG1pbk1hdGNoZXNDdHJsKTtcblxuZnVuY3Rpb24gQWRtaW5NYXRjaGVzQ3RybCgkc2NvcGUsIFBhcnNlLCBNYXRjaFNlcnZpY2VzKSB7XG4gIFxuICBNYXRjaFNlcnZpY2VzLmdldFJlcG9ydGVkTWF0Y2hlcygpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAkc2NvcGUubWF0Y2hlcyA9IG1hdGNoZXM7XG4gIH0pO1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblBsYXllcnNDdHJsJywgQWRtaW5QbGF5ZXJzQ3RybCk7XG5cbmZ1bmN0aW9uIEFkbWluUGxheWVyc0N0cmwoJHNjb3BlLCBQYXJzZSwgTGFkZGVyU2VydmljZXMpIHtcbiAgJHNjb3BlLnNlYXJjaCA9IHtcbiAgICBpbnB1dDogbnVsbFxuICB9XG4gIFxuICAkc2NvcGUuc2VhcmNoUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIExhZGRlclNlcnZpY2VzLnNlYXJjaFBsYXllcnMoJHNjb3BlLnNlYXJjaC5pbnB1dCkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICAgIH0pO1xuICB9XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluU2V0dGluZ3NDdHJsJywgQWRtaW5TZXR0aW5nc0N0cmwpO1xuXG5mdW5jdGlvbiBBZG1pblNldHRpbmdzQ3RybCgkc2NvcGUsIGxvY2F0aW9uU2VydmljZXMsIG5ld1RvdXJuYW1lbnQsIHRvdXJuYW1lbnQpIHtcbiAgJHNjb3BlLmRldGFpbHMgPSBuZXdUb3VybmFtZW50O1xuICBcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50LnRvdXJuYW1lbnQ7XG4gIFxuICAkc2NvcGUuc2V0VG91cm5hbWVudExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIGxvY2F0aW9uU2VydmljZXMuZ2V0TG9jYXRpb24oKS50aGVuKGZ1bmN0aW9uIChsb2NhdGlvbikge1xuICAgICAgdmFyIHBvaW50ID0gbmV3IFBhcnNlLkdlb1BvaW50KHtsYXRpdHVkZTogbG9jYXRpb24ubGF0aXR1ZGUsIGxvbmdpdHVkZTogbG9jYXRpb24ubG9uZ2l0dWRlfSk7XG4gICAgICAkc2NvcGUudG91cm5hbWVudC5zZXQoXCJsb2NhdGlvblwiLCBwb2ludCk7XG4gICAgICAkc2NvcGUudG91cm5hbWVudC5zYXZlKCkudGhlbihmdW5jdGlvbiAodG91cm5hbWVudCkge1xuICAgICAgICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQ7XG4gICAgICAgIGFsZXJ0KCd0b3Vybm1hbmV0IGxvY2F0aW9uIHNldCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignRGFzaGJvYXJkQ3RybCcsIERhc2hib2FyZEN0cmwpO1xuXG5mdW5jdGlvbiBEYXNoYm9hcmRDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGZpbHRlciwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJGlvbmljUG9wdXAsICRyb290U2NvcGUsIG1vbWVudCxcbiAgUGFyc2UsIHRvdXJuYW1lbnQsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMsIExhZGRlclNlcnZpY2VzLCBsb2NhdGlvblNlcnZpY2VzXG4pIHtcbiAgdmFyIHByb21pc2UgPSBudWxsO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuXG4gICRzY29wZS5lbmQgPSB7XG4gICAgY2FuUGxheTogdHJ1ZSxcbiAgICB0aW1lOiBwYXJzZUZsb2F0KG1vbWVudCgpLmZvcm1hdCgneCcpKVxuICB9O1xuXG4gICRzY29wZS5sb2NhdGlvbiA9IGxvY2F0aW9uU2VydmljZXMubG9jYXRpb247XG4gICRzY29wZS5vcHBvbmVudCA9IFF1ZXVlU2VydmljZXMub3Bwb25lbnQ7XG4gICRzY29wZS5oZXJvTGlzdCA9IFF1ZXVlU2VydmljZXMuaGVyb2VzO1xuICAkc2NvcGUubXlPcHBvbmVudCA9IHtuYW1lOidQQVggQXR0ZW5kZWUnfTtcblxuICAkc2NvcGUuJG9uKCckaW9uaWNWaWV3LmVudGVyJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZihuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuICAgICAgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbi5oaWRlKCk7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcigkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICBpZihwbGF5ZXJzLmxlbmd0aCkge1xuICAgICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyc1swXTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ2xvY2F0aW9uJywgJHNjb3BlLmxvY2F0aW9uLmNvb3Jkcyk7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICAgICAgICB0aW1lcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0Tm90aWZpY2F0aW9ucygpO1xuICAgICAgICAgICAgc3RhdHVzKCk7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICRzdGF0ZS5yZWxvYWQoJ2FwcC5kYXNoYm9hcmQnKTtcbiAgfTtcbiAgJHNjb3BlLnN0YXJ0UXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoJHNjb3BlLmVuZC5jYW5QbGF5KSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICBzYXZlUGxheWVyKCk7XG4gICAgfVxuICB9O1xuICAkc2NvcGUuY2FuY2VsUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBzYXZlUGxheWVyKCk7XG4gIH07XG5cbiAgJHNjb3BlLnBsYXllckNvbmZpcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgJHNjb3BlLm1hdGNoLmZldGNoKCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgc3dpdGNoICgkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSkge1xuICAgICAgICBjYXNlICdwZW5kaW5nJzogXG4gICAgICAgICAgY29uZmlybVBsYXllcigpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICAgIHNob3dDYW5jZWxsZWRNYXRjaCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICBcbiAgJHNjb3BlLnN0b3AgPSBmdW5jdGlvbigpIHtcbiAgICAkaW50ZXJ2YWwuY2FuY2VsKHByb21pc2UpO1xuICB9O1xuICBcbiAgJHNjb3BlLnNob3dPcHBvbmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgIHByb21pc2UgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge2NoYW5nZVdvcmQoKTt9LCAyMDAwKTtcbiAgfTtcblxuICAkc2NvcGUuc2V0VG9PcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9XG5cbiAgJHNjb3BlLmZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAgICR0aW1lb3V0KHRpbWVyLCAxNTAwKTtcbiAgfVxuICBcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICB9KTtcbiAgXG4gICRzY29wZS4kb24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NvbnRyb2xsZXIgZGVzdHJveWVkJyk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNldE5vdGlmaWNhdGlvbnMoKSB7XG4gICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgUGFyc2VQdXNoUGx1Z2luLnN1YnNjcmliZSgkc2NvcGUucGxheWVyLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3N1YmJlZCB0byAnICsgJHNjb3BlLnBsYXllci51c2VybmFtZSk7XG4gICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIHVzZXJHZW9Qb2ludCA9ICRzY29wZS5wbGF5ZXIuZ2V0KFwibG9jYXRpb25cIik7XG4gICAgaWYodXNlckdlb1BvaW50KSB7XG4gICAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoJ1RvdXJuYW1lbnQnKTtcbiAgICAgIHF1ZXJ5LndpdGhpbk1pbGVzKFwibG9jYXRpb25cIiwgdXNlckdlb1BvaW50LCA1MCk7XG4gICAgICBxdWVyeS5saW1pdCgxMCk7XG4gICAgICBxdWVyeS5maW5kKHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocGxhY2VzT2JqZWN0cykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHBsYWNlc09iamVjdHMpO1xuICAgICAgICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4gJiYgcGxhY2VzT2JqZWN0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIFBhcnNlUHVzaFBsdWdpbi5zdWJzY3JpYmUoJ3BheC1lYXN0JywgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXhlZCcpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZ2V0U3RhdHVzKCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuZmV0Y2goKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgc3RhdHVzKCk7XG4gICAgICB9KTtcbiAgICB9LCAyMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1cygpIHtcbiAgICBpZigkc2NvcGUucGxheWVyKSB7XG4gICAgICBzd2l0Y2ggKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSkge1xuICAgICAgICBjYXNlICdvcGVuJzpcbiAgICAgICAgICAkc2NvcGUuc3RvcCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdxdWV1ZSc6XG4gICAgICAgICAgJHNjb3BlLnNob3dPcHBvbmVudHMoKTtcbiAgICAgICAgICBtYXRjaE1ha2luZygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmb3VuZCc6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NvbmZpcm1lZCc6XG4gICAgICAgICAgd2FpdGluZ0Zvck9wcG9uZW50KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ25vT3Bwb25lbnQnOlxuICAgICAgICAgIG5vT3Bwb25lbnQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGxheWluZyc6XG4gICAgICAgICAgZ2V0TGFzdE1hdGNoKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbGxlZCc6XG4gICAgICAgICAgcGxheWVyQ2FuY2VsbGVkKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyICgpIHtcbiAgICB2YXIgbm93ID0gbW9tZW50KCk7XG4gICAgdmFyIHRpbWUgPSAkc2NvcGUubWF0Y2guZ2V0KCdhY3RpdmVEYXRlJyk7XG4gICAgaWYodGltZSkge1xuICAgICAgdmFyIGZpdmVNaW51dGVzID0gbW9tZW50KHRpbWUpLmFkZCg1LCAnbWludXRlcycpO1xuICAgICAgJHNjb3BlLmVuZC50aW1lID0gcGFyc2VGbG9hdChmaXZlTWludXRlcy5mb3JtYXQoJ3gnKSk7XG4gICAgICAkc2NvcGUuZW5kLmNhblBsYXkgPSBub3cuaXNBZnRlcihmaXZlTWludXRlcywgJ3NlY29uZHMnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlUGxheWVyICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICBzdGF0dXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoTWFraW5nKCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIFBhcnNlLkNsb3VkLnJ1bignbWF0Y2htYWtpbmcnKS50aGVuKGZ1bmN0aW9uIChyZXMpe1xuICAgICAgICBjb25zb2xlLmxvZygnbWF0Y2htYWtpbmcgc3RhcnRlZCcpO1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2V0U3RhdHVzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgMTUwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd0NhbmNlbGxlZE1hdGNoKCkge1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggQ2FuY2VsbGVkJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+WW91IGhhdmUgZmFpbGVkIHRvIGNvbmZpcm08L2Rpdj4nXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgc2F2ZVBsYXllcigpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybVBsYXllcigpIHtcbiAgICBpZiAoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgJHNjb3BlLm1hdGNoLnNldCgnY29uZmlybTEnLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm1hdGNoLnNldCgnY29uZmlybTInLCB0cnVlKTtcbiAgICB9XG4gICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgc2F2ZVBsYXllcigpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gb3Bwb25lbnRDb25maXJtZWQgKCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnYWN0aXZlJykge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC52aWV3Jyk7XG4gICAgICB9XG4gICAgfSwgMTAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiB3YWl0aW5nRm9yT3Bwb25lbnQgKCkge1xuICAgIFBhcnNlLkNsb3VkLnJ1bignY29uZmlybU1hdGNoJykudGhlbihmdW5jdGlvbiAobnVtKSB7XG4gICAgICBjaGVja09wcG9uZW50KDUwMDAsIGZhbHNlKTtcbiAgICAgIGNoZWNrT3Bwb25lbnQoMjAwMDAsIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tPcHBvbmVudCAodGltZW91dCwgYWxyZWFkeUNoZWNrZWQpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZigkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykgPT09ICdjb25maXJtZWQnKSB7XG4gICAgICAgICRzY29wZS5tYXRjaC5mZXRjaCgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICAgICAgY2hlY2tNYXRjaFN0YXR1cyhhbHJlYWR5Q2hlY2tlZCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHRpbWVvdXQpO1xuICB9XG4gIFxuICBmdW5jdGlvbiBjaGVja01hdGNoU3RhdHVzKGFscmVhZHlDaGVja2VkKSB7XG4gICAgc3dpdGNoICgkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSkge1xuICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgIGlmKGFscmVhZHlDaGVja2VkKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdub09wcG9uZW50Jyk7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWN0aXZlJzpcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdwbGF5aW5nJyk7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2hvdzpsb2FkaW5nJyk7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbXBsZXRlZCc6XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBcblxuICBmdW5jdGlvbiBub09wcG9uZW50ICgpIHtcbiAgICAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggRXJyb3InLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj48c3Ryb25nPllvdXIgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGZhaWxlZCB0byBjb25maXJtITwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+QmFjazwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tYXNzZXJ0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5RdWV1ZSBBZ2FpbjwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgaWYocmVzKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ2NhbmNlbGxlZCcpO1xuICAgICAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ2NhbmNlbGxlZCcpO1xuICAgICAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMYXN0TWF0Y2goKSB7XG4gICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdjb21wbGV0ZWQnKSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGFuZ2VXb3JkICgpIHtcbiAgICAkc2NvcGUubXlPcHBvbmVudC5uYW1lID0gJHNjb3BlLm9wcG9uZW50Lmxpc3RbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKiRzY29wZS5vcHBvbmVudC5saXN0Lmxlbmd0aCldO1xuICB9XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xhZGRlckpvaW5DdHJsJywgTGFkZGVySm9pbkN0cmwpO1xuXG5mdW5jdGlvbiBMYWRkZXJKb2luQ3RybChcbiAgJHNjb3BlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCAkcSwgUGFyc2UsICB0b3VybmFtZW50LCBMYWRkZXJTZXJ2aWNlc1xuKSB7XG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50LnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG4gICRzY29wZS5wbGF5ZXIgPSB7XG4gICAgYmF0dGxlVGFnOiAnJ1xuICB9O1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIudXNlcm5hbWUgPSAkc2NvcGUudXNlci51c2VybmFtZTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zdGF0dXMgPSAnb3Blbic7XG4gICAgICAgIExhZGRlclNlcnZpY2VzLmpvaW5Ub3VybmFtZW50KCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlciwgJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgU3VjY2Vzc1BvcHVwKHBsYXllcikudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvcik7XG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZUJhdHRsZVRhZyAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdGFnID0gJHNjb3BlLnBsYXllci5iYXR0bGVUYWc7XG5cbiAgICBpZih0YWcubGVuZ3RoIDwgOCkge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgYmF0dGxlIHRhZycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBzcGxpdCA9IHRhZy5zcGxpdCgnIycpO1xuICAgIGlmKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgQkFUVExFVEFH4oSiIGluY2x1ZGluZyAjIGFuZCBmb3VyIGRpZ2l0cycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKHNwbGl0WzFdLmxlbmd0aCA8IDIgfHwgc3BsaXRbMV0ubGVuZ3RoID4gNCkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyB1cCB0byBmb3VyIGRpZ2l0cyBhZnRlciAjIScpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKGlzTmFOKHNwbGl0WzFdKSkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyBmb3VyIGRpZ2l0cyBhZnRlciAjJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMudmFsaWRhdGVQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCwgdGFnKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICBpZihyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBjYi5yZWplY3QoJ1RoZSBCQVRUTEVUQUfihKIgeW91IGVudGVyZWQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYi5yZXNvbHZlKHRhZyk7XG4gICAgICB9IFxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgc2lnbmVkIHVwISBOb3cgZ28gZmluZCBhIHZhbGlhbnQgb3Bwb25lbnQuJ1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMZWFkZXJCb2FyZHNDdHJsJywgTGVhZGVyQm9hcmRzQ3RybCk7XG5cbmZ1bmN0aW9uIExlYWRlckJvYXJkc0N0cmwoJHNjb3BlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCwgUGFyc2UpIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICBnZXRQbGF5ZXJzKCk7XG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2V0UGxheWVycygpO1xuICB9O1xuICBcbiAgZnVuY3Rpb24gZ2V0UGxheWVycygpIHtcbiAgICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXJzKHRvdXJuYW1lbnQudG91cm5hbWVudCkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgdmFyIHJhbmsgPSAxO1xuICAgICAgYW5ndWxhci5mb3JFYWNoKHBsYXllcnMsIGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgcGxheWVyLnJhbmsgPSByYW5rO1xuICAgICAgICByYW5rKys7XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5wbGF5ZXJzID0gcGxheWVycztcbiAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgfSk7XG4gIH1cbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdSZXNldFBhc3N3b3JkQ3RybCcsIFJlc2V0UGFzc3dvcmRDdHJsKTtcblxuZnVuY3Rpb24gUmVzZXRQYXNzd29yZEN0cmxcbigkc2NvcGUsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlKSB7XG5cbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICAkc2NvcGUuZW1haWwgPSB7fTtcbiAgXG4gICRzY29wZS5yZXNldFBhc3N3b3JkID0gZnVuY3Rpb24gKGVtYWlsKSB7XG4gICAgUGFyc2UuVXNlci5yZXF1ZXN0UGFzc3dvcmRSZXNldChlbWFpbC50ZXh0LCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgU3VjY2Vzc1BvcHVwKCk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIGVycm9yIG1lc3NhZ2Ugc29tZXdoZXJlXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gIFxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnVXBkYXRlIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKCkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1Bhc3N3b3JkIFJlc2V0JyxcbiAgICAgIHRlbXBsYXRlOiAnQW4gRW1haWwgaGFzIGJlZW4gc2VudCB0byByZXNldCB5b3VyIHBhc3N3b3JkJ1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgfSlcbiAgfVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xhZGRlclByb2ZpbGVDdHJsJywgTGFkZGVyUHJvZmlsZUN0cmwpO1xuXG5mdW5jdGlvbiBMYWRkZXJQcm9maWxlQ3RybChcbiAgJHNjb3BlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCAkcSwgUGFyc2UsICB0b3VybmFtZW50LCBMYWRkZXJTZXJ2aWNlcywgcGxheWVyXG4pIHtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIFN1Y2Nlc3NQb3B1cChwbGF5ZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IpO1xuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVCYXR0bGVUYWcgKCkge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRhZyA9ICRzY29wZS5wbGF5ZXIuYmF0dGxlVGFnO1xuXG4gICAgaWYodGFnLmxlbmd0aCA8IDgpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIGJhdHRsZSB0YWcnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgc3BsaXQgPSB0YWcuc3BsaXQoJyMnKTtcbiAgICBpZihzcGxpdC5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIEJBVFRMRVRBR+KEoiBpbmNsdWRpbmcgIyBhbmQgZm91ciBkaWdpdHMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihzcGxpdFsxXS5sZW5ndGggPCAyIHx8IHNwbGl0WzFdLmxlbmd0aCA+IDQpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgdXAgdG8gZm91ciBkaWdpdHMgYWZ0ZXIgIyEnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihpc05hTihzcGxpdFsxXSkpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgZm91ciBkaWdpdHMgYWZ0ZXIgIycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLnZhbGlkYXRlUGxheWVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsIHRhZykudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgaWYocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgY2IucmVqZWN0KCdUaGUgQkFUVExFVEFH4oSiIHlvdSBlbnRlcmVkIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0YWcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdVcGRhdGUgRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgdXBkYXRlZCEgTm93IGdvIGFuZCBwbGF5ISdcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuZnVuY3Rpb24gTG9naW5DdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljSGlzdG9yeSkge1xuICAkc2NvcGUudXNlciA9IHt9O1xuICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24gKCkge1xuICAgIFBhcnNlLlVzZXIubG9nSW4oJHNjb3BlLnVzZXIudXNlcm5hbWUsICRzY29wZS51c2VyLnBhc3N3b3JkLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbiAodXNlciwgZXJyb3IpIHtcbiAgICAgICAgJHNjb3BlLndhcm5pbmcgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd1c2VyJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuICAgICRzY29wZS53YXJuaW5nID0gbnVsbDtcbiAgfSwgdHJ1ZSk7XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoTGlzdEN0cmwnLCBNYXRjaExpc3RDdHJsKTtcblxuZnVuY3Rpb24gTWF0Y2hMaXN0Q3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRpb25pY1BvcHVwLCAkcm9vdFNjb3BlLCBQYXJzZSwgTWF0Y2hTZXJ2aWNlcywgcGxheWVyXG4pIHtcbiAgJHNjb3BlLm1hdGNoZXMgPSBbXTtcbiAgJHNjb3BlLnBsYXllciA9IHBsYXllclswXTtcblxuICBpZigkc2NvcGUucGxheWVyKSB7XG4gICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzaG93OmxvYWRpbmcnKTtcbiAgICBNYXRjaFNlcnZpY2VzLmdldFBsYXllck1hdGNoZXMoJHNjb3BlLnBsYXllciwgbnVsbCkudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoZXMgZmV0Y2hlZCcpO1xuICAgICAgJHNjb3BlLm1hdGNoZXMgPSBtYXRjaGVzO1xuICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRQbGF5ZXJNYXRjaGVzKCRzY29wZS5wbGF5ZXIsICdyZXBvcnRlZCcpLnRoZW4oZnVuY3Rpb24gKHJlcG9ydGVkKSB7XG4gICAgICAgICRzY29wZS5yZXBvcnRlZCA9IHJlcG9ydGVkO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfVxuXG4gICRzY29wZS5wcm9jZXNzTWF0Y2ggPSBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICBpZihtYXRjaC53aW5uZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYobWF0Y2gubG9zZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIGlmKG1hdGNoLnJlcG9ydFJlYXNvbil7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoJHNjb3BlLnJlcG9ydGVkLmxlbmd0aCkge1xuICAgICAgc2hvd1JlcG9ydGVkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKG1hdGNoLnN0YXR1cyAhPT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gucmVwb3J0Jywge2lkOiBtYXRjaC5pZH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHNob3dSZXBvcnRlZCgpIHtcbiAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1RvbyBNYW55IFJlcG9ydHMnLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5Zb3UgaGF2ZSB0b28gbWFueSBwZW5kaW5nIHJlcG9ydHMuIFBsZWFzZSB3YWl0LjwvZGl2PidcbiAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcblxuICAgIH0pXG4gIH1cbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTWF0Y2hSZXBvcnRDdHJsJywgTWF0Y2hSZXBvcnRDdHJsKTtcblxuZnVuY3Rpb24gTWF0Y2hSZXBvcnRDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJHJvb3RTY29wZSwgJGlvbmljUG9wdXAsICRpb25pY0hpc3RvcnksXG4gIFBhcnNlLCBNYXRjaFNlcnZpY2VzLCBjYW1lcmFTZXJ2aWNlcywgcmVwb3J0XG4pIHtcblxuICAkc2NvcGUubWF0Y2ggPSByZXBvcnQ7XG5cbiAgJHNjb3BlLnBpY3R1cmUgPSBudWxsO1xuXG4gIHZhciBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZSgpO1xuICB2YXIgaW1nU3RyaW5nID0gbnVsbDtcblxuICAkc2NvcGUuZ2V0UGljdHVyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcHRpb25zID0gY2FtZXJhU2VydmljZXMuY2FtZXJhO1xuICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZShvblN1Y2Nlc3Msb25GYWlsLG9wdGlvbnMpO1xuICB9O1xuICB2YXIgb25TdWNjZXNzID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XG4gICAgJHNjb3BlLnBpY3R1cmUgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcgKyBpbWFnZURhdGE7XG4gICAgaW1nU3RyaW5nID0gaW1hZ2VEYXRhO1xuICAgICRzY29wZS4kYXBwbHkoKTtcbiAgfTtcbiAgdmFyIG9uRmFpbCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIk9uIGZhaWwgXCIgKyBlKTtcbiAgfVxuXG4gICRzY29wZS5wcm9jZXNzUmVwb3J0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZihpbWdTdHJpbmcpIHtcbiAgICAgIHBhcnNlRmlsZSA9IG5ldyBQYXJzZS5GaWxlKFwicmVwb3J0LnBuZ1wiLCB7YmFzZTY0OmltZ1N0cmluZ30pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJzZUZpbGUgPSBudWxsO1xuICAgIH1cbiAgICAkc2NvcGUubWF0Y2guc2V0KFwicmVwb3J0SW1hZ2VcIiwgcGFyc2VGaWxlKTtcbiAgICAkc2NvcGUubWF0Y2guc2V0KCdzdGF0dXMnLCAncmVwb3J0ZWQnKTtcbiAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICB9KTtcbiAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgdGl0bGU6ICdNYXRjaCBSZXBvcnRlZCcsXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+VGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHRoZSByZXBvcnQuPC9kaXY+J1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfTtcblxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoVmlld0N0cmwnLCBNYXRjaFZpZXdDdHJsKTtcblxuZnVuY3Rpb24gTWF0Y2hWaWV3Q3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY1BvcHVwLCAkaW9uaWNIaXN0b3J5LCAkdGltZW91dCxcbiAgUGFyc2UsIExhZGRlclNlcnZpY2VzLCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCBjYW1lcmFTZXJ2aWNlcywgdG91cm5hbWVudFxuKSB7XG4gIFxuICB2YXIgcGFyc2VGaWxlID0gbmV3IFBhcnNlLkZpbGUoKTtcbiAgdmFyIGltZ1N0cmluZyA9IG51bGw7XG4gIFxuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG5cbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICBcbiAgJHNjb3BlLiRvbihcIiRpb25pY1ZpZXcuZW50ZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnNbMF07XG4gICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdjYW5jZWxsZWQnKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNYXRjaERldGFpbHMoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgXG4gICRzY29wZS4kb24oJyRpb25pY1ZpZXcubGVhdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGxvc2VNYXRjaCgpLmNsb3NlKCk7XG4gICAgd2luTWF0Y2goKS5jbG9zZSgpO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0UGljdHVyZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKGNhbWVyYVNlcnZpY2VzLmNhbWVyYSkge1xuICAgICAgdmFyIG9wdGlvbnMgPSBjYW1lcmFTZXJ2aWNlcy5jYW1lcmE7XG4gICAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUob25TdWNjZXNzLG9uRmFpbCxvcHRpb25zKTtcbiAgICB9XG4gIH07XG4gIHZhciBvblN1Y2Nlc3MgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlRGF0YTtcbiAgICBpbWdTdHJpbmcgPSBpbWFnZURhdGE7XG4gICAgJHNjb3BlLiRhcHBseSgpO1xuICB9O1xuICB2YXIgb25GYWlsID0gZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUubG9nKFwiT24gZmFpbCBcIiArIGUpO1xuICB9O1xuXG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBnZXRNYXRjaCh0cnVlKTtcbiAgfTtcblxuICAkc2NvcGUucmVjb3JkID0gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgdmFyIHVzZXJuYW1lID0gbnVsbDtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSA9PT0gJ2FjdGl2ZScpIHtcbiAgICAgICAgc3dpdGNoIChyZWNvcmQpIHtcbiAgICAgICAgICBjYXNlICd3aW4nOlxuICAgICAgICAgICAgd2luTWF0Y2goKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICBpZihyZXMpIHtcbiAgICAgICAgICAgICAgICBpZihpbWdTdHJpbmcpIHtcbiAgICAgICAgICAgICAgICAgIHBhcnNlRmlsZSA9IG5ldyBQYXJzZS5GaWxlKFwicmVwb3J0LnBuZ1wiLCB7YmFzZTY0OmltZ1N0cmluZ30pO1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldChcIndpbkltYWdlXCIsIHBhcnNlRmlsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJlY29yZE1hdGNoKHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdsb3NzJzpcbiAgICAgICAgICAgIGxvc2VNYXRjaCgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgIGlmKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5vcHBvbmVudC51c2VyKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdsb3NlcicsICRzY29wZS5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJlY29yZE1hdGNoKHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHdpbk1hdGNoICgpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG4gICAgJHNjb3BlLmVycm9yTWVzc2FnZSA9IG51bGw7XG5cbiAgICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcG9wdXBzL3dpbi5tYXRjaC5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQgYSBXaW4nLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZiAoISRzY29wZS5waWN0dXJlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yTWVzc2FnZSA9ICdVcGxvYWQgYSBTY3JlZW5zaG90JztcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9zZU1hdGNoKCkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvbG9zZS5tYXRjaC5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQgYSBMb3NzJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1hdGNoKHJlZnJlc2gpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCRzY29wZS5tYXRjaC5pZCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoJyArICRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpKTtcbiAgICAgIGNvbnNvbGUubG9nKCdtYXRjaCBmZXRjaGVkJyk7XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUubWF0Y2guZ2V0KCd3aW5uZXInKSk7XG4gICAgICBpZihyZWZyZXNoKSB7XG4gICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZWNvcmRNYXRjaCh1c2VybmFtZSkge1xuICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2hvdzpsb2FkaW5nJyk7XG4gICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ2NvbXBsZXRlZCcpO1xuICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBQYXJzZS5DbG91ZC5ydW4oJ21hdGNoUmVzdWx0cycsIHttYXRjaDogJHNjb3BlLm1hdGNoLmlkLCB1c2VybmFtZTogdXNlcm5hbWV9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5tYXRjaC53aW5uZXIuZmV0Y2goKS50aGVuKGZ1bmN0aW9uICh3aW5uZXIpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cod2lubmVyKTtcbiAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLndpbm5lciA9IHdpbm5lcjtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KGVyci5tZXNzYWdlKTtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDIwMDApO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWF0Y2hEZXRhaWxzKCkge1xuICAgICRzY29wZS5vcHBvbmVudCA9IHtcbiAgICAgIGhlcm86IG51bGwsXG4gICAgICBiYXR0bGVUYWc6IG51bGxcbiAgICB9O1xuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8yO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjI7XG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMicpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8xO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjE7XG4gICAgfVxuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdNZW51Q3RybCcsIE1lbnVDdHJsKTtcblxuZnVuY3Rpb24gTWVudUN0cmwoJHNjb3BlLCAkaW9uaWNQb3BvdmVyLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlLCAkdGltZW91dCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJGlvbmljUG9wb3Zlci5mcm9tVGVtcGxhdGVVcmwoJ3RlbXBsYXRlcy9wb3BvdmVycy9wcm9maWxlLnBvcC5odG1sJywge1xuICAgIHNjb3BlOiAkc2NvcGUsXG4gIH0pLnRoZW4oZnVuY3Rpb24ocG9wb3Zlcikge1xuICAgICRzY29wZS5wb3BvdmVyID0gcG9wb3ZlcjtcbiAgfSk7XG5cbiAgJHNjb3BlLm1lbnUgPSBmdW5jdGlvbiAobGluaykge1xuICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgfSk7XG4gICAgaWYobGluayA9PT0gJ2xvZ2luJykge1xuICAgICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgICBQYXJzZVB1c2hQbHVnaW4udW5zdWJzY3JpYmUoJHNjb3BlLnVzZXIuY3VycmVudCgpLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5zdWJiZWQnKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBQYXJzZS5Vc2VyLmxvZ091dCgpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC4nICsgbGluaywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDEwMDApO1xuICAgICAgXG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICB9XG4gICAgJHNjb3BlLnBvcG92ZXIuaGlkZSgpO1xuICB9XG4gIC8vQ2xlYW51cCB0aGUgcG9wb3ZlciB3aGVuIHdlJ3JlIGRvbmUgd2l0aCBpdCFcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wb3Zlci5yZW1vdmUoKTtcbiAgfSk7XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgUmVnaXN0ZXJDdHJsKTtcblxuUmVnaXN0ZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIFJlZ2lzdGVyQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY1BvcHVwKSB7XG5cbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuUmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB2YXIgcmVnaXN0ZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgIHJlZ2lzdGVyLnNldCh1c2VyKTtcbiAgICByZWdpc3Rlci5zaWduVXAobnVsbCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcy5hZG1pbicsIFtdKVxuICAuY29uZmlnKEFkbWluUm91dGVzKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmFkbWluLnBsYXllcnMnLCB7XG4gICAgICB1cmw6ICcvcGxheWVycycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5wbGF5ZXJzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0FkbWluUGxheWVyc0N0cmwnXG4gICAgfSk7XG4gIFxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLmxhZGRlcicsIFtdKVxuICAuY29uZmlnKExhZGRlclJvdXRlcyk7XG5cbmZ1bmN0aW9uIExhZGRlclJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlcicsIHtcbiAgICAgIHVybDogJy9sYWRkZXInLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2xhZGRlci5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmxlYWRlcmJvYXJkJywge1xuICAgICAgdXJsOiAnL2xlYWRlcmJvYXJkcycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGVhZGVyYm9hcmQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGVhZGVyQm9hcmRzQ3RybCdcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5qb2luJywge1xuICAgICAgdXJsOiAnL2pvaW4nLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2pvaW4uaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGFkZGVySm9pbkN0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIucHJvZmlsZScsIHtcbiAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9wcm9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xhZGRlclByb2ZpbGVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcGxheWVyOiBmdW5jdGlvbiAoUGFyc2UsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIExhZGRlclNlcnZpY2VzLmdldFBsYXllcih0b3VybmFtZW50LnRvdXJuYW1lbnQsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLm1hdGNoZXMnLCBbXSlcbiAgLmNvbmZpZyhNYXRjaFJvdXRlcyk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gubGlzdCcsIHtcbiAgICAgIHVybDogJy9saXN0JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmxpc3QuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hMaXN0Q3RybCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHBsYXllcjogZnVuY3Rpb24gKFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCkge1xuICAgICAgICAgIHJldHVybiBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIodG91cm5hbWVudC50b3VybmFtZW50LCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnZpZXcnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC52aWV3Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoVmlld0N0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5tYXRjaC5yZXBvcnQnLCB7XG4gICAgICB1cmw6ICcvcmVwb3J0LzppZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC5yZXBvcnQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hSZXBvcnRDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcmVwb3J0OiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJHN0YXRlUGFyYW1zLmlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ0xhZGRlclNlcnZpY2VzJywgTGFkZGVyU2VydmljZXMpXG4gIC5mYWN0b3J5KCdMYWRkZXInLCBMYWRkZXIpO1xuXG5mdW5jdGlvbiBMYWRkZXJTZXJ2aWNlcyhQYXJzZSwgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UGxheWVyczogZ2V0UGxheWVycyxcbiAgICBnZXRQbGF5ZXI6IGdldFBsYXllcixcbiAgICB2YWxpZGF0ZVBsYXllcjogdmFsaWRhdGVQbGF5ZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50LFxuICAgIGdldFBlbmRpbmdQbGF5ZXJzOiBnZXRQZW5kaW5nUGxheWVycyxcbiAgICBzZWFyY2hQbGF5ZXJzOiBzZWFyY2hQbGF5ZXJzXG4gIH07XG5cbiAgZnVuY3Rpb24gc2VhcmNoUGxheWVycyhpbnB1dCkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LnN0YXJ0c1dpdGgoJ3VzZXJuYW1lJywgaW5wdXQpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRQZW5kaW5nUGxheWVycyh0b3VybmFtZW50LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5Lm5vdEVxdWFsVG8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVycyh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoJ3BvaW50cycsICdtbXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVQbGF5ZXIodG91cm5leSwgYmF0dGxlVGFnKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ2JhdHRsZVRhZycsIGJhdHRsZVRhZyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBsYXllcih0b3VybmV5LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgdXNlciwgdXNlckRhdGEpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbCgpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgdXNlcik7XG4gICAgcGxheWVyLnNldCh1c2VyRGF0YSk7XG4gICAgcGxheWVyLnNldCgnd2lucycsIDApO1xuICAgIHBsYXllci5zZXQoJ2xvc3NlcycsIDApO1xuICAgIHBsYXllci5zZXQoJ3BvaW50cycsIDApO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIExhZGRlcihQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdMYWRkZXInKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndXNlcicsICdiYXR0bGVUYWcnLCAndXNlcm5hbWUnLCAnbG9jYXRpb24nLCAnYmFubmVkJyxcbiAgICAnaGVybycsICdwbGF5ZXInLCAnc3RhdHVzJywgJ2NhbmNlbFRpbWVyJywgJ3dpbnMnLCAnbG9zc2VzJywgJ21tcicsICdwb2ludHMnLCAnYmFuUmVhc29uJywgJ2FkbWluJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnbG9jYXRpb25TZXJ2aWNlcycsIGxvY2F0aW9uU2VydmljZXMpO1xuXG5mdW5jdGlvbiBsb2NhdGlvblNlcnZpY2VzIChQYXJzZSwgJGNvcmRvdmFHZW9sb2NhdGlvbiwgJHEpIHtcblxuICB2YXIgbG9jYXRpb24gPSB7Y29vcmRzOiBuZXcgUGFyc2UuR2VvUG9pbnQoKX07XG4gIHJldHVybiB7XG4gICAgbG9jYXRpb246IGxvY2F0aW9uLFxuICAgIGdldExvY2F0aW9uOiBnZXRMb2NhdGlvbixcbiAgICBzZXRMb2NhdGlvbjogc2V0TG9jYXRpb25cbiAgfTtcbiAgXG4gIGZ1bmN0aW9uIHNldExvY2F0aW9uIChjb29yZHMpIHtcbiAgICBsb2NhdGlvbi5jb29yZHMgPSBuZXcgUGFyc2UuR2VvUG9pbnQoe2xhdGl0dWRlOiBjb29yZHMubGF0aXR1ZGUsIGxvbmdpdHVkZTogY29vcmRzLmxvbmdpdHVkZX0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TG9jYXRpb24gKCkge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHBvc09wdGlvbnMgPSB7ZW5hYmxlSGlnaEFjY3VyYWN5OiBmYWxzZX07XG4gICAgJGNvcmRvdmFHZW9sb2NhdGlvblxuICAgICAgLmdldEN1cnJlbnRQb3NpdGlvbihwb3NPcHRpb25zKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHBvc2l0aW9uKSB7XG4gICAgICAgIGNiLnJlc29sdmUocG9zaXRpb24uY29vcmRzKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgICBjYi5yZWplY3QoZXJyKTtcbiAgICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ01hdGNoU2VydmljZXMnLCBNYXRjaFNlcnZpY2VzKVxuICAuZmFjdG9yeSgnTWF0Y2gnLCBNYXRjaCk7XG5cbmZ1bmN0aW9uIE1hdGNoU2VydmljZXMoUGFyc2UsIE1hdGNoLCAkcSkge1xuICB2YXIgdXNlciA9IFBhcnNlLlVzZXI7XG4gIHJldHVybiB7XG4gICAgZ2V0Q29uZmlybWVkTWF0Y2g6IGdldENvbmZpcm1lZE1hdGNoLFxuICAgIGdldFBlbmRpbmdNYXRjaDogZ2V0UGVuZGluZ01hdGNoLFxuICAgIGdldFJlcG9ydGVkTWF0Y2hlczogZ2V0UmVwb3J0ZWRNYXRjaGVzLFxuICAgIGdldExhdGVzdE1hdGNoOiBnZXRMYXRlc3RNYXRjaCxcbiAgICBnZXRNYXRjaDogZ2V0TWF0Y2gsXG4gICAgZ2V0UGxheWVyTWF0Y2hlczogZ2V0UGxheWVyTWF0Y2hlcyxcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQbGF5ZXJNYXRjaGVzKHBsYXllciwgc3RhdHVzKSB7XG4gICAgdmFyIHBsYXllcjEgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHBsYXllcjEuZXF1YWxUbygncGxheWVyMScsIHBsYXllcik7XG4gICAgdmFyIHBsYXllcjIgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHBsYXllcjIuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgdmFyIG1haW5RdWVyeSA9IFBhcnNlLlF1ZXJ5Lm9yKHBsYXllcjEsIHBsYXllcjIpO1xuICAgIG1haW5RdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIG1haW5RdWVyeS5saW1pdCgxMCk7XG4gICAgaWYoc3RhdHVzKSB7XG4gICAgICBtYWluUXVlcnkuZXF1YWxUbygnc3RhdHVzJywgc3RhdHVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG1haW5RdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMYXRlc3RNYXRjaChwbGF5ZXIpIHtcbiAgICB2YXIgdHlwZSA9IHBsYXllci5nZXQoJ3BsYXllcicpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuaW5jbHVkZSgnd2lubmVyJyk7XG4gICAgcXVlcnkuaW5jbHVkZSgnbG9zZXInKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKCdjcmVhdGVkQXQnKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENvbmZpcm1lZE1hdGNoIChwbGF5ZXIpIHtcbiAgICB2YXIgdHlwZSA9IHBsYXllci5nZXQoJ3BsYXllcicpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSgnTWF0Y2gnKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAnYWN0aXZlJyk7XG4gICAgcXVlcnkuZGVzY2VuZGluZygnY3JlYXRlZEF0Jyk7XG4gICAgaWYodHlwZSA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgfVxuICAgIHF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgcXVlcnkuZXF1YWxUbygnY29uZmlybTInLCB0cnVlKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcblxuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0UmVwb3J0ZWRNYXRjaGVzKCkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSgnTWF0Y2gnKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncmVwb3J0ZWQnKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKCdjcmVhdGVkQXQnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFBlbmRpbmdNYXRjaChwbGF5ZXIpIHtcbiAgICB2YXIgdHlwZSA9IHBsYXllci5nZXQoJ3BsYXllcicpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuZGVzY2VuZGluZygnY3JlYXRlZEF0Jyk7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgaWYodHlwZSA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgfVxuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdwZW5kaW5nJyk7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRNYXRjaChpZCkge1xuICAgIHZhciBtYXRjaCA9IG5ldyBNYXRjaC5Nb2RlbCgpO1xuICAgIG1hdGNoLmlkID0gaWQ7XG4gICAgcmV0dXJuIG1hdGNoLmZldGNoKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTWF0Y2goUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTWF0Y2gnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbXG4gICAgJ3RvdXJuYW1lbnQnLCAncGxheWVyMScsICdwbGF5ZXIyJywgJ2hlcm8xJywgJ2hlcm8yJywgJ3VzZXJuYW1lMScsICd1c2VybmFtZTInLCAnYmF0dGxlVGFnMScsICdiYXR0bGVUYWcyJywgJ3N0YXR1cycsICd3aW5uZXInLCAnbG9zZXInLFxuICAgICd3aW5JbWFnZScsICdyZXBvcnRSZWFzb24nLCAncmVwb3J0SW1hZ2UnLCAnYWN0aXZlRGF0ZScsICd1c2VyMScsICd1c2VyMidcbiAgXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfTtcbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnY2FtZXJhU2VydmljZXMnLCBjYW1lcmFTZXJ2aWNlcyk7XG5cbmZ1bmN0aW9uIGNhbWVyYVNlcnZpY2VzICgkd2luZG93KSB7XG5cbiAgdmFyIGNhbWVyYSA9IHtcbiAgICBxdWFsaXR5OiA5MCxcbiAgICB0YXJnZXRXaWR0aDogMzIwLFxuICAgIHRhcmdldEhlaWdodDogNTAwLFxuICAgIGFsbG93RWRpdDogdHJ1ZSxcbiAgICBzb3VyY2VUeXBlOiAwLFxuICB9XG4gIGlmKCR3aW5kb3cuQ2FtZXJhKSB7XG4gICAgY2FtZXJhLmRlc3RpbmF0aW9uVHlwZSA9IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuREFUQV9VUkw7XG4gICAgY2FtZXJhLmVuY29kaW5nVHlwZSA9IENhbWVyYS5FbmNvZGluZ1R5cGUuSlBFRztcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2FtZXJhOiBjYW1lcmFcbiAgfTtcblxuICAvLyBmdW5jdGlvbiBnZXREYXRhVXJpICh1cmwsIGNhbGxiYWNrKSB7XG4gIC8vICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gIC8vICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAvLyAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAvLyAgICAgY2FudmFzLndpZHRoID0gdGhpcy5uYXR1cmFsV2lkdGg7IC8vIG9yICd3aWR0aCcgaWYgeW91IHdhbnQgYSBzcGVjaWFsL3NjYWxlZCBzaXplXG4gIC8vICAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5uYXR1cmFsSGVpZ2h0OyAvLyBvciAnaGVpZ2h0JyBpZiB5b3Ugd2FudCBhIHNwZWNpYWwvc2NhbGVkIHNpemVcbiAgLy9cbiAgLy8gICAgIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmRyYXdJbWFnZSh0aGlzLCAwLCAwKTtcbiAgLy9cbiAgLy8gICAgIC8vIEdldCByYXcgaW1hZ2UgZGF0YVxuICAvLyAgICAgY2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJykucmVwbGFjZSgvXmRhdGE6aW1hZ2VcXC8ocG5nfGpwZyk7YmFzZTY0LC8sICcnKSk7XG4gIC8vXG4gIC8vICAgICAvLyAuLi4gb3IgZ2V0IGFzIERhdGEgVVJJXG4gIC8vICAgICAvL2NhbGxiYWNrKGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpKTtcbiAgLy8gICB9O1xuICAvLyAgIGltYWdlLnNyYyA9IHVybDtcbiAgLy8gfVxuXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1F1ZXVlU2VydmljZXMnLCBRdWV1ZVNlcnZpY2VzKVxuXG5mdW5jdGlvbiBRdWV1ZVNlcnZpY2VzKCkge1xuICB2YXIgb3Bwb25lbnQgPSB7XG4gICAgbGlzdDogWydFYXN5IFBpY2tpbmdzJywgJ1lvdXIgV29yc3QgTmlnaHRtYXJlJywgJ1dvcmxkIGNsYXNzIHBhc3RlIGVhdGVyJyxcbiAgICAgICdBIE11cmxvYycsICdHb3VyZCBjcml0aWMnLCAnTm9zZSBhbmQgbW91dGggYnJlYXRoZXInLCAnSG9nZ2VyJywgJ0EgY2FyZGlzaCBJYW4nLFxuICAgICAgJ01vcGV5IE1hZ2UnLCAnV29tYmF0IFdhcmxvY2snLCAnUm91Z2VkIHVwIFJvZ3VlJywgJ1dhaWZpc2ggV2FycmlvcicsICdEYW1wIERydWlkJyxcbiAgICAgICdTaGFiYnkgU2hhbWFuJywgJ1Blbm5pbGVzcyBQYWxhZGluJywgJ0h1ZmZ5IEh1bnRlcicsICdQZXJreSBQcmllc3QnLCAnVGhlIFdvcnN0IFBsYXllcicsXG4gICAgICAnWW91ciBPbGQgUm9vbW1hdGUnLCAnU3RhckNyYWZ0IFBybycsICdGaXNjYWxseSByZXNwb25zaWJsZSBtaW1lJywgJ1lvdXIgR3VpbGQgTGVhZGVyJyxcbiAgICAgICdOb25lY2sgR2VvcmdlJywgJ0d1bSBQdXNoZXInLCAnQ2hlYXRlciBNY0NoZWF0ZXJzb24nLCAnUmVhbGx5IHNsb3cgZ3V5JywgJ1JvYWNoIEJveScsXG4gICAgICAnT3JhbmdlIFJoeW1lcicsICdDb2ZmZWUgQWRkaWN0JywgJ0lud2FyZCBUYWxrZXInLCAnQmxpenphcmQgRGV2ZWxvcGVyJywgJ0dyYW5kIE1hc3RlcicsXG4gICAgICAnRGlhbW9uZCBMZWFndWUgUGxheWVyJywgJ0JyYW5kIE5ldyBQbGF5ZXInLCAnRGFzdGFyZGx5IERlYXRoIEtuaWdodCcsICdNZWRpb2NyZSBNb25rJyxcbiAgICAgICdBIExpdHRsZSBQdXBweSdcbiAgICBdXG4gIH07XG4gIHZhciBoZXJvZXMgPSBbXG4gICAge3RleHQ6ICdtYWdlJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnaHVudGVyJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncGFsYWRpbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcnJpb3InLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdkcnVpZCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcmxvY2snLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdzaGFtYW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwcmllc3QnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdyb2d1ZScsIGNoZWNrZWQ6IGZhbHNlfVxuICBdO1xuICByZXR1cm4ge1xuICAgIG9wcG9uZW50OiBvcHBvbmVudCxcbiAgICBoZXJvZXM6IGhlcm9lc1xuICB9O1xufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1RvdXJuYW1lbnRTZXJ2aWNlcycsIFRvdXJuYW1lbnRTZXJ2aWNlcylcbiAgLmZhY3RvcnkoJ1RvdXJuYW1lbnQnLCBUb3VybmFtZW50KVxuICAuZmFjdG9yeSgnRGV0YWlscycsIERldGFpbHMpO1xuXG5mdW5jdGlvbiBUb3VybmFtZW50U2VydmljZXMoUGFyc2UsICRxLCBUb3VybmFtZW50LCBEZXRhaWxzLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb3VybmFtZW50OiBnZXRUb3VybmFtZW50LFxuICAgIGNyZWF0ZVRvdXJuYW1lbnQ6IGNyZWF0ZVRvdXJuYW1lbnQsXG4gICAgZ2V0TGFkZGVyOiBnZXRMYWRkZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH07XG4gIGZ1bmN0aW9uIGpvaW5Ub3VybmFtZW50KHRvdXJuZXksIGpvaW5QbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbChqb2luUGxheWVyKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VybmFtZScsIFBhcnNlLlVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICBwbGF5ZXIuc2V0KCdtbXInLCAxMDAwKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VG91cm5hbWVudCgpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoRGV0YWlscy5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndHlwZScsICdsYWRkZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd0b3VybmFtZW50Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb3VybmFtZW50ICgpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0b3VybmFtZW50ID0gbmV3IFRvdXJuYW1lbnQuTW9kZWwoKTtcbiAgICB0b3VybmFtZW50LnNldCgnbmFtZScsICdPTk9HIE9QRU4nKTtcbiAgICB0b3VybmFtZW50LnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICB0b3VybmFtZW50LnNldCgnZ2FtZScsICdoZWFydGhzdG9uZScpO1xuICAgIHRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuZXkpIHtcbiAgICAgIHZhciBkZXRhaWxzID0gbmV3IERldGFpbHMuTW9kZWwoKTtcbiAgICAgIGRldGFpbHMuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgICBkZXRhaWxzLnNldCgndHlwZScsICdsYWRkZXInKTtcbiAgICAgIGRldGFpbHMuc2V0KCdwbGF5ZXJDb3VudCcsIDApO1xuICAgICAgZGV0YWlscy5zZXQoJ251bU9mR2FtZXMnLCA1KTtcbiAgICAgIGRldGFpbHMuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgZGVmZXIucmVzb2x2ZShkZXRhaWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhZGRlciAodG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5pbmNsdWRlKCdwbGF5ZXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnQoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVG91cm5hbWVudCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnbmFtZScsICdnYW1lJywgJ3N0YXR1cycsICdkaXNhYmxlZCcsICdkaXNhYmxlZFJlYXNvbicsICdsb2NhdGlvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9O1xufVxuZnVuY3Rpb24gRGV0YWlscyhQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdEZXRhaWxzJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3R5cGUnLCAnbnVtT2ZHYW1lcycsICdwbGF5ZXJDb3VudCddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9O1xufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
