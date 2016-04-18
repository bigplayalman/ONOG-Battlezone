
config.$inject = ['$ionicConfigProvider', '$compileProvider', 'ParseProvider'];angular.module('ONOG.config', [])
  .config(config);

function config ($ionicConfigProvider, $compileProvider, ParseProvider) {

  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob|content|ms-appx|x-wmapp0):|data:image\/|img\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0):/);

  ParseProvider.initialize("nYsB6tmBMYKYMzM5iV9BUcBvHWX89ItPX5GfbN6Q", "zrin8GEBDVGbkl1ioGEwnHuP70FdG6HhzTS8uGjz");

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


routes.$inject = ['$stateProvider', '$urlRouterProvider'];angular.module('ONOG.routes', [
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
    })


}


run.$inject = ['$ionicPlatform', '$state', '$rootScope', '$ionicLoading', '$ionicPopup', 'locationServices', '$ionicHistory', '$cordovaNetwork'];angular.module('ONOG')
  .constant("moment", moment)
  .run(run);

function run ($ionicPlatform, $state, $rootScope, $ionicLoading, $ionicPopup, locationServices, $ionicHistory, $cordovaNetwork) {
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
    var type = $cordovaNetwork.getNetwork();

    var isOnline = $cordovaNetwork.isOnline();

    var isOffline = $cordovaNetwork.isOffline();
    
    console.log(isOffline);
    // listen for Online event
    $rootScope.$on('$cordovaNetwork:online', function(event, networkState){
      var onlineState = networkState;
    })

    // listen for Offline event
    $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
      var offlineState = networkState;
      $ionicPopup.alert({
          title: "Internet Disconnected",
          content: "The internet is disconnected on your device."
        })
        .then(function(result) {
          ionic.Platform.exitApp();
        });
      
    })


    $rootScope.$on('show:loading', function() {
      $ionicLoading.show({template: '<ion-spinner icon="spiral" class="spinner-calm"></ion-spinner>', showBackdrop: true, animation: 'fade-in'});
    });

    $rootScope.$on('hide:loading', function() {
      $ionicLoading.hide();
    });

    $ionicPlatform.on('resume', function(){
      //rock on
      $state.go('app.dashboard', {reload: true});
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
    });

  });
}

angular.module('ONOG.Services', []);



AdminRoutes.$inject = ['$stateProvider'];angular.module('ONOG.routes.admin', [])
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
}


LadderRoutes.$inject = ['$stateProvider'];angular.module('ONOG.routes.ladder', [])
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


MatchRoutes.$inject = ['$stateProvider'];angular.module('ONOG.routes.matches', [])
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
      url: '/view',
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
    })
}


AdminMatchesCtrl.$inject = ['$scope', 'Parse'];
angular.module('ONOG.Controllers')

  .controller('AdminMatchesCtrl', AdminMatchesCtrl);

function AdminMatchesCtrl($scope, Parse) {
  
};


AdminPlayersCtrl.$inject = ['$scope', 'Parse'];
angular.module('ONOG.Controllers')

  .controller('AdminPlayersCtrl', AdminPlayersCtrl);

function AdminPlayersCtrl($scope, Parse) {
  
};


AdminSettingsCtrl.$inject = ['$scope', 'locationServices', 'newTournament', 'tournament'];
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
  }
  
};


DashboardCtrl.$inject = ['$scope', '$state', '$filter', '$timeout', '$interval', '$ionicPopup', '$rootScope', 'Parse', 'tournament', 'MatchServices', 'QueueServices', 'LadderServices', 'locationServices'];
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

function DashboardCtrl(
  $scope, $state, $filter, $timeout, $interval, $ionicPopup, $rootScope,
  Parse, tournament, MatchServices, QueueServices, LadderServices, locationServices
) {
  var promise = null;
  $scope.tournament = tournament.tournament;
  $scope.user = Parse.User;

  $scope.end = {
    canPlay: true,
    time: parseFloat(moment().format('x'))
  }

  $scope.location = locationServices.location;
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};

  $scope.$on("$ionicView.enter", function(event) {
    if(navigator && navigator.splashscreen) {
      navigator.splashscreen.hide();
    }
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
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
  }
  
  $scope.stop = function() {
    $interval.cancel(promise);
  };
  
  $scope.showOpponents = function() {
    $scope.stop();
    promise = $interval(function () {changeWord()}, 2000);
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
  };
};


LadderJoinCtrl.$inject = ['$scope', '$filter', '$ionicPopup', '$state', '$ionicHistory', '$q', 'Parse', 'tournament', 'LadderServices'];
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


LeaderBoardsCtrl.$inject = ['$scope', 'LadderServices', 'tournament', 'Parse', '$filter', '$ionicPopup'];
angular.module('ONOG.Controllers')

  .controller('LeaderBoardsCtrl', LeaderBoardsCtrl);

function LeaderBoardsCtrl($scope, LadderServices, tournament, Parse, $filter, $ionicPopup) {
  $scope.user = Parse.User;
  getPlayers();
  $scope.doRefresh = function () {
    getPlayers();
  }
  
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
};


ResetPasswordCtrl.$inject = ['$scope', '$ionicPopup', '$state', '$ionicHistory', 'Parse'];
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
  }

  

  function ErrorPopup (message) {
    return $ionicPopup.alert({
      title: 'Update Error',
      template: message
    });
  };

  function SuccessPopup (player) {
    return $ionicPopup.alert({
      title: 'Password Reset',
      template: 'An Email has been sent to reset your password'
    }).then(function (res) {
      $state.go('app.dashboard');
    })
  };
};


LadderProfileCtrl.$inject = ['$scope', '$filter', '$ionicPopup', '$state', '$ionicHistory', '$q', 'Parse', 'tournament', 'LadderServices', 'player'];
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


LoginCtrl.$inject = ['$scope', '$state', 'Parse', '$ionicHistory'];
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


MatchListCtrl.$inject = ['$scope', '$state', '$ionicPopup', '$rootScope', 'Parse', 'MatchServices', 'player'];
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
  }

  function showReported() {
    $ionicPopup.alert({
      title: 'Too Many Reports',
      template: '<div class="text-center">You have too many pending reports. Please wait.</div>'
    }).then(function () {

    })
  }
};


MatchReportCtrl.$inject = ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', 'Parse', 'MatchServices', 'cameraServices', 'report'];
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


