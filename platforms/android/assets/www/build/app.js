
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


run.$inject = ['$ionicPlatform', '$state', '$rootScope', '$ionicLoading', '$ionicPopup', 'locationServices', '$ionicHistory'];angular.module('ONOG')
  .constant("moment", moment)
  .run(run);

function run ($ionicPlatform, $state, $rootScope, $ionicLoading, $ionicPopup, locationServices, $ionicHistory) {
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
    });

  });
}

angular.module('ONOG.Services', []);



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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5wYXNzd29yZC5jdHJsLmpzIiwiY29udHJvbGxlcnMvbGFkZGVyLnByb2ZpbGUuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5saXN0LmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5yZXBvcnQuY3RybC5qcyIsImNvbnRyb2xsZXJzL21hdGNoLnZpZXcuY3RybC5qcyIsImNvbnRyb2xsZXJzL21lbnUuY3RybC5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmN0cmwuanMiLCJyb3V0ZXMvYWRtaW4ucm91dGVzLmpzIiwicm91dGVzL2xhZGRlci5yb3V0ZXMuanMiLCJyb3V0ZXMvbWF0Y2gucm91dGVzLmpzIiwic2VydmljZXMvbGFkZGVyLnNlcnZpY2VzLmpzIiwic2VydmljZXMvbG9jYXRpb24uc2VydmljZXMuanMiLCJzZXJ2aWNlcy9tYXRjaC5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL3Bob3RvLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7K0VBQUEsUUFBUSxPQUFPLGVBQWU7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TTs7OztBQUlqQixTQUFTLFdBQVcsT0FBTztFQUN6QixJQUFJLFFBQVEsTUFBTSxPQUFPLE9BQU87RUFDaEMsSUFBSSxhQUFhLENBQUMsUUFBUSxRQUFRLFVBQVUsWUFBWSxrQkFBa0I7RUFDMUUsTUFBTSxpQkFBaUIsT0FBTzs7RUFFOUIsT0FBTztJQUNMLE9BQU87OztBQUdYLFNBQVMsUUFBUSxPQUFPO0VBQ3RCLElBQUksUUFBUSxNQUFNLE9BQU8sT0FBTztFQUNoQyxJQUFJLGFBQWEsQ0FBQyxjQUFjLFFBQVEsY0FBYztFQUN0RCxNQUFNLGlCQUFpQixPQUFPOztFQUU5QixPQUFPO0lBQ0wsT0FBTzs7O0FBR1giLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ09OT0cuY29uZmlnJywgW10pXG4gIC5jb25maWcoY29uZmlnKTtcblxuZnVuY3Rpb24gY29uZmlnICgkaW9uaWNDb25maWdQcm92aWRlciwgJGNvbXBpbGVQcm92aWRlciwgUGFyc2VQcm92aWRlcikge1xuXG4gICRjb21waWxlUHJvdmlkZXIuaW1nU3JjU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfGZpbGV8YmxvYnxjb250ZW50fG1zLWFwcHh8eC13bWFwcDApOnxkYXRhOmltYWdlXFwvfGltZ1xcLy8pO1xuICAkY29tcGlsZVByb3ZpZGVyLmFIcmVmU2FuaXRpemF0aW9uV2hpdGVsaXN0KC9eXFxzKihodHRwcz98ZnRwfG1haWx0b3xmaWxlfGdodHRwcz98bXMtYXBweHx4LXdtYXBwMCk6Lyk7XG5cbiAgUGFyc2VQcm92aWRlci5pbml0aWFsaXplKFwibllzQjZ0bUJNWUtZTXpNNWlWOUJVY0J2SFdYODlJdFBYNUdmYk42UVwiLCBcInpyaW44R0VCRFZHYmtsMWlvR0V3bkh1UDcwRmRHNkhoelRTOHVHanpcIik7XG5cbiAgaWYgKGlvbmljLlBsYXRmb3JtLmlzSU9TKCkpIHtcbiAgICAkaW9uaWNDb25maWdQcm92aWRlci5zY3JvbGxpbmcuanNTY3JvbGxpbmcodHJ1ZSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJywgW10pO1xuXG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycsIFtcbiAgJ2lvbmljJyxcbiAgJ25nUGFyc2UnLFxuICAndGltZXInLFxuICAnbmdDb3Jkb3ZhJyxcbiAgJ25nQW5pbWF0ZScsXG4gICdPTk9HLmNvbmZpZycsXG4gICdPTk9HLnJvdXRlcycsXG4gICdPTk9HLkNvbnRyb2xsZXJzJyxcbiAgJ09OT0cuU2VydmljZXMnXG5dKTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcycsIFtcbiAgJ09OT0cucm91dGVzLm1hdGNoZXMnLFxuICAnT05PRy5yb3V0ZXMubGFkZGVyJyxcbiAgJ09OT0cucm91dGVzLmFkbWluJ1xuXSlcbiAgLmNvbmZpZyhyb3V0ZXMpO1xuXG5mdW5jdGlvbiByb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdhcHAvbG9hZGluZycpO1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAnLCB7XG4gICAgICB1cmw6ICcvYXBwJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWVudS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNZW51Q3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsICRxLCBQYXJzZSwgJHN0YXRlKSB7XG4gICAgICAgICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBUb3VybmFtZW50U2VydmljZXMuZ2V0VG91cm5hbWVudCgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuYW1lbnRzKSB7XG4gICAgICAgICAgICBpZih0b3VybmFtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgY2IucmVzb2x2ZSh0b3VybmFtZW50c1swXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSxcbiAgICAgICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAgIGlvbmljLlBsYXRmb3JtLmV4aXRBcHAoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubG9hZGluZycsIHtcbiAgICAgIHVybDogJy9sb2FkaW5nJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2FkaW5nLmh0bWwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmRhc2hib2FyZCcsIHtcbiAgICAgIHVybDogJy9kYXNoYm9hcmQnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2Rhc2hib2FyZC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnRGFzaGJvYXJkQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubG9naW4nLCB7XG4gICAgICB1cmw6ICcvbG9naW4nLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xvZ2luLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLnJlZ2lzdGVyJywge1xuICAgICAgdXJsOiAnL3JlZ2lzdGVyJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9yZWdpc3Rlci5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnUmVnaXN0ZXJDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5yZXNldCcsIHtcbiAgICAgIHVybDogJy9wYXNzd29yZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcGFzc3dvcmQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1Jlc2V0UGFzc3dvcmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcblxuXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRycpXG4gIC5jb25zdGFudChcIm1vbWVudFwiLCBtb21lbnQpXG4gIC5ydW4ocnVuKTtcblxuZnVuY3Rpb24gcnVuICgkaW9uaWNQbGF0Zm9ybSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNMb2FkaW5nLCAkaW9uaWNQb3B1cCwgbG9jYXRpb25TZXJ2aWNlcywgJGlvbmljSGlzdG9yeSkge1xuICAkaW9uaWNQbGF0Zm9ybS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICBpZih3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zLktleWJvYXJkKSB7XG4gICAgICAvLyBIaWRlIHRoZSBhY2Nlc3NvcnkgYmFyIGJ5IGRlZmF1bHQgKHJlbW92ZSB0aGlzIHRvIHNob3cgdGhlIGFjY2Vzc29yeSBiYXIgYWJvdmUgdGhlIGtleWJvYXJkXG4gICAgICAvLyBmb3IgZm9ybSBpbnB1dHMpXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuaGlkZUtleWJvYXJkQWNjZXNzb3J5QmFyKHRydWUpO1xuXG4gICAgICAvLyBEb24ndCByZW1vdmUgdGhpcyBsaW5lIHVubGVzcyB5b3Uga25vdyB3aGF0IHlvdSBhcmUgZG9pbmcuIEl0IHN0b3BzIHRoZSB2aWV3cG9ydFxuICAgICAgLy8gZnJvbSBzbmFwcGluZyB3aGVuIHRleHQgaW5wdXRzIGFyZSBmb2N1c2VkLiBJb25pYyBoYW5kbGVzIHRoaXMgaW50ZXJuYWxseSBmb3JcbiAgICAgIC8vIGEgbXVjaCBuaWNlciBrZXlib2FyZCBleHBlcmllbmNlLlxuICAgICAgY29yZG92YS5wbHVnaW5zLktleWJvYXJkLmRpc2FibGVTY3JvbGwodHJ1ZSk7XG4gICAgfVxuICAgIGlmKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgIFN0YXR1c0Jhci5zdHlsZURlZmF1bHQoKTtcbiAgICB9XG5cbiAgICAkcm9vdFNjb3BlLiRvbignc2hvdzpsb2FkaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAkaW9uaWNMb2FkaW5nLnNob3coe3RlbXBsYXRlOiAnPGlvbi1zcGlubmVyIGljb249XCJzcGlyYWxcIiBjbGFzcz1cInNwaW5uZXItY2FsbVwiPjwvaW9uLXNwaW5uZXI+Jywgc2hvd0JhY2tkcm9wOiB0cnVlLCBhbmltYXRpb246ICdmYWRlLWluJ30pO1xuICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS4kb24oJ2hpZGU6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XG4gICAgfSk7XG5cbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICBjb25zb2xlLmxvZygnbmV3IHZlcnNpb24gMScpO1xuICAgICAgUGFyc2VQdXNoUGx1Z2luLm9uKCdyZWNlaXZlUE4nLCBmdW5jdGlvbihwbil7XG4gICAgICAgIGNvbnNvbGUubG9nKHBuKTtcbiAgICAgICAgaWYoIXBuLnRpdGxlKSB7XG4gICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgdGl0bGU6ICdBbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj4nKyBwbi5hbGVydCArICc8L2Rpdj4nXG4gICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcblxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN3aXRjaCAocG4udGl0bGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ09wcG9uZW50IEZvdW5kJzpcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ09wcG9uZW50IENvbmZpcm1lZCc6XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcsIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdSZXN1bHRzIEVudGVyZWQnOlxuICAgICAgICAgICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICAgICAgdGl0bGU6ICdNYXRjaCBQbGF5ZWQnLFxuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+UmVzdWx0cyBoYXZlIGJlZW4gc3VibWl0dGVkPC9kaXY+J1xuICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcsIHtyZWxvYWQ6IHRydWV9KTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgbG9jYXRpb25TZXJ2aWNlcy5nZXRMb2NhdGlvbigpLnRoZW4oZnVuY3Rpb24gKGxvY2F0aW9uKSB7XG4gICAgICBsb2NhdGlvblNlcnZpY2VzLnNldExvY2F0aW9uKGxvY2F0aW9uKTtcbiAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICAgIH0pO1xuICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgfSk7XG5cbiAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycsIFtdKTtcblxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluTWF0Y2hlc0N0cmwnLCBBZG1pbk1hdGNoZXNDdHJsKTtcblxuZnVuY3Rpb24gQWRtaW5NYXRjaGVzQ3RybCgkc2NvcGUsIFBhcnNlKSB7XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblBsYXllcnNDdHJsJywgQWRtaW5QbGF5ZXJzQ3RybCk7XG5cbmZ1bmN0aW9uIEFkbWluUGxheWVyc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5TZXR0aW5nc0N0cmwnLCBBZG1pblNldHRpbmdzQ3RybCk7XG5cbmZ1bmN0aW9uIEFkbWluU2V0dGluZ3NDdHJsKCRzY29wZSwgbG9jYXRpb25TZXJ2aWNlcywgbmV3VG91cm5hbWVudCwgdG91cm5hbWVudCkge1xuICAkc2NvcGUuZGV0YWlscyA9IG5ld1RvdXJuYW1lbnQ7XG4gIFxuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgXG4gICRzY29wZS5zZXRUb3VybmFtZW50TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgbG9jYXRpb25TZXJ2aWNlcy5nZXRMb2NhdGlvbigpLnRoZW4oZnVuY3Rpb24gKGxvY2F0aW9uKSB7XG4gICAgICB2YXIgcG9pbnQgPSBuZXcgUGFyc2UuR2VvUG9pbnQoe2xhdGl0dWRlOiBsb2NhdGlvbi5sYXRpdHVkZSwgbG9uZ2l0dWRlOiBsb2NhdGlvbi5sb25naXR1ZGV9KTtcbiAgICAgICRzY29wZS50b3VybmFtZW50LnNldChcImxvY2F0aW9uXCIsIHBvaW50KTtcbiAgICAgICRzY29wZS50b3VybmFtZW50LnNhdmUoKS50aGVuKGZ1bmN0aW9uICh0b3VybmFtZW50KSB7XG4gICAgICAgICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudDtcbiAgICAgICAgYWxlcnQoJ3RvdXJubWFuZXQgbG9jYXRpb24gc2V0Jyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignRGFzaGJvYXJkQ3RybCcsIERhc2hib2FyZEN0cmwpO1xuXG5mdW5jdGlvbiBEYXNoYm9hcmRDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGZpbHRlciwgJHRpbWVvdXQsICRpbnRlcnZhbCwgJGlvbmljUG9wdXAsICRyb290U2NvcGUsXG4gIFBhcnNlLCB0b3VybmFtZW50LCBNYXRjaFNlcnZpY2VzLCBRdWV1ZVNlcnZpY2VzLCBMYWRkZXJTZXJ2aWNlcywgbG9jYXRpb25TZXJ2aWNlc1xuKSB7XG4gIHZhciBwcm9taXNlID0gbnVsbDtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50LnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcblxuICAkc2NvcGUuZW5kID0ge1xuICAgIGNhblBsYXk6IHRydWUsXG4gICAgdGltZTogcGFyc2VGbG9hdChtb21lbnQoKS5mb3JtYXQoJ3gnKSlcbiAgfVxuXG4gICRzY29wZS5sb2NhdGlvbiA9IGxvY2F0aW9uU2VydmljZXMubG9jYXRpb247XG4gICRzY29wZS5vcHBvbmVudCA9IFF1ZXVlU2VydmljZXMub3Bwb25lbnQ7XG4gICRzY29wZS5oZXJvTGlzdCA9IFF1ZXVlU2VydmljZXMuaGVyb2VzO1xuICAkc2NvcGUubXlPcHBvbmVudCA9IHtuYW1lOidQQVggQXR0ZW5kZWUnfTtcblxuICAkc2NvcGUuJG9uKFwiJGlvbmljVmlldy5lbnRlclwiLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKG5hdmlnYXRvciAmJiBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG4gICAgICBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlci5jdXJyZW50KCkpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ2xvY2F0aW9uJywgJHNjb3BlLmxvY2F0aW9uLmNvb3Jkcyk7XG4gICAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcjtcbiAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICAgaWYobWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgICAgICB0aW1lcigpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBzZXROb3RpZmljYXRpb25zKCk7XG4gICAgICAgICAgc3RhdHVzKCk7XG4gICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICRzdGF0ZS5yZWxvYWQoJ2FwcC5kYXNoYm9hcmQnKTtcbiAgfTtcbiAgJHNjb3BlLnN0YXJ0UXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoJHNjb3BlLmVuZC5jYW5QbGF5KSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICBzYXZlUGxheWVyKCk7XG4gICAgfVxuICB9O1xuICAkc2NvcGUuY2FuY2VsUXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgICBzYXZlUGxheWVyKCk7XG4gIH07XG5cbiAgJHNjb3BlLnBsYXllckNvbmZpcm0gPSBmdW5jdGlvbiAoKSB7XG4gICAgJHNjb3BlLm1hdGNoLmZldGNoKCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgc3dpdGNoICgkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSkge1xuICAgICAgICBjYXNlICdwZW5kaW5nJzogXG4gICAgICAgICAgY29uZmlybVBsYXllcigpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICAgIHNob3dDYW5jZWxsZWRNYXRjaCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIFxuICAkc2NvcGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgICRpbnRlcnZhbC5jYW5jZWwocHJvbWlzZSk7XG4gIH07XG4gIFxuICAkc2NvcGUuc2hvd09wcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgcHJvbWlzZSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7Y2hhbmdlV29yZCgpfSwgMjAwMCk7XG4gIH07XG5cbiAgJHNjb3BlLnNldFRvT3BlbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgIHNhdmVQbGF5ZXIoKTtcbiAgfVxuXG4gICRzY29wZS5maW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkdGltZW91dCh0aW1lciwgMTUwMCk7XG4gIH1cbiAgXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgfSk7XG4gIFxuICAkc2NvcGUuJG9uKCdkZXN0cm95JywgZnVuY3Rpb24gKCkge1xuICAgIGNvbnNvbGUubG9nKCdjb250cm9sbGVyIGRlc3Ryb3llZCcpO1xuICB9KTtcblxuICBmdW5jdGlvbiBzZXROb3RpZmljYXRpb25zKCkge1xuICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4pIHtcbiAgICAgIFBhcnNlUHVzaFBsdWdpbi5zdWJzY3JpYmUoJHNjb3BlLnBsYXllci51c2VybmFtZSwgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzdWJiZWQgdG8gJyArICRzY29wZS5wbGF5ZXIudXNlcm5hbWUpO1xuICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgfSk7XG4gICAgfVxuICAgIHZhciB1c2VyR2VvUG9pbnQgPSAkc2NvcGUucGxheWVyLmdldChcImxvY2F0aW9uXCIpO1xuICAgIGlmKHVzZXJHZW9Qb2ludCkge1xuICAgICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KCdUb3VybmFtZW50Jyk7XG4gICAgICBxdWVyeS53aXRoaW5NaWxlcyhcImxvY2F0aW9uXCIsIHVzZXJHZW9Qb2ludCwgNTApO1xuICAgICAgcXVlcnkubGltaXQoMTApO1xuICAgICAgcXVlcnkuZmluZCh7XG4gICAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKHBsYWNlc09iamVjdHMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhwbGFjZXNPYmplY3RzKTtcbiAgICAgICAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luICYmIHBsYWNlc09iamVjdHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBQYXJzZVB1c2hQbHVnaW4uc3Vic2NyaWJlKCdwYXgtZWFzdCcsIGZ1bmN0aW9uKG1zZykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygncGF4ZWQnKTtcbiAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCB0byBzdWInKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIGdldFN0YXR1cygpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAkc2NvcGUucGxheWVyLmZldGNoKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIHN0YXR1cygpO1xuICAgICAgfSk7XG4gICAgfSwgMjAwMCk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXMoKSB7XG4gICAgaWYoJHNjb3BlLnBsYXllcikge1xuICAgICAgc3dpdGNoICgkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykpIHtcbiAgICAgICAgY2FzZSAnb3Blbic6XG4gICAgICAgICAgJHNjb3BlLnN0b3AoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncXVldWUnOlxuICAgICAgICAgICRzY29wZS5zaG93T3Bwb25lbnRzKCk7XG4gICAgICAgICAgbWF0Y2hNYWtpbmcoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZm91bmQnOlxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjb25maXJtZWQnOlxuICAgICAgICAgIHdhaXRpbmdGb3JPcHBvbmVudCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdub09wcG9uZW50JzpcbiAgICAgICAgICBub09wcG9uZW50KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3BsYXlpbmcnOlxuICAgICAgICAgIGdldExhc3RNYXRjaCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdjYW5jZWxsZWQnOlxuICAgICAgICAgIHBsYXllckNhbmNlbGxlZCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lciAoKSB7XG4gICAgdmFyIG5vdyA9IG1vbWVudCgpO1xuICAgIHZhciB0aW1lID0gJHNjb3BlLm1hdGNoLmdldCgnYWN0aXZlRGF0ZScpO1xuICAgIGlmKHRpbWUpIHtcbiAgICAgIHZhciBmaXZlTWludXRlcyA9IG1vbWVudCh0aW1lKS5hZGQoMSwgJ21pbnV0ZXMnKTtcbiAgICAgICRzY29wZS5lbmQudGltZSA9IHBhcnNlRmxvYXQoZml2ZU1pbnV0ZXMuZm9ybWF0KCd4JykpO1xuICAgICAgJHNjb3BlLmVuZC5jYW5QbGF5ID0gbm93LmlzQWZ0ZXIoZml2ZU1pbnV0ZXMsICdzZWNvbmRzJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVBsYXllciAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgc3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYXRjaE1ha2luZygpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBQYXJzZS5DbG91ZC5ydW4oJ21hdGNobWFraW5nJykudGhlbihmdW5jdGlvbiAocmVzKXtcbiAgICAgICAgY29uc29sZS5sb2coJ21hdGNobWFraW5nIHN0YXJ0ZWQnKTtcbiAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICAgaWYobWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgICAgfVxuICAgICAgICAgIGdldFN0YXR1cygpO1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDE1MDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dDYW5jZWxsZWRNYXRjaCgpIHtcbiAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ01hdGNoIENhbmNlbGxlZCcsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdSBoYXZlIGZhaWxlZCB0byBjb25maXJtPC9kaXY+J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNvbmZpcm1QbGF5ZXIoKSB7XG4gICAgaWYgKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2NvbmZpcm0yJywgdHJ1ZSk7XG4gICAgfVxuICAgICRzY29wZS5tYXRjaC5zYXZlKCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdjb25maXJtZWQnKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wcG9uZW50Q29uZmlybWVkICgpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSA9PT0gJ2FjdGl2ZScpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgfVxuICAgIH0sIDEwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gd2FpdGluZ0Zvck9wcG9uZW50ICgpIHtcbiAgICBQYXJzZS5DbG91ZC5ydW4oJ2NvbmZpcm1NYXRjaCcpLnRoZW4oZnVuY3Rpb24gKG51bSkge1xuICAgICAgY2hlY2tPcHBvbmVudCg1MDAwLCBmYWxzZSk7XG4gICAgICBjaGVja09wcG9uZW50KDIwMDAwLCB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrT3Bwb25lbnQgKHRpbWVvdXQsIGFscmVhZHlDaGVja2VkKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpID09PSAnY29uZmlybWVkJykge1xuICAgICAgICAkc2NvcGUubWF0Y2guZmV0Y2goKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgICAgIGNoZWNrTWF0Y2hTdGF0dXMoYWxyZWFkeUNoZWNrZWQpO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9LCB0aW1lb3V0KTtcbiAgfVxuICBcbiAgZnVuY3Rpb24gY2hlY2tNYXRjaFN0YXR1cyhhbHJlYWR5Q2hlY2tlZCkge1xuICAgIHN3aXRjaCAoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykpIHtcbiAgICAgIGNhc2UgJ3BlbmRpbmcnOlxuICAgICAgICBpZihhbHJlYWR5Q2hlY2tlZCkge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnbm9PcHBvbmVudCcpO1xuICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ2FjdGl2ZSc6XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncGxheWluZycpO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgICAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgICAgICRzdGF0ZS5nbygnYXBwLm1hdGNoLnZpZXcnKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnY2FuY2VsbGVkJzpcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdjb21wbGV0ZWQnOlxuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgXG5cbiAgZnVuY3Rpb24gbm9PcHBvbmVudCAoKSB7XG4gICAgJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICB0aXRsZTogJ01hdGNoIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+PHN0cm9uZz5Zb3VyIE9wcG9uZW50PC9zdHJvbmc+PGJyPiBmYWlsZWQgdG8gY29uZmlybSE8L2Rpdj4nLFxuICAgICAgYnV0dG9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPkJhY2s8L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLWFzc2VydGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+UXVldWUgQWdhaW48L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3N0YXR1cycsICdjYW5jZWxsZWQnKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3N0YXR1cycsICdjYW5jZWxsZWQnKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGFzdE1hdGNoKCkge1xuICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnY29tcGxldGVkJykge1xuICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICBzYXZlUGxheWVyKCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hhbmdlV29yZCAoKSB7XG4gICAgJHNjb3BlLm15T3Bwb25lbnQubmFtZSA9ICRzY29wZS5vcHBvbmVudC5saXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSokc2NvcGUub3Bwb25lbnQubGlzdC5sZW5ndGgpXTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVySm9pbkN0cmwnLCBMYWRkZXJKb2luQ3RybCk7XG5cbmZ1bmN0aW9uIExhZGRlckpvaW5DdHJsKFxuICAkc2NvcGUsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksICRxLCBQYXJzZSwgIHRvdXJuYW1lbnQsIExhZGRlclNlcnZpY2VzXG4pIHtcbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcbiAgJHNjb3BlLnBsYXllciA9IHtcbiAgICBiYXR0bGVUYWc6ICcnXG4gIH07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhbGlkYXRlQmF0dGxlVGFnKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci51c2VybmFtZSA9ICRzY29wZS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAkc2NvcGUucGxheWVyLnN0YXR1cyA9ICdvcGVuJztcbiAgICAgICAgTGFkZGVyU2VydmljZXMuam9pblRvdXJuYW1lbnQoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLCAkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICBTdWNjZXNzUG9wdXAocGxheWVyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBFcnJvclBvcHVwKGVycm9yKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQmF0dGxlVGFnICgpIHtcbiAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0YWcgPSAkc2NvcGUucGxheWVyLmJhdHRsZVRhZztcblxuICAgIGlmKHRhZy5sZW5ndGggPCA4KSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBiYXR0bGUgdGFnJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIHNwbGl0ID0gdGFnLnNwbGl0KCcjJyk7XG4gICAgaWYoc3BsaXQubGVuZ3RoICE9PSAyKSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBCQVRUTEVUQUfihKIgaW5jbHVkaW5nICMgYW5kIGZvdXIgZGlnaXRzJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoc3BsaXRbMV0ubGVuZ3RoIDwgMiB8fCBzcGxpdFsxXS5sZW5ndGggPiA0KSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIHVwIHRvIGZvdXIgZGlnaXRzIGFmdGVyICMhJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoaXNOYU4oc3BsaXRbMV0pKSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIGZvdXIgZGlnaXRzIGFmdGVyICMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBMYWRkZXJTZXJ2aWNlcy52YWxpZGF0ZVBsYXllcigkc2NvcGUudG91cm5hbWVudC50b3VybmFtZW50LCB0YWcpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgIGlmKHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIGNiLnJlamVjdCgnVGhlIEJBVFRMRVRBR+KEoiB5b3UgZW50ZXJlZCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiLnJlc29sdmUodGFnKTtcbiAgICAgIH0gXG4gICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1JlZ2lzdHJhdGlvbiBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFN1Y2Nlc3NQb3B1cCAocGxheWVyKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnQ29uZ3JhdHVsYXRpb25zICcgKyBwbGF5ZXIudXNlcm5hbWUgKyAnIScsXG4gICAgICB0ZW1wbGF0ZTogJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSBzaWduZWQgdXAhIE5vdyBnbyBmaW5kIGEgdmFsaWFudCBvcHBvbmVudC4nXG4gICAgfSk7XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkc0N0cmwnLCBMZWFkZXJCb2FyZHNDdHJsKTtcblxuZnVuY3Rpb24gTGVhZGVyQm9hcmRzQ3RybCgkc2NvcGUsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50LCBQYXJzZSwgJGZpbHRlciwgJGlvbmljUG9wdXApIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICBnZXRQbGF5ZXJzKCk7XG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2V0UGxheWVycygpO1xuICB9XG4gIFxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKCkge1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudC50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICB2YXIgcmFuayA9IDE7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGxheWVycywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICAgIHJhbmsrKztcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdSZXNldFBhc3N3b3JkQ3RybCcsIFJlc2V0UGFzc3dvcmRDdHJsKTtcblxuZnVuY3Rpb24gUmVzZXRQYXNzd29yZEN0cmxcbigkc2NvcGUsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlKSB7XG5cbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICAkc2NvcGUuZW1haWwgPSB7fTtcbiAgXG4gICRzY29wZS5yZXNldFBhc3N3b3JkID0gZnVuY3Rpb24gKGVtYWlsKSB7XG4gICAgUGFyc2UuVXNlci5yZXF1ZXN0UGFzc3dvcmRSZXNldChlbWFpbC50ZXh0LCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgU3VjY2Vzc1BvcHVwKCk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIGVycm9yIG1lc3NhZ2Ugc29tZXdoZXJlXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnVXBkYXRlIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gU3VjY2Vzc1BvcHVwIChwbGF5ZXIpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdQYXNzd29yZCBSZXNldCcsXG4gICAgICB0ZW1wbGF0ZTogJ0FuIEVtYWlsIGhhcyBiZWVuIHNlbnQgdG8gcmVzZXQgeW91ciBwYXNzd29yZCdcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgIH0pXG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xhZGRlclByb2ZpbGVDdHJsJywgTGFkZGVyUHJvZmlsZUN0cmwpO1xuXG5mdW5jdGlvbiBMYWRkZXJQcm9maWxlQ3RybChcbiAgJHNjb3BlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCAkcSwgUGFyc2UsICB0b3VybmFtZW50LCBMYWRkZXJTZXJ2aWNlcywgcGxheWVyXG4pIHtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIFN1Y2Nlc3NQb3B1cChwbGF5ZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IpO1xuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVCYXR0bGVUYWcgKCkge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRhZyA9ICRzY29wZS5wbGF5ZXIuYmF0dGxlVGFnO1xuXG4gICAgaWYodGFnLmxlbmd0aCA8IDgpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIGJhdHRsZSB0YWcnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgc3BsaXQgPSB0YWcuc3BsaXQoJyMnKTtcbiAgICBpZihzcGxpdC5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIEJBVFRMRVRBR+KEoiBpbmNsdWRpbmcgIyBhbmQgZm91ciBkaWdpdHMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihzcGxpdFsxXS5sZW5ndGggPCAyIHx8IHNwbGl0WzFdLmxlbmd0aCA+IDQpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgdXAgdG8gZm91ciBkaWdpdHMgYWZ0ZXIgIyEnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihpc05hTihzcGxpdFsxXSkpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgZm91ciBkaWdpdHMgYWZ0ZXIgIycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLnZhbGlkYXRlUGxheWVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsIHRhZykudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgaWYocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgY2IucmVqZWN0KCdUaGUgQkFUVExFVEFH4oSiIHlvdSBlbnRlcmVkIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0YWcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdVcGRhdGUgRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgdXBkYXRlZCEgTm93IGdvIGFuZCBwbGF5ISdcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuZnVuY3Rpb24gTG9naW5DdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljSGlzdG9yeSkge1xuICAkc2NvcGUudXNlciA9IHt9O1xuICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24gKCkge1xuICAgIFBhcnNlLlVzZXIubG9nSW4oJHNjb3BlLnVzZXIudXNlcm5hbWUsICRzY29wZS51c2VyLnBhc3N3b3JkLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbiAodXNlciwgZXJyb3IpIHtcbiAgICAgICAgJHNjb3BlLndhcm5pbmcgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd1c2VyJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuICAgICRzY29wZS53YXJuaW5nID0gbnVsbDtcbiAgfSwgdHJ1ZSk7XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoTGlzdEN0cmwnLCBNYXRjaExpc3RDdHJsKTtcblxuZnVuY3Rpb24gTWF0Y2hMaXN0Q3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRpb25pY1BvcHVwLCAkcm9vdFNjb3BlLCBQYXJzZSwgTWF0Y2hTZXJ2aWNlcywgcGxheWVyXG4pIHtcbiAgJHNjb3BlLm1hdGNoZXMgPSBbXTtcbiAgJHNjb3BlLnBsYXllciA9IHBsYXllclswXTtcblxuICBpZigkc2NvcGUucGxheWVyKSB7XG4gICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzaG93OmxvYWRpbmcnKTtcbiAgICBNYXRjaFNlcnZpY2VzLmdldFBsYXllck1hdGNoZXMoJHNjb3BlLnBsYXllciwgbnVsbCkudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoZXMgZmV0Y2hlZCcpO1xuICAgICAgJHNjb3BlLm1hdGNoZXMgPSBtYXRjaGVzO1xuICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRQbGF5ZXJNYXRjaGVzKCRzY29wZS5wbGF5ZXIsICdyZXBvcnRlZCcpLnRoZW4oZnVuY3Rpb24gKHJlcG9ydGVkKSB7XG4gICAgICAgICRzY29wZS5yZXBvcnRlZCA9IHJlcG9ydGVkO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfVxuXG4gICRzY29wZS5wcm9jZXNzTWF0Y2ggPSBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICBpZihtYXRjaC53aW5uZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYobWF0Y2gubG9zZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIGlmKG1hdGNoLnJlcG9ydFJlYXNvbil7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoJHNjb3BlLnJlcG9ydGVkLmxlbmd0aCkge1xuICAgICAgc2hvd1JlcG9ydGVkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKG1hdGNoLnN0YXR1cyAhPT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gucmVwb3J0Jywge2lkOiBtYXRjaC5pZH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd1JlcG9ydGVkKCkge1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnVG9vIE1hbnkgUmVwb3J0cycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdSBoYXZlIHRvbyBtYW55IHBlbmRpbmcgcmVwb3J0cy4gUGxlYXNlIHdhaXQuPC9kaXY+J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgfSlcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFJlcG9ydEN0cmwnLCBNYXRjaFJlcG9ydEN0cmwpO1xuXG5mdW5jdGlvbiBNYXRjaFJlcG9ydEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCwgJGlvbmljSGlzdG9yeSxcbiAgUGFyc2UsIE1hdGNoU2VydmljZXMsIGNhbWVyYVNlcnZpY2VzLCByZXBvcnRcbikge1xuXG4gICRzY29wZS5tYXRjaCA9IHJlcG9ydDtcblxuICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG5cbiAgdmFyIHBhcnNlRmlsZSA9IG5ldyBQYXJzZS5GaWxlKCk7XG4gIHZhciBpbWdTdHJpbmcgPSBudWxsO1xuXG4gICRzY29wZS5nZXRQaWN0dXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBjYW1lcmFTZXJ2aWNlcy5jYW1lcmE7XG4gICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKG9uU3VjY2VzcyxvbkZhaWwsb3B0aW9ucyk7XG4gIH1cbiAgdmFyIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuICAgICRzY29wZS5waWN0dXJlID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnICsgaW1hZ2VEYXRhO1xuICAgIGltZ1N0cmluZyA9IGltYWdlRGF0YTtcbiAgICAkc2NvcGUuJGFwcGx5KCk7XG4gIH07XG4gIHZhciBvbkZhaWwgPSBmdW5jdGlvbihlKSB7XG4gICAgY29uc29sZS5sb2coXCJPbiBmYWlsIFwiICsgZSk7XG4gIH1cblxuICAkc2NvcGUucHJvY2Vzc1JlcG9ydCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYoaW1nU3RyaW5nKSB7XG4gICAgICBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZShcInJlcG9ydC5wbmdcIiwge2Jhc2U2NDppbWdTdHJpbmd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyc2VGaWxlID0gbnVsbDtcbiAgICB9XG4gICAgJHNjb3BlLm1hdGNoLnNldChcInJlcG9ydEltYWdlXCIsIHBhcnNlRmlsZSk7XG4gICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ3JlcG9ydGVkJyk7XG4gICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgfSk7XG4gICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgIHRpdGxlOiAnTWF0Y2ggUmVwb3J0ZWQnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlRoYW5rIHlvdSBmb3Igc3VibWl0dGluZyB0aGUgcmVwb3J0LjwvZGl2PidcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIH1cblxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFZpZXdDdHJsJywgTWF0Y2hWaWV3Q3RybCk7XG5cbmZ1bmN0aW9uIE1hdGNoVmlld0N0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCwgJGlvbmljSGlzdG9yeSwgJHRpbWVvdXQsXG4gIFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcywgY2FtZXJhU2VydmljZXMsIHRvdXJuYW1lbnRcbikge1xuICBcbiAgdmFyIHBhcnNlRmlsZSA9IG5ldyBQYXJzZS5GaWxlKCk7XG4gIHZhciBpbWdTdHJpbmcgPSBudWxsO1xuICBcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50LnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcbiAgJHNjb3BlLnBpY3R1cmUgPSBudWxsO1xuXG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgXG4gICRzY29wZS4kb24oXCIkaW9uaWNWaWV3LmVudGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlci5jdXJyZW50KCkpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnY2FuY2VsbGVkJykge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWF0Y2hEZXRhaWxzKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG4gIFxuICAkc2NvcGUuJG9uKCckaW9uaWNWaWV3LmxlYXZlJywgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsb3NlTWF0Y2goKS5jbG9zZSgpO1xuICAgIHdpbk1hdGNoKCkuY2xvc2UoKTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdldFBpY3R1cmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGNhbWVyYVNlcnZpY2VzLmNhbWVyYTtcbiAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUob25TdWNjZXNzLG9uRmFpbCxvcHRpb25zKTtcbiAgfVxuICB2YXIgb25TdWNjZXNzID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XG4gICAgJHNjb3BlLnBpY3R1cmUgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcgKyBpbWFnZURhdGE7XG4gICAgaW1nU3RyaW5nID0gaW1hZ2VEYXRhO1xuICAgICRzY29wZS4kYXBwbHkoKTtcbiAgfTtcbiAgdmFyIG9uRmFpbCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIk9uIGZhaWwgXCIgKyBlKTtcbiAgfVxuXG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBnZXRNYXRjaCh0cnVlKTtcbiAgfTtcblxuICAkc2NvcGUucmVjb3JkID0gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgdmFyIHVzZXJuYW1lID0gbnVsbDtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSA9PT0gJ2FjdGl2ZScpIHtcbiAgICAgICAgc3dpdGNoIChyZWNvcmQpIHtcbiAgICAgICAgICBjYXNlICd3aW4nOlxuICAgICAgICAgICAgd2luTWF0Y2goKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICBpZihyZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCd3aW5uZXInLCAkc2NvcGUucGxheWVyKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdsb3NlcicsICRzY29wZS5vcHBvbmVudC51c2VyKTtcbiAgICAgICAgICAgICAgICB1c2VybmFtZSA9ICRzY29wZS5vcHBvbmVudC51c2VybmFtZVxuICAgICAgICAgICAgICAgIHJlY29yZE1hdGNoKCRzY29wZS5tYXRjaCwgdXNlcm5hbWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbG9zcyc6XG4gICAgICAgICAgICBsb3NlTWF0Y2goKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICBpZihyZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCd3aW5uZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnbG9zZXInLCAkc2NvcGUucGxheWVyKTtcbiAgICAgICAgICAgICAgICB1c2VybmFtZSA9ICRzY29wZS5vcHBvbmVudC51c2VybmFtZTtcbiAgICAgICAgICAgICAgICByZWNvcmRNYXRjaCgkc2NvcGUubWF0Y2gsIHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHdpbk1hdGNoICgpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG4gICAgJHNjb3BlLmVycm9yTWVzc2FnZSA9IG51bGw7XG5cbiAgICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcG9wdXBzL3dpbi5tYXRjaC5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQgYSBXaW4nLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZiAoISRzY29wZS5waWN0dXJlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yTWVzc2FnZSA9ICdVcGxvYWQgYSBTY3JlZW5zaG90JztcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9zZU1hdGNoKCkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvbG9zZS5tYXRjaC5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQgYSBMb3NzJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1hdGNoKHJlZnJlc2gpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCRzY29wZS5tYXRjaC5pZCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoJyArICRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpKTtcbiAgICAgIGNvbnNvbGUubG9nKCdtYXRjaCBmZXRjaGVkJyk7XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUubWF0Y2guZ2V0KCd3aW5uZXInKSk7XG4gICAgICBpZihyZWZyZXNoKSB7XG4gICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29yZE1hdGNoKG1hdGNoLCB1c2VybmFtZSkge1xuICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2hvdzpsb2FkaW5nJyk7XG4gICAgbWF0Y2guc2V0KCdzdGF0dXMnLCAnY29tcGxldGVkJyk7XG4gICAgbWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaDtcbiAgICAgIFBhcnNlLkNsb3VkLnJ1bignbWF0Y2hSZXN1bHRzJywge3VzZXJuYW1lOiB1c2VybmFtZSwgbWF0Y2g6IG1hdGNoLmlkfSkudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRNYXRjaERldGFpbHMoKSB7XG4gICAgJHNjb3BlLm9wcG9uZW50ID0ge1xuICAgICAgaGVybzogbnVsbCxcbiAgICAgIGJhdHRsZVRhZzogbnVsbFxuICAgIH1cbiAgICBpZigkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuaGVybyA9ICRzY29wZS5tYXRjaC5oZXJvMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VybmFtZSA9ICRzY29wZS5tYXRjaC51c2VybmFtZTI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuYmF0dGxlVGFnID0gJHNjb3BlLm1hdGNoLmJhdHRsZVRhZzI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlciA9ICRzY29wZS5tYXRjaC5wbGF5ZXIyO1xuICAgIH1cbiAgICBpZigkc2NvcGUucGxheWVyLnBsYXllciA9PT0gJ3BsYXllcjInKSB7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuaGVybyA9ICRzY29wZS5tYXRjaC5oZXJvMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VybmFtZSA9ICRzY29wZS5tYXRjaC51c2VybmFtZTE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQuYmF0dGxlVGFnID0gJHNjb3BlLm1hdGNoLmJhdHRsZVRhZzE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlciA9ICRzY29wZS5tYXRjaC5wbGF5ZXIxO1xuICAgIH1cbiAgfVxufTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcbiAgLmNvbnRyb2xsZXIoJ01lbnVDdHJsJywgTWVudUN0cmwpO1xuXG5mdW5jdGlvbiBNZW51Q3RybCgkc2NvcGUsICRpb25pY1BvcG92ZXIsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgUGFyc2UsICR0aW1lb3V0KSB7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcblxuICAkaW9uaWNQb3BvdmVyLmZyb21UZW1wbGF0ZVVybCgndGVtcGxhdGVzL3BvcG92ZXJzL3Byb2ZpbGUucG9wLmh0bWwnLCB7XG4gICAgc2NvcGU6ICRzY29wZSxcbiAgfSkudGhlbihmdW5jdGlvbihwb3BvdmVyKSB7XG4gICAgJHNjb3BlLnBvcG92ZXIgPSBwb3BvdmVyO1xuICB9KTtcblxuICAkc2NvcGUubWVudSA9IGZ1bmN0aW9uIChsaW5rKSB7XG4gICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICB9KTtcbiAgICBpZihsaW5rID09PSAnbG9naW4nKSB7XG4gICAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICAgIFBhcnNlUHVzaFBsdWdpbi51bnN1YnNjcmliZSgkc2NvcGUudXNlci5jdXJyZW50KCkudXNlcm5hbWUsIGZ1bmN0aW9uKG1zZykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCd1bnN1YmJlZCcpO1xuICAgICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCB0byBzdWInKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIFBhcnNlLlVzZXIubG9nT3V0KCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICRzdGF0ZS5nbygnYXBwLicgKyBsaW5rLCB7cmVsb2FkOiB0cnVlfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSwgMTAwMCk7XG4gICAgICBcbiAgICAgIFxuICAgIH0gZWxzZSB7XG4gICAgICAkc3RhdGUuZ28oJ2FwcC4nICsgbGluaywge3JlbG9hZDogdHJ1ZX0pO1xuICAgIH1cbiAgICAkc2NvcGUucG9wb3Zlci5oaWRlKCk7XG4gIH1cbiAgLy9DbGVhbnVwIHRoZSBwb3BvdmVyIHdoZW4gd2UncmUgZG9uZSB3aXRoIGl0IVxuICAkc2NvcGUuJG9uKCckZGVzdHJveScsIGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wb3BvdmVyLnJlbW92ZSgpO1xuICB9KTtcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdSZWdpc3RlckN0cmwnLCBSZWdpc3RlckN0cmwpO1xuXG5SZWdpc3RlckN0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJyRzdGF0ZScsICdQYXJzZScsICckaW9uaWNQb3B1cCddO1xuZnVuY3Rpb24gUmVnaXN0ZXJDdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljUG9wdXApIHtcblxuICAkc2NvcGUudXNlciA9IHt9O1xuXG4gICRzY29wZS5SZWdpc3RlclVzZXIgPSBmdW5jdGlvbiAodXNlcikge1xuICAgIHZhciByZWdpc3RlciA9IG5ldyBQYXJzZS5Vc2VyKCk7XG4gICAgcmVnaXN0ZXIuc2V0KHVzZXIpO1xuICAgIHJlZ2lzdGVyLnNpZ25VcChudWxsLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuICAgICAgICAvLyBTaG93IHRoZSBlcnJvciBtZXNzYWdlIHNvbWV3aGVyZSBhbmQgbGV0IHRoZSB1c2VyIHRyeSBhZ2Fpbi5cbiAgICAgICAgRXJyb3JQb3B1cChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLiR3YXRjaCgndXNlcicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcbiAgICAkc2NvcGUud2FybmluZyA9IG51bGw7XG4gIH0sIHRydWUpO1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLmFkbWluJywgW10pXG4gIC5jb25maWcoQWRtaW5Sb3V0ZXMpO1xuXG5mdW5jdGlvbiBBZG1pblJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmFkbWluJywge1xuICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5zZXR0aW5ncycsIHtcbiAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5zZXR0aW5ncy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pblNldHRpbmdzQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuZXk6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV3VG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgdG91cm5leSkge1xuICAgICAgICAgIGlmKHRvdXJuZXkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdG91cm5leVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5jcmVhdGVUb3VybmFtZW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5tYXRjaGVzJywge1xuICAgICAgdXJsOiAnL21hdGNoZXMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4ubWF0Y2hlcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbk1hdGNoZXNDdHJsJ1xuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5yb3V0ZXMubGFkZGVyJywgW10pXG4gIC5jb25maWcoTGFkZGVyUm91dGVzKTtcblxuZnVuY3Rpb24gTGFkZGVyUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyJywge1xuICAgICAgdXJsOiAnL2xhZGRlcicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGFkZGVyLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIubGVhZGVyYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvbGVhZGVyYm9hcmRzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sZWFkZXJib2FyZC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMZWFkZXJCb2FyZHNDdHJsJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmpvaW4nLCB7XG4gICAgICB1cmw6ICcvam9pbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvam9pbi5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMYWRkZXJKb2luQ3RybCdcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5wcm9maWxlJywge1xuICAgICAgdXJsOiAnL3Byb2ZpbGUnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL3Byb2ZpbGUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGFkZGVyUHJvZmlsZUN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBwbGF5ZXI6IGZ1bmN0aW9uIChQYXJzZSwgTGFkZGVyU2VydmljZXMsIHRvdXJuYW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKHRvdXJuYW1lbnQudG91cm5hbWVudCwgUGFyc2UuVXNlci5jdXJyZW50KCkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5yb3V0ZXMubWF0Y2hlcycsIFtdKVxuICAuY29uZmlnKE1hdGNoUm91dGVzKTtcblxuZnVuY3Rpb24gTWF0Y2hSb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5tYXRjaCcsIHtcbiAgICAgIHVybDogJy9tYXRjaCcsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC5odG1sJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5tYXRjaC5saXN0Jywge1xuICAgICAgdXJsOiAnL3ZpZXcnLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2gubGlzdC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNYXRjaExpc3RDdHJsJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcGxheWVyOiBmdW5jdGlvbiAoUGFyc2UsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIExhZGRlclNlcnZpY2VzLmdldFBsYXllcih0b3VybmFtZW50LnRvdXJuYW1lbnQsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gudmlldycsIHtcbiAgICAgIHVybDogJy92aWV3JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLnZpZXcuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hWaWV3Q3RybCdcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnJlcG9ydCcsIHtcbiAgICAgIHVybDogJy9yZXBvcnQvOmlkJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLnJlcG9ydC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdNYXRjaFJlcG9ydEN0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICByZXBvcnQ6IGZ1bmN0aW9uIChNYXRjaFNlcnZpY2VzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgICByZXR1cm4gTWF0Y2hTZXJ2aWNlcy5nZXRNYXRjaCgkc3RhdGVQYXJhbXMuaWQpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdMYWRkZXJTZXJ2aWNlcycsIExhZGRlclNlcnZpY2VzKVxuICAuZmFjdG9yeSgnTGFkZGVyJywgTGFkZGVyKVxuXG5mdW5jdGlvbiBMYWRkZXJTZXJ2aWNlcyhQYXJzZSwgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UGxheWVyczogZ2V0UGxheWVycyxcbiAgICBnZXRQbGF5ZXI6IGdldFBsYXllcixcbiAgICB2YWxpZGF0ZVBsYXllcjogdmFsaWRhdGVQbGF5ZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50LFxuICAgIGdldFBlbmRpbmdQbGF5ZXJzOiBnZXRQZW5kaW5nUGxheWVyc1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBlbmRpbmdQbGF5ZXJzKHRvdXJuYW1lbnQsIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkubm90RXF1YWxUTygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVycyh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoJ3BvaW50cycsICdtbXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUGxheWVyKHRvdXJuZXksIGJhdHRsZVRhZykge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5lcXVhbFRvKCdiYXR0bGVUYWcnLCBiYXR0bGVUYWcpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyKHRvdXJuZXksIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCB1c2VyLCB1c2VyRGF0YSkge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKCk7XG4gICAgcGxheWVyLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXInLCB1c2VyKTtcbiAgICBwbGF5ZXIuc2V0KHVzZXJEYXRhKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIExhZGRlcihQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdMYWRkZXInKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndXNlcicsICdiYXR0bGVUYWcnLCAndXNlcm5hbWUnLCAnbG9jYXRpb24nLFxuICAgICdoZXJvJywgJ3BsYXllcicsICdzdGF0dXMnLCAnY2FuY2VsVGltZXInLCAnd2lucycsICdsb3NzZXMnLCAnbW1yJywgJ3BvaW50cycsICdiYW5SZWFzb24nLCAnYWRtaW4nXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnbG9jYXRpb25TZXJ2aWNlcycsIGxvY2F0aW9uU2VydmljZXMpO1xuXG5mdW5jdGlvbiBsb2NhdGlvblNlcnZpY2VzIChQYXJzZSwgJGNvcmRvdmFHZW9sb2NhdGlvbiwgJHEsICRyb290U2NvcGUpIHtcblxuICB2YXIgbG9jYXRpb24gPSB7Y29vcmRzOiBuZXcgUGFyc2UuR2VvUG9pbnQoKX07XG4gIHJldHVybiB7XG4gICAgbG9jYXRpb246IGxvY2F0aW9uLFxuICAgIGdldExvY2F0aW9uOiBnZXRMb2NhdGlvbixcbiAgICBzZXRMb2NhdGlvbjogc2V0TG9jYXRpb25cbiAgfVxuICBcbiAgZnVuY3Rpb24gc2V0TG9jYXRpb24gKGNvb3Jkcykge1xuICAgIGxvY2F0aW9uLmNvb3JkcyA9IG5ldyBQYXJzZS5HZW9Qb2ludCh7bGF0aXR1ZGU6IGNvb3Jkcy5sYXRpdHVkZSwgbG9uZ2l0dWRlOiBjb29yZHMubG9uZ2l0dWRlfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExvY2F0aW9uICgpIHtcbiAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgIHZhciBwb3NPcHRpb25zID0ge2VuYWJsZUhpZ2hBY2N1cmFjeTogZmFsc2V9O1xuICAgICRjb3Jkb3ZhR2VvbG9jYXRpb25cbiAgICAgIC5nZXRDdXJyZW50UG9zaXRpb24ocG9zT3B0aW9ucylcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgICBjYi5yZXNvbHZlKHBvc2l0aW9uLmNvb3Jkcyk7XG4gICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgICAgY2IucmVqZWN0KGVycik7XG4gICAgICB9KTtcbiAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdNYXRjaFNlcnZpY2VzJywgTWF0Y2hTZXJ2aWNlcylcbiAgLmZhY3RvcnkoJ01hdGNoJywgTWF0Y2gpO1xuXG5mdW5jdGlvbiBNYXRjaFNlcnZpY2VzKFBhcnNlLCBNYXRjaCwgJHEpIHtcbiAgdmFyIHVzZXIgPSBQYXJzZS5Vc2VyO1xuICByZXR1cm4ge1xuICAgIGdldENvbmZpcm1lZE1hdGNoOiBnZXRDb25maXJtZWRNYXRjaCxcbiAgICBnZXRQZW5kaW5nTWF0Y2g6IGdldFBlbmRpbmdNYXRjaCxcbiAgICBnZXRMYXRlc3RNYXRjaDogZ2V0TGF0ZXN0TWF0Y2gsXG4gICAgZ2V0TWF0Y2g6IGdldE1hdGNoLFxuICAgIGdldFBsYXllck1hdGNoZXM6IGdldFBsYXllck1hdGNoZXMsXG4gIH1cblxuICBmdW5jdGlvbiBnZXRQbGF5ZXJNYXRjaGVzKHBsYXllciwgc3RhdHVzKSB7XG4gICAgdmFyIHBsYXllcjEgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHBsYXllcjEuZXF1YWxUbygncGxheWVyMScsIHBsYXllcik7XG4gICAgdmFyIHBsYXllcjIgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHBsYXllcjIuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgdmFyIG1haW5RdWVyeSA9IFBhcnNlLlF1ZXJ5Lm9yKHBsYXllcjEsIHBsYXllcjIpO1xuICAgIG1haW5RdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIG1haW5RdWVyeS5saW1pdCgxMCk7XG4gICAgaWYoc3RhdHVzKSB7XG4gICAgICBtYWluUXVlcnkuZXF1YWxUbygnc3RhdHVzJywgc3RhdHVzKTtcbiAgICB9XG4gICAgcmV0dXJuIG1haW5RdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRMYXRlc3RNYXRjaChwbGF5ZXIpIHtcbiAgICB2YXIgdHlwZSA9IHBsYXllci5nZXQoJ3BsYXllcicpXG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd3aW5uZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCdsb3NlcicpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoXCJjcmVhdGVkQXRcIik7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgaWYodHlwZSA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgfVxuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDb25maXJtZWRNYXRjaCAocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKTtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoJ01hdGNoJyk7XG4gICAgcXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ2FjdGl2ZScpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoXCJjcmVhdGVkQXRcIik7XG4gICAgaWYodHlwZSA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKVxuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKVxuICAgIH1cbiAgICBxdWVyeS5lcXVhbFRvKCdjb25maXJtMScsIHRydWUpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0yJywgdHJ1ZSk7XG4gICAgcXVlcnkubGltaXQoMSk7XG5cbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldFBlbmRpbmdNYXRjaChwbGF5ZXIpIHtcbiAgICB2YXIgdHlwZSA9IHBsYXllci5nZXQoJ3BsYXllcicpXG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIH1cbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncGVuZGluZycpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TWF0Y2goaWQpIHtcbiAgICB2YXIgbWF0Y2ggPSBuZXcgTWF0Y2guTW9kZWwoKTtcbiAgICBtYXRjaC5pZCA9IGlkO1xuICAgIHJldHVybiBtYXRjaC5mZXRjaCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIE1hdGNoKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ01hdGNoJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gW1xuICAgICd0b3VybmFtZW50JywgJ3BsYXllcjEnLCAncGxheWVyMicsICdoZXJvMScsICdoZXJvMicsICd1c2VybmFtZTEnLCAndXNlcm5hbWUyJywgJ2JhdHRsZVRhZzEnLCAnYmF0dGxlVGFnMicsICdzdGF0dXMnLCAnd2lubmVyJywgJ2xvc2VyJyxcbiAgICAnd2luSW1hZ2UnLCAncmVwb3J0UmVhc29uJywgJ3JlcG9ydEltYWdlJywgJ2FjdGl2ZURhdGUnLCAndXNlcjEnLCAndXNlcjInXG4gIF07XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnY2FtZXJhU2VydmljZXMnLCBjYW1lcmFTZXJ2aWNlcyk7XG5cbmZ1bmN0aW9uIGNhbWVyYVNlcnZpY2VzICgpIHtcbiAgXG4gIHZhciBjYW1lcmEgPSB7XG4gICAgcXVhbGl0eTogOTAsXG4gICAgdGFyZ2V0V2lkdGg6IDMyMCxcbiAgICB0YXJnZXRIZWlnaHQ6IDUwMCxcbiAgICBhbGxvd0VkaXQ6IHRydWUsXG4gICAgZGVzdGluYXRpb25UeXBlOiBDYW1lcmEuRGVzdGluYXRpb25UeXBlLkRBVEFfVVJMLFxuICAgIHNvdXJjZVR5cGU6IDAsXG4gICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLkpQRUdcbiAgfVxuICBcbiAgcmV0dXJuIHtcbiAgICBjYW1lcmE6IGNhbWVyYVxuICB9XG5cbiAgLy8gZnVuY3Rpb24gZ2V0RGF0YVVyaSAodXJsLCBjYWxsYmFjaykge1xuICAvLyAgIHZhciBpbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAvLyAgIGltYWdlLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHtcbiAgLy8gICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgLy8gICAgIGNhbnZhcy53aWR0aCA9IHRoaXMubmF0dXJhbFdpZHRoOyAvLyBvciAnd2lkdGgnIGlmIHlvdSB3YW50IGEgc3BlY2lhbC9zY2FsZWQgc2l6ZVxuICAvLyAgICAgY2FudmFzLmhlaWdodCA9IHRoaXMubmF0dXJhbEhlaWdodDsgLy8gb3IgJ2hlaWdodCcgaWYgeW91IHdhbnQgYSBzcGVjaWFsL3NjYWxlZCBzaXplXG4gIC8vXG4gIC8vICAgICBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKS5kcmF3SW1hZ2UodGhpcywgMCwgMCk7XG4gIC8vXG4gIC8vICAgICAvLyBHZXQgcmF3IGltYWdlIGRhdGFcbiAgLy8gICAgIGNhbGxiYWNrKGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpLnJlcGxhY2UoL15kYXRhOmltYWdlXFwvKHBuZ3xqcGcpO2Jhc2U2NCwvLCAnJykpO1xuICAvL1xuICAvLyAgICAgLy8gLi4uIG9yIGdldCBhcyBEYXRhIFVSSVxuICAvLyAgICAgLy9jYWxsYmFjayhjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKSk7XG4gIC8vICAgfTtcbiAgLy8gICBpbWFnZS5zcmMgPSB1cmw7XG4gIC8vIH1cblxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdRdWV1ZVNlcnZpY2VzJywgUXVldWVTZXJ2aWNlcylcblxuZnVuY3Rpb24gUXVldWVTZXJ2aWNlcygpIHtcbiAgdmFyIG9wcG9uZW50ID0ge1xuICAgIGxpc3Q6IFsnRWFzeSBQaWNraW5ncycsICdZb3VyIFdvcnN0IE5pZ2h0bWFyZScsICdXb3JsZCBjbGFzcyBwYXN0ZSBlYXRlcicsXG4gICAgICAnQSBNdXJsb2MnLCAnR291cmQgY3JpdGljJywgJ05vc2UgYW5kIG1vdXRoIGJyZWF0aGVyJywgJ0hvZ2dlcicsICdBIGNhcmRpc2ggSWFuJyxcbiAgICAgICdNb3BleSBNYWdlJywgJ1dvbWJhdCBXYXJsb2NrJywgJ1JvdWdlZCB1cCBSb2d1ZScsICdXYWlmaXNoIFdhcnJpb3InLCAnRGFtcCBEcnVpZCcsXG4gICAgICAnU2hhYmJ5IFNoYW1hbicsICdQZW5uaWxlc3MgUGFsYWRpbicsICdIdWZmeSBIdW50ZXInLCAnUGVya3kgUHJpZXN0JywgJ1RoZSBXb3JzdCBQbGF5ZXInLFxuICAgICAgJ1lvdXIgT2xkIFJvb21tYXRlJywgJ1N0YXJDcmFmdCBQcm8nLCAnRmlzY2FsbHkgcmVzcG9uc2libGUgbWltZScsICdZb3VyIEd1aWxkIExlYWRlcicsXG4gICAgICAnTm9uZWNrIEdlb3JnZScsICdHdW0gUHVzaGVyJywgJ0NoZWF0ZXIgTWNDaGVhdGVyc29uJywgJ1JlYWxseSBzbG93IGd1eScsICdSb2FjaCBCb3knLFxuICAgICAgJ09yYW5nZSBSaHltZXInLCAnQ29mZmVlIEFkZGljdCcsICdJbndhcmQgVGFsa2VyJywgJ0JsaXp6YXJkIERldmVsb3BlcicsICdHcmFuZCBNYXN0ZXInLFxuICAgICAgJ0RpYW1vbmQgTGVhZ3VlIFBsYXllcicsICdCcmFuZCBOZXcgUGxheWVyJywgJ0Rhc3RhcmRseSBEZWF0aCBLbmlnaHQnLCAnTWVkaW9jcmUgTW9uaycsXG4gICAgICAnQSBMaXR0bGUgUHVwcHknXG4gICAgXVxuICB9O1xuICB2YXIgaGVyb2VzID0gW1xuICAgIHt0ZXh0OiAnbWFnZScsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2h1bnRlcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3BhbGFkaW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJyaW9yJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnZHJ1aWQnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICd3YXJsb2NrJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnc2hhbWFuJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncHJpZXN0JywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncm9ndWUnLCBjaGVja2VkOiBmYWxzZX1cbiAgXVxuICByZXR1cm4ge1xuICAgIG9wcG9uZW50OiBvcHBvbmVudCxcbiAgICBoZXJvZXM6IGhlcm9lc1xuICB9XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnVG91cm5hbWVudFNlcnZpY2VzJywgVG91cm5hbWVudFNlcnZpY2VzKVxuICAuZmFjdG9yeSgnVG91cm5hbWVudCcsIFRvdXJuYW1lbnQpXG4gIC5mYWN0b3J5KCdEZXRhaWxzJywgRGV0YWlscyk7XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnRTZXJ2aWNlcyhQYXJzZSwgJHEsIFRvdXJuYW1lbnQsIERldGFpbHMsIExhZGRlcikge1xuICByZXR1cm4ge1xuICAgIGdldFRvdXJuYW1lbnQ6IGdldFRvdXJuYW1lbnQsXG4gICAgY3JlYXRlVG91cm5hbWVudDogY3JlYXRlVG91cm5hbWVudCxcbiAgICBnZXRMYWRkZXI6IGdldExhZGRlcixcbiAgICBqb2luVG91cm5hbWVudDogam9pblRvdXJuYW1lbnRcbiAgfVxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCBwbGF5ZXIpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbChwbGF5ZXIpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgUGFyc2UuVXNlci5jdXJyZW50KCkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXJuYW1lJywgUGFyc2UuVXNlci5jdXJyZW50KCkudXNlcm5hbWUpO1xuICAgIHBsYXllci5zZXQoJ21tcicsIDEwMDApO1xuICAgIHBsYXllci5zZXQoJ3dpbnMnLCAwKTtcbiAgICBwbGF5ZXIuc2V0KCdsb3NzZXMnLCAwKTtcbiAgICBwbGF5ZXIuc2V0KCdwb2ludHMnLCAwKTtcbiAgICByZXR1cm4gcGxheWVyLnNhdmUoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRUb3VybmFtZW50KCkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShEZXRhaWxzLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0eXBlJywgJ2xhZGRlcicpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3RvdXJuYW1lbnQnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGNyZWF0ZVRvdXJuYW1lbnQgKCkge1xuICAgIHZhciBkZWZlciA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRvdXJuYW1lbnQgPSBuZXcgVG91cm5hbWVudC5Nb2RlbCgpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCduYW1lJywgJ09OT0cgT1BFTicpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCdzdGF0dXMnLCAncGVuZGluZycpO1xuICAgIHRvdXJuYW1lbnQuc2V0KCdnYW1lJywgJ2hlYXJ0aHN0b25lJyk7XG4gICAgdG91cm5hbWVudC5zYXZlKCkudGhlbihmdW5jdGlvbiAodG91cm5leSkge1xuICAgICAgdmFyIGRldGFpbHMgPSBuZXcgRGV0YWlscy5Nb2RlbCgpO1xuICAgICAgZGV0YWlscy5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICAgIGRldGFpbHMuc2V0KCd0eXBlJywgJ2xhZGRlcicpO1xuICAgICAgZGV0YWlscy5zZXQoJ3BsYXllckNvdW50JywgMCk7XG4gICAgICBkZXRhaWxzLnNldCgnbnVtT2ZHYW1lcycsIDUpO1xuICAgICAgZGV0YWlscy5zYXZlKCkudGhlbihmdW5jdGlvbiAoZGV0YWlscykge1xuICAgICAgICBkZWZlci5yZXNvbHZlKGRldGFpbHMpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRlZmVyLnByb21pc2U7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TGFkZGVyICh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3BsYXllcicpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gVG91cm5hbWVudChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdUb3VybmFtZW50Jyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyduYW1lJywgJ2dhbWUnLCAnc3RhdHVzJywgJ2Rpc2FibGVkJywgJ2Rpc2FibGVkUmVhc29uJywgJ2xvY2F0aW9uJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbmZ1bmN0aW9uIERldGFpbHMoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnRGV0YWlscycpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsndG91cm5hbWVudCcsICd0eXBlJywgJ251bU9mR2FtZXMnLCAncGxheWVyQ291bnQnXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