MatchViewCtrl.$inject = ['$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory', '$timeout', 'Parse', 'LadderServices', 'MatchServices', 'QueueServices', 'cameraServices', 'tournament'];
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
    var options = cameraServices.camera;
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
      console.log('match fetched');
      console.log($scope.match.get('winner'));
      if(refresh) {
        $scope.$broadcast('scroll.refreshComplete');
      }
    })
  }

  function recordMatch(match, username) {
    $rootScope.$broadcast('show:loading');
    match.set('status', 'completed');
    match.save().then(function (match) {
      $scope.match = match;
      Parse.Cloud.run('matchResults', {username: username, match: match.id}).then(function (results) {
        $rootScope.$broadcast('hide:loading');
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


MenuCtrl.$inject = ['$scope', '$ionicPopover', '$state', '$ionicHistory', 'Parse', '$timeout'];angular.module('ONOG.Controllers')
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


LadderServices.$inject = ['Parse', 'Ladder'];
Ladder.$inject = ['Parse'];
angular.module('ONOG.Services')

  .service('LadderServices', LadderServices)
  .factory('Ladder', Ladder)

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
  var attributes = ['tournament', 'user', 'battleTag', 'username', 'location',
    'hero', 'player', 'status', 'cancelTimer', 'wins', 'losses', 'mmr', 'points', 'banReason', 'admin'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
};


locationServices.$inject = ['Parse', '$cordovaGeolocation', '$q', '$rootScope'];angular.module('ONOG.Services')

  .service('locationServices', locationServices);

function locationServices (Parse, $cordovaGeolocation, $q, $rootScope) {

  var location = {coords: new Parse.GeoPoint()};
  return {
    location: location,
    getLocation: getLocation,
    setLocation: setLocation
  }
  
  function setLocation (coords) {
    location.coords = new Parse.GeoPoint({latitude: coords.latitude, longitude: coords.longitude})
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


MatchServices.$inject = ['Parse', 'Match', '$q'];
Match.$inject = ['Parse'];angular.module('ONOG.Services')

  .service('MatchServices', MatchServices)
  .factory('Match', Match);

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
    mainQuery.descending("createdAt");
    mainQuery.limit(10);
    if(status) {
      mainQuery.equalTo('status', status);
    }
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

  .service('cameraServices', cameraServices);

function cameraServices () {
  
  var camera = {
    quality: 90,
    targetWidth: 320,
    targetHeight: 500,
    allowEdit: true,
    destinationType: Camera.DestinationType.DATA_URL,
    sourceType: 0,
    encodingType: Camera.EncodingType.JPEG
  }
  
  return {
    camera: camera
  }

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
  ]
  return {
    opponent: opponent,
    heroes: heroes
  }
}


TournamentServices.$inject = ['Parse', '$q', 'Tournament', 'Details', 'Ladder'];
Tournament.$inject = ['Parse'];
Details.$inject = ['Parse'];
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
  var attributes = ['name', 'game', 'status', 'disabled', 'disabledReason', 'location'];
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsInJvdXRlcy9hZG1pbi5yb3V0ZXMuanMiLCJyb3V0ZXMvbGFkZGVyLnJvdXRlcy5qcyIsInJvdXRlcy9tYXRjaC5yb3V0ZXMuanMiLCJjb250cm9sbGVycy9hZG1pbi5tYXRjaGVzLmN0cmwuanMiLCJjb250cm9sbGVycy9hZG1pbi5wbGF5ZXJzLmN0cmwuanMiLCJjb250cm9sbGVycy9hZG1pbi5zZXR0aW5ncy5jdHJsLmpzIiwiY29udHJvbGxlcnMvZGFzaGJvYXJkLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIuam9pbi5jdHJsLmpzIiwiY29udHJvbGxlcnMvbGFkZGVyLmxlYWRlcmJvYXJkLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIucGFzc3dvcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5wcm9maWxlLmN0cmwuanMiLCJjb250cm9sbGVycy9sb2dpbi5jdHJsLmpzIiwiY29udHJvbGxlcnMvbWF0Y2gubGlzdC5jdHJsLmpzIiwiY29udHJvbGxlcnMvbWF0Y2gucmVwb3J0LmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC52aWV3LmN0cmwuanMiLCJjb250cm9sbGVycy9tZW51LmN0cmwuanMiLCJjb250cm9sbGVycy9yZWdpc3Rlci5jdHJsLmpzIiwic2VydmljZXMvbGFkZGVyLnNlcnZpY2VzLmpzIiwic2VydmljZXMvbG9jYXRpb24uc2VydmljZXMuanMiLCJzZXJ2aWNlcy9tYXRjaC5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL3Bob3RvLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7K0VBQUEsUUFBUSxPQUFPLGVBQWU7R0FDM0IsT0FBTzs7QUFFVixTQUFTLFFBQVEsc0JBQXNCLGtCQUFrQixlQUFlOztFQUV0RSxpQkFBaUIsNEJBQTRCO0VBQzdDLGlCQUFpQiwyQkFBMkI7O0VBRTVDLGNBQWMsV0FBVyw0Q0FBNEM7O0VBRXJFLElBQUksTUFBTSxTQUFTLFNBQVM7SUFDMUIscUJBQXFCLFVBQVUsWUFBWTs7O0FBRy9DO0FDZEEsUUFBUSxPQUFPLG9CQUFvQjs7QUFFbkM7QUNGQSxRQUFRLE9BQU8sUUFBUTtFQUNyQjtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7O0FBRUY7OzBEQ1hBLFFBQVEsT0FBTyxlQUFlO0VBQzVCO0VBQ0E7RUFDQTs7R0FFQyxPQUFPOztBQUVWLFNBQVMsUUFBUSxnQkFBZ0Isb0JBQW9COztFQUVuRCxtQkFBbUIsVUFBVTs7RUFFN0I7S0FDRyxNQUFNLE9BQU87TUFDWixLQUFLO01BQ0wsVUFBVTtNQUNWLE9BQU87TUFDUCxhQUFhO01BQ2IsWUFBWTtNQUNaLFNBQVM7UUFDUCw0REFBWSxVQUFVLG9CQUFvQixJQUFJLE9BQU8sUUFBUTtVQUMzRCxJQUFJLEtBQUssR0FBRztVQUNaLG1CQUFtQixnQkFBZ0IsS0FBSyxVQUFVLGFBQWE7WUFDN0QsR0FBRyxZQUFZLFFBQVE7Y0FDckIsR0FBRyxRQUFRLFlBQVk7OztVQUczQixVQUFVLE9BQU87WUFDZixNQUFNLFNBQVM7O1VBRWpCLE9BQU8sR0FBRzs7OztLQUlmLE1BQU0sZUFBZTtNQUNwQixLQUFLO01BQ0wsT0FBTztRQUNMLGVBQWU7VUFDYixhQUFhOzs7O0tBSWxCLE1BQU0saUJBQWlCO01BQ3RCLEtBQUs7TUFDTCxPQUFPO1FBQ0wsZUFBZTtVQUNiLGFBQWE7VUFDYixZQUFZOzs7O0tBSWpCLE1BQU0sYUFBYTtNQUNsQixLQUFLO01BQ0wsT0FBTztNQUNQLE9BQU87UUFDTCxlQUFlO1VBQ2IsYUFBYTtVQUNiLFlBQVk7Ozs7S0FJakIsTUFBTSxnQkFBZ0I7TUFDckIsS0FBSztNQUNMLE9BQU87TUFDUCxPQUFPO1FBQ0wsZUFBZTtVQUNiLGFBQWE7VUFDYixZQUFZOzs7O0tBSWpCLE1BQU0sYUFBYTtNQUNsQixLQUFLO01BQ0wsT0FBTztNQUNQLE9BQU87UUFDTCxlQUFlO1VBQ2IsYUFBYTtVQUNiLFlBQVk7Ozs7Ozs7QUFPdEI7O2lKQ25GQSxRQUFRLE9BQU87R0FDWixTQUFTLFVBQVU7R0FDbkIsSUFBSTs7QUFFUCxTQUFTLEtBQUssZ0JBQWdCLFFBQVEsWUFBWSxlQUFlLGFBQWEsa0JBQWtCLGVBQWUsaUJBQWlCO0VBQzlILGVBQWUsTUFBTSxXQUFXO0lBQzlCLEdBQUcsT0FBTyxXQUFXLE9BQU8sUUFBUSxRQUFRLFVBQVU7OztNQUdwRCxRQUFRLFFBQVEsU0FBUyx5QkFBeUI7Ozs7O01BS2xELFFBQVEsUUFBUSxTQUFTLGNBQWM7O0lBRXpDLEdBQUcsT0FBTyxXQUFXO01BQ25CLFVBQVU7O0lBRVosSUFBSSxPQUFPLGdCQUFnQjs7SUFFM0IsSUFBSSxXQUFXLGdCQUFnQjs7SUFFL0IsSUFBSSxZQUFZLGdCQUFnQjs7SUFFaEMsUUFBUSxJQUFJOztJQUVaLFdBQVcsSUFBSSwwQkFBMEIsU0FBUyxPQUFPLGFBQWE7TUFDcEUsSUFBSSxjQUFjOzs7O0lBSXBCLFdBQVcsSUFBSSwyQkFBMkIsU0FBUyxPQUFPLGFBQWE7TUFDckUsSUFBSSxlQUFlO01BQ25CLFlBQVksTUFBTTtVQUNkLE9BQU87VUFDUCxTQUFTOztTQUVWLEtBQUssU0FBUyxRQUFRO1VBQ3JCLE1BQU0sU0FBUzs7Ozs7O0lBTXJCLFdBQVcsSUFBSSxnQkFBZ0IsV0FBVztNQUN4QyxjQUFjLEtBQUssQ0FBQyxVQUFVLGtFQUFrRSxjQUFjLE1BQU0sV0FBVzs7O0lBR2pJLFdBQVcsSUFBSSxnQkFBZ0IsV0FBVztNQUN4QyxjQUFjOzs7SUFHaEIsZUFBZSxHQUFHLFVBQVUsVUFBVTs7TUFFcEMsT0FBTyxHQUFHLGlCQUFpQixDQUFDLFFBQVE7Ozs7SUFJdEMsR0FBRyxPQUFPLGlCQUFpQjtNQUN6QixRQUFRLElBQUk7TUFDWixnQkFBZ0IsR0FBRyxhQUFhLFNBQVMsR0FBRztRQUMxQyxRQUFRLElBQUk7UUFDWixHQUFHLENBQUMsR0FBRyxPQUFPO1VBQ1osWUFBWSxNQUFNO1lBQ2hCLE9BQU87WUFDUCxVQUFVLDZCQUE2QixHQUFHLFFBQVE7YUFDakQsS0FBSyxTQUFTLEtBQUs7OztlQUdqQjtVQUNMLFFBQVEsR0FBRztZQUNULEtBQUs7Y0FDSCxPQUFPLEdBQUcsaUJBQWlCLENBQUMsUUFBUTtjQUNwQztZQUNGLEtBQUs7Y0FDSCxPQUFPLEdBQUcsaUJBQWlCLENBQUMsUUFBUTtjQUNwQztZQUNGLEtBQUs7Y0FDSCxZQUFZLE1BQU07Z0JBQ2hCLE9BQU87Z0JBQ1AsVUFBVTtpQkFDVCxLQUFLLFNBQVMsS0FBSztnQkFDcEIsT0FBTyxHQUFHLGlCQUFpQixDQUFDLFFBQVE7O2NBRXRDOzs7Ozs7SUFNVixpQkFBaUIsY0FBYyxLQUFLLFVBQVUsVUFBVTtNQUN0RCxpQkFBaUIsWUFBWTtNQUM3QixjQUFjLGdCQUFnQjtRQUM1QixhQUFhOztNQUVmLE9BQU8sR0FBRztPQUNULFVBQVUsS0FBSztNQUNoQixHQUFHLGFBQWEsVUFBVSxjQUFjO1FBQ3RDLFVBQVUsYUFBYTs7Ozs7O0FBTS9CO0FDekdBLFFBQVEsT0FBTyxpQkFBaUI7O0FBRWhDOzt5Q0NGQSxRQUFRLE9BQU8scUJBQXFCO0dBQ2pDLE9BQU87O0FBRVYsU0FBUyxhQUFhLGdCQUFnQjs7RUFFcEM7S0FDRyxNQUFNLGFBQWE7TUFDbEIsS0FBSztNQUNMLFVBQVU7TUFDVixPQUFPO01BQ1AsT0FBTztRQUNMLGVBQWU7VUFDYixhQUFhOzs7O0tBSWxCLE1BQU0sc0JBQXNCO01BQzNCLEtBQUs7TUFDTCxPQUFPO01BQ1AsYUFBYTtNQUNiLFlBQVk7TUFDWixTQUFTO1FBQ1AsZ0NBQVMsVUFBVSxvQkFBb0I7VUFDckMsT0FBTyxtQkFBbUI7O1FBRTVCLGlEQUFlLFVBQVUsb0JBQW9CLFNBQVM7VUFDcEQsR0FBRyxRQUFRLFFBQVE7WUFDakIsT0FBTyxRQUFRO2lCQUNWO1lBQ0wsT0FBTyxtQkFBbUI7Ozs7O0tBS2pDLE1BQU0scUJBQXFCO01BQzFCLEtBQUs7TUFDTCxPQUFPO01BQ1AsYUFBYTtNQUNiLFlBQVk7OztBQUdsQjs7MENDekNBLFFBQVEsT0FBTyxzQkFBc0I7R0FDbEMsT0FBTzs7QUFFVixTQUFTLGNBQWMsZ0JBQWdCOztFQUVyQztLQUNHLE1BQU0sY0FBYztNQUNuQixLQUFLO01BQ0wsVUFBVTtNQUNWLE9BQU87TUFDUCxPQUFPO1FBQ0wsZUFBZTtVQUNiLGFBQWE7Ozs7S0FJbEIsTUFBTSwwQkFBMEI7TUFDL0IsS0FBSztNQUNMLE9BQU87TUFDUCxhQUFhO01BQ2IsWUFBWTs7S0FFYixNQUFNLG1CQUFtQjtNQUN4QixLQUFLO01BQ0wsT0FBTztNQUNQLGFBQWE7TUFDYixZQUFZOztLQUViLE1BQU0sc0JBQXNCO01BQzNCLEtBQUs7TUFDTCxPQUFPO01BQ1AsYUFBYTtNQUNiLFlBQVk7TUFDWixTQUFTO1FBQ1Asa0RBQVEsVUFBVSxPQUFPLGdCQUFnQixZQUFZO1VBQ25ELE9BQU8sZUFBZSxVQUFVLFdBQVcsWUFBWSxNQUFNLEtBQUs7Ozs7O0FBSzVFOzt5Q0N4Q0EsUUFBUSxPQUFPLHVCQUF1QjtHQUNuQyxPQUFPOztBQUVWLFNBQVMsYUFBYSxnQkFBZ0I7O0VBRXBDO0tBQ0csTUFBTSxhQUFhO01BQ2xCLEtBQUs7TUFDTCxVQUFVO01BQ1YsT0FBTztRQUNMLGVBQWU7VUFDYixhQUFhOzs7O0tBSWxCLE1BQU0sa0JBQWtCO01BQ3ZCLEtBQUs7TUFDTCxhQUFhO01BQ2IsWUFBWTtNQUNaLE9BQU87TUFDUCxTQUFTO1FBQ1Asa0RBQVEsVUFBVSxPQUFPLGdCQUFnQixZQUFZO1VBQ25ELE9BQU8sZUFBZSxVQUFVLFdBQVcsWUFBWSxNQUFNLEtBQUs7Ozs7S0FJdkUsTUFBTSxrQkFBa0I7TUFDdkIsS0FBSztNQUNMLGFBQWE7TUFDYixZQUFZOztLQUViLE1BQU0sb0JBQW9CO01BQ3pCLEtBQUs7TUFDTCxPQUFPO01BQ1AsYUFBYTtNQUNiLFlBQVk7TUFDWixTQUFTO1FBQ1AsMENBQVEsVUFBVSxlQUFlLGNBQWM7VUFDN0MsT0FBTyxjQUFjLFNBQVMsYUFBYTs7Ozs7QUFLckQ7O2dEQzNDQTtBQUNBLFFBQVEsT0FBTzs7R0FFWixXQUFXLG9CQUFvQjs7QUFFbEMsU0FBUyxpQkFBaUIsUUFBUSxPQUFPOztDQUV4QztBQUNEOztnRENSQTtBQUNBLFFBQVEsT0FBTzs7R0FFWixXQUFXLG9CQUFvQjs7QUFFbEMsU0FBUyxpQkFBaUIsUUFBUSxPQUFPOztDQUV4QztBQUNEOzsyRkNSQTtBQUNBLFFBQVEsT0FBTzs7R0FFWixXQUFXLHFCQUFxQjs7QUFFbkMsU0FBUyxrQkFBa0IsUUFBUSxrQkFBa0IsZUFBZSxZQUFZO0VBQzlFLE9BQU8sVUFBVTs7RUFFakIsT0FBTyxhQUFhLFdBQVc7O0VBRS9CLE9BQU8sd0JBQXdCLFlBQVk7SUFDekMsaUJBQWlCLGNBQWMsS0FBSyxVQUFVLFVBQVU7TUFDdEQsSUFBSSxRQUFRLElBQUksTUFBTSxTQUFTLENBQUMsVUFBVSxTQUFTLFVBQVUsV0FBVyxTQUFTO01BQ2pGLE9BQU8sV0FBVyxJQUFJLFlBQVk7TUFDbEMsT0FBTyxXQUFXLE9BQU8sS0FBSyxVQUFVLFlBQVk7UUFDbEQsT0FBTyxhQUFhO1FBQ3BCLE1BQU07Ozs7O0NBS2I7QUFDRDs7OE1DdEJBO0FBQ0EsUUFBUSxPQUFPOztHQUVaLFdBQVcsaUJBQWlCOztBQUUvQixTQUFTO0VBQ1AsUUFBUSxRQUFRLFNBQVMsVUFBVSxXQUFXLGFBQWE7RUFDM0QsT0FBTyxZQUFZLGVBQWUsZUFBZSxnQkFBZ0I7RUFDakU7RUFDQSxJQUFJLFVBQVU7RUFDZCxPQUFPLGFBQWEsV0FBVztFQUMvQixPQUFPLE9BQU8sTUFBTTs7RUFFcEIsT0FBTyxNQUFNO0lBQ1gsU0FBUztJQUNULE1BQU0sV0FBVyxTQUFTLE9BQU87OztFQUduQyxPQUFPLFdBQVcsaUJBQWlCO0VBQ25DLE9BQU8sV0FBVyxjQUFjO0VBQ2hDLE9BQU8sV0FBVyxjQUFjO0VBQ2hDLE9BQU8sYUFBYSxDQUFDLEtBQUs7O0VBRTFCLE9BQU8sSUFBSSxvQkFBb0IsU0FBUyxPQUFPO0lBQzdDLEdBQUcsYUFBYSxVQUFVLGNBQWM7TUFDdEMsVUFBVSxhQUFhOztJQUV6QixlQUFlLFVBQVUsT0FBTyxZQUFZLE9BQU8sS0FBSyxXQUFXLEtBQUssVUFBVSxTQUFTO01BQ3pGLE9BQU8sU0FBUyxRQUFRO01BQ3hCLE9BQU8sT0FBTyxJQUFJLFlBQVksT0FBTyxTQUFTO01BQzlDLE9BQU8sT0FBTyxPQUFPLEtBQUssVUFBVSxRQUFRO1FBQzFDLE9BQU8sU0FBUztRQUNoQixjQUFjLGVBQWUsT0FBTyxRQUFRLEtBQUssVUFBVSxTQUFTO1VBQ2xFLEdBQUcsUUFBUSxRQUFRO1lBQ2pCLE9BQU8sUUFBUSxRQUFRO1lBQ3ZCOztVQUVGO1VBQ0E7VUFDQSxPQUFPLFdBQVc7Ozs7OztFQU0xQixPQUFPLFlBQVksV0FBVztJQUM1QixPQUFPLE9BQU87O0VBRWhCLE9BQU8sYUFBYSxZQUFZO0lBQzlCLEdBQUcsT0FBTyxJQUFJLFNBQVM7TUFDckIsT0FBTyxPQUFPLElBQUksVUFBVTtNQUM1Qjs7O0VBR0osT0FBTyxjQUFjLFlBQVk7SUFDL0IsT0FBTyxPQUFPLElBQUksVUFBVTtJQUM1QixPQUFPO0lBQ1A7OztFQUdGLE9BQU8sZ0JBQWdCLFlBQVk7SUFDakMsT0FBTyxNQUFNLFFBQVEsS0FBSyxVQUFVLE9BQU87TUFDekMsT0FBTyxRQUFRO01BQ2YsUUFBUSxPQUFPLE1BQU0sSUFBSTtRQUN2QixLQUFLO1VBQ0g7VUFDQTtRQUNGLEtBQUs7VUFDSDtVQUNBOzs7OztFQUtSLE9BQU8sT0FBTyxXQUFXO0lBQ3ZCLFVBQVUsT0FBTzs7O0VBR25CLE9BQU8sZ0JBQWdCLFdBQVc7SUFDaEMsT0FBTztJQUNQLFVBQVUsVUFBVSxZQUFZLENBQUMsZUFBZTs7O0VBR2xELE9BQU8sWUFBWSxXQUFXO0lBQzVCLE9BQU8sT0FBTyxJQUFJLFVBQVU7SUFDNUI7OztFQUdGLE9BQU8sV0FBVyxZQUFZO0lBQzVCLFNBQVMsT0FBTzs7O0VBR2xCLE9BQU8sSUFBSSxZQUFZLFdBQVc7SUFDaEMsT0FBTzs7O0VBR1QsT0FBTyxJQUFJLFdBQVcsWUFBWTtJQUNoQyxRQUFRLElBQUk7OztFQUdkLFNBQVMsbUJBQW1CO0lBQzFCLEdBQUcsT0FBTyxpQkFBaUI7TUFDekIsZ0JBQWdCLFVBQVUsT0FBTyxPQUFPLFVBQVUsU0FBUyxLQUFLO1FBQzlELFFBQVEsSUFBSSxlQUFlLE9BQU8sT0FBTztTQUN4QyxTQUFTLEdBQUc7UUFDYixRQUFRLElBQUk7OztJQUdoQixJQUFJLGVBQWUsT0FBTyxPQUFPLElBQUk7SUFDckMsR0FBRyxjQUFjO01BQ2YsSUFBSSxRQUFRLElBQUksTUFBTSxNQUFNO01BQzVCLE1BQU0sWUFBWSxZQUFZLGNBQWM7TUFDNUMsTUFBTSxNQUFNO01BQ1osTUFBTSxLQUFLO1FBQ1QsU0FBUyxTQUFTLGVBQWU7VUFDL0IsUUFBUSxJQUFJO1VBQ1osR0FBRyxPQUFPLG1CQUFtQixjQUFjLFFBQVE7WUFDakQsZ0JBQWdCLFVBQVUsWUFBWSxTQUFTLEtBQUs7Y0FDbEQsUUFBUSxJQUFJO2VBQ1gsU0FBUyxHQUFHO2NBQ2IsUUFBUSxJQUFJOzs7Ozs7O0VBT3hCLFNBQVMsWUFBWTtJQUNuQixTQUFTLFlBQVk7TUFDbkIsT0FBTyxPQUFPLFFBQVEsS0FBSyxVQUFVLFFBQVE7UUFDM0M7O09BRUQ7OztFQUdMLFNBQVMsU0FBUztJQUNoQixHQUFHLE9BQU8sUUFBUTtNQUNoQixRQUFRLE9BQU8sT0FBTyxJQUFJO1FBQ3hCLEtBQUs7VUFDSCxPQUFPO1VBQ1A7UUFDRixLQUFLO1VBQ0gsT0FBTztVQUNQO1VBQ0E7UUFDRixLQUFLO1VBQ0g7UUFDRixLQUFLO1VBQ0g7VUFDQTtRQUNGLEtBQUs7VUFDSDtVQUNBO1FBQ0YsS0FBSztVQUNIO1VBQ0E7UUFDRixLQUFLO1VBQ0g7VUFDQTs7TUFFSixRQUFRLElBQUksT0FBTyxPQUFPLElBQUk7Ozs7RUFJbEMsU0FBUyxTQUFTO0lBQ2hCLElBQUksTUFBTTtJQUNWLElBQUksT0FBTyxPQUFPLE1BQU0sSUFBSTtJQUM1QixHQUFHLE1BQU07TUFDUCxJQUFJLGNBQWMsT0FBTyxNQUFNLElBQUksR0FBRztNQUN0QyxPQUFPLElBQUksT0FBTyxXQUFXLFlBQVksT0FBTztNQUNoRCxPQUFPLElBQUksVUFBVSxJQUFJLFFBQVEsYUFBYTs7OztFQUlsRCxTQUFTLGNBQWM7SUFDckIsT0FBTyxPQUFPLE9BQU8sS0FBSyxVQUFVLFFBQVE7TUFDMUMsT0FBTyxTQUFTO01BQ2hCOzs7O0VBSUosU0FBUyxjQUFjO0lBQ3JCLFNBQVMsWUFBWTtNQUNuQixNQUFNLE1BQU0sSUFBSSxlQUFlLEtBQUssVUFBVSxJQUFJO1FBQ2hELFFBQVEsSUFBSTtRQUNaLGNBQWMsZUFBZSxPQUFPLFFBQVEsS0FBSyxVQUFVLFNBQVM7VUFDbEUsR0FBRyxRQUFRLFFBQVE7WUFDakIsT0FBTyxRQUFRLFFBQVE7O1VBRXpCOzs7T0FHSDs7O0VBR0wsU0FBUyxxQkFBcUI7SUFDNUIsWUFBWSxNQUFNO01BQ2hCLE9BQU87TUFDUCxVQUFVO09BQ1QsS0FBSyxTQUFTLEtBQUs7TUFDcEIsT0FBTyxPQUFPLElBQUksVUFBVTtNQUM1Qjs7OztFQUlKLFNBQVMsZ0JBQWdCO0lBQ3ZCLElBQUksT0FBTyxPQUFPLFdBQVcsV0FBVztNQUN0QyxPQUFPLE1BQU0sSUFBSSxZQUFZO1dBQ3hCO01BQ0wsT0FBTyxNQUFNLElBQUksWUFBWTs7SUFFL0IsT0FBTyxNQUFNLE9BQU8sS0FBSyxVQUFVLE9BQU87TUFDeEMsT0FBTyxRQUFRO01BQ2YsT0FBTyxPQUFPLElBQUksVUFBVTtNQUM1Qjs7OztFQUlKLFNBQVMscUJBQXFCO0lBQzVCLFNBQVMsWUFBWTtNQUNuQixHQUFHLE9BQU8sTUFBTSxJQUFJLGNBQWMsVUFBVTtRQUMxQyxPQUFPLEdBQUc7O09BRVg7OztFQUdMLFNBQVMsc0JBQXNCO0lBQzdCLE1BQU0sTUFBTSxJQUFJLGdCQUFnQixLQUFLLFVBQVUsS0FBSztNQUNsRCxjQUFjLE1BQU07TUFDcEIsY0FBYyxPQUFPOzs7O0VBSXpCLFNBQVMsZUFBZSxTQUFTLGdCQUFnQjtJQUMvQyxTQUFTLFlBQVk7TUFDbkIsR0FBRyxPQUFPLE9BQU8sSUFBSSxjQUFjLGFBQWE7UUFDOUMsT0FBTyxNQUFNLFFBQVEsS0FBSyxVQUFVLE9BQU87VUFDekMsT0FBTyxRQUFRO1VBQ2YsaUJBQWlCOzs7T0FHcEI7OztFQUdMLFNBQVMsaUJBQWlCLGdCQUFnQjtJQUN4QyxRQUFRLE9BQU8sTUFBTSxJQUFJO01BQ3ZCLEtBQUs7UUFDSCxHQUFHLGdCQUFnQjtVQUNqQixPQUFPLE9BQU8sSUFBSSxVQUFVO1VBQzVCOztRQUVGO01BQ0YsS0FBSztRQUNILE9BQU8sT0FBTyxJQUFJLFVBQVU7UUFDNUIsV0FBVyxXQUFXO1FBQ3RCLE9BQU8sT0FBTyxPQUFPLEtBQUssWUFBWTtVQUNwQyxXQUFXLFdBQVc7VUFDdEIsT0FBTyxHQUFHOztRQUVaO01BQ0YsS0FBSztRQUNILE9BQU8sT0FBTyxJQUFJLFVBQVU7UUFDNUI7UUFDQTtNQUNGLEtBQUs7UUFDSCxPQUFPLE9BQU8sSUFBSSxVQUFVO1FBQzVCO1FBQ0E7Ozs7O0VBS04sU0FBUyxjQUFjO0lBQ3JCLFlBQVksS0FBSztNQUNmLE9BQU87TUFDUCxVQUFVO01BQ1YsU0FBUztRQUNQO1VBQ0UsTUFBTTtVQUNOLE1BQU07VUFDTixPQUFPLFNBQVMsR0FBRztZQUNqQixPQUFPOzs7UUFHWDtVQUNFLE1BQU07VUFDTixNQUFNO1VBQ04sT0FBTyxTQUFTLEdBQUc7WUFDakIsT0FBTzs7OztPQUlaLEtBQUssU0FBUyxLQUFLO01BQ3BCLEdBQUcsS0FBSztRQUNOLE9BQU8sT0FBTyxJQUFJLFVBQVU7UUFDNUIsT0FBTyxNQUFNLElBQUksVUFBVTtRQUMzQixPQUFPLE1BQU0sT0FBTyxLQUFLLFlBQVk7VUFDbkM7O2FBRUc7UUFDTCxPQUFPLE9BQU8sSUFBSSxVQUFVO1FBQzVCLE9BQU8sTUFBTSxJQUFJLFVBQVU7UUFDM0IsT0FBTyxNQUFNLE9BQU8sS0FBSyxZQUFZO1VBQ25DOzs7Ozs7RUFNUixTQUFTLGVBQWU7SUFDdEIsR0FBRyxPQUFPLE1BQU0sSUFBSSxjQUFjLGFBQWE7TUFDN0MsT0FBTyxPQUFPLElBQUksVUFBVTtNQUM1Qjs7OztFQUlKLFNBQVMsY0FBYztJQUNyQixPQUFPLFdBQVcsT0FBTyxPQUFPLFNBQVMsS0FBSyxLQUFLLE1BQU0sS0FBSyxTQUFTLE9BQU8sU0FBUyxLQUFLO0dBQzdGO0NBQ0Y7QUFDRDs7eUlDaFVBO0FBQ0EsUUFBUSxPQUFPOztHQUVaLFdBQVcsa0JBQWtCOztBQUVoQyxTQUFTO0VBQ1AsUUFBUSxTQUFTLGFBQWEsUUFBUSxlQUFlLElBQUksUUFBUSxZQUFZO0VBQzdFO0VBQ0EsY0FBYyxnQkFBZ0I7SUFDNUIsYUFBYTs7RUFFZixPQUFPLGFBQWEsV0FBVztFQUMvQixPQUFPLE9BQU8sTUFBTSxLQUFLO0VBQ3pCLE9BQU8sU0FBUztJQUNkLFdBQVc7OztFQUdiLE9BQU8saUJBQWlCLFlBQVk7SUFDbEMsb0JBQW9CO01BQ2xCLFVBQVUsS0FBSztRQUNiLE9BQU8sT0FBTyxXQUFXLE9BQU8sS0FBSztRQUNyQyxPQUFPLE9BQU8sU0FBUztRQUN2QixlQUFlLGVBQWUsT0FBTyxZQUFZLE9BQU8sTUFBTSxPQUFPLFFBQVEsS0FBSyxVQUFVLFFBQVE7VUFDbEcsYUFBYSxRQUFRLEtBQUssU0FBUyxLQUFLO1lBQ3RDLE9BQU8sR0FBRzs7OztNQUloQixVQUFVLE9BQU87UUFDZixXQUFXOzs7O0VBSWpCLFNBQVMscUJBQXFCO0lBQzVCLElBQUksS0FBSyxHQUFHO0lBQ1osSUFBSSxNQUFNLE9BQU8sT0FBTzs7SUFFeEIsR0FBRyxJQUFJLFNBQVMsR0FBRztNQUNqQixHQUFHLE9BQU87TUFDVixPQUFPLEdBQUc7O0lBRVosSUFBSSxRQUFRLElBQUksTUFBTTtJQUN0QixHQUFHLE1BQU0sV0FBVyxHQUFHO01BQ3JCLEdBQUcsT0FBTztNQUNWLE9BQU8sR0FBRzs7SUFFWixHQUFHLE1BQU0sR0FBRyxTQUFTLEtBQUssTUFBTSxHQUFHLFNBQVMsR0FBRztNQUM3QyxHQUFHLE9BQU87TUFDVixPQUFPLEdBQUc7O0lBRVosR0FBRyxNQUFNLE1BQU0sS0FBSztNQUNsQixHQUFHLE9BQU87TUFDVixPQUFPLEdBQUc7O0lBRVosZUFBZSxlQUFlLE9BQU8sV0FBVyxZQUFZLEtBQUssS0FBSyxVQUFVLFNBQVM7TUFDdkYsR0FBRyxRQUFRLFFBQVE7UUFDakIsR0FBRyxPQUFPO2FBQ0w7UUFDTCxHQUFHLFFBQVE7OztJQUdmLE9BQU8sR0FBRztHQUNYOztFQUVELFNBQVMsWUFBWSxTQUFTO0lBQzVCLE9BQU8sWUFBWSxNQUFNO01BQ3ZCLE9BQU87TUFDUCxVQUFVOztHQUViOztFQUVELFNBQVMsY0FBYyxRQUFRO0lBQzdCLE9BQU8sWUFBWSxNQUFNO01BQ3ZCLE9BQU8scUJBQXFCLE9BQU8sV0FBVztNQUM5QyxVQUFVOztHQUViO0NBQ0Y7QUFDRDs7MEdDOUVBO0FBQ0EsUUFBUSxPQUFPOztHQUVaLFdBQVcsb0JBQW9COztBQUVsQyxTQUFTLGlCQUFpQixRQUFRLGdCQUFnQixZQUFZLE9BQU8sU0FBUyxhQUFhO0VBQ3pGLE9BQU8sT0FBTyxNQUFNO0VBQ3BCO0VBQ0EsT0FBTyxZQUFZLFlBQVk7SUFDN0I7OztFQUdGLFNBQVMsYUFBYTtJQUNwQixlQUFlLFdBQVcsV0FBVyxZQUFZLEtBQUssVUFBVSxTQUFTO01BQ3ZFLElBQUksT0FBTztNQUNYLFFBQVEsUUFBUSxTQUFTLFVBQVUsUUFBUTtRQUN6QyxPQUFPLE9BQU87UUFDZDs7TUFFRixPQUFPLFVBQVU7TUFDakIsT0FBTyxXQUFXOzs7Q0FHdkI7QUFDRDs7MkZDeEJBO0FBQ0EsUUFBUSxPQUFPOztHQUVaLFdBQVcscUJBQXFCOztBQUVuQyxTQUFTO0NBQ1IsUUFBUSxhQUFhLFFBQVEsZUFBZSxPQUFPOztFQUVsRCxjQUFjLGdCQUFnQjtJQUM1QixhQUFhOztFQUVmLE9BQU8sUUFBUTs7RUFFZixPQUFPLGdCQUFnQixVQUFVLE9BQU87SUFDdEMsTUFBTSxLQUFLLHFCQUFxQixNQUFNLE1BQU07TUFDMUMsU0FBUyxXQUFXO1FBQ2xCOztNQUVGLE9BQU8sU0FBUyxPQUFPOztRQUVyQixXQUFXLE1BQU07Ozs7Ozs7RUFPdkIsU0FBUyxZQUFZLFNBQVM7SUFDNUIsT0FBTyxZQUFZLE1BQU07TUFDdkIsT0FBTztNQUNQLFVBQVU7O0dBRWI7O0VBRUQsU0FBUyxjQUFjLFFBQVE7SUFDN0IsT0FBTyxZQUFZLE1BQU07TUFDdkIsT0FBTztNQUNQLFVBQVU7T0FDVCxLQUFLLFVBQVUsS0FBSztNQUNyQixPQUFPLEdBQUc7O0dBRWI7Q0FDRjtBQUNEOztzSkMzQ0E7QUFDQSxRQUFRLE9BQU87O0dBRVosV0FBVyxxQkFBcUI7O0FBRW5DLFNBQVM7RUFDUCxRQUFRLFNBQVMsYUFBYSxRQUFRLGVBQWUsSUFBSSxRQUFRLFlBQVksZ0JBQWdCO0VBQzdGOztFQUVBLGNBQWMsZ0JBQWdCO0lBQzVCLGFBQWE7O0VBRWYsT0FBTyxhQUFhLFdBQVc7RUFDL0IsT0FBTyxPQUFPLE1BQU0sS0FBSztFQUN6QixPQUFPLFNBQVMsT0FBTzs7RUFFdkIsT0FBTyxpQkFBaUIsWUFBWTtJQUNsQyxvQkFBb0I7TUFDbEIsVUFBVSxLQUFLO1FBQ2IsT0FBTyxPQUFPLE9BQU8sS0FBSyxZQUFZO1VBQ3BDLGFBQWEsUUFBUSxLQUFLLFNBQVMsS0FBSztZQUN0QyxPQUFPLEdBQUc7Ozs7TUFJaEIsVUFBVSxPQUFPO1FBQ2YsV0FBVzs7OztFQUlqQixTQUFTLHFCQUFxQjtJQUM1QixJQUFJLEtBQUssR0FBRztJQUNaLElBQUksTUFBTSxPQUFPLE9BQU87O0lBRXhCLEdBQUcsSUFBSSxTQUFTLEdBQUc7TUFDakIsR0FBRyxPQUFPO01BQ1YsT0FBTyxHQUFHOztJQUVaLElBQUksUUFBUSxJQUFJLE1BQU07SUFDdEIsR0FBRyxNQUFNLFdBQVcsR0FBRztNQUNyQixHQUFHLE9BQU87TUFDVixPQUFPLEdBQUc7O0lBRVosR0FBRyxNQUFNLEdBQUcsU0FBUyxLQUFLLE1BQU0sR0FBRyxTQUFTLEdBQUc7TUFDN0MsR0FBRyxPQUFPO01BQ1YsT0FBTyxHQUFHOztJQUVaLEdBQUcsTUFBTSxNQUFNLEtBQUs7TUFDbEIsR0FBRyxPQUFPO01BQ1YsT0FBTyxHQUFHOztJQUVaLGVBQWUsZUFBZSxPQUFPLFdBQVcsWUFBWSxLQUFLLEtBQUssVUFBVSxTQUFTO01BQ3ZGLEdBQUcsUUFBUSxRQUFRO1FBQ2pCLEdBQUcsT0FBTzthQUNMO1FBQ0wsR0FBRyxRQUFROzs7SUFHZixPQUFPLEdBQUc7R0FDWDs7RUFFRCxTQUFTLFlBQVksU0FBUztJQUM1QixPQUFPLFlBQVksTUFBTTtNQUN2QixPQUFPO01BQ1AsVUFBVTs7R0FFYjs7RUFFRCxTQUFTLGNBQWMsUUFBUTtJQUM3QixPQUFPLFlBQVksTUFBTTtNQUN2QixPQUFPLHFCQUFxQixPQUFPLFdBQVc7TUFDOUMsVUFBVTs7R0FFYjtDQUNGO0FBQ0Q7O29FQzNFQTtBQUNBLFFBQVEsT0FBTzs7R0FFWixXQUFXLGFBQWE7O0FBRTNCLFNBQVMsVUFBVSxRQUFRLFFBQVEsT0FBTyxlQUFlO0VBQ3ZELE9BQU8sT0FBTztFQUNkLE1BQU0sS0FBSztFQUNYLE9BQU8sWUFBWSxZQUFZO0lBQzdCLE1BQU0sS0FBSyxNQUFNLE9BQU8sS0FBSyxVQUFVLE9BQU8sS0FBSyxVQUFVO01BQzNELFNBQVMsU0FBUyxNQUFNO1FBQ3RCLGNBQWMsZ0JBQWdCO1VBQzVCLGFBQWE7OztRQUdmLE9BQU8sR0FBRzs7TUFFWixPQUFPLFVBQVUsTUFBTSxPQUFPO1FBQzVCLE9BQU8sVUFBVSxNQUFNOzs7O0VBSTdCLE9BQU8sT0FBTyxRQUFRLFNBQVMsUUFBUSxPQUFPO0lBQzVDLE9BQU8sVUFBVTtLQUNoQjtDQUNKO0FBQ0Q7OytHQzFCQTtBQUNBLFFBQVEsT0FBTzs7R0FFWixXQUFXLGlCQUFpQjs7QUFFL0IsU0FBUztFQUNQLFFBQVEsUUFBUSxhQUFhLFlBQVksT0FBTyxlQUFlO0VBQy9EO0VBQ0EsT0FBTyxVQUFVO0VBQ2pCLE9BQU8sU0FBUyxPQUFPOztFQUV2QixHQUFHLE9BQU8sUUFBUTtJQUNoQixXQUFXLFdBQVc7SUFDdEIsY0FBYyxpQkFBaUIsT0FBTyxRQUFRLE1BQU0sS0FBSyxVQUFVLFNBQVM7TUFDMUUsUUFBUSxJQUFJO01BQ1osT0FBTyxVQUFVO01BQ2pCLGNBQWMsaUJBQWlCLE9BQU8sUUFBUSxZQUFZLEtBQUssVUFBVSxVQUFVO1FBQ2pGLE9BQU8sV0FBVztRQUNsQixXQUFXLFdBQVc7Ozs7OztFQU01QixPQUFPLGVBQWUsVUFBVSxPQUFPO0lBQ3JDLEdBQUcsTUFBTSxPQUFPLE9BQU8sT0FBTyxPQUFPLElBQUk7TUFDdkM7O0lBRUYsR0FBRyxNQUFNLE1BQU0sT0FBTyxPQUFPLE9BQU8sSUFBSTtNQUN0QyxHQUFHLE1BQU0sYUFBYTtRQUNwQjs7O0lBR0osR0FBRyxPQUFPLFNBQVMsUUFBUTtNQUN6QjtNQUNBOztJQUVGLEdBQUcsTUFBTSxXQUFXLGFBQWE7TUFDL0I7O0lBRUYsT0FBTyxHQUFHLG9CQUFvQixDQUFDLElBQUksTUFBTTs7O0VBRzNDLFNBQVMsZUFBZTtJQUN0QixZQUFZLE1BQU07TUFDaEIsT0FBTztNQUNQLFVBQVU7T0FDVCxLQUFLLFlBQVk7Ozs7Q0FJdkI7QUFDRDs7b0pDcERBO0FBQ0EsUUFBUSxPQUFPOztHQUVaLFdBQVcsbUJBQW1COztBQUVqQyxTQUFTO0VBQ1AsUUFBUSxRQUFRLFlBQVksYUFBYTtFQUN6QyxPQUFPLGVBQWUsZ0JBQWdCO0VBQ3RDOztFQUVBLE9BQU8sUUFBUTs7RUFFZixPQUFPLFVBQVU7O0VBRWpCLElBQUksWUFBWSxJQUFJLE1BQU07RUFDMUIsSUFBSSxZQUFZOztFQUVoQixPQUFPLGFBQWEsV0FBVztJQUM3QixJQUFJLFVBQVUsZUFBZTtJQUM3QixVQUFVLE9BQU8sV0FBVyxVQUFVLE9BQU87O0VBRS9DLElBQUksWUFBWSxTQUFTLFdBQVc7SUFDbEMsT0FBTyxVQUFVLDJCQUEyQjtJQUM1QyxZQUFZO0lBQ1osT0FBTzs7RUFFVCxJQUFJLFNBQVMsU0FBUyxHQUFHO0lBQ3ZCLFFBQVEsSUFBSSxhQUFhOzs7RUFHM0IsT0FBTyxnQkFBZ0IsVUFBVSxNQUFNO0lBQ3JDLEdBQUcsV0FBVztNQUNaLFlBQVksSUFBSSxNQUFNLEtBQUssY0FBYyxDQUFDLE9BQU87V0FDNUM7TUFDTCxZQUFZOztJQUVkLE9BQU8sTUFBTSxJQUFJLGVBQWU7SUFDaEMsT0FBTyxNQUFNLElBQUksVUFBVTtJQUMzQixPQUFPLE1BQU0sT0FBTyxLQUFLLFVBQVUsT0FBTztNQUN4QyxjQUFjLGdCQUFnQjtRQUM1QixhQUFhOztNQUVmLFlBQVksTUFBTTtRQUNoQixPQUFPO1FBQ1AsVUFBVTtTQUNULEtBQUssWUFBWTtRQUNsQixPQUFPLEdBQUc7Ozs7OztDQU1qQjtBQUNEOztxTUNyREE7QUFDQSxRQUFRLE9BQU87O0dBRVosV0FBVyxpQkFBaUI7O0FBRS9CLFNBQVM7RUFDUCxRQUFRLFFBQVEsWUFBWSxhQUFhLGVBQWU7RUFDeEQsT0FBTyxnQkFBZ0IsZUFBZSxlQUFlLGdCQUFnQjtFQUNyRTs7RUFFQSxJQUFJLFlBQVksSUFBSSxNQUFNO0VBQzFCLElBQUksWUFBWTs7RUFFaEIsT0FBTyxhQUFhLFdBQVc7RUFDL0IsT0FBTyxPQUFPLE1BQU07RUFDcEIsT0FBTyxVQUFVOztFQUVqQixjQUFjLGdCQUFnQjtJQUM1QixhQUFhOzs7RUFHZixPQUFPLElBQUksb0JBQW9CLFNBQVMsT0FBTztJQUM3QyxlQUFlLFVBQVUsT0FBTyxZQUFZLE9BQU8sS0FBSyxXQUFXLEtBQUssVUFBVSxTQUFTO01BQ3pGLE9BQU8sU0FBUyxRQUFRO01BQ3hCLGNBQWMsZUFBZSxPQUFPLFFBQVEsS0FBSyxVQUFVLFNBQVM7UUFDbEUsT0FBTyxRQUFRLFFBQVE7UUFDdkIsR0FBRyxPQUFPLE1BQU0sSUFBSSxjQUFjLGFBQWE7VUFDN0MsT0FBTyxPQUFPLElBQUksVUFBVTtVQUM1QixPQUFPLE9BQU8sT0FBTyxLQUFLLFlBQVk7WUFDcEMsT0FBTyxHQUFHOzs7UUFHZDs7Ozs7RUFLTixPQUFPLElBQUksb0JBQW9CLFNBQVMsT0FBTztJQUM3QyxZQUFZO0lBQ1osV0FBVzs7O0VBR2IsT0FBTyxhQUFhLFdBQVc7SUFDN0IsSUFBSSxVQUFVLGVBQWU7SUFDN0IsVUFBVSxPQUFPLFdBQVcsVUFBVSxPQUFPOztFQUUvQyxJQUFJLFlBQVksU0FBUyxXQUFXO0lBQ2xDLE9BQU8sVUFBVSwyQkFBMkI7SUFDNUMsWUFBWTtJQUNaLE9BQU87O0VBRVQsSUFBSSxTQUFTLFNBQVMsR0FBRztJQUN2QixRQUFRLElBQUksYUFBYTs7O0VBRzNCLE9BQU8sWUFBWSxXQUFXO0lBQzVCLFNBQVM7OztFQUdYLE9BQU8sU0FBUyxVQUFVLFFBQVE7SUFDaEMsY0FBYyxlQUFlLE9BQU8sUUFBUSxLQUFLLFVBQVUsU0FBUztNQUNsRSxJQUFJLFdBQVc7TUFDZixPQUFPLFFBQVEsUUFBUTtNQUN2QixHQUFHLE9BQU8sTUFBTSxJQUFJLGNBQWMsVUFBVTtRQUMxQyxRQUFRO1VBQ04sS0FBSztZQUNILFdBQVcsS0FBSyxTQUFTLEtBQUs7Y0FDNUIsUUFBUSxJQUFJO2NBQ1osR0FBRyxLQUFLO2dCQUNOLE9BQU8sTUFBTSxJQUFJLFVBQVUsT0FBTztnQkFDbEMsT0FBTyxNQUFNLElBQUksU0FBUyxPQUFPLFNBQVM7Z0JBQzFDLFdBQVcsT0FBTyxTQUFTO2dCQUMzQixZQUFZLE9BQU8sT0FBTzs7O1lBRzlCO1VBQ0YsS0FBSztZQUNILFlBQVksS0FBSyxTQUFTLEtBQUs7Y0FDN0IsUUFBUSxJQUFJO2NBQ1osR0FBRyxLQUFLO2dCQUNOLE9BQU8sTUFBTSxJQUFJLFVBQVUsT0FBTyxTQUFTO2dCQUMzQyxPQUFPLE1BQU0sSUFBSSxTQUFTLE9BQU87Z0JBQ2pDLFdBQVcsT0FBTyxTQUFTO2dCQUMzQixZQUFZLE9BQU8sT0FBTzs7O1lBRzlCOzs7Ozs7RUFNVixTQUFTLFlBQVk7SUFDbkIsT0FBTyxVQUFVO0lBQ2pCLE9BQU8sZUFBZTs7SUFFdEIsT0FBTyxZQUFZO01BQ2pCO1FBQ0UsYUFBYTtRQUNiLE9BQU87UUFDUCxPQUFPO1FBQ1AsU0FBUztVQUNQLEVBQUUsTUFBTTtVQUNSLEVBQUUsTUFBTTtZQUNOLE1BQU07WUFDTixPQUFPLFNBQVMsR0FBRztjQUNqQixJQUFJLENBQUMsT0FBTyxTQUFTO2dCQUNuQixPQUFPLGVBQWU7Z0JBQ3RCLEVBQUU7cUJBQ0c7Z0JBQ0wsT0FBTzs7Ozs7Ozs7RUFRckIsU0FBUyxZQUFZO0lBQ25CLE9BQU8sWUFBWTtNQUNqQjtRQUNFLGFBQWE7UUFDYixPQUFPO1FBQ1AsT0FBTztRQUNQLFNBQVM7VUFDUCxFQUFFLE1BQU07VUFDUixFQUFFLE1BQU07WUFDTixNQUFNO1lBQ04sT0FBTyxTQUFTLEdBQUc7Y0FDakIsT0FBTzs7Ozs7OztFQU9uQixTQUFTLFNBQVMsU0FBUztJQUN6QixjQUFjLFNBQVMsT0FBTyxNQUFNLElBQUksS0FBSyxVQUFVLE9BQU87TUFDNUQsT0FBTyxRQUFRO01BQ2YsUUFBUSxJQUFJLFVBQVUsT0FBTyxNQUFNLElBQUk7TUFDdkMsUUFBUSxJQUFJO01BQ1osUUFBUSxJQUFJLE9BQU8sTUFBTSxJQUFJO01BQzdCLEdBQUcsU0FBUztRQUNWLE9BQU8sV0FBVzs7Ozs7RUFLeEIsU0FBUyxZQUFZLE9BQU8sVUFBVTtJQUNwQyxXQUFXLFdBQVc7SUFDdEIsTUFBTSxJQUFJLFVBQVU7SUFDcEIsTUFBTSxPQUFPLEtBQUssVUFBVSxPQUFPO01BQ2pDLE9BQU8sUUFBUTtNQUNmLE1BQU0sTUFBTSxJQUFJLGdCQUFnQixDQUFDLFVBQVUsVUFBVSxPQUFPLE1BQU0sS0FBSyxLQUFLLFVBQVUsU0FBUztRQUM3RixXQUFXLFdBQVc7Ozs7O0VBSzVCLFNBQVMsa0JBQWtCO0lBQ3pCLE9BQU8sV0FBVztNQUNoQixNQUFNO01BQ04sV0FBVzs7SUFFYixHQUFHLE9BQU8sT0FBTyxXQUFXLFdBQVc7TUFDckMsT0FBTyxTQUFTLE9BQU8sT0FBTyxNQUFNO01BQ3BDLE9BQU8sU0FBUyxXQUFXLE9BQU8sTUFBTTtNQUN4QyxPQUFPLFNBQVMsWUFBWSxPQUFPLE1BQU07TUFDekMsT0FBTyxTQUFTLE9BQU8sT0FBTyxNQUFNOztJQUV0QyxHQUFHLE9BQU8sT0FBTyxXQUFXLFdBQVc7TUFDckMsT0FBTyxTQUFTLE9BQU8sT0FBTyxNQUFNO01BQ3BDLE9BQU8sU0FBUyxXQUFXLE9BQU8sTUFBTTtNQUN4QyxPQUFPLFNBQVMsWUFBWSxPQUFPLE1BQU07TUFDekMsT0FBTyxTQUFTLE9BQU8sT0FBTyxNQUFNOzs7Q0FHekM7QUFDRDs7K0ZDbExBLFFBQVEsT0FBTztHQUNaLFdBQVcsWUFBWTs7QUFFMUIsU0FBUyxTQUFTLFFBQVEsZUFBZSxRQUFRLGVBQWUsT0FBTyxVQUFVO0VBQy9FLE9BQU8sT0FBTyxNQUFNOztFQUVwQixjQUFjLGdCQUFnQix1Q0FBdUM7SUFDbkUsT0FBTztLQUNOLEtBQUssU0FBUyxTQUFTO0lBQ3hCLE9BQU8sVUFBVTs7O0VBR25CLE9BQU8sT0FBTyxVQUFVLE1BQU07SUFDNUIsY0FBYyxnQkFBZ0I7TUFDNUIsYUFBYTs7SUFFZixHQUFHLFNBQVMsU0FBUztNQUNuQixHQUFHLE9BQU8saUJBQWlCO1FBQ3pCLGdCQUFnQixZQUFZLE9BQU8sS0FBSyxVQUFVLFVBQVUsU0FBUyxLQUFLO1VBQ3hFLFFBQVEsSUFBSTtXQUNYLFNBQVMsR0FBRztVQUNiLFFBQVEsSUFBSTs7O01BR2hCLFNBQVMsWUFBWTtRQUNuQixNQUFNLEtBQUssU0FBUyxLQUFLLFVBQVUsTUFBTTtVQUN2QyxPQUFPLEdBQUcsU0FBUyxNQUFNLENBQUMsUUFBUTs7U0FFbkM7OztXQUdFO01BQ0wsT0FBTyxHQUFHLFNBQVMsTUFBTSxDQUFDLFFBQVE7O0lBRXBDLE9BQU8sUUFBUTs7O0VBR2pCLE9BQU8sSUFBSSxZQUFZLFdBQVc7SUFDaEMsT0FBTyxRQUFROzs7QUFHbkI7QUN6Q0E7QUFDQSxRQUFRLE9BQU87O0dBRVosV0FBVyxnQkFBZ0I7O0FBRTlCLGFBQWEsVUFBVSxDQUFDLFVBQVUsVUFBVSxTQUFTO0FBQ3JELFNBQVMsYUFBYSxRQUFRLFFBQVEsT0FBTyxhQUFhOztFQUV4RCxPQUFPLE9BQU87O0VBRWQsT0FBTyxlQUFlLFVBQVUsTUFBTTtJQUNwQyxJQUFJLFdBQVcsSUFBSSxNQUFNO0lBQ3pCLFNBQVMsSUFBSTtJQUNiLFNBQVMsT0FBTyxNQUFNO01BQ3BCLFNBQVMsU0FBUyxNQUFNO1FBQ3RCLE9BQU8sR0FBRzs7TUFFWixPQUFPLFNBQVMsTUFBTSxPQUFPOztRQUUzQixXQUFXLE1BQU07Ozs7RUFJdkIsT0FBTyxPQUFPLFFBQVEsU0FBUyxRQUFRLE9BQU87SUFDNUMsT0FBTyxVQUFVO0tBQ2hCOztFQUVILFNBQVMsWUFBWSxTQUFTO0lBQzVCLE9BQU8sWUFBWSxNQUFNO01BQ3ZCLE9BQU87TUFDUCxVQUFVOzs7O0FBSWhCOzs7NEJDbENBO0FBQ0EsUUFBUSxPQUFPOztHQUVaLFFBQVEsa0JBQWtCO0dBQzFCLFFBQVEsVUFBVTs7QUFFckIsU0FBUyxlQUFlLE9BQU8sUUFBUTtFQUNyQyxPQUFPO0lBQ0wsWUFBWTtJQUNaLFdBQVc7SUFDWCxnQkFBZ0I7SUFDaEIsZ0JBQWdCO0lBQ2hCLG1CQUFtQjs7O0VBR3JCLFNBQVMsa0JBQWtCLFlBQVksTUFBTTtJQUMzQyxJQUFJLFFBQVEsSUFBSSxNQUFNLE1BQU0sT0FBTztJQUNuQyxNQUFNLFFBQVEsY0FBYztJQUM1QixNQUFNLFdBQVcsUUFBUTtJQUN6QixNQUFNLFFBQVEsVUFBVTtJQUN4QixPQUFPLE1BQU07R0FDZDs7RUFFRCxTQUFTLFdBQVcsU0FBUztJQUMzQixJQUFJLFFBQVEsSUFBSSxNQUFNLE1BQU0sT0FBTztJQUNuQyxNQUFNLFFBQVEsY0FBYztJQUM1QixNQUFNLFdBQVcsVUFBVTtJQUMzQixPQUFPLE1BQU07R0FDZDs7RUFFRCxTQUFTLGVBQWUsU0FBUyxXQUFXO0lBQzFDLElBQUksUUFBUSxJQUFJLE1BQU0sTUFBTSxPQUFPO0lBQ25DLE1BQU0sUUFBUSxjQUFjO0lBQzVCLE1BQU0sUUFBUSxhQUFhO0lBQzNCLE9BQU8sTUFBTTtHQUNkOztFQUVELFNBQVMsVUFBVSxTQUFTLE1BQU07SUFDaEMsSUFBSSxRQUFRLElBQUksTUFBTSxNQUFNLE9BQU87SUFDbkMsTUFBTSxRQUFRLGNBQWM7SUFDNUIsTUFBTSxRQUFRLFFBQVE7SUFDdEIsTUFBTSxNQUFNO0lBQ1osT0FBTyxNQUFNOzs7RUFHZixTQUFTLGVBQWUsU0FBUyxNQUFNLFVBQVU7SUFDL0MsSUFBSSxTQUFTLElBQUksT0FBTztJQUN4QixPQUFPLElBQUksY0FBYztJQUN6QixPQUFPLElBQUksUUFBUTtJQUNuQixPQUFPLElBQUk7SUFDWCxPQUFPLElBQUksUUFBUTtJQUNuQixPQUFPLElBQUksVUFBVTtJQUNyQixPQUFPLElBQUksVUFBVTtJQUNyQixPQUFPLE9BQU87O0NBRWpCOztBQUVELFNBQVMsT0FBTyxPQUFPO0VBQ3JCLElBQUksUUFBUSxNQUFNLE9BQU8sT0FBTztFQUNoQyxJQUFJLGFBQWEsQ0FBQyxjQUFjLFFBQVEsYUFBYSxZQUFZO0lBQy9ELFFBQVEsVUFBVSxVQUFVLGVBQWUsUUFBUSxVQUFVLE9BQU8sVUFBVSxhQUFhO0VBQzdGLE1BQU0saUJBQWlCLE9BQU87O0VBRTlCLE9BQU87SUFDTCxPQUFPOztDQUVWO0FBQ0Q7O2dGQ25FQSxRQUFRLE9BQU87O0dBRVosUUFBUSxvQkFBb0I7O0FBRS9CLFNBQVMsa0JBQWtCLE9BQU8scUJBQXFCLElBQUksWUFBWTs7RUFFckUsSUFBSSxXQUFXLENBQUMsUUFBUSxJQUFJLE1BQU07RUFDbEMsT0FBTztJQUNMLFVBQVU7SUFDVixhQUFhO0lBQ2IsYUFBYTs7O0VBR2YsU0FBUyxhQUFhLFFBQVE7SUFDNUIsU0FBUyxTQUFTLElBQUksTUFBTSxTQUFTLENBQUMsVUFBVSxPQUFPLFVBQVUsV0FBVyxPQUFPOzs7RUFHckYsU0FBUyxlQUFlO0lBQ3RCLElBQUksS0FBSyxHQUFHO0lBQ1osSUFBSSxhQUFhLENBQUMsb0JBQW9CO0lBQ3RDO09BQ0csbUJBQW1CO09BQ25CLEtBQUssVUFBVSxVQUFVO1FBQ3hCLEdBQUcsUUFBUSxTQUFTO1NBQ25CLFNBQVMsS0FBSztRQUNmLFFBQVEsSUFBSTtRQUNaLEdBQUcsT0FBTzs7SUFFZCxPQUFPLEdBQUc7OztBQUdkOzs7MEJDL0JBLFFBQVEsT0FBTzs7R0FFWixRQUFRLGlCQUFpQjtHQUN6QixRQUFRLFNBQVM7O0FBRXBCLFNBQVMsY0FBYyxPQUFPLE9BQU8sSUFBSTtFQUN2QyxJQUFJLE9BQU8sTUFBTTtFQUNqQixPQUFPO0lBQ0wsbUJBQW1CO0lBQ25CLGlCQUFpQjtJQUNqQixnQkFBZ0I7SUFDaEIsVUFBVTtJQUNWLGtCQUFrQjs7O0VBR3BCLFNBQVMsaUJBQWlCLFFBQVEsUUFBUTtJQUN4QyxJQUFJLFVBQVUsSUFBSSxNQUFNLE1BQU0sTUFBTTtJQUNwQyxRQUFRLFFBQVEsV0FBVztJQUMzQixJQUFJLFVBQVUsSUFBSSxNQUFNLE1BQU0sTUFBTTtJQUNwQyxRQUFRLFFBQVEsV0FBVztJQUMzQixJQUFJLFlBQVksTUFBTSxNQUFNLEdBQUcsU0FBUztJQUN4QyxVQUFVLFdBQVc7SUFDckIsVUFBVSxNQUFNO0lBQ2hCLEdBQUcsUUFBUTtNQUNULFVBQVUsUUFBUSxVQUFVOztJQUU5QixPQUFPLFVBQVU7OztFQUduQixTQUFTLGVBQWUsUUFBUTtJQUM5QixJQUFJLE9BQU8sT0FBTyxJQUFJO0lBQ3RCLElBQUksUUFBUSxJQUFJLE1BQU0sTUFBTSxNQUFNO0lBQ2xDLE1BQU0sUUFBUTtJQUNkLE1BQU0sUUFBUTtJQUNkLE1BQU0sV0FBVztJQUNqQixNQUFNLE1BQU07SUFDWixHQUFHLFNBQVMsV0FBVztNQUNyQixNQUFNLFFBQVEsV0FBVztXQUNwQjtNQUNMLE1BQU0sUUFBUSxXQUFXOztJQUUzQixPQUFPLE1BQU07OztFQUdmLFNBQVMsbUJBQW1CLFFBQVE7SUFDbEMsSUFBSSxPQUFPLE9BQU8sSUFBSTtJQUN0QixJQUFJLFFBQVEsSUFBSSxNQUFNLE1BQU07SUFDNUIsTUFBTSxRQUFRLFVBQVU7SUFDeEIsTUFBTSxXQUFXO0lBQ2pCLEdBQUcsU0FBUyxXQUFXO01BQ3JCLE1BQU0sUUFBUSxXQUFXO1dBQ3BCO01BQ0wsTUFBTSxRQUFRLFdBQVc7O0lBRTNCLE1BQU0sUUFBUSxZQUFZO0lBQzFCLE1BQU0sUUFBUSxZQUFZO0lBQzFCLE1BQU0sTUFBTTs7SUFFWixPQUFPLE1BQU07O0VBRWYsU0FBUyxnQkFBZ0IsUUFBUTtJQUMvQixJQUFJLE9BQU8sT0FBTyxJQUFJO0lBQ3RCLElBQUksUUFBUSxJQUFJLE1BQU0sTUFBTSxNQUFNO0lBQ2xDLE1BQU0sV0FBVztJQUNqQixNQUFNLE1BQU07SUFDWixHQUFHLFNBQVMsV0FBVztNQUNyQixNQUFNLFFBQVEsV0FBVztXQUNwQjtNQUNMLE1BQU0sUUFBUSxXQUFXOztJQUUzQixNQUFNLFFBQVEsVUFBVTtJQUN4QixNQUFNLE1BQU07SUFDWixPQUFPLE1BQU07O0VBRWYsU0FBUyxTQUFTLElBQUk7SUFDcEIsSUFBSSxRQUFRLElBQUksTUFBTTtJQUN0QixNQUFNLEtBQUs7SUFDWCxPQUFPLE1BQU07Ozs7QUFJakIsU0FBUyxNQUFNLE9BQU87RUFDcEIsSUFBSSxRQUFRLE1BQU0sT0FBTyxPQUFPO0VBQ2hDLElBQUksYUFBYTtJQUNmLGNBQWMsV0FBVyxXQUFXLFNBQVMsU0FBUyxhQUFhLGFBQWEsY0FBYyxjQUFjLFVBQVUsVUFBVTtJQUNoSSxZQUFZLGdCQUFnQixlQUFlLGNBQWMsU0FBUzs7RUFFcEUsTUFBTSxpQkFBaUIsT0FBTzs7RUFFOUIsT0FBTztJQUNMLE9BQU87OztBQUdYO0FDN0ZBLFFBQVEsT0FBTzs7R0FFWixRQUFRLGtCQUFrQjs7QUFFN0IsU0FBUyxrQkFBa0I7O0VBRXpCLElBQUksU0FBUztJQUNYLFNBQVM7SUFDVCxhQUFhO0lBQ2IsY0FBYztJQUNkLFdBQVc7SUFDWCxpQkFBaUIsT0FBTyxnQkFBZ0I7SUFDeEMsWUFBWTtJQUNaLGNBQWMsT0FBTyxhQUFhOzs7RUFHcEMsT0FBTztJQUNMLFFBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQlo7QUN2Q0EsUUFBUSxPQUFPOztHQUVaLFFBQVEsaUJBQWlCOztBQUU1QixTQUFTLGdCQUFnQjtFQUN2QixJQUFJLFdBQVc7SUFDYixNQUFNLENBQUMsaUJBQWlCLHdCQUF3QjtNQUM5QyxZQUFZLGdCQUFnQiwyQkFBMkIsVUFBVTtNQUNqRSxjQUFjLGtCQUFrQixtQkFBbUIsbUJBQW1CO01BQ3RFLGlCQUFpQixxQkFBcUIsZ0JBQWdCLGdCQUFnQjtNQUN0RSxxQkFBcUIsaUJBQWlCLDZCQUE2QjtNQUNuRSxpQkFBaUIsY0FBYyx3QkFBd0IsbUJBQW1CO01BQzFFLGlCQUFpQixpQkFBaUIsaUJBQWlCLHNCQUFzQjtNQUN6RSx5QkFBeUIsb0JBQW9CLDBCQUEwQjtNQUN2RTs7O0VBR0osSUFBSSxTQUFTO0lBQ1gsQ0FBQyxNQUFNLFFBQVEsU0FBUztJQUN4QixDQUFDLE1BQU0sVUFBVSxTQUFTO0lBQzFCLENBQUMsTUFBTSxXQUFXLFNBQVM7SUFDM0IsQ0FBQyxNQUFNLFdBQVcsU0FBUztJQUMzQixDQUFDLE1BQU0sU0FBUyxTQUFTO0lBQ3pCLENBQUMsTUFBTSxXQUFXLFNBQVM7SUFDM0IsQ0FBQyxNQUFNLFVBQVUsU0FBUztJQUMxQixDQUFDLE1BQU0sVUFBVSxTQUFTO0lBQzFCLENBQUMsTUFBTSxTQUFTLFNBQVM7O0VBRTNCLE9BQU87SUFDTCxVQUFVO0lBQ1YsUUFBUTs7O0FBR1o7Ozs7NkJDakNBO0FBQ0EsUUFBUSxPQUFPOztHQUVaLFFBQVEsc0JBQXNCO0dBQzlCLFFBQVEsY0FBYztHQUN0QixRQUFRLFdBQVc7O0FBRXRCLFNBQVMsbUJBQW1CLE9BQU8sSUFBSSxZQUFZLFNBQVMsUUFBUTtFQUNsRSxPQUFPO0lBQ0wsZUFBZTtJQUNmLGtCQUFrQjtJQUNsQixXQUFXO0lBQ1gsZ0JBQWdCOztFQUVsQixTQUFTLGVBQWUsU0FBUyxRQUFRO0lBQ3ZDLElBQUksU0FBUyxJQUFJLE9BQU8sTUFBTTtJQUM5QixPQUFPLElBQUksY0FBYztJQUN6QixPQUFPLElBQUksUUFBUSxNQUFNLEtBQUs7SUFDOUIsT0FBTyxJQUFJLFlBQVksTUFBTSxLQUFLLFVBQVU7SUFDNUMsT0FBTyxJQUFJLE9BQU87SUFDbEIsT0FBTyxJQUFJLFFBQVE7SUFDbkIsT0FBTyxJQUFJLFVBQVU7SUFDckIsT0FBTyxJQUFJLFVBQVU7SUFDckIsT0FBTyxPQUFPOztFQUVoQixTQUFTLGdCQUFnQjtJQUN2QixJQUFJLFFBQVEsSUFBSSxNQUFNLE1BQU0sUUFBUTtJQUNwQyxNQUFNLFFBQVEsUUFBUTtJQUN0QixNQUFNLFFBQVE7SUFDZCxPQUFPLE1BQU07O0VBRWYsU0FBUyxvQkFBb0I7SUFDM0IsSUFBSSxRQUFRLEdBQUc7SUFDZixJQUFJLGFBQWEsSUFBSSxXQUFXO0lBQ2hDLFdBQVcsSUFBSSxRQUFRO0lBQ3ZCLFdBQVcsSUFBSSxVQUFVO0lBQ3pCLFdBQVcsSUFBSSxRQUFRO0lBQ3ZCLFdBQVcsT0FBTyxLQUFLLFVBQVUsU0FBUztNQUN4QyxJQUFJLFVBQVUsSUFBSSxRQUFRO01BQzFCLFFBQVEsSUFBSSxjQUFjO01BQzFCLFFBQVEsSUFBSSxRQUFRO01BQ3BCLFFBQVEsSUFBSSxlQUFlO01BQzNCLFFBQVEsSUFBSSxjQUFjO01BQzFCLFFBQVEsT0FBTyxLQUFLLFVBQVUsU0FBUztRQUNyQyxNQUFNLFFBQVE7OztJQUdsQixPQUFPLE1BQU07O0VBRWYsU0FBUyxXQUFXLFNBQVM7SUFDM0IsSUFBSSxRQUFRLElBQUksTUFBTSxNQUFNLE9BQU87SUFDbkMsTUFBTSxRQUFRLGNBQWM7SUFDNUIsTUFBTSxRQUFRO0lBQ2QsT0FBTyxNQUFNOzs7O0FBSWpCLFNBQVMsV0FBVyxPQUFPO0VBQ3pCLElBQUksUUFBUSxNQUFNLE9BQU8sT0FBTztFQUNoQyxJQUFJLGFBQWEsQ0FBQyxRQUFRLFFBQVEsVUFBVSxZQUFZLGtCQUFrQjtFQUMxRSxNQUFNLGlCQUFpQixPQUFPOztFQUU5QixPQUFPO0lBQ0wsT0FBTzs7O0FBR1gsU0FBUyxRQUFRLE9BQU87RUFDdEIsSUFBSSxRQUFRLE1BQU0sT0FBTyxPQUFPO0VBQ2hDLElBQUksYUFBYSxDQUFDLGNBQWMsUUFBUSxjQUFjO0VBQ3RELE1BQU0saUJBQWlCLE9BQU87O0VBRTlCLE9BQU87SUFDTCxPQUFPOzs7QUFHWCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnT05PRy5jb25maWcnLCBbXSlcbiAgLmNvbmZpZyhjb25maWcpO1xuXG5mdW5jdGlvbiBjb25maWcgKCRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyLCBQYXJzZVByb3ZpZGVyKSB7XG5cbiAgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8ZmlsZXxibG9ifGNvbnRlbnR8bXMtYXBweHx4LXdtYXBwMCk6fGRhdGE6aW1hZ2VcXC98aW1nXFwvLyk7XG4gICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGZpbGV8Z2h0dHBzP3xtcy1hcHB4fHgtd21hcHAwKTovKTtcblxuICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJuWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRXCIsIFwienJpbjhHRUJEVkdia2wxaW9HRXduSHVQNzBGZEc2SGh6VFM4dUdqelwiKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJywgW1xuICAnaW9uaWMnLFxuICAnbmdQYXJzZScsXG4gICd0aW1lcicsXG4gICduZ0NvcmRvdmEnLFxuICAnbmdBbmltYXRlJyxcbiAgJ09OT0cuY29uZmlnJyxcbiAgJ09OT0cucm91dGVzJyxcbiAgJ09OT0cuQ29udHJvbGxlcnMnLFxuICAnT05PRy5TZXJ2aWNlcydcbl0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzJywgW1xuICAnT05PRy5yb3V0ZXMubWF0Y2hlcycsXG4gICdPTk9HLnJvdXRlcy5sYWRkZXInLFxuICAnT05PRy5yb3V0ZXMuYWRtaW4nXG5dKVxuICAuY29uZmlnKHJvdXRlcyk7XG5cbmZ1bmN0aW9uIHJvdXRlcyAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJ2FwcC9sb2FkaW5nJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgJHEsIFBhcnNlLCAkc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCkudGhlbihmdW5jdGlvbiAodG91cm5hbWVudHMpIHtcbiAgICAgICAgICAgIGlmKHRvdXJuYW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYi5yZXNvbHZlKHRvdXJuYW1lbnRzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgaW9uaWMuUGxhdGZvcm0uZXhpdEFwcCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2FkaW5nJywge1xuICAgICAgdXJsOiAnL2xvYWRpbmcnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xvYWRpbmcuaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuZGFzaGJvYXJkJywge1xuICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAucmVnaXN0ZXInLCB7XG4gICAgICB1cmw6ICcvcmVnaXN0ZXInLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3JlZ2lzdGVyLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLnJlc2V0Jywge1xuICAgICAgdXJsOiAnL3Bhc3N3b3JkJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wYXNzd29yZC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnUmVzZXRQYXNzd29yZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG5cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbnN0YW50KFwibW9tZW50XCIsIG1vbWVudClcbiAgLnJ1bihydW4pO1xuXG5mdW5jdGlvbiBydW4gKCRpb25pY1BsYXRmb3JtLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY0xvYWRpbmcsICRpb25pY1BvcHVwLCBsb2NhdGlvblNlcnZpY2VzLCAkaW9uaWNIaXN0b3J5LCAkY29yZG92YU5ldHdvcmspIHtcbiAgJGlvbmljUGxhdGZvcm0ucmVhZHkoZnVuY3Rpb24oKSB7XG4gICAgaWYod2luZG93LmNvcmRvdmEgJiYgd2luZG93LmNvcmRvdmEucGx1Z2lucy5LZXlib2FyZCkge1xuICAgICAgLy8gSGlkZSB0aGUgYWNjZXNzb3J5IGJhciBieSBkZWZhdWx0IChyZW1vdmUgdGhpcyB0byBzaG93IHRoZSBhY2Nlc3NvcnkgYmFyIGFib3ZlIHRoZSBrZXlib2FyZFxuICAgICAgLy8gZm9yIGZvcm0gaW5wdXRzKVxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmhpZGVLZXlib2FyZEFjY2Vzc29yeUJhcih0cnVlKTtcblxuICAgICAgLy8gRG9uJ3QgcmVtb3ZlIHRoaXMgbGluZSB1bmxlc3MgeW91IGtub3cgd2hhdCB5b3UgYXJlIGRvaW5nLiBJdCBzdG9wcyB0aGUgdmlld3BvcnRcbiAgICAgIC8vIGZyb20gc25hcHBpbmcgd2hlbiB0ZXh0IGlucHV0cyBhcmUgZm9jdXNlZC4gSW9uaWMgaGFuZGxlcyB0aGlzIGludGVybmFsbHkgZm9yXG4gICAgICAvLyBhIG11Y2ggbmljZXIga2V5Ym9hcmQgZXhwZXJpZW5jZS5cbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuICAgIH1cbiAgICBpZih3aW5kb3cuU3RhdHVzQmFyKSB7XG4gICAgICBTdGF0dXNCYXIuc3R5bGVEZWZhdWx0KCk7XG4gICAgfVxuICAgIHZhciB0eXBlID0gJGNvcmRvdmFOZXR3b3JrLmdldE5ldHdvcmsoKTtcblxuICAgIHZhciBpc09ubGluZSA9ICRjb3Jkb3ZhTmV0d29yay5pc09ubGluZSgpO1xuXG4gICAgdmFyIGlzT2ZmbGluZSA9ICRjb3Jkb3ZhTmV0d29yay5pc09mZmxpbmUoKTtcbiAgICBcbiAgICBjb25zb2xlLmxvZyhpc09mZmxpbmUpO1xuICAgIC8vIGxpc3RlbiBmb3IgT25saW5lIGV2ZW50XG4gICAgJHJvb3RTY29wZS4kb24oJyRjb3Jkb3ZhTmV0d29yazpvbmxpbmUnLCBmdW5jdGlvbihldmVudCwgbmV0d29ya1N0YXRlKXtcbiAgICAgIHZhciBvbmxpbmVTdGF0ZSA9IG5ldHdvcmtTdGF0ZTtcbiAgICB9KVxuXG4gICAgLy8gbGlzdGVuIGZvciBPZmZsaW5lIGV2ZW50XG4gICAgJHJvb3RTY29wZS4kb24oJyRjb3Jkb3ZhTmV0d29yazpvZmZsaW5lJywgZnVuY3Rpb24oZXZlbnQsIG5ldHdvcmtTdGF0ZSl7XG4gICAgICB2YXIgb2ZmbGluZVN0YXRlID0gbmV0d29ya1N0YXRlO1xuICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgIHRpdGxlOiBcIkludGVybmV0IERpc2Nvbm5lY3RlZFwiLFxuICAgICAgICAgIGNvbnRlbnQ6IFwiVGhlIGludGVybmV0IGlzIGRpc2Nvbm5lY3RlZCBvbiB5b3VyIGRldmljZS5cIlxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcbiAgICAgICAgICBpb25pYy5QbGF0Zm9ybS5leGl0QXBwKCk7XG4gICAgICAgIH0pO1xuICAgICAgXG4gICAgfSlcblxuXG4gICAgJHJvb3RTY29wZS4kb24oJ3Nob3c6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5zaG93KHt0ZW1wbGF0ZTogJzxpb24tc3Bpbm5lciBpY29uPVwic3BpcmFsXCIgY2xhc3M9XCJzcGlubmVyLWNhbG1cIj48L2lvbi1zcGlubmVyPicsIHNob3dCYWNrZHJvcDogdHJ1ZSwgYW5pbWF0aW9uOiAnZmFkZS1pbid9KTtcbiAgICB9KTtcblxuICAgICRyb290U2NvcGUuJG9uKCdoaWRlOmxvYWRpbmcnLCBmdW5jdGlvbigpIHtcbiAgICAgICRpb25pY0xvYWRpbmcuaGlkZSgpO1xuICAgIH0pO1xuXG4gICAgJGlvbmljUGxhdGZvcm0ub24oJ3Jlc3VtZScsIGZ1bmN0aW9uKCl7XG4gICAgICAvL3JvY2sgb25cbiAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcsIHtyZWxvYWQ6IHRydWV9KTtcbiAgICB9KTtcblxuXG4gICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgY29uc29sZS5sb2coJ25ldyB2ZXJzaW9uIDEnKTtcbiAgICAgIFBhcnNlUHVzaFBsdWdpbi5vbigncmVjZWl2ZVBOJywgZnVuY3Rpb24ocG4pe1xuICAgICAgICBjb25zb2xlLmxvZyhwbik7XG4gICAgICAgIGlmKCFwbi50aXRsZSkge1xuICAgICAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgICAgIHRpdGxlOiAnQW5ub3VuY2VtZW50JyxcbiAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+JysgcG4uYWxlcnQgKyAnPC9kaXY+J1xuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzd2l0Y2ggKHBuLnRpdGxlKSB7XG4gICAgICAgICAgICBjYXNlICdPcHBvbmVudCBGb3VuZCc6XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcsIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdPcHBvbmVudCBDb25maXJtZWQnOlxuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnUmVzdWx0cyBFbnRlcmVkJzpcbiAgICAgICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgICAgIHRpdGxlOiAnTWF0Y2ggUGxheWVkJyxcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlJlc3VsdHMgaGF2ZSBiZWVuIHN1Ym1pdHRlZDwvZGl2PidcbiAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxvY2F0aW9uU2VydmljZXMuZ2V0TG9jYXRpb24oKS50aGVuKGZ1bmN0aW9uIChsb2NhdGlvbikge1xuICAgICAgbG9jYXRpb25TZXJ2aWNlcy5zZXRMb2NhdGlvbihsb2NhdGlvbik7XG4gICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICB9KTtcbiAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgIGlmKG5hdmlnYXRvciAmJiBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG4gICAgICAgIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcy5hZG1pbicsIFtdKVxuICAuY29uZmlnKEFkbWluUm91dGVzKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLmxhZGRlcicsIFtdKVxuICAuY29uZmlnKExhZGRlclJvdXRlcyk7XG5cbmZ1bmN0aW9uIExhZGRlclJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlcicsIHtcbiAgICAgIHVybDogJy9sYWRkZXInLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2xhZGRlci5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmxlYWRlcmJvYXJkJywge1xuICAgICAgdXJsOiAnL2xlYWRlcmJvYXJkcycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGVhZGVyYm9hcmQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGVhZGVyQm9hcmRzQ3RybCdcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5qb2luJywge1xuICAgICAgdXJsOiAnL2pvaW4nLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2pvaW4uaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGFkZGVySm9pbkN0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIucHJvZmlsZScsIHtcbiAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9wcm9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xhZGRlclByb2ZpbGVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcGxheWVyOiBmdW5jdGlvbiAoUGFyc2UsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIExhZGRlclNlcnZpY2VzLmdldFBsYXllcih0b3VybmFtZW50LnRvdXJuYW1lbnQsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLm1hdGNoZXMnLCBbXSlcbiAgLmNvbmZpZyhNYXRjaFJvdXRlcyk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gubGlzdCcsIHtcbiAgICAgIHVybDogJy92aWV3JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmxpc3QuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hMaXN0Q3RybCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHBsYXllcjogZnVuY3Rpb24gKFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCkge1xuICAgICAgICAgIHJldHVybiBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIodG91cm5hbWVudC50b3VybmFtZW50LCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnZpZXcnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC52aWV3Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoVmlld0N0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5tYXRjaC5yZXBvcnQnLCB7XG4gICAgICB1cmw6ICcvcmVwb3J0LzppZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC5yZXBvcnQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hSZXBvcnRDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcmVwb3J0OiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJHN0YXRlUGFyYW1zLmlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5NYXRjaGVzQ3RybCcsIEFkbWluTWF0Y2hlc0N0cmwpO1xuXG5mdW5jdGlvbiBBZG1pbk1hdGNoZXNDdHJsKCRzY29wZSwgUGFyc2UpIHtcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluUGxheWVyc0N0cmwnLCBBZG1pblBsYXllcnNDdHJsKTtcblxuZnVuY3Rpb24gQWRtaW5QbGF5ZXJzQ3RybCgkc2NvcGUsIFBhcnNlKSB7XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblNldHRpbmdzQ3RybCcsIEFkbWluU2V0dGluZ3NDdHJsKTtcblxuZnVuY3Rpb24gQWRtaW5TZXR0aW5nc0N0cmwoJHNjb3BlLCBsb2NhdGlvblNlcnZpY2VzLCBuZXdUb3VybmFtZW50LCB0b3VybmFtZW50KSB7XG4gICRzY29wZS5kZXRhaWxzID0gbmV3VG91cm5hbWVudDtcbiAgXG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICBcbiAgJHNjb3BlLnNldFRvdXJuYW1lbnRMb2NhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBsb2NhdGlvblNlcnZpY2VzLmdldExvY2F0aW9uKCkudGhlbihmdW5jdGlvbiAobG9jYXRpb24pIHtcbiAgICAgIHZhciBwb2ludCA9IG5ldyBQYXJzZS5HZW9Qb2ludCh7bGF0aXR1ZGU6IGxvY2F0aW9uLmxhdGl0dWRlLCBsb25naXR1ZGU6IGxvY2F0aW9uLmxvbmdpdHVkZX0pO1xuICAgICAgJHNjb3BlLnRvdXJuYW1lbnQuc2V0KFwibG9jYXRpb25cIiwgcG9pbnQpO1xuICAgICAgJHNjb3BlLnRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuYW1lbnQpIHtcbiAgICAgICAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50O1xuICAgICAgICBhbGVydCgndG91cm5tYW5ldCBsb2NhdGlvbiBzZXQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdEYXNoYm9hcmRDdHJsJywgRGFzaGJvYXJkQ3RybCk7XG5cbmZ1bmN0aW9uIERhc2hib2FyZEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkZmlsdGVyLCAkdGltZW91dCwgJGludGVydmFsLCAkaW9uaWNQb3B1cCwgJHJvb3RTY29wZSxcbiAgUGFyc2UsIHRvdXJuYW1lbnQsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMsIExhZGRlclNlcnZpY2VzLCBsb2NhdGlvblNlcnZpY2VzXG4pIHtcbiAgdmFyIHByb21pc2UgPSBudWxsO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuXG4gICRzY29wZS5lbmQgPSB7XG4gICAgY2FuUGxheTogdHJ1ZSxcbiAgICB0aW1lOiBwYXJzZUZsb2F0KG1vbWVudCgpLmZvcm1hdCgneCcpKVxuICB9XG5cbiAgJHNjb3BlLmxvY2F0aW9uID0gbG9jYXRpb25TZXJ2aWNlcy5sb2NhdGlvbjtcbiAgJHNjb3BlLm9wcG9uZW50ID0gUXVldWVTZXJ2aWNlcy5vcHBvbmVudDtcbiAgJHNjb3BlLmhlcm9MaXN0ID0gUXVldWVTZXJ2aWNlcy5oZXJvZXM7XG4gICRzY29wZS5teU9wcG9uZW50ID0ge25hbWU6J1BBWCBBdHRlbmRlZSd9O1xuXG4gICRzY29wZS4kb24oXCIkaW9uaWNWaWV3LmVudGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYobmF2aWdhdG9yICYmIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4pIHtcbiAgICAgIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuICAgIH1cbiAgICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnNbMF07XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnbG9jYXRpb24nLCAkc2NvcGUubG9jYXRpb24uY29vcmRzKTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgICAgIHRpbWVyKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHNldE5vdGlmaWNhdGlvbnMoKTtcbiAgICAgICAgICBzdGF0dXMoKTtcbiAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgJHN0YXRlLnJlbG9hZCgnYXBwLmRhc2hib2FyZCcpO1xuICB9O1xuICAkc2NvcGUuc3RhcnRRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZigkc2NvcGUuZW5kLmNhblBsYXkpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5jYW5jZWxRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgIHNhdmVQbGF5ZXIoKTtcbiAgfTtcblxuICAkc2NvcGUucGxheWVyQ29uZmlybSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkc2NvcGUubWF0Y2guZmV0Y2goKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICBzd2l0Y2ggKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpKSB7XG4gICAgICAgIGNhc2UgJ3BlbmRpbmcnOiBcbiAgICAgICAgICBjb25maXJtUGxheWVyKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbGxlZCc6XG4gICAgICAgICAgc2hvd0NhbmNlbGxlZE1hdGNoKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgXG4gICRzY29wZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgfTtcbiAgXG4gICRzY29wZS5zaG93T3Bwb25lbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBwcm9taXNlID0gJGludGVydmFsKGZ1bmN0aW9uICgpIHtjaGFuZ2VXb3JkKCl9LCAyMDAwKTtcbiAgfTtcblxuICAkc2NvcGUuc2V0VG9PcGVuID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9XG5cbiAgJHNjb3BlLmZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAgICR0aW1lb3V0KHRpbWVyLCAxNTAwKTtcbiAgfVxuICBcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICB9KTtcbiAgXG4gICRzY29wZS4kb24oJ2Rlc3Ryb3knLCBmdW5jdGlvbiAoKSB7XG4gICAgY29uc29sZS5sb2coJ2NvbnRyb2xsZXIgZGVzdHJveWVkJyk7XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIHNldE5vdGlmaWNhdGlvbnMoKSB7XG4gICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgUGFyc2VQdXNoUGx1Z2luLnN1YnNjcmliZSgkc2NvcGUucGxheWVyLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3N1YmJlZCB0byAnICsgJHNjb3BlLnBsYXllci51c2VybmFtZSk7XG4gICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgdmFyIHVzZXJHZW9Qb2ludCA9ICRzY29wZS5wbGF5ZXIuZ2V0KFwibG9jYXRpb25cIik7XG4gICAgaWYodXNlckdlb1BvaW50KSB7XG4gICAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoJ1RvdXJuYW1lbnQnKTtcbiAgICAgIHF1ZXJ5LndpdGhpbk1pbGVzKFwibG9jYXRpb25cIiwgdXNlckdlb1BvaW50LCA1MCk7XG4gICAgICBxdWVyeS5saW1pdCgxMCk7XG4gICAgICBxdWVyeS5maW5kKHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocGxhY2VzT2JqZWN0cykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHBsYWNlc09iamVjdHMpO1xuICAgICAgICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4gJiYgcGxhY2VzT2JqZWN0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIFBhcnNlUHVzaFBsdWdpbi5zdWJzY3JpYmUoJ3BheC1lYXN0JywgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXhlZCcpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gZ2V0U3RhdHVzKCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuZmV0Y2goKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgc3RhdHVzKCk7XG4gICAgICB9KTtcbiAgICB9LCAyMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1cygpIHtcbiAgICBpZigkc2NvcGUucGxheWVyKSB7XG4gICAgICBzd2l0Y2ggKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSkge1xuICAgICAgICBjYXNlICdvcGVuJzpcbiAgICAgICAgICAkc2NvcGUuc3RvcCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdxdWV1ZSc6XG4gICAgICAgICAgJHNjb3BlLnNob3dPcHBvbmVudHMoKTtcbiAgICAgICAgICBtYXRjaE1ha2luZygpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmb3VuZCc6XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NvbmZpcm1lZCc6XG4gICAgICAgICAgd2FpdGluZ0Zvck9wcG9uZW50KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ25vT3Bwb25lbnQnOlxuICAgICAgICAgIG5vT3Bwb25lbnQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGxheWluZyc6XG4gICAgICAgICAgZ2V0TGFzdE1hdGNoKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbGxlZCc6XG4gICAgICAgICAgcGxheWVyQ2FuY2VsbGVkKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyICgpIHtcbiAgICB2YXIgbm93ID0gbW9tZW50KCk7XG4gICAgdmFyIHRpbWUgPSAkc2NvcGUubWF0Y2guZ2V0KCdhY3RpdmVEYXRlJyk7XG4gICAgaWYodGltZSkge1xuICAgICAgdmFyIGZpdmVNaW51dGVzID0gbW9tZW50KHRpbWUpLmFkZCgxLCAnbWludXRlcycpO1xuICAgICAgJHNjb3BlLmVuZC50aW1lID0gcGFyc2VGbG9hdChmaXZlTWludXRlcy5mb3JtYXQoJ3gnKSk7XG4gICAgICAkc2NvcGUuZW5kLmNhblBsYXkgPSBub3cuaXNBZnRlcihmaXZlTWludXRlcywgJ3NlY29uZHMnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlUGxheWVyICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICBzdGF0dXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoTWFraW5nKCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIFBhcnNlLkNsb3VkLnJ1bignbWF0Y2htYWtpbmcnKS50aGVuKGZ1bmN0aW9uIChyZXMpe1xuICAgICAgICBjb25zb2xlLmxvZygnbWF0Y2htYWtpbmcgc3RhcnRlZCcpO1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICBpZihtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZ2V0U3RhdHVzKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgMTUwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd0NhbmNlbGxlZE1hdGNoKCkge1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggQ2FuY2VsbGVkJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+WW91IGhhdmUgZmFpbGVkIHRvIGNvbmZpcm08L2Rpdj4nXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgc2F2ZVBsYXllcigpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY29uZmlybVBsYXllcigpIHtcbiAgICBpZiAoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgJHNjb3BlLm1hdGNoLnNldCgnY29uZmlybTEnLCB0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm1hdGNoLnNldCgnY29uZmlybTInLCB0cnVlKTtcbiAgICB9XG4gICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgc2F2ZVBsYXllcigpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gb3Bwb25lbnRDb25maXJtZWQgKCkge1xuICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnYWN0aXZlJykge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC52aWV3Jyk7XG4gICAgICB9XG4gICAgfSwgMTAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiB3YWl0aW5nRm9yT3Bwb25lbnQgKCkge1xuICAgIFBhcnNlLkNsb3VkLnJ1bignY29uZmlybU1hdGNoJykudGhlbihmdW5jdGlvbiAobnVtKSB7XG4gICAgICBjaGVja09wcG9uZW50KDUwMDAsIGZhbHNlKTtcbiAgICAgIGNoZWNrT3Bwb25lbnQoMjAwMDAsIHRydWUpO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tPcHBvbmVudCAodGltZW91dCwgYWxyZWFkeUNoZWNrZWQpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZigkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykgPT09ICdjb25maXJtZWQnKSB7XG4gICAgICAgICRzY29wZS5tYXRjaC5mZXRjaCgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICAgICAgY2hlY2tNYXRjaFN0YXR1cyhhbHJlYWR5Q2hlY2tlZCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHRpbWVvdXQpO1xuICB9XG4gIFxuICBmdW5jdGlvbiBjaGVja01hdGNoU3RhdHVzKGFscmVhZHlDaGVja2VkKSB7XG4gICAgc3dpdGNoICgkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSkge1xuICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgIGlmKGFscmVhZHlDaGVja2VkKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdub09wcG9uZW50Jyk7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYWN0aXZlJzpcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdwbGF5aW5nJyk7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2hvdzpsb2FkaW5nJyk7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgICB9KTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2NvbXBsZXRlZCc6XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBcblxuICBmdW5jdGlvbiBub09wcG9uZW50ICgpIHtcbiAgICAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggRXJyb3InLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj48c3Ryb25nPllvdXIgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGZhaWxlZCB0byBjb25maXJtITwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+QmFjazwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tYXNzZXJ0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5RdWV1ZSBBZ2FpbjwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgaWYocmVzKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ2NhbmNlbGxlZCcpO1xuICAgICAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ2NhbmNlbGxlZCcpO1xuICAgICAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMYXN0TWF0Y2goKSB7XG4gICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdjb21wbGV0ZWQnKSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGFuZ2VXb3JkICgpIHtcbiAgICAkc2NvcGUubXlPcHBvbmVudC5uYW1lID0gJHNjb3BlLm9wcG9uZW50Lmxpc3RbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpKiRzY29wZS5vcHBvbmVudC5saXN0Lmxlbmd0aCldO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMYWRkZXJKb2luQ3RybCcsIExhZGRlckpvaW5DdHJsKTtcblxuZnVuY3Rpb24gTGFkZGVySm9pbkN0cmwoXG4gICRzY29wZSwgJGZpbHRlciwgJGlvbmljUG9wdXAsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgJHEsIFBhcnNlLCAgdG91cm5hbWVudCwgTGFkZGVyU2VydmljZXNcbikge1xuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICAkc2NvcGUucGxheWVyID0ge1xuICAgIGJhdHRsZVRhZzogJydcbiAgfTtcblxuICAkc2NvcGUucmVnaXN0ZXJQbGF5ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFsaWRhdGVCYXR0bGVUYWcoKS50aGVuKFxuICAgICAgZnVuY3Rpb24gKHRhZykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnVzZXJuYW1lID0gJHNjb3BlLnVzZXIudXNlcm5hbWU7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc3RhdHVzID0gJ29wZW4nO1xuICAgICAgICBMYWRkZXJTZXJ2aWNlcy5qb2luVG91cm5hbWVudCgkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIsICRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgIFN1Y2Nlc3NQb3B1cChwbGF5ZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IpO1xuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVCYXR0bGVUYWcgKCkge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRhZyA9ICRzY29wZS5wbGF5ZXIuYmF0dGxlVGFnO1xuXG4gICAgaWYodGFnLmxlbmd0aCA8IDgpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIGJhdHRsZSB0YWcnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgc3BsaXQgPSB0YWcuc3BsaXQoJyMnKTtcbiAgICBpZihzcGxpdC5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIEJBVFRMRVRBR+KEoiBpbmNsdWRpbmcgIyBhbmQgZm91ciBkaWdpdHMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihzcGxpdFsxXS5sZW5ndGggPCAyIHx8IHNwbGl0WzFdLmxlbmd0aCA+IDQpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgdXAgdG8gZm91ciBkaWdpdHMgYWZ0ZXIgIyEnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihpc05hTihzcGxpdFsxXSkpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgZm91ciBkaWdpdHMgYWZ0ZXIgIycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLnZhbGlkYXRlUGxheWVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsIHRhZykudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgaWYocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgY2IucmVqZWN0KCdUaGUgQkFUVExFVEFH4oSiIHlvdSBlbnRlcmVkIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0YWcpO1xuICAgICAgfSBcbiAgICB9KTtcbiAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgfTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gU3VjY2Vzc1BvcHVwIChwbGF5ZXIpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdDb25ncmF0dWxhdGlvbnMgJyArIHBsYXllci51c2VybmFtZSArICchJyxcbiAgICAgIHRlbXBsYXRlOiAnWW91IGhhdmUgc3VjY2Vzc2Z1bGx5IHNpZ25lZCB1cCEgTm93IGdvIGZpbmQgYSB2YWxpYW50IG9wcG9uZW50LidcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGVhZGVyQm9hcmRzQ3RybCcsIExlYWRlckJvYXJkc0N0cmwpO1xuXG5mdW5jdGlvbiBMZWFkZXJCb2FyZHNDdHJsKCRzY29wZSwgTGFkZGVyU2VydmljZXMsIHRvdXJuYW1lbnQsIFBhcnNlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gIGdldFBsYXllcnMoKTtcbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uICgpIHtcbiAgICBnZXRQbGF5ZXJzKCk7XG4gIH1cbiAgXG4gIGZ1bmN0aW9uIGdldFBsYXllcnMoKSB7XG4gICAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVycyh0b3VybmFtZW50LnRvdXJuYW1lbnQpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgIHZhciByYW5rID0gMTtcbiAgICAgIGFuZ3VsYXIuZm9yRWFjaChwbGF5ZXJzLCBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHBsYXllci5yYW5rID0gcmFuaztcbiAgICAgICAgcmFuaysrO1xuICAgICAgfSk7XG4gICAgICAkc2NvcGUucGxheWVycyA9IHBsYXllcnM7XG4gICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgIH0pO1xuICB9XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ1Jlc2V0UGFzc3dvcmRDdHJsJywgUmVzZXRQYXNzd29yZEN0cmwpO1xuXG5mdW5jdGlvbiBSZXNldFBhc3N3b3JkQ3RybFxuKCRzY29wZSwgJGlvbmljUG9wdXAsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgUGFyc2UpIHtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS5lbWFpbCA9IHt9O1xuICBcbiAgJHNjb3BlLnJlc2V0UGFzc3dvcmQgPSBmdW5jdGlvbiAoZW1haWwpIHtcbiAgICBQYXJzZS5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0KGVtYWlsLnRleHQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTdWNjZXNzUG9wdXAoKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmVcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIFxuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdVcGRhdGUgRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1Bhc3N3b3JkIFJlc2V0JyxcbiAgICAgIHRlbXBsYXRlOiAnQW4gRW1haWwgaGFzIGJlZW4gc2VudCB0byByZXNldCB5b3VyIHBhc3N3b3JkJ1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgfSlcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVyUHJvZmlsZUN0cmwnLCBMYWRkZXJQcm9maWxlQ3RybCk7XG5cbmZ1bmN0aW9uIExhZGRlclByb2ZpbGVDdHJsKFxuICAkc2NvcGUsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksICRxLCBQYXJzZSwgIHRvdXJuYW1lbnQsIExhZGRlclNlcnZpY2VzLCBwbGF5ZXJcbikge1xuXG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50LnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG4gICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJbMF07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhbGlkYXRlQmF0dGxlVGFnKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgU3VjY2Vzc1BvcHVwKHBsYXllcikudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvcik7XG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZUJhdHRsZVRhZyAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdGFnID0gJHNjb3BlLnBsYXllci5iYXR0bGVUYWc7XG5cbiAgICBpZih0YWcubGVuZ3RoIDwgOCkge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgYmF0dGxlIHRhZycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBzcGxpdCA9IHRhZy5zcGxpdCgnIycpO1xuICAgIGlmKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgQkFUVExFVEFH4oSiIGluY2x1ZGluZyAjIGFuZCBmb3VyIGRpZ2l0cycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKHNwbGl0WzFdLmxlbmd0aCA8IDIgfHwgc3BsaXRbMV0ubGVuZ3RoID4gNCkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyB1cCB0byBmb3VyIGRpZ2l0cyBhZnRlciAjIScpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKGlzTmFOKHNwbGl0WzFdKSkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyBmb3VyIGRpZ2l0cyBhZnRlciAjJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMudmFsaWRhdGVQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCwgdGFnKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICBpZihyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBjYi5yZWplY3QoJ1RoZSBCQVRUTEVUQUfihKIgeW91IGVudGVyZWQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYi5yZXNvbHZlKHRhZyk7XG4gICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1VwZGF0ZSBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFN1Y2Nlc3NQb3B1cCAocGxheWVyKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnQ29uZ3JhdHVsYXRpb25zICcgKyBwbGF5ZXIudXNlcm5hbWUgKyAnIScsXG4gICAgICB0ZW1wbGF0ZTogJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSB1cGRhdGVkISBOb3cgZ28gYW5kIHBsYXkhJ1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBMb2dpbkN0cmwpO1xuXG5mdW5jdGlvbiBMb2dpbkN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICRzY29wZS51c2VyID0ge307XG4gIFBhcnNlLlVzZXIubG9nT3V0KCk7XG4gICRzY29wZS5sb2dpblVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgUGFyc2UuVXNlci5sb2dJbigkc2NvcGUudXNlci51c2VybmFtZSwgJHNjb3BlLnVzZXIucGFzc3dvcmQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICAgIH0pO1xuICAgICAgICBcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uICh1c2VyLCBlcnJvcikge1xuICAgICAgICAkc2NvcGUud2FybmluZyA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTWF0Y2hMaXN0Q3RybCcsIE1hdGNoTGlzdEN0cmwpO1xuXG5mdW5jdGlvbiBNYXRjaExpc3RDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGlvbmljUG9wdXAsICRyb290U2NvcGUsIFBhcnNlLCBNYXRjaFNlcnZpY2VzLCBwbGF5ZXJcbikge1xuICAkc2NvcGUubWF0Y2hlcyA9IFtdO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuXG4gIGlmKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgIE1hdGNoU2VydmljZXMuZ2V0UGxheWVyTWF0Y2hlcygkc2NvcGUucGxheWVyLCBudWxsKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICBjb25zb2xlLmxvZygnbWF0Y2hlcyBmZXRjaGVkJyk7XG4gICAgICAkc2NvcGUubWF0Y2hlcyA9IG1hdGNoZXM7XG4gICAgICBNYXRjaFNlcnZpY2VzLmdldFBsYXllck1hdGNoZXMoJHNjb3BlLnBsYXllciwgJ3JlcG9ydGVkJykudGhlbihmdW5jdGlvbiAocmVwb3J0ZWQpIHtcbiAgICAgICAgJHNjb3BlLnJlcG9ydGVkID0gcmVwb3J0ZWQ7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICB9KTtcbiAgICB9KTtcblxuICB9XG5cbiAgJHNjb3BlLnByb2Nlc3NNYXRjaCA9IGZ1bmN0aW9uIChtYXRjaCkge1xuICAgIGlmKG1hdGNoLndpbm5lci5pZCA9PT0gJHNjb3BlLnBsYXllci5pZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZihtYXRjaC5sb3Nlci5pZCA9PT0gJHNjb3BlLnBsYXllci5pZCkge1xuICAgICAgaWYobWF0Y2gucmVwb3J0UmVhc29uKXtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICBpZigkc2NvcGUucmVwb3J0ZWQubGVuZ3RoKSB7XG4gICAgICBzaG93UmVwb3J0ZWQoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYobWF0Y2guc3RhdHVzICE9PSAnY29tcGxldGVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAkc3RhdGUuZ28oJ2FwcC5tYXRjaC5yZXBvcnQnLCB7aWQ6IG1hdGNoLmlkfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93UmVwb3J0ZWQoKSB7XG4gICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdUb28gTWFueSBSZXBvcnRzJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+WW91IGhhdmUgdG9vIG1hbnkgcGVuZGluZyByZXBvcnRzLiBQbGVhc2Ugd2FpdC48L2Rpdj4nXG4gICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG5cbiAgICB9KVxuICB9XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoUmVwb3J0Q3RybCcsIE1hdGNoUmVwb3J0Q3RybCk7XG5cbmZ1bmN0aW9uIE1hdGNoUmVwb3J0Q3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY1BvcHVwLCAkaW9uaWNIaXN0b3J5LFxuICBQYXJzZSwgTWF0Y2hTZXJ2aWNlcywgY2FtZXJhU2VydmljZXMsIHJlcG9ydFxuKSB7XG5cbiAgJHNjb3BlLm1hdGNoID0gcmVwb3J0O1xuXG4gICRzY29wZS5waWN0dXJlID0gbnVsbDtcblxuICB2YXIgcGFyc2VGaWxlID0gbmV3IFBhcnNlLkZpbGUoKTtcbiAgdmFyIGltZ1N0cmluZyA9IG51bGw7XG5cbiAgJHNjb3BlLmdldFBpY3R1cmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGNhbWVyYVNlcnZpY2VzLmNhbWVyYTtcbiAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUob25TdWNjZXNzLG9uRmFpbCxvcHRpb25zKTtcbiAgfVxuICB2YXIgb25TdWNjZXNzID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XG4gICAgJHNjb3BlLnBpY3R1cmUgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcgKyBpbWFnZURhdGE7XG4gICAgaW1nU3RyaW5nID0gaW1hZ2VEYXRhO1xuICAgICRzY29wZS4kYXBwbHkoKTtcbiAgfTtcbiAgdmFyIG9uRmFpbCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIk9uIGZhaWwgXCIgKyBlKTtcbiAgfVxuXG4gICRzY29wZS5wcm9jZXNzUmVwb3J0ID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICBpZihpbWdTdHJpbmcpIHtcbiAgICAgIHBhcnNlRmlsZSA9IG5ldyBQYXJzZS5GaWxlKFwicmVwb3J0LnBuZ1wiLCB7YmFzZTY0OmltZ1N0cmluZ30pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJzZUZpbGUgPSBudWxsO1xuICAgIH1cbiAgICAkc2NvcGUubWF0Y2guc2V0KFwicmVwb3J0SW1hZ2VcIiwgcGFyc2VGaWxlKTtcbiAgICAkc2NvcGUubWF0Y2guc2V0KCdzdGF0dXMnLCAncmVwb3J0ZWQnKTtcbiAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICB9KTtcbiAgICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgICAgdGl0bGU6ICdNYXRjaCBSZXBvcnRlZCcsXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+VGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHRoZSByZXBvcnQuPC9kaXY+J1xuICAgICAgfSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfVxuXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoVmlld0N0cmwnLCBNYXRjaFZpZXdDdHJsKTtcblxuZnVuY3Rpb24gTWF0Y2hWaWV3Q3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY1BvcHVwLCAkaW9uaWNIaXN0b3J5LCAkdGltZW91dCxcbiAgUGFyc2UsIExhZGRlclNlcnZpY2VzLCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCBjYW1lcmFTZXJ2aWNlcywgdG91cm5hbWVudFxuKSB7XG4gIFxuICB2YXIgcGFyc2VGaWxlID0gbmV3IFBhcnNlLkZpbGUoKTtcbiAgdmFyIGltZ1N0cmluZyA9IG51bGw7XG4gIFxuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG5cbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICBcbiAgJHNjb3BlLiRvbihcIiRpb25pY1ZpZXcuZW50ZXJcIiwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnNbMF07XG4gICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdjYW5jZWxsZWQnKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNYXRjaERldGFpbHMoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbiAgXG4gICRzY29wZS4kb24oJyRpb25pY1ZpZXcubGVhdmUnLCBmdW5jdGlvbihldmVudCkge1xuICAgIGxvc2VNYXRjaCgpLmNsb3NlKCk7XG4gICAgd2luTWF0Y2goKS5jbG9zZSgpO1xuICB9KTtcblxuICAkc2NvcGUuZ2V0UGljdHVyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcHRpb25zID0gY2FtZXJhU2VydmljZXMuY2FtZXJhO1xuICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZShvblN1Y2Nlc3Msb25GYWlsLG9wdGlvbnMpO1xuICB9XG4gIHZhciBvblN1Y2Nlc3MgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlRGF0YTtcbiAgICBpbWdTdHJpbmcgPSBpbWFnZURhdGE7XG4gICAgJHNjb3BlLiRhcHBseSgpO1xuICB9O1xuICB2YXIgb25GYWlsID0gZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUubG9nKFwiT24gZmFpbCBcIiArIGUpO1xuICB9XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIGdldE1hdGNoKHRydWUpO1xuICB9O1xuXG4gICRzY29wZS5yZWNvcmQgPSBmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBudWxsO1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnYWN0aXZlJykge1xuICAgICAgICBzd2l0Y2ggKHJlY29yZCkge1xuICAgICAgICAgIGNhc2UgJ3dpbic6XG4gICAgICAgICAgICB3aW5NYXRjaCgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgIGlmKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lXG4gICAgICAgICAgICAgICAgcmVjb3JkTWF0Y2goJHNjb3BlLm1hdGNoLCB1c2VybmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdsb3NzJzpcbiAgICAgICAgICAgIGxvc2VNYXRjaCgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgIGlmKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5vcHBvbmVudC51c2VyKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdsb3NlcicsICRzY29wZS5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJlY29yZE1hdGNoKCRzY29wZS5tYXRjaCwgdXNlcm5hbWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gd2luTWF0Y2ggKCkge1xuICAgICRzY29wZS5waWN0dXJlID0gbnVsbDtcbiAgICAkc2NvcGUuZXJyb3JNZXNzYWdlID0gbnVsbDtcblxuICAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvd2luLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1JlcG9ydCBhIFdpbicsXG4gICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdDYW5jZWwnfSxcbiAgICAgICAgICB7IHRleHQ6ICc8Yj5Db25maXJtPC9iPicsXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLnBpY3R1cmUpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JNZXNzYWdlID0gJ1VwbG9hZCBhIFNjcmVlbnNob3QnO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBsb3NlTWF0Y2goKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLnNob3coXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy9sb3NlLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1JlcG9ydCBhIExvc3MnLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWF0Y2gocmVmcmVzaCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJHNjb3BlLm1hdGNoLmlkKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICBjb25zb2xlLmxvZygnbWF0Y2gnICsgJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykpO1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoIGZldGNoZWQnKTtcbiAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5tYXRjaC5nZXQoJ3dpbm5lcicpKTtcbiAgICAgIGlmKHJlZnJlc2gpIHtcbiAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgZnVuY3Rpb24gcmVjb3JkTWF0Y2gobWF0Y2gsIHVzZXJuYW1lKSB7XG4gICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzaG93OmxvYWRpbmcnKTtcbiAgICBtYXRjaC5zZXQoJ3N0YXR1cycsICdjb21wbGV0ZWQnKTtcbiAgICBtYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaFJlc3VsdHMnLCB7dXNlcm5hbWU6IHVzZXJuYW1lLCBtYXRjaDogbWF0Y2guaWR9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1hdGNoRGV0YWlscygpIHtcbiAgICAkc2NvcGUub3Bwb25lbnQgPSB7XG4gICAgICBoZXJvOiBudWxsLFxuICAgICAgYmF0dGxlVGFnOiBudWxsXG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8yO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjI7XG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMicpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8xO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjE7XG4gICAgfVxuICB9XG59O1xuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignTWVudUN0cmwnLCBNZW51Q3RybCk7XG5cbmZ1bmN0aW9uIE1lbnVDdHJsKCRzY29wZSwgJGlvbmljUG9wb3ZlciwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCBQYXJzZSwgJHRpbWVvdXQpIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuXG4gICRpb25pY1BvcG92ZXIuZnJvbVRlbXBsYXRlVXJsKCd0ZW1wbGF0ZXMvcG9wb3ZlcnMvcHJvZmlsZS5wb3AuaHRtbCcsIHtcbiAgICBzY29wZTogJHNjb3BlLFxuICB9KS50aGVuKGZ1bmN0aW9uKHBvcG92ZXIpIHtcbiAgICAkc2NvcGUucG9wb3ZlciA9IHBvcG92ZXI7XG4gIH0pO1xuXG4gICRzY29wZS5tZW51ID0gZnVuY3Rpb24gKGxpbmspIHtcbiAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgIH0pO1xuICAgIGlmKGxpbmsgPT09ICdsb2dpbicpIHtcbiAgICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4pIHtcbiAgICAgICAgUGFyc2VQdXNoUGx1Z2luLnVuc3Vic2NyaWJlKCRzY29wZS51c2VyLmN1cnJlbnQoKS51c2VybmFtZSwgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Vuc3ViYmVkJyk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgICR0aW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgUGFyc2UuVXNlci5sb2dPdXQoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LCAxMDAwKTtcbiAgICAgIFxuICAgICAgXG4gICAgfSBlbHNlIHtcbiAgICAgICRzdGF0ZS5nbygnYXBwLicgKyBsaW5rLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgfVxuICAgICRzY29wZS5wb3BvdmVyLmhpZGUoKTtcbiAgfVxuICAvL0NsZWFudXAgdGhlIHBvcG92ZXIgd2hlbiB3ZSdyZSBkb25lIHdpdGggaXQhXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnBvcG92ZXIucmVtb3ZlKCk7XG4gIH0pO1xufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ1JlZ2lzdGVyQ3RybCcsIFJlZ2lzdGVyQ3RybCk7XG5cblJlZ2lzdGVyQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnJHN0YXRlJywgJ1BhcnNlJywgJyRpb25pY1BvcHVwJ107XG5mdW5jdGlvbiBSZWdpc3RlckN0cmwoJHNjb3BlLCAkc3RhdGUsIFBhcnNlLCAkaW9uaWNQb3B1cCkge1xuXG4gICRzY29wZS51c2VyID0ge307XG5cbiAgJHNjb3BlLlJlZ2lzdGVyVXNlciA9IGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgdmFyIHJlZ2lzdGVyID0gbmV3IFBhcnNlLlVzZXIoKTtcbiAgICByZWdpc3Rlci5zZXQodXNlcik7XG4gICAgcmVnaXN0ZXIuc2lnblVwKG51bGwsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKHVzZXIsIGVycm9yKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIGVycm9yIG1lc3NhZ2Ugc29tZXdoZXJlIGFuZCBsZXQgdGhlIHVzZXIgdHJ5IGFnYWluLlxuICAgICAgICBFcnJvclBvcHVwKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd1c2VyJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuICAgICRzY29wZS53YXJuaW5nID0gbnVsbDtcbiAgfSwgdHJ1ZSk7XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1JlZ2lzdHJhdGlvbiBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTGFkZGVyU2VydmljZXMnLCBMYWRkZXJTZXJ2aWNlcylcbiAgLmZhY3RvcnkoJ0xhZGRlcicsIExhZGRlcilcblxuZnVuY3Rpb24gTGFkZGVyU2VydmljZXMoUGFyc2UsIExhZGRlcikge1xuICByZXR1cm4ge1xuICAgIGdldFBsYXllcnM6IGdldFBsYXllcnMsXG4gICAgZ2V0UGxheWVyOiBnZXRQbGF5ZXIsXG4gICAgdmFsaWRhdGVQbGF5ZXI6IHZhbGlkYXRlUGxheWVyLFxuICAgIGpvaW5Ub3VybmFtZW50OiBqb2luVG91cm5hbWVudCxcbiAgICBnZXRQZW5kaW5nUGxheWVyczogZ2V0UGVuZGluZ1BsYXllcnNcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQZW5kaW5nUGxheWVycyh0b3VybmFtZW50LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5Lm5vdEVxdWFsVE8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcnModG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKCdwb2ludHMnLCAnbW1yJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZVBsYXllcih0b3VybmV5LCBiYXR0bGVUYWcpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygnYmF0dGxlVGFnJywgYmF0dGxlVGFnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcih0b3VybmV5LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgdXNlciwgdXNlckRhdGEpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbCgpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgdXNlcik7XG4gICAgcGxheWVyLnNldCh1c2VyRGF0YSk7XG4gICAgcGxheWVyLnNldCgnd2lucycsIDApO1xuICAgIHBsYXllci5zZXQoJ2xvc3NlcycsIDApO1xuICAgIHBsYXllci5zZXQoJ3BvaW50cycsIDApO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBMYWRkZXIoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTGFkZGVyJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3VzZXInLCAnYmF0dGxlVGFnJywgJ3VzZXJuYW1lJywgJ2xvY2F0aW9uJyxcbiAgICAnaGVybycsICdwbGF5ZXInLCAnc3RhdHVzJywgJ2NhbmNlbFRpbWVyJywgJ3dpbnMnLCAnbG9zc2VzJywgJ21tcicsICdwb2ludHMnLCAnYmFuUmVhc29uJywgJ2FkbWluJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ2xvY2F0aW9uU2VydmljZXMnLCBsb2NhdGlvblNlcnZpY2VzKTtcblxuZnVuY3Rpb24gbG9jYXRpb25TZXJ2aWNlcyAoUGFyc2UsICRjb3Jkb3ZhR2VvbG9jYXRpb24sICRxLCAkcm9vdFNjb3BlKSB7XG5cbiAgdmFyIGxvY2F0aW9uID0ge2Nvb3JkczogbmV3IFBhcnNlLkdlb1BvaW50KCl9O1xuICByZXR1cm4ge1xuICAgIGxvY2F0aW9uOiBsb2NhdGlvbixcbiAgICBnZXRMb2NhdGlvbjogZ2V0TG9jYXRpb24sXG4gICAgc2V0TG9jYXRpb246IHNldExvY2F0aW9uXG4gIH1cbiAgXG4gIGZ1bmN0aW9uIHNldExvY2F0aW9uIChjb29yZHMpIHtcbiAgICBsb2NhdGlvbi5jb29yZHMgPSBuZXcgUGFyc2UuR2VvUG9pbnQoe2xhdGl0dWRlOiBjb29yZHMubGF0aXR1ZGUsIGxvbmdpdHVkZTogY29vcmRzLmxvbmdpdHVkZX0pXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMb2NhdGlvbiAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgcG9zT3B0aW9ucyA9IHtlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlfTtcbiAgICAkY29yZG92YUdlb2xvY2F0aW9uXG4gICAgICAuZ2V0Q3VycmVudFBvc2l0aW9uKHBvc09wdGlvbnMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgY2IucmVzb2x2ZShwb3NpdGlvbi5jb29yZHMpO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGNiLnJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTWF0Y2hTZXJ2aWNlcycsIE1hdGNoU2VydmljZXMpXG4gIC5mYWN0b3J5KCdNYXRjaCcsIE1hdGNoKTtcblxuZnVuY3Rpb24gTWF0Y2hTZXJ2aWNlcyhQYXJzZSwgTWF0Y2gsICRxKSB7XG4gIHZhciB1c2VyID0gUGFyc2UuVXNlcjtcbiAgcmV0dXJuIHtcbiAgICBnZXRDb25maXJtZWRNYXRjaDogZ2V0Q29uZmlybWVkTWF0Y2gsXG4gICAgZ2V0UGVuZGluZ01hdGNoOiBnZXRQZW5kaW5nTWF0Y2gsXG4gICAgZ2V0TGF0ZXN0TWF0Y2g6IGdldExhdGVzdE1hdGNoLFxuICAgIGdldE1hdGNoOiBnZXRNYXRjaCxcbiAgICBnZXRQbGF5ZXJNYXRjaGVzOiBnZXRQbGF5ZXJNYXRjaGVzLFxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyTWF0Y2hlcyhwbGF5ZXIsIHN0YXR1cykge1xuICAgIHZhciBwbGF5ZXIxID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBwbGF5ZXIxLmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIHZhciBwbGF5ZXIyID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBwbGF5ZXIyLmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIHZhciBtYWluUXVlcnkgPSBQYXJzZS5RdWVyeS5vcihwbGF5ZXIxLCBwbGF5ZXIyKTtcbiAgICBtYWluUXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBtYWluUXVlcnkubGltaXQoMTApO1xuICAgIGlmKHN0YXR1cykge1xuICAgICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsIHN0YXR1cyk7XG4gICAgfVxuICAgIHJldHVybiBtYWluUXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGF0ZXN0TWF0Y2gocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKVxuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuaW5jbHVkZSgnd2lubmVyJyk7XG4gICAgcXVlcnkuaW5jbHVkZSgnbG9zZXInKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q29uZmlybWVkTWF0Y2ggKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJyk7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdhY3RpdmUnKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcilcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcilcbiAgICB9XG4gICAgcXVlcnkuZXF1YWxUbygnY29uZmlybTEnLCB0cnVlKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdjb25maXJtMicsIHRydWUpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuXG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRQZW5kaW5nTWF0Y2gocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKVxuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKTtcbiAgICB9XG4gICAgcXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE1hdGNoKGlkKSB7XG4gICAgdmFyIG1hdGNoID0gbmV3IE1hdGNoLk1vZGVsKCk7XG4gICAgbWF0Y2guaWQgPSBpZDtcbiAgICByZXR1cm4gbWF0Y2guZmV0Y2goKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNYXRjaChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdNYXRjaCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFtcbiAgICAndG91cm5hbWVudCcsICdwbGF5ZXIxJywgJ3BsYXllcjInLCAnaGVybzEnLCAnaGVybzInLCAndXNlcm5hbWUxJywgJ3VzZXJuYW1lMicsICdiYXR0bGVUYWcxJywgJ2JhdHRsZVRhZzInLCAnc3RhdHVzJywgJ3dpbm5lcicsICdsb3NlcicsXG4gICAgJ3dpbkltYWdlJywgJ3JlcG9ydFJlYXNvbicsICdyZXBvcnRJbWFnZScsICdhY3RpdmVEYXRlJywgJ3VzZXIxJywgJ3VzZXIyJ1xuICBdO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ2NhbWVyYVNlcnZpY2VzJywgY2FtZXJhU2VydmljZXMpO1xuXG5mdW5jdGlvbiBjYW1lcmFTZXJ2aWNlcyAoKSB7XG4gIFxuICB2YXIgY2FtZXJhID0ge1xuICAgIHF1YWxpdHk6IDkwLFxuICAgIHRhcmdldFdpZHRoOiAzMjAsXG4gICAgdGFyZ2V0SGVpZ2h0OiA1MDAsXG4gICAgYWxsb3dFZGl0OiB0cnVlLFxuICAgIGRlc3RpbmF0aW9uVHlwZTogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5EQVRBX1VSTCxcbiAgICBzb3VyY2VUeXBlOiAwLFxuICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5KUEVHXG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgY2FtZXJhOiBjYW1lcmFcbiAgfVxuXG4gIC8vIGZ1bmN0aW9uIGdldERhdGFVcmkgKHVybCwgY2FsbGJhY2spIHtcbiAgLy8gICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgLy8gICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIC8vICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIC8vICAgICBjYW52YXMud2lkdGggPSB0aGlzLm5hdHVyYWxXaWR0aDsgLy8gb3IgJ3dpZHRoJyBpZiB5b3Ugd2FudCBhIHNwZWNpYWwvc2NhbGVkIHNpemVcbiAgLy8gICAgIGNhbnZhcy5oZWlnaHQgPSB0aGlzLm5hdHVyYWxIZWlnaHQ7IC8vIG9yICdoZWlnaHQnIGlmIHlvdSB3YW50IGEgc3BlY2lhbC9zY2FsZWQgc2l6ZVxuICAvL1xuICAvLyAgICAgY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMsIDAsIDApO1xuICAvL1xuICAvLyAgICAgLy8gR2V0IHJhdyBpbWFnZSBkYXRhXG4gIC8vICAgICBjYWxsYmFjayhjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKS5yZXBsYWNlKC9eZGF0YTppbWFnZVxcLyhwbmd8anBnKTtiYXNlNjQsLywgJycpKTtcbiAgLy9cbiAgLy8gICAgIC8vIC4uLiBvciBnZXQgYXMgRGF0YSBVUklcbiAgLy8gICAgIC8vY2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJykpO1xuICAvLyAgIH07XG4gIC8vICAgaW1hZ2Uuc3JjID0gdXJsO1xuICAvLyB9XG5cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnUXVldWVTZXJ2aWNlcycsIFF1ZXVlU2VydmljZXMpXG5cbmZ1bmN0aW9uIFF1ZXVlU2VydmljZXMoKSB7XG4gIHZhciBvcHBvbmVudCA9IHtcbiAgICBsaXN0OiBbJ0Vhc3kgUGlja2luZ3MnLCAnWW91ciBXb3JzdCBOaWdodG1hcmUnLCAnV29ybGQgY2xhc3MgcGFzdGUgZWF0ZXInLFxuICAgICAgJ0EgTXVybG9jJywgJ0dvdXJkIGNyaXRpYycsICdOb3NlIGFuZCBtb3V0aCBicmVhdGhlcicsICdIb2dnZXInLCAnQSBjYXJkaXNoIElhbicsXG4gICAgICAnTW9wZXkgTWFnZScsICdXb21iYXQgV2FybG9jaycsICdSb3VnZWQgdXAgUm9ndWUnLCAnV2FpZmlzaCBXYXJyaW9yJywgJ0RhbXAgRHJ1aWQnLFxuICAgICAgJ1NoYWJieSBTaGFtYW4nLCAnUGVubmlsZXNzIFBhbGFkaW4nLCAnSHVmZnkgSHVudGVyJywgJ1Blcmt5IFByaWVzdCcsICdUaGUgV29yc3QgUGxheWVyJyxcbiAgICAgICdZb3VyIE9sZCBSb29tbWF0ZScsICdTdGFyQ3JhZnQgUHJvJywgJ0Zpc2NhbGx5IHJlc3BvbnNpYmxlIG1pbWUnLCAnWW91ciBHdWlsZCBMZWFkZXInLFxuICAgICAgJ05vbmVjayBHZW9yZ2UnLCAnR3VtIFB1c2hlcicsICdDaGVhdGVyIE1jQ2hlYXRlcnNvbicsICdSZWFsbHkgc2xvdyBndXknLCAnUm9hY2ggQm95JyxcbiAgICAgICdPcmFuZ2UgUmh5bWVyJywgJ0NvZmZlZSBBZGRpY3QnLCAnSW53YXJkIFRhbGtlcicsICdCbGl6emFyZCBEZXZlbG9wZXInLCAnR3JhbmQgTWFzdGVyJyxcbiAgICAgICdEaWFtb25kIExlYWd1ZSBQbGF5ZXInLCAnQnJhbmQgTmV3IFBsYXllcicsICdEYXN0YXJkbHkgRGVhdGggS25pZ2h0JywgJ01lZGlvY3JlIE1vbmsnLFxuICAgICAgJ0EgTGl0dGxlIFB1cHB5J1xuICAgIF1cbiAgfTtcbiAgdmFyIGhlcm9lcyA9IFtcbiAgICB7dGV4dDogJ21hZ2UnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdodW50ZXInLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwYWxhZGluJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnd2FycmlvcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2RydWlkJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnd2FybG9jaycsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3NoYW1hbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3ByaWVzdCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3JvZ3VlJywgY2hlY2tlZDogZmFsc2V9XG4gIF1cbiAgcmV0dXJuIHtcbiAgICBvcHBvbmVudDogb3Bwb25lbnQsXG4gICAgaGVyb2VzOiBoZXJvZXNcbiAgfVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1RvdXJuYW1lbnRTZXJ2aWNlcycsIFRvdXJuYW1lbnRTZXJ2aWNlcylcbiAgLmZhY3RvcnkoJ1RvdXJuYW1lbnQnLCBUb3VybmFtZW50KVxuICAuZmFjdG9yeSgnRGV0YWlscycsIERldGFpbHMpO1xuXG5mdW5jdGlvbiBUb3VybmFtZW50U2VydmljZXMoUGFyc2UsICRxLCBUb3VybmFtZW50LCBEZXRhaWxzLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb3VybmFtZW50OiBnZXRUb3VybmFtZW50LFxuICAgIGNyZWF0ZVRvdXJuYW1lbnQ6IGNyZWF0ZVRvdXJuYW1lbnQsXG4gICAgZ2V0TGFkZGVyOiBnZXRMYWRkZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH1cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgcGxheWVyKSB7XG4gICAgdmFyIHBsYXllciA9IG5ldyBMYWRkZXIuTW9kZWwocGxheWVyKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VybmFtZScsIFBhcnNlLlVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICBwbGF5ZXIuc2V0KCdtbXInLCAxMDAwKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VG91cm5hbWVudCgpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoRGV0YWlscy5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndHlwZScsICdsYWRkZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd0b3VybmFtZW50Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb3VybmFtZW50ICgpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0b3VybmFtZW50ID0gbmV3IFRvdXJuYW1lbnQuTW9kZWwoKTtcbiAgICB0b3VybmFtZW50LnNldCgnbmFtZScsICdPTk9HIE9QRU4nKTtcbiAgICB0b3VybmFtZW50LnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICB0b3VybmFtZW50LnNldCgnZ2FtZScsICdoZWFydGhzdG9uZScpO1xuICAgIHRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuZXkpIHtcbiAgICAgIHZhciBkZXRhaWxzID0gbmV3IERldGFpbHMuTW9kZWwoKTtcbiAgICAgIGRldGFpbHMuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgICBkZXRhaWxzLnNldCgndHlwZScsICdsYWRkZXInKTtcbiAgICAgIGRldGFpbHMuc2V0KCdwbGF5ZXJDb3VudCcsIDApO1xuICAgICAgZGV0YWlscy5zZXQoJ251bU9mR2FtZXMnLCA1KTtcbiAgICAgIGRldGFpbHMuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgZGVmZXIucmVzb2x2ZShkZXRhaWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhZGRlciAodG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5pbmNsdWRlKCdwbGF5ZXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnQoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVG91cm5hbWVudCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnbmFtZScsICdnYW1lJywgJ3N0YXR1cycsICdkaXNhYmxlZCcsICdkaXNhYmxlZFJlYXNvbicsICdsb2NhdGlvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG5mdW5jdGlvbiBEZXRhaWxzKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0RldGFpbHMnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndHlwZScsICdudW1PZkdhbWVzJywgJ3BsYXllckNvdW50J107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
