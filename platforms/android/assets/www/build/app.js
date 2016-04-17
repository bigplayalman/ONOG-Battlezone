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

angular.module('ONOG.config', [])
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


angular.module('ONOG.routes', [
  'ONOG.routes.matches',
  'ONOG.routes.ladder',
  'ONOG.routes.admin'
])
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
        tournament: function (TournamentServices, $q, Parse, $state) {
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
        },
        location: function (locationServices, $q) {
          var cb = $q.defer();
          locationServices.getLocation().then(function (location) {
            locationServices.setLocation(location);
            cb.resolve();
          });
          return cb.promise;
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

angular.module('ONOG')
  .constant("moment", moment)
  .run(['$ionicPlatform', '$state', '$rootScope', '$ionicLoading', '$ionicPopup', run]);

function run ($ionicPlatform, $state, $rootScope, $ionicLoading, $ionicPopup) {
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
              $rootScope.$broadcast('opponent:found');
              break;
            case 'Opponent Confirmed':
              $rootScope.$broadcast('opponent:confirmed');
              break;
            case 'Results Entered':
              $rootScope.$broadcast('results:entered');
              break;
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

AdminSettingsCtrl.$inject = ['$scope', 'locationServices', 'newTournament', 'tournament'];

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


angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject =  ['$scope', '$state', '$filter', '$timeout', '$interval', '$ionicPopup', '$rootScope',
  'Parse', 'tournament', 'MatchServices', 'QueueServices', 'LadderServices', 'locationServices'
];

function DashboardCtrl(
  $scope, $state, $filter, $timeout, $interval, $ionicPopup, $rootScope,
  Parse, tournament, MatchServices, QueueServices, LadderServices, locationServices
) {

  $scope.tournament = tournament.tournament;
  var promise = null;
  $scope.user = Parse.User;
  $scope.end = {
    canPlay: true,
    time: parseFloat(moment().format('x'))
  }
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};

  $rootScope.$on('opponent:found', playerConfirm);
  $rootScope.$on('opponent:confirmed', opponentConfirmed);
  $rootScope.$on('results:entered', matchPlayed);

  $scope.$on("$ionicView.enter", function(event) {
    if(navigator && navigator.splashscreen) {
      navigator.splashscreen.hide();
    }
    $scope.location = locationServices.location;
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      $scope.player.set('location', $scope.location.coords);
      status();
    });
  });

  $scope.doRefresh = function() {
    getCurrentStatus(true);
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
  $scope.finished = function () {
    $timeout(timer, 1500);
  }

  function matchTime() {
    if(!$scope.match) {
      MatchServices.getLatestMatch($scope.player).then(function (matches) {
        if (matches.length) {
          $scope.match = matches[0];
          timer();
        }
      });
    } else {
      timer();
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

  function status () {
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
          playerConfirm();
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
      matchTime();
    }
  }

  $scope.$on('destroy', function () {
    console.log('controller destroyed');
  });

  function getCurrentStatus(refresh) {
    var refresh = refresh;
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      if ($scope.player) {
        console.log('currentStatus');
        status();
        if(refresh) {
          $scope.$broadcast('scroll.refreshComplete');
        }
      }
    });
  }
  function getLastMatch() {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      $scope.match = matches[0];
      if($scope.match.get('status') === 'completed') {
        $scope.player.set('status', 'open');
        savePlayer();
      }
    });
  }

  function matchMaking() {
    Parse.Cloud.run('matchmaking').then(function (){
      console.log('matchmaking started');
    });
  }

  function playerConfirm() {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      $scope.match = matches[0];
      $timeout (function () {
        $scope.stop();
        if($scope.match.status === 'pending') {
          var confirmPopup = $ionicPopup.show({
            title: 'Matchmaking',
            template: '<div class="text-center"><strong>A Worthy Opponent</strong><br> has been found!</div>',
            buttons: [
              {
                text: '<b>Confirm</b>',
                type: 'button-positive',
                onTap: function(e) {
                  return true;
                }
              }
            ]
          });

          confirmPopup.then(function (res) {
            if(res) {
              if ($scope.player.player === 'player1') {
                $scope.match.set('confirm1', true);
              } else {
                $scope.match.set('confirm2', true);
              }
              $scope.match.save().then(function () {
                $scope.player.set('status', 'confirmed');
                savePlayer();
              });
            } else {
              showFailPopup();
              $scope.player.set('status', 'open');
              savePlayer();
            }
          });
          $timeout(function () {
            if($scope.player.get('status') === 'found') {
              confirmPopup.close();
            }
          }, 20000);
        }
        if($scope.match.status === 'cancelled') {
          $scope.player.set('status', 'open');
          savePlayer();
        }
      }, 2000);
    });
  }

  function showFailPopup() {
    var failPopup = $ionicPopup.show({
      title: 'Matchmaking',
      template: '<div class="text-center">You Failed to Confirm Match</div>',
      buttons: [
        {
          text: '<b>Close</b>',
          type: 'button-positive',
          onTap: function(e) {
            return true;
          }
        }
      ]
    });

    failPopup.then(function (res) {

    });
  }

  function opponentConfirmed () {
    MatchServices.getLatestMatch($scope.player).then(function (matches) {
      $scope.match = matches[0];
      if($scope.match.get('status'), 'active') {
        $state.go('app.match.view');
      }
    })
  }

  function waitingForOpponent () {
    Parse.Cloud.run('confirmMatch').then(function (num) {
      checkOpponent(5000, false);
      checkOpponent(30000, true);

      var userGeoPoint = $scope.player.get("location");
// Create a query for places
      var query = new Parse.Query('Tournament');
// Interested in locations near user.
      query.withinMiles("location", userGeoPoint, 50);
// Limit what could be a lot of points.
      query.limit(10);
// Final list of objects
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
    });
  }

  function checkOpponent (timeout, alreadyChecked) {
    $timeout(function () {
      if($scope.player.get('status') === 'confirmed') {
        MatchServices.getLatestMatch($scope.player).then(function (matches) {
          $scope.match = matches[0];

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
          }

        });
      }
    }, timeout);
  }
  function matchPlayed() {
    if($scope.player.get('status') !== 'open') {
      $scope.player.set('status', 'open');
      $scope.player.save().then(function (player) {
        $scope.player = player;
        showMatchResultsPopup();
      })
    }
  }
  function showMatchResultsPopup() {
    var popup = $ionicPopup.alert({
      title: 'Match Played',
      template: '<div class="text-center">Your Opponent has submitting results</div>'
    }).then(function(res) {

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
        MatchServices.getLatestMatch($scope.player).then(function (matches) {
          $scope.match = matches[0];
          $scope.match.set('status', 'cancelled');
          $scope.match.save().then(function () {
            savePlayer();
          });
        });
      } else {
        $scope.player.set('status', 'open');
        savePlayer();
      }
    });
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

  .controller('LadderJoinCtrl', [
    '$scope', '$filter', '$ionicPopup', '$state', '$ionicHistory', '$q', 'Parse', 'tournament', 'LadderServices', LadderJoinCtrl]);

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

LeaderBoardsCtrl.$inject = ['$scope', 'LadderServices', 'tournament', 'Parse', '$filter', '$ionicPopup'];
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


angular.module('ONOG.Controllers')

  .controller('ResetPasswordCtrl',
    ['$scope', '$ionicPopup', '$state', '$ionicHistory', 'Parse', ResetPasswordCtrl]);

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


angular.module('ONOG.Controllers')

  .controller('LadderProfileCtrl',
    ['$scope', '$filter', '$ionicPopup', '$state', '$ionicHistory', '$q', 'Parse', 'tournament', 'LadderServices', 'player', LadderProfileCtrl]);

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
        if(window.ParsePushPlugin) {
          ParsePushPlugin.subscribe(user.username, function(msg) {
            console.log('subbed');
          }, function(e) {
            console.log('failed to sub');
          });
        }
        
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

MatchListCtrl.$inject = [
  '$scope', '$state', '$ionicPopup', '$rootScope', 'Parse', 'MatchServices', 'player'
];

function MatchListCtrl(
  $scope, $state, $ionicPopup, $rootScope, Parse, MatchServices, player
) {
  $scope.matches = [];
  $scope.player = player[0];

  if($scope.player) {
    $rootScope.$broadcast('show:loading');
    MatchServices.getPlayerMatches($scope.player, 'completed').then(function (matches) {
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


angular.module('ONOG.Controllers')

  .controller('MatchReportCtrl', MatchReportCtrl);

MatchReportCtrl.$inject = [
  '$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory',
  'Parse', 'MatchServices', 'cameraServices', 'report'
];
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


angular.module('ONOG.Controllers')

  .controller('MatchViewCtrl', MatchViewCtrl);

MatchViewCtrl.$inject = [
  '$scope', '$state', '$rootScope', '$ionicPopup', '$ionicHistory',
  'Parse', 'LadderServices', 'MatchServices', 'QueueServices', 'cameraServices',
  'tournament', 'match', 'player'
];
function MatchViewCtrl(
  $scope, $state, $rootScope, $ionicPopup, $ionicHistory,
  Parse, LadderServices, MatchServices, QueueServices, cameraServices,
  tournament, match, player
) {
  $scope.tournament = tournament.tournament;
  $scope.user = Parse.User;
  $scope.end = {
    time: 0
  };

  $scope.$on("$ionicView.enter", function(event) {
    $scope.match = match[0];
    $scope.player = player[0];
    getMatchDetails();
  });

  $rootScope.$on('results:entered', getMatch);

  $scope.picture = null;
  var parseFile = new Parse.File();
  var imgString = null;

  $ionicHistory.nextViewOptions({
    disableBack: true
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
      if(refresh) {
        $scope.$broadcast('scroll.refreshComplete');
      }
    })
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

        })
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

angular.module('ONOG.routes.ladder', [])
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
    .state('app.ladder.profile', {
      url: '/profile',
      cache: false,
      templateUrl: 'templates/ladder/profile.html',
      controller: 'LadderProfileCtrl',
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament.tournament, Parse.User.current());
        }
      }
    });
}

angular.module('ONOG.routes.matches', [])
  .config(['$stateProvider', MatchRoutes]);

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
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament.tournament, Parse.User.current());
        }
      }
    })
    .state('app.match.view', {
      url: '/view',
      templateUrl: 'templates/match/match.view.html',
      controller: 'MatchViewCtrl',
      resolve: {
        player: function (Parse, LadderServices, tournament) {
          return LadderServices.getPlayer(tournament.tournament, Parse.User.current());
        },
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
    .state('app.match.report', {
      url: '/report/:id',
      cache: false,
      templateUrl: 'templates/match/match.report.html',
      controller: 'MatchReportCtrl',
      resolve: {
        report: function (MatchServices, $stateParams) {
          return MatchServices.getMatch($stateParams.id);
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

angular.module('ONOG.Services')

  .service('locationServices', ['Parse', '$cordovaGeolocation', '$q', locationServices]);

function locationServices (Parse, $cordovaGeolocation, $q) {

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

angular.module('ONOG.Services')

  .service('MatchServices', ['Parse', 'Match', '$q', MatchServices])
  .factory('Match', ['Parse', Match]);

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
    mainQuery.limit(10);
    mainQuery.equalTo('status', status);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5wYXNzd29yZC5jdHJsLmpzIiwiY29udHJvbGxlcnMvbGFkZGVyLnByb2ZpbGUuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5saXN0LmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5yZXBvcnQuY3RybC5qcyIsImNvbnRyb2xsZXJzL21hdGNoLnZpZXcuY3RybC5qcyIsImNvbnRyb2xsZXJzL21lbnUuY3RybC5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmN0cmwuanMiLCJyb3V0ZXMvYWRtaW4ucm91dGVzLmpzIiwicm91dGVzL2xhZGRlci5yb3V0ZXMuanMiLCJyb3V0ZXMvbWF0Y2gucm91dGVzLmpzIiwic2VydmljZXMvbGFkZGVyLnNlcnZpY2VzLmpzIiwic2VydmljZXMvbG9jYXRpb24uc2VydmljZXMuanMiLCJzZXJ2aWNlcy9tYXRjaC5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL3Bob3RvLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2RBO0FBQ0E7QUFDQTtBQ0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ25GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN4REE7QUFDQTtBQUNBO0FDRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2paQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDL0VBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNqQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiYW5ndWxhci5tb2R1bGUoJ09OT0cnLCBbXG4gICdpb25pYycsXG4gICduZ1BhcnNlJyxcbiAgJ3RpbWVyJyxcbiAgJ25nQ29yZG92YScsXG4gICduZ0FuaW1hdGUnLFxuICAnT05PRy5jb25maWcnLFxuICAnT05PRy5yb3V0ZXMnLFxuICAnT05PRy5Db250cm9sbGVycycsXG4gICdPTk9HLlNlcnZpY2VzJ1xuXSk7XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5jb25maWcnLCBbXSlcbiAgLmNvbmZpZyhbJyRpb25pY0NvbmZpZ1Byb3ZpZGVyJywgJyRjb21waWxlUHJvdmlkZXInLCAnUGFyc2VQcm92aWRlcicsIGNvbmZpZ10pO1xuXG5mdW5jdGlvbiBjb25maWcgKCRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyLCBQYXJzZVByb3ZpZGVyKSB7XG5cbiAgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8ZmlsZXxibG9ifGNvbnRlbnR8bXMtYXBweHx4LXdtYXBwMCk6fGRhdGE6aW1hZ2VcXC98aW1nXFwvLyk7XG4gICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGZpbGV8Z2h0dHBzP3xtcy1hcHB4fHgtd21hcHAwKTovKTtcblxuICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJuWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRXCIsIFwienJpbjhHRUJEVkdia2wxaW9HRXduSHVQNzBGZEc2SGh6VFM4dUdqelwiKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcycsIFtcbiAgJ09OT0cucm91dGVzLm1hdGNoZXMnLFxuICAnT05PRy5yb3V0ZXMubGFkZGVyJyxcbiAgJ09OT0cucm91dGVzLmFkbWluJ1xuXSlcbiAgLmNvbmZpZyhbJyRzdGF0ZVByb3ZpZGVyJywgJyR1cmxSb3V0ZXJQcm92aWRlcicsIHJvdXRlc10pO1xuXG5mdW5jdGlvbiByb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyLCAkdXJsUm91dGVyUHJvdmlkZXIpIHtcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCdhcHAvZGFzaGJvYXJkJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgJHEsIFBhcnNlLCAkc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCkudGhlbihmdW5jdGlvbiAodG91cm5hbWVudHMpIHtcbiAgICAgICAgICAgIGlmKHRvdXJuYW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYi5yZXNvbHZlKHRvdXJuYW1lbnRzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgaW9uaWMuUGxhdGZvcm0uZXhpdEFwcCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9LFxuICAgICAgICBsb2NhdGlvbjogZnVuY3Rpb24gKGxvY2F0aW9uU2VydmljZXMsICRxKSB7XG4gICAgICAgICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICBsb2NhdGlvblNlcnZpY2VzLmdldExvY2F0aW9uKCkudGhlbihmdW5jdGlvbiAobG9jYXRpb24pIHtcbiAgICAgICAgICAgIGxvY2F0aW9uU2VydmljZXMuc2V0TG9jYXRpb24obG9jYXRpb24pO1xuICAgICAgICAgICAgY2IucmVzb2x2ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5kYXNoYm9hcmQnLCB7XG4gICAgICB1cmw6ICcvZGFzaGJvYXJkJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9kYXNoYm9hcmQuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0Rhc2hib2FyZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb2dpbi5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnTG9naW5DdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5yZWdpc3RlcicsIHtcbiAgICAgIHVybDogJy9yZWdpc3RlcicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ1JlZ2lzdGVyQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAucmVzZXQnLCB7XG4gICAgICB1cmw6ICcvcGFzc3dvcmQnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Bhc3N3b3JkLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZXNldFBhc3N3b3JkQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cblxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cnKVxuICAuY29uc3RhbnQoXCJtb21lbnRcIiwgbW9tZW50KVxuICAucnVuKFsnJGlvbmljUGxhdGZvcm0nLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnJGlvbmljTG9hZGluZycsICckaW9uaWNQb3B1cCcsIHJ1bl0pO1xuXG5mdW5jdGlvbiBydW4gKCRpb25pY1BsYXRmb3JtLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY0xvYWRpbmcsICRpb25pY1BvcHVwKSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cbiAgICAgIC8vIERvbid0IHJlbW92ZSB0aGlzIGxpbmUgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91IGFyZSBkb2luZy4gSXQgc3RvcHMgdGhlIHZpZXdwb3J0XG4gICAgICAvLyBmcm9tIHNuYXBwaW5nIHdoZW4gdGV4dCBpbnB1dHMgYXJlIGZvY3VzZWQuIElvbmljIGhhbmRsZXMgdGhpcyBpbnRlcm5hbGx5IGZvclxuICAgICAgLy8gYSBtdWNoIG5pY2VyIGtleWJvYXJkIGV4cGVyaWVuY2UuXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcbiAgICB9XG4gICAgaWYod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cbiAgICAkcm9vdFNjb3BlLiRvbignc2hvdzpsb2FkaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAkaW9uaWNMb2FkaW5nLnNob3coe3RlbXBsYXRlOiAnPGlvbi1zcGlubmVyIGljb249XCJzcGlyYWxcIiBjbGFzcz1cInNwaW5uZXItY2FsbVwiPjwvaW9uLXNwaW5uZXI+Jywgc2hvd0JhY2tkcm9wOiB0cnVlLCBhbmltYXRpb246ICdmYWRlLWluJ30pO1xuICAgIH0pO1xuXG4gICAgJHJvb3RTY29wZS4kb24oJ2hpZGU6bG9hZGluZycsIGZ1bmN0aW9uKCkge1xuICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XG4gICAgfSk7XG5cbiAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICBjb25zb2xlLmxvZygnbmV3IHZlcnNpb24gMScpO1xuICAgICAgUGFyc2VQdXNoUGx1Z2luLm9uKCdyZWNlaXZlUE4nLCBmdW5jdGlvbihwbil7XG4gICAgICAgIGNvbnNvbGUubG9nKHBuKTtcbiAgICAgICAgaWYoIXBuLnRpdGxlKSB7XG4gICAgICAgICAgJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgICAgICAgdGl0bGU6ICdBbm5vdW5jZW1lbnQnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj4nKyBwbi5hbGVydCArICc8L2Rpdj4nXG4gICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcblxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHN3aXRjaCAocG4udGl0bGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ09wcG9uZW50IEZvdW5kJzpcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdvcHBvbmVudDpmb3VuZCcpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ09wcG9uZW50IENvbmZpcm1lZCc6XG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnb3Bwb25lbnQ6Y29uZmlybWVkJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnUmVzdWx0cyBFbnRlcmVkJzpcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdyZXN1bHRzOmVudGVyZWQnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgfSk7XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycsIFtdKTtcblxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluTWF0Y2hlc0N0cmwnLCBBZG1pbk1hdGNoZXNDdHJsKTtcblxuQWRtaW5NYXRjaGVzQ3RybC4kaW5qZWN0ID0gWyckc2NvcGUnLCAnUGFyc2UnXTtcbmZ1bmN0aW9uIEFkbWluTWF0Y2hlc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5QbGF5ZXJzQ3RybCcsIEFkbWluUGxheWVyc0N0cmwpO1xuXG5BZG1pblBsYXllcnNDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICdQYXJzZSddO1xuZnVuY3Rpb24gQWRtaW5QbGF5ZXJzQ3RybCgkc2NvcGUsIFBhcnNlKSB7XG4gIFxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pblNldHRpbmdzQ3RybCcsIEFkbWluU2V0dGluZ3NDdHJsKTtcblxuQWRtaW5TZXR0aW5nc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ2xvY2F0aW9uU2VydmljZXMnLCAnbmV3VG91cm5hbWVudCcsICd0b3VybmFtZW50J107XG5cbmZ1bmN0aW9uIEFkbWluU2V0dGluZ3NDdHJsKCRzY29wZSwgbG9jYXRpb25TZXJ2aWNlcywgbmV3VG91cm5hbWVudCwgdG91cm5hbWVudCkge1xuICAkc2NvcGUuZGV0YWlscyA9IG5ld1RvdXJuYW1lbnQ7XG4gIFxuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgXG4gICRzY29wZS5zZXRUb3VybmFtZW50TG9jYXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgbG9jYXRpb25TZXJ2aWNlcy5nZXRMb2NhdGlvbigpLnRoZW4oZnVuY3Rpb24gKGxvY2F0aW9uKSB7XG4gICAgICB2YXIgcG9pbnQgPSBuZXcgUGFyc2UuR2VvUG9pbnQoe2xhdGl0dWRlOiBsb2NhdGlvbi5sYXRpdHVkZSwgbG9uZ2l0dWRlOiBsb2NhdGlvbi5sb25naXR1ZGV9KTtcbiAgICAgICRzY29wZS50b3VybmFtZW50LnNldChcImxvY2F0aW9uXCIsIHBvaW50KTtcbiAgICAgICRzY29wZS50b3VybmFtZW50LnNhdmUoKS50aGVuKGZ1bmN0aW9uICh0b3VybmFtZW50KSB7XG4gICAgICAgICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudDtcbiAgICAgICAgYWxlcnQoJ3RvdXJubWFuZXQgbG9jYXRpb24gc2V0Jyk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignRGFzaGJvYXJkQ3RybCcsIERhc2hib2FyZEN0cmwpO1xuXG5EYXNoYm9hcmRDdHJsLiRpbmplY3QgPSAgWyckc2NvcGUnLCAnJHN0YXRlJywgJyRmaWx0ZXInLCAnJHRpbWVvdXQnLCAnJGludGVydmFsJywgJyRpb25pY1BvcHVwJywgJyRyb290U2NvcGUnLFxuICAnUGFyc2UnLCAndG91cm5hbWVudCcsICdNYXRjaFNlcnZpY2VzJywgJ1F1ZXVlU2VydmljZXMnLCAnTGFkZGVyU2VydmljZXMnLCAnbG9jYXRpb25TZXJ2aWNlcydcbl07XG5cbmZ1bmN0aW9uIERhc2hib2FyZEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkZmlsdGVyLCAkdGltZW91dCwgJGludGVydmFsLCAkaW9uaWNQb3B1cCwgJHJvb3RTY29wZSxcbiAgUGFyc2UsIHRvdXJuYW1lbnQsIE1hdGNoU2VydmljZXMsIFF1ZXVlU2VydmljZXMsIExhZGRlclNlcnZpY2VzLCBsb2NhdGlvblNlcnZpY2VzXG4pIHtcblxuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgdmFyIHByb21pc2UgPSBudWxsO1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG4gICRzY29wZS5lbmQgPSB7XG4gICAgY2FuUGxheTogdHJ1ZSxcbiAgICB0aW1lOiBwYXJzZUZsb2F0KG1vbWVudCgpLmZvcm1hdCgneCcpKVxuICB9XG4gICRzY29wZS5vcHBvbmVudCA9IFF1ZXVlU2VydmljZXMub3Bwb25lbnQ7XG4gICRzY29wZS5oZXJvTGlzdCA9IFF1ZXVlU2VydmljZXMuaGVyb2VzO1xuICAkc2NvcGUubXlPcHBvbmVudCA9IHtuYW1lOidQQVggQXR0ZW5kZWUnfTtcblxuICAkcm9vdFNjb3BlLiRvbignb3Bwb25lbnQ6Zm91bmQnLCBwbGF5ZXJDb25maXJtKTtcbiAgJHJvb3RTY29wZS4kb24oJ29wcG9uZW50OmNvbmZpcm1lZCcsIG9wcG9uZW50Q29uZmlybWVkKTtcbiAgJHJvb3RTY29wZS4kb24oJ3Jlc3VsdHM6ZW50ZXJlZCcsIG1hdGNoUGxheWVkKTtcblxuICAkc2NvcGUuJG9uKFwiJGlvbmljVmlldy5lbnRlclwiLCBmdW5jdGlvbihldmVudCkge1xuICAgIGlmKG5hdmlnYXRvciAmJiBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuKSB7XG4gICAgICBuYXZpZ2F0b3Iuc3BsYXNoc2NyZWVuLmhpZGUoKTtcbiAgICB9XG4gICAgJHNjb3BlLmxvY2F0aW9uID0gbG9jYXRpb25TZXJ2aWNlcy5sb2NhdGlvbjtcbiAgICBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLmN1cnJlbnQoKSkudGhlbihmdW5jdGlvbiAocGxheWVycykge1xuICAgICAgJHNjb3BlLnBsYXllciA9IHBsYXllcnNbMF07XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnbG9jYXRpb24nLCAkc2NvcGUubG9jYXRpb24uY29vcmRzKTtcbiAgICAgIHN0YXR1cygpO1xuICAgIH0pO1xuICB9KTtcblxuICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKSB7XG4gICAgZ2V0Q3VycmVudFN0YXR1cyh0cnVlKTtcbiAgfTtcblxuICAkc2NvcGUuc3RhcnRRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZigkc2NvcGUuZW5kLmNhblBsYXkpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmNhbmNlbFF1ZXVlID0gZnVuY3Rpb24gKCkge1xuICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgc2F2ZVBsYXllcigpO1xuICB9O1xuXG4gICRzY29wZS5zdG9wID0gZnVuY3Rpb24oKSB7XG4gICAgJGludGVydmFsLmNhbmNlbChwcm9taXNlKTtcbiAgfTtcblxuICAkc2NvcGUuc2hvd09wcG9uZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5zdG9wKCk7XG4gICAgcHJvbWlzZSA9ICRpbnRlcnZhbChmdW5jdGlvbiAoKSB7Y2hhbmdlV29yZCgpfSwgMjAwMCk7XG4gIH07XG5cbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICB9KTtcbiAgJHNjb3BlLmZpbmlzaGVkID0gZnVuY3Rpb24gKCkge1xuICAgICR0aW1lb3V0KHRpbWVyLCAxNTAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoVGltZSgpIHtcbiAgICBpZighJHNjb3BlLm1hdGNoKSB7XG4gICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgaWYgKG1hdGNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgICB0aW1lcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZXIoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiB0aW1lciAoKSB7XG4gICAgdmFyIG5vdyA9IG1vbWVudCgpO1xuICAgIHZhciB0aW1lID0gJHNjb3BlLm1hdGNoLmdldCgnYWN0aXZlRGF0ZScpO1xuICAgIGlmKHRpbWUpIHtcbiAgICAgIHZhciBmaXZlTWludXRlcyA9IG1vbWVudCh0aW1lKS5hZGQoMSwgJ21pbnV0ZXMnKTtcbiAgICAgICRzY29wZS5lbmQudGltZSA9IHBhcnNlRmxvYXQoZml2ZU1pbnV0ZXMuZm9ybWF0KCd4JykpO1xuICAgICAgJHNjb3BlLmVuZC5jYW5QbGF5ID0gbm93LmlzQWZ0ZXIoZml2ZU1pbnV0ZXMsICdzZWNvbmRzJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2F2ZVBsYXllciAoKSB7XG4gICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgc3RhdHVzKCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzdGF0dXMgKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAgIHN3aXRjaCAoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpKSB7XG4gICAgICAgIGNhc2UgJ29wZW4nOlxuICAgICAgICAgICRzY29wZS5zdG9wKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3F1ZXVlJzpcbiAgICAgICAgICAkc2NvcGUuc2hvd09wcG9uZW50cygpO1xuICAgICAgICAgIG1hdGNoTWFraW5nKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2ZvdW5kJzpcbiAgICAgICAgICBwbGF5ZXJDb25maXJtKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NvbmZpcm1lZCc6XG4gICAgICAgICAgd2FpdGluZ0Zvck9wcG9uZW50KCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ25vT3Bwb25lbnQnOlxuICAgICAgICAgIG5vT3Bwb25lbnQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncGxheWluZyc6XG4gICAgICAgICAgZ2V0TGFzdE1hdGNoKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2NhbmNlbGxlZCc6XG4gICAgICAgICAgcGxheWVyQ2FuY2VsbGVkKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykpO1xuICAgICAgbWF0Y2hUaW1lKCk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLiRvbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnY29udHJvbGxlciBkZXN0cm95ZWQnKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gZ2V0Q3VycmVudFN0YXR1cyhyZWZyZXNoKSB7XG4gICAgdmFyIHJlZnJlc2ggPSByZWZyZXNoO1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcigkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyc1swXTtcbiAgICAgIGlmICgkc2NvcGUucGxheWVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdjdXJyZW50U3RhdHVzJyk7XG4gICAgICAgIHN0YXR1cygpO1xuICAgICAgICBpZihyZWZyZXNoKSB7XG4gICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhc3RNYXRjaCgpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSA9PT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1hdGNoTWFraW5nKCkge1xuICAgIFBhcnNlLkNsb3VkLnJ1bignbWF0Y2htYWtpbmcnKS50aGVuKGZ1bmN0aW9uICgpe1xuICAgICAgY29uc29sZS5sb2coJ21hdGNobWFraW5nIHN0YXJ0ZWQnKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXllckNvbmZpcm0oKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgJHRpbWVvdXQgKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLnN0b3AoKTtcbiAgICAgICAgaWYoJHNjb3BlLm1hdGNoLnN0YXR1cyA9PT0gJ3BlbmRpbmcnKSB7XG4gICAgICAgICAgdmFyIGNvbmZpcm1Qb3B1cCA9ICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPjxzdHJvbmc+QSBXb3J0aHkgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGhhcyBiZWVuIGZvdW5kITwvZGl2PicsXG4gICAgICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGNvbmZpcm1Qb3B1cC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgICAgIGlmKHJlcykge1xuICAgICAgICAgICAgICBpZiAoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnY29uZmlybTInLCB0cnVlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnY29uZmlybWVkJyk7XG4gICAgICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNob3dGYWlsUG9wdXAoKTtcbiAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZigkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykgPT09ICdmb3VuZCcpIHtcbiAgICAgICAgICAgICAgY29uZmlybVBvcHVwLmNsb3NlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgMjAwMDApO1xuICAgICAgICB9XG4gICAgICAgIGlmKCRzY29wZS5tYXRjaC5zdGF0dXMgPT09ICdjYW5jZWxsZWQnKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9XG4gICAgICB9LCAyMDAwKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dGYWlsUG9wdXAoKSB7XG4gICAgdmFyIGZhaWxQb3B1cCA9ICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdSBGYWlsZWQgdG8gQ29uZmlybSBNYXRjaDwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+Q2xvc2U8L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG5cbiAgICBmYWlsUG9wdXAudGhlbihmdW5jdGlvbiAocmVzKSB7XG5cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wcG9uZW50Q29uZmlybWVkICgpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSwgJ2FjdGl2ZScpIHtcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiB3YWl0aW5nRm9yT3Bwb25lbnQgKCkge1xuICAgIFBhcnNlLkNsb3VkLnJ1bignY29uZmlybU1hdGNoJykudGhlbihmdW5jdGlvbiAobnVtKSB7XG4gICAgICBjaGVja09wcG9uZW50KDUwMDAsIGZhbHNlKTtcbiAgICAgIGNoZWNrT3Bwb25lbnQoMzAwMDAsIHRydWUpO1xuXG4gICAgICB2YXIgdXNlckdlb1BvaW50ID0gJHNjb3BlLnBsYXllci5nZXQoXCJsb2NhdGlvblwiKTtcbi8vIENyZWF0ZSBhIHF1ZXJ5IGZvciBwbGFjZXNcbiAgICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSgnVG91cm5hbWVudCcpO1xuLy8gSW50ZXJlc3RlZCBpbiBsb2NhdGlvbnMgbmVhciB1c2VyLlxuICAgICAgcXVlcnkud2l0aGluTWlsZXMoXCJsb2NhdGlvblwiLCB1c2VyR2VvUG9pbnQsIDUwKTtcbi8vIExpbWl0IHdoYXQgY291bGQgYmUgYSBsb3Qgb2YgcG9pbnRzLlxuICAgICAgcXVlcnkubGltaXQoMTApO1xuLy8gRmluYWwgbGlzdCBvZiBvYmplY3RzXG4gICAgICBxdWVyeS5maW5kKHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocGxhY2VzT2JqZWN0cykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHBsYWNlc09iamVjdHMpO1xuICAgICAgICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4gJiYgcGxhY2VzT2JqZWN0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIFBhcnNlUHVzaFBsdWdpbi5zdWJzY3JpYmUoJ3BheC1lYXN0JywgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdwYXhlZCcpO1xuICAgICAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrT3Bwb25lbnQgKHRpbWVvdXQsIGFscmVhZHlDaGVja2VkKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpID09PSAnY29uZmlybWVkJykge1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuXG4gICAgICAgICAgc3dpdGNoICgkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSkge1xuICAgICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgICAgIGlmKGFscmVhZHlDaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdub09wcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYWN0aXZlJzpcbiAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdwbGF5aW5nJyk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2hvdzpsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHRpbWVvdXQpO1xuICB9XG4gIGZ1bmN0aW9uIG1hdGNoUGxheWVkKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSAhPT0gJ29wZW4nKSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyO1xuICAgICAgICBzaG93TWF0Y2hSZXN1bHRzUG9wdXAoKTtcbiAgICAgIH0pXG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNob3dNYXRjaFJlc3VsdHNQb3B1cCgpIHtcbiAgICB2YXIgcG9wdXAgPSAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ01hdGNoIFBsYXllZCcsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdXIgT3Bwb25lbnQgaGFzIHN1Ym1pdHRpbmcgcmVzdWx0czwvZGl2PidcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBub09wcG9uZW50ICgpIHtcbiAgICAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggRXJyb3InLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj48c3Ryb25nPllvdXIgT3Bwb25lbnQ8L3N0cm9uZz48YnI+IGZhaWxlZCB0byBjb25maXJtITwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+QmFjazwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tYXNzZXJ0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHRleHQ6ICc8Yj5RdWV1ZSBBZ2FpbjwvYj4nLFxuICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIF1cbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgaWYocmVzKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdzdGF0dXMnLCAnY2FuY2VsbGVkJyk7XG4gICAgICAgICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hhbmdlV29yZCAoKSB7XG4gICAgJHNjb3BlLm15T3Bwb25lbnQubmFtZSA9ICRzY29wZS5vcHBvbmVudC5saXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSokc2NvcGUub3Bwb25lbnQubGlzdC5sZW5ndGgpXTtcbiAgfTtcbn07XG4vLyBmdW5jdGlvbiBqb2luUXVldWVQb3B1cCAoKSB7XG4vLyAgIHN1YigpO1xuLy8gICAkc2NvcGUuc2VsZWN0ZWQgPSB7c3RhdHVzOiB0cnVlfTtcbi8vICAgJHNjb3BlLnNlbGVjdEhlcm8gPSBmdW5jdGlvbiAoaGVybykge1xuLy8gICAgICRzY29wZS5pbWFnZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb0NsYXNzJykpWzBdLmNsaWVudFdpZHRoO1xuLy9cbi8vICAgICBpZihoZXJvLmNoZWNrZWQpIHtcbi8vICAgICAgIGhlcm8uY2hlY2tlZCA9ICFoZXJvLmNoZWNrZWQ7XG4vLyAgICAgICAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzID0gdHJ1ZTtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vL1xuLy8gICAgIGlmKCFoZXJvLmNoZWNrZWQgJiYgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cykge1xuLy8gICAgICAgaGVyby5jaGVja2VkID0gIWhlcm8uY2hlY2tlZDtcbi8vICAgICAgICRzY29wZS5zZWxlY3RlZC5zdGF0dXMgPSBmYWxzZTtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgIH07XG4vLyAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuLy8gICAgIHtcbi8vICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy9zZWxlY3QuaGVyby5odG1sJyxcbi8vICAgICAgIHRpdGxlOiAnU2VsZWN0IEhlcm8gQ2xhc3MnLFxuLy8gICAgICAgc2NvcGU6ICRzY29wZSxcbi8vICAgICAgIGJ1dHRvbnM6IFtcbi8vICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4vLyAgICAgICAgIHsgdGV4dDogJzxiPlF1ZXVlPC9iPicsXG4vLyAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4vLyAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbi8vICAgICAgICAgICAgIHZhciBoZXJvID0gJGZpbHRlcignZmlsdGVyJykoJHNjb3BlLmhlcm9MaXN0LCB7Y2hlY2tlZDogdHJ1ZX0sIHRydWUpO1xuLy8gICAgICAgICAgICAgaWYgKCFoZXJvLmxlbmd0aCkge1xuLy8gICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4vLyAgICAgICAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICAgICAgICByZXR1cm4gaGVyb1swXTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICAgIF1cbi8vICAgICB9KTtcbi8vIH07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVySm9pbkN0cmwnLCBbXG4gICAgJyRzY29wZScsICckZmlsdGVyJywgJyRpb25pY1BvcHVwJywgJyRzdGF0ZScsICckaW9uaWNIaXN0b3J5JywgJyRxJywgJ1BhcnNlJywgJ3RvdXJuYW1lbnQnLCAnTGFkZGVyU2VydmljZXMnLCBMYWRkZXJKb2luQ3RybF0pO1xuXG5mdW5jdGlvbiBMYWRkZXJKb2luQ3RybChcbiAgJHNjb3BlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCAkcSwgUGFyc2UsICB0b3VybmFtZW50LCBMYWRkZXJTZXJ2aWNlc1xuKSB7XG4gICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICB9KTtcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50LnRvdXJuYW1lbnQ7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG4gICRzY29wZS5wbGF5ZXIgPSB7XG4gICAgYmF0dGxlVGFnOiAnJ1xuICB9O1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIudXNlcm5hbWUgPSAkc2NvcGUudXNlci51c2VybmFtZTtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zdGF0dXMgPSAnb3Blbic7XG4gICAgICAgIExhZGRlclNlcnZpY2VzLmpvaW5Ub3VybmFtZW50KCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlciwgJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICAgU3VjY2Vzc1BvcHVwKHBsYXllcikudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICBmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvcik7XG4gICAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZUJhdHRsZVRhZyAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgdGFnID0gJHNjb3BlLnBsYXllci5iYXR0bGVUYWc7XG5cbiAgICBpZih0YWcubGVuZ3RoIDwgOCkge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgYmF0dGxlIHRhZycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIHZhciBzcGxpdCA9IHRhZy5zcGxpdCgnIycpO1xuICAgIGlmKHNwbGl0Lmxlbmd0aCAhPT0gMikge1xuICAgICAgY2IucmVqZWN0KCdFbnRlciB5b3VyIGZ1bGwgQkFUVExFVEFH4oSiIGluY2x1ZGluZyAjIGFuZCBmb3VyIGRpZ2l0cycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKHNwbGl0WzFdLmxlbmd0aCA8IDIgfHwgc3BsaXRbMV0ubGVuZ3RoID4gNCkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyB1cCB0byBmb3VyIGRpZ2l0cyBhZnRlciAjIScpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIGlmKGlzTmFOKHNwbGl0WzFdKSkge1xuICAgICAgY2IucmVqZWN0KCdZb3VyIEJBVFRMRVRBR+KEoiBtdXN0IGluY2x1ZGluZyBmb3VyIGRpZ2l0cyBhZnRlciAjJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgTGFkZGVyU2VydmljZXMudmFsaWRhdGVQbGF5ZXIoJHNjb3BlLnRvdXJuYW1lbnQudG91cm5hbWVudCwgdGFnKS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICBpZihyZXN1bHRzLmxlbmd0aCkge1xuICAgICAgICBjYi5yZWplY3QoJ1RoZSBCQVRUTEVUQUfihKIgeW91IGVudGVyZWQgaXMgYWxyZWFkeSByZWdpc3RlcmVkLicpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYi5yZXNvbHZlKHRhZyk7XG4gICAgICB9IFxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdSZWdpc3RyYXRpb24gRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgc2lnbmVkIHVwISBOb3cgZ28gZmluZCBhIHZhbGlhbnQgb3Bwb25lbnQuJ1xuICAgIH0pO1xuICB9O1xufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdMZWFkZXJCb2FyZHNDdHJsJywgTGVhZGVyQm9hcmRzQ3RybCk7XG5cbkxlYWRlckJvYXJkc0N0cmwuJGluamVjdCA9IFsnJHNjb3BlJywgJ0xhZGRlclNlcnZpY2VzJywgJ3RvdXJuYW1lbnQnLCAnUGFyc2UnLCAnJGZpbHRlcicsICckaW9uaWNQb3B1cCddO1xuZnVuY3Rpb24gTGVhZGVyQm9hcmRzQ3RybCgkc2NvcGUsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50LCBQYXJzZSwgJGZpbHRlciwgJGlvbmljUG9wdXApIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICBnZXRQbGF5ZXJzKCk7XG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2V0UGxheWVycygpO1xuICB9XG4gIFxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKCkge1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudC50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICB2YXIgcmFuayA9IDE7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGxheWVycywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICAgIHJhbmsrKztcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdSZXNldFBhc3N3b3JkQ3RybCcsXG4gICAgWyckc2NvcGUnLCAnJGlvbmljUG9wdXAnLCAnJHN0YXRlJywgJyRpb25pY0hpc3RvcnknLCAnUGFyc2UnLCBSZXNldFBhc3N3b3JkQ3RybF0pO1xuXG5mdW5jdGlvbiBSZXNldFBhc3N3b3JkQ3RybFxuKCRzY29wZSwgJGlvbmljUG9wdXAsICRzdGF0ZSwgJGlvbmljSGlzdG9yeSwgUGFyc2UpIHtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS5lbWFpbCA9IHt9O1xuICBcbiAgJHNjb3BlLnJlc2V0UGFzc3dvcmQgPSBmdW5jdGlvbiAoZW1haWwpIHtcbiAgICBQYXJzZS5Vc2VyLnJlcXVlc3RQYXNzd29yZFJlc2V0KGVtYWlsLnRleHQsIHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICBTdWNjZXNzUG9wdXAoKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmVcbiAgICAgICAgRXJyb3JQb3B1cChlcnJvci5tZXNzYWdlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIFxuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdVcGRhdGUgRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1Bhc3N3b3JkIFJlc2V0JyxcbiAgICAgIHRlbXBsYXRlOiAnQW4gRW1haWwgaGFzIGJlZW4gc2VudCB0byByZXNldCB5b3VyIHBhc3N3b3JkJ1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgfSlcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVyUHJvZmlsZUN0cmwnLFxuICAgIFsnJHNjb3BlJywgJyRmaWx0ZXInLCAnJGlvbmljUG9wdXAnLCAnJHN0YXRlJywgJyRpb25pY0hpc3RvcnknLCAnJHEnLCAnUGFyc2UnLCAndG91cm5hbWVudCcsICdMYWRkZXJTZXJ2aWNlcycsICdwbGF5ZXInLCBMYWRkZXJQcm9maWxlQ3RybF0pO1xuXG5mdW5jdGlvbiBMYWRkZXJQcm9maWxlQ3RybChcbiAgJHNjb3BlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCAkcSwgUGFyc2UsICB0b3VybmFtZW50LCBMYWRkZXJTZXJ2aWNlcywgcGxheWVyXG4pIHtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIFN1Y2Nlc3NQb3B1cChwbGF5ZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IpO1xuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVCYXR0bGVUYWcgKCkge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRhZyA9ICRzY29wZS5wbGF5ZXIuYmF0dGxlVGFnO1xuXG4gICAgaWYodGFnLmxlbmd0aCA8IDgpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIGJhdHRsZSB0YWcnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgc3BsaXQgPSB0YWcuc3BsaXQoJyMnKTtcbiAgICBpZihzcGxpdC5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIEJBVFRMRVRBR+KEoiBpbmNsdWRpbmcgIyBhbmQgZm91ciBkaWdpdHMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihzcGxpdFsxXS5sZW5ndGggPCAyIHx8IHNwbGl0WzFdLmxlbmd0aCA+IDQpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgdXAgdG8gZm91ciBkaWdpdHMgYWZ0ZXIgIyEnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihpc05hTihzcGxpdFsxXSkpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgZm91ciBkaWdpdHMgYWZ0ZXIgIycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLnZhbGlkYXRlUGxheWVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsIHRhZykudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgaWYocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgY2IucmVqZWN0KCdUaGUgQkFUVExFVEFH4oSiIHlvdSBlbnRlcmVkIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0YWcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdVcGRhdGUgRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgdXBkYXRlZCEgTm93IGdvIGFuZCBwbGF5ISdcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuTG9naW5DdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljSGlzdG9yeSddO1xuZnVuY3Rpb24gTG9naW5DdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljSGlzdG9yeSkge1xuICAkc2NvcGUudXNlciA9IHt9O1xuICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24gKCkge1xuICAgIFBhcnNlLlVzZXIubG9nSW4oJHNjb3BlLnVzZXIudXNlcm5hbWUsICRzY29wZS51c2VyLnBhc3N3b3JkLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgICAgIFBhcnNlUHVzaFBsdWdpbi5zdWJzY3JpYmUodXNlci51c2VybmFtZSwgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnc3ViYmVkJyk7XG4gICAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZhaWxlZCB0byBzdWInKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uICh1c2VyLCBlcnJvcikge1xuICAgICAgICAkc2NvcGUud2FybmluZyA9IGVycm9yLm1lc3NhZ2U7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTWF0Y2hMaXN0Q3RybCcsIE1hdGNoTGlzdEN0cmwpO1xuXG5NYXRjaExpc3RDdHJsLiRpbmplY3QgPSBbXG4gICckc2NvcGUnLCAnJHN0YXRlJywgJyRpb25pY1BvcHVwJywgJyRyb290U2NvcGUnLCAnUGFyc2UnLCAnTWF0Y2hTZXJ2aWNlcycsICdwbGF5ZXInXG5dO1xuXG5mdW5jdGlvbiBNYXRjaExpc3RDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJGlvbmljUG9wdXAsICRyb290U2NvcGUsIFBhcnNlLCBNYXRjaFNlcnZpY2VzLCBwbGF5ZXJcbikge1xuICAkc2NvcGUubWF0Y2hlcyA9IFtdO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuXG4gIGlmKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgIE1hdGNoU2VydmljZXMuZ2V0UGxheWVyTWF0Y2hlcygkc2NvcGUucGxheWVyLCAnY29tcGxldGVkJykudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoZXMgZmV0Y2hlZCcpO1xuICAgICAgJHNjb3BlLm1hdGNoZXMgPSBtYXRjaGVzO1xuICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRQbGF5ZXJNYXRjaGVzKCRzY29wZS5wbGF5ZXIsICdyZXBvcnRlZCcpLnRoZW4oZnVuY3Rpb24gKHJlcG9ydGVkKSB7XG4gICAgICAgICRzY29wZS5yZXBvcnRlZCA9IHJlcG9ydGVkO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfVxuXG4gICRzY29wZS5wcm9jZXNzTWF0Y2ggPSBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICBpZihtYXRjaC53aW5uZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYobWF0Y2gubG9zZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIGlmKG1hdGNoLnJlcG9ydFJlYXNvbil7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoJHNjb3BlLnJlcG9ydGVkLmxlbmd0aCkge1xuICAgICAgc2hvd1JlcG9ydGVkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgICRzdGF0ZS5nbygnYXBwLm1hdGNoLnJlcG9ydCcsIHtpZDogbWF0Y2guaWR9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dSZXBvcnRlZCgpIHtcbiAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1RvbyBNYW55IFJlcG9ydHMnLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj5Zb3UgaGF2ZSB0b28gbWFueSBwZW5kaW5nIHJlcG9ydHMuIFBsZWFzZSB3YWl0LjwvZGl2PidcbiAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcblxuICAgIH0pXG4gIH1cbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTWF0Y2hSZXBvcnRDdHJsJywgTWF0Y2hSZXBvcnRDdHJsKTtcblxuTWF0Y2hSZXBvcnRDdHJsLiRpbmplY3QgPSBbXG4gICckc2NvcGUnLCAnJHN0YXRlJywgJyRyb290U2NvcGUnLCAnJGlvbmljUG9wdXAnLCAnJGlvbmljSGlzdG9yeScsXG4gICdQYXJzZScsICdNYXRjaFNlcnZpY2VzJywgJ2NhbWVyYVNlcnZpY2VzJywgJ3JlcG9ydCdcbl07XG5mdW5jdGlvbiBNYXRjaFJlcG9ydEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCwgJGlvbmljSGlzdG9yeSxcbiAgUGFyc2UsIE1hdGNoU2VydmljZXMsIGNhbWVyYVNlcnZpY2VzLCByZXBvcnRcbikge1xuXG4gICRzY29wZS5tYXRjaCA9IHJlcG9ydDtcblxuICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG5cbiAgdmFyIHBhcnNlRmlsZSA9IG5ldyBQYXJzZS5GaWxlKCk7XG4gIHZhciBpbWdTdHJpbmcgPSBudWxsO1xuXG4gICRzY29wZS5nZXRQaWN0dXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBjYW1lcmFTZXJ2aWNlcy5jYW1lcmE7XG4gICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKG9uU3VjY2VzcyxvbkZhaWwsb3B0aW9ucyk7XG4gIH1cbiAgdmFyIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuICAgICRzY29wZS5waWN0dXJlID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnICsgaW1hZ2VEYXRhO1xuICAgIGltZ1N0cmluZyA9IGltYWdlRGF0YTtcbiAgICAkc2NvcGUuJGFwcGx5KCk7XG4gIH07XG4gIHZhciBvbkZhaWwgPSBmdW5jdGlvbihlKSB7XG4gICAgY29uc29sZS5sb2coXCJPbiBmYWlsIFwiICsgZSk7XG4gIH1cblxuICAkc2NvcGUucHJvY2Vzc1JlcG9ydCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYoaW1nU3RyaW5nKSB7XG4gICAgICBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZShcInJlcG9ydC5wbmdcIiwge2Jhc2U2NDppbWdTdHJpbmd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyc2VGaWxlID0gbnVsbDtcbiAgICB9XG4gICAgJHNjb3BlLm1hdGNoLnNldChcInJlcG9ydEltYWdlXCIsIHBhcnNlRmlsZSk7XG4gICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ3JlcG9ydGVkJyk7XG4gICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgfSk7XG4gICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgIHRpdGxlOiAnTWF0Y2ggUmVwb3J0ZWQnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlRoYW5rIHlvdSBmb3Igc3VibWl0dGluZyB0aGUgcmVwb3J0LjwvZGl2PidcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIH1cblxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFZpZXdDdHJsJywgTWF0Y2hWaWV3Q3RybCk7XG5cbk1hdGNoVmlld0N0cmwuJGluamVjdCA9IFtcbiAgJyRzY29wZScsICckc3RhdGUnLCAnJHJvb3RTY29wZScsICckaW9uaWNQb3B1cCcsICckaW9uaWNIaXN0b3J5JyxcbiAgJ1BhcnNlJywgJ0xhZGRlclNlcnZpY2VzJywgJ01hdGNoU2VydmljZXMnLCAnUXVldWVTZXJ2aWNlcycsICdjYW1lcmFTZXJ2aWNlcycsXG4gICd0b3VybmFtZW50JywgJ21hdGNoJywgJ3BsYXllcidcbl07XG5mdW5jdGlvbiBNYXRjaFZpZXdDdHJsKFxuICAkc2NvcGUsICRzdGF0ZSwgJHJvb3RTY29wZSwgJGlvbmljUG9wdXAsICRpb25pY0hpc3RvcnksXG4gIFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcywgY2FtZXJhU2VydmljZXMsXG4gIHRvdXJuYW1lbnQsIG1hdGNoLCBwbGF5ZXJcbikge1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUuZW5kID0ge1xuICAgIHRpbWU6IDBcbiAgfTtcblxuICAkc2NvcGUuJG9uKFwiJGlvbmljVmlldy5lbnRlclwiLCBmdW5jdGlvbihldmVudCkge1xuICAgICRzY29wZS5tYXRjaCA9IG1hdGNoWzBdO1xuICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJbMF07XG4gICAgZ2V0TWF0Y2hEZXRhaWxzKCk7XG4gIH0pO1xuXG4gICRyb290U2NvcGUuJG9uKCdyZXN1bHRzOmVudGVyZWQnLCBnZXRNYXRjaCk7XG5cbiAgJHNjb3BlLnBpY3R1cmUgPSBudWxsO1xuICB2YXIgcGFyc2VGaWxlID0gbmV3IFBhcnNlLkZpbGUoKTtcbiAgdmFyIGltZ1N0cmluZyA9IG51bGw7XG5cbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuXG5cblxuICAkc2NvcGUuZ2V0UGljdHVyZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBvcHRpb25zID0gY2FtZXJhU2VydmljZXMuY2FtZXJhO1xuICAgIG5hdmlnYXRvci5jYW1lcmEuZ2V0UGljdHVyZShvblN1Y2Nlc3Msb25GYWlsLG9wdGlvbnMpO1xuICB9XG4gIHZhciBvblN1Y2Nlc3MgPSBmdW5jdGlvbihpbWFnZURhdGEpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9ICdkYXRhOmltYWdlL3BuZztiYXNlNjQsJyArIGltYWdlRGF0YTtcbiAgICBpbWdTdHJpbmcgPSBpbWFnZURhdGE7XG4gICAgJHNjb3BlLiRhcHBseSgpO1xuICB9O1xuICB2YXIgb25GYWlsID0gZnVuY3Rpb24oZSkge1xuICAgIGNvbnNvbGUubG9nKFwiT24gZmFpbCBcIiArIGUpO1xuICB9XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIGdldE1hdGNoKHRydWUpO1xuICB9O1xuXG4gICRzY29wZS5yZWNvcmQgPSBmdW5jdGlvbiAocmVjb3JkKSB7XG4gICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICB2YXIgdXNlcm5hbWUgPSBudWxsO1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnYWN0aXZlJykge1xuICAgICAgICBzd2l0Y2ggKHJlY29yZCkge1xuICAgICAgICAgIGNhc2UgJ3dpbic6XG4gICAgICAgICAgICB3aW5NYXRjaCgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgIGlmKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2xvc2VyJywgJHNjb3BlLm9wcG9uZW50LnVzZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lXG4gICAgICAgICAgICAgICAgcmVjb3JkTWF0Y2goJHNjb3BlLm1hdGNoLCB1c2VybmFtZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlICdsb3NzJzpcbiAgICAgICAgICAgIGxvc2VNYXRjaCgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgICAgICAgIGlmKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3dpbm5lcicsICRzY29wZS5vcHBvbmVudC51c2VyKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdsb3NlcicsICRzY29wZS5wbGF5ZXIpO1xuICAgICAgICAgICAgICAgIHVzZXJuYW1lID0gJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgIHJlY29yZE1hdGNoKCRzY29wZS5tYXRjaCwgdXNlcm5hbWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gd2luTWF0Y2ggKCkge1xuICAgICRzY29wZS5waWN0dXJlID0gbnVsbDtcbiAgICAkc2NvcGUuZXJyb3JNZXNzYWdlID0gbnVsbDtcblxuICAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvd2luLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1JlcG9ydCBhIFdpbicsXG4gICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICB7IHRleHQ6ICdDYW5jZWwnfSxcbiAgICAgICAgICB7IHRleHQ6ICc8Yj5Db25maXJtPC9iPicsXG4gICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLnBpY3R1cmUpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JNZXNzYWdlID0gJ1VwbG9hZCBhIFNjcmVlbnNob3QnO1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgXVxuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBsb3NlTWF0Y2goKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLnNob3coXG4gICAgICB7XG4gICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy9sb3NlLm1hdGNoLmh0bWwnLFxuICAgICAgICB0aXRsZTogJ1JlcG9ydCBhIExvc3MnLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWF0Y2gocmVmcmVzaCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJHNjb3BlLm1hdGNoLmlkKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2g7XG4gICAgICBjb25zb2xlLmxvZygnbWF0Y2gnICsgJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykpO1xuICAgICAgaWYocmVmcmVzaCkge1xuICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZWNvcmRNYXRjaChtYXRjaCwgdXNlcm5hbWUpIHtcblxuICAgIG1hdGNoLnNldCgnc3RhdHVzJywgJ2NvbXBsZXRlZCcpO1xuICAgIG1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzaG93OmxvYWRpbmcnKTtcbiAgICAgIFBhcnNlLkNsb3VkLnJ1bignbWF0Y2hSZXN1bHRzJywge3VzZXJuYW1lOiB1c2VybmFtZSwgbWF0Y2g6IG1hdGNoLmlkfSkudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgdGl0bGU6ICdNYXRjaCBTdWJtaXR0ZWQnLFxuICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+VGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHJlc3VsdHM8L2Rpdj4nXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1hdGNoRGV0YWlscygpIHtcbiAgICAkc2NvcGUub3Bwb25lbnQgPSB7XG4gICAgICBoZXJvOiBudWxsLFxuICAgICAgYmF0dGxlVGFnOiBudWxsXG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8yO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMjtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjI7XG4gICAgfVxuICAgIGlmKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMicpIHtcbiAgICAgICRzY29wZS5vcHBvbmVudC5oZXJvID0gJHNjb3BlLm1hdGNoLmhlcm8xO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXJuYW1lID0gJHNjb3BlLm1hdGNoLnVzZXJuYW1lMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC5iYXR0bGVUYWcgPSAkc2NvcGUubWF0Y2guYmF0dGxlVGFnMTtcbiAgICAgICRzY29wZS5vcHBvbmVudC51c2VyID0gJHNjb3BlLm1hdGNoLnBsYXllcjE7XG4gICAgfVxuICB9XG59O1xuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuICAuY29udHJvbGxlcignTWVudUN0cmwnLCBNZW51Q3RybCk7XG5cbk1lbnVDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsJyRpb25pY1BvcG92ZXInLCAnJHN0YXRlJywgJyRpb25pY0hpc3RvcnknLCAnUGFyc2UnLCAnJHRpbWVvdXQnXTtcblxuZnVuY3Rpb24gTWVudUN0cmwoJHNjb3BlLCAkaW9uaWNQb3BvdmVyLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlLCAkdGltZW91dCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJGlvbmljUG9wb3Zlci5mcm9tVGVtcGxhdGVVcmwoJ3RlbXBsYXRlcy9wb3BvdmVycy9wcm9maWxlLnBvcC5odG1sJywge1xuICAgIHNjb3BlOiAkc2NvcGUsXG4gIH0pLnRoZW4oZnVuY3Rpb24ocG9wb3Zlcikge1xuICAgICRzY29wZS5wb3BvdmVyID0gcG9wb3ZlcjtcbiAgfSk7XG5cbiAgJHNjb3BlLm1lbnUgPSBmdW5jdGlvbiAobGluaykge1xuICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgfSk7XG4gICAgaWYobGluayA9PT0gJ2xvZ2luJykge1xuICAgICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgICBQYXJzZVB1c2hQbHVnaW4udW5zdWJzY3JpYmUoJHNjb3BlLnVzZXIuY3VycmVudCgpLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5zdWJiZWQnKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBQYXJzZS5Vc2VyLmxvZ091dCgpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC4nICsgbGluaywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDEwMDApO1xuICAgICAgXG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICB9XG4gICAgJHNjb3BlLnBvcG92ZXIuaGlkZSgpO1xuICB9XG4gIC8vQ2xlYW51cCB0aGUgcG9wb3ZlciB3aGVuIHdlJ3JlIGRvbmUgd2l0aCBpdCFcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wb3Zlci5yZW1vdmUoKTtcbiAgfSk7XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgUmVnaXN0ZXJDdHJsKTtcblxuUmVnaXN0ZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIFJlZ2lzdGVyQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY1BvcHVwKSB7XG5cbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuUmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB2YXIgcmVnaXN0ZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgIHJlZ2lzdGVyLnNldCh1c2VyKTtcbiAgICByZWdpc3Rlci5zaWduVXAobnVsbCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcy5hZG1pbicsIFtdKVxuICAuY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCBBZG1pblJvdXRlc10pO1xuXG5mdW5jdGlvbiBBZG1pblJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmFkbWluJywge1xuICAgICAgdXJsOiAnL2FkbWluJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLmh0bWwnLFxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5zZXR0aW5ncycsIHtcbiAgICAgIHVybDogJy9zZXR0aW5ncycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5zZXR0aW5ncy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pblNldHRpbmdzQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHRvdXJuZXk6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMpIHtcbiAgICAgICAgICByZXR1cm4gVG91cm5hbWVudFNlcnZpY2VzLmdldFRvdXJuYW1lbnQoKTtcbiAgICAgICAgfSxcbiAgICAgICAgbmV3VG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgdG91cm5leSkge1xuICAgICAgICAgIGlmKHRvdXJuZXkubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gdG91cm5leVswXTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5jcmVhdGVUb3VybmFtZW50KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbi5tYXRjaGVzJywge1xuICAgICAgdXJsOiAnL21hdGNoZXMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4ubWF0Y2hlcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbk1hdGNoZXNDdHJsJ1xuICAgIH0pXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5yb3V0ZXMubGFkZGVyJywgW10pXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIExhZGRlclJvdXRlc10pO1xuXG5mdW5jdGlvbiBMYWRkZXJSb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXInLCB7XG4gICAgICB1cmw6ICcvbGFkZGVyJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9sYWRkZXIuaHRtbCcsXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5sZWFkZXJib2FyZCcsIHtcbiAgICAgIHVybDogJy9sZWFkZXJib2FyZHMnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2xlYWRlcmJvYXJkLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xlYWRlckJvYXJkc0N0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIuam9pbicsIHtcbiAgICAgIHVybDogJy9qb2luJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9qb2luLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xhZGRlckpvaW5DdHJsJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLnByb2ZpbGUnLCB7XG4gICAgICB1cmw6ICcvcHJvZmlsZScsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvcHJvZmlsZS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdMYWRkZXJQcm9maWxlQ3RybCcsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHBsYXllcjogZnVuY3Rpb24gKFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCkge1xuICAgICAgICAgIHJldHVybiBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIodG91cm5hbWVudC50b3VybmFtZW50LCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcy5tYXRjaGVzJywgW10pXG4gIC5jb25maWcoWyckc3RhdGVQcm92aWRlcicsIE1hdGNoUm91dGVzXSk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gubGlzdCcsIHtcbiAgICAgIHVybDogJy92aWV3JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmxpc3QuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hMaXN0Q3RybCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHBsYXllcjogZnVuY3Rpb24gKFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCkge1xuICAgICAgICAgIHJldHVybiBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIodG91cm5hbWVudC50b3VybmFtZW50LCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnZpZXcnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC52aWV3Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoVmlld0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBwbGF5ZXI6IGZ1bmN0aW9uIChQYXJzZSwgTGFkZGVyU2VydmljZXMsIHRvdXJuYW1lbnQpIHtcbiAgICAgICAgICByZXR1cm4gTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKHRvdXJuYW1lbnQudG91cm5hbWVudCwgUGFyc2UuVXNlci5jdXJyZW50KCkpO1xuICAgICAgICB9LFxuICAgICAgICBtYXRjaDogZnVuY3Rpb24gKE1hdGNoU2VydmljZXMsICRzdGF0ZSwgJHEsIHBsYXllcikge1xuICAgICAgICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaChwbGF5ZXJbMF0pLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIGlmKCFtYXRjaGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYi5yZWplY3QoKTtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBjYi5yZXNvbHZlKG1hdGNoZXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5tYXRjaC5yZXBvcnQnLCB7XG4gICAgICB1cmw6ICcvcmVwb3J0LzppZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC5yZXBvcnQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hSZXBvcnRDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcmVwb3J0OiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJHN0YXRlUGFyYW1zLmlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTGFkZGVyU2VydmljZXMnLCBbJ1BhcnNlJywgJ0xhZGRlcicsIExhZGRlclNlcnZpY2VzXSlcbiAgLmZhY3RvcnkoJ0xhZGRlcicsIFsnUGFyc2UnLCBMYWRkZXJdKVxuXG5mdW5jdGlvbiBMYWRkZXJTZXJ2aWNlcyhQYXJzZSwgTGFkZGVyKSB7XG4gIHJldHVybiB7XG4gICAgZ2V0UGxheWVyczogZ2V0UGxheWVycyxcbiAgICBnZXRQbGF5ZXI6IGdldFBsYXllcixcbiAgICB2YWxpZGF0ZVBsYXllcjogdmFsaWRhdGVQbGF5ZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50LFxuICAgIGdldFBlbmRpbmdQbGF5ZXJzOiBnZXRQZW5kaW5nUGxheWVyc1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBlbmRpbmdQbGF5ZXJzKHRvdXJuYW1lbnQsIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkubm90RXF1YWxUTygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdxdWV1ZScpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVycyh0b3VybmV5KSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoJ3BvaW50cycsICdtbXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlUGxheWVyKHRvdXJuZXksIGJhdHRsZVRhZykge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5lcXVhbFRvKCdiYXR0bGVUYWcnLCBiYXR0bGVUYWcpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH07XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyKHRvdXJuZXksIHVzZXIpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygndXNlcicsIHVzZXIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cblxuICBmdW5jdGlvbiBqb2luVG91cm5hbWVudCh0b3VybmV5LCB1c2VyLCB1c2VyRGF0YSkge1xuICAgIHZhciBwbGF5ZXIgPSBuZXcgTGFkZGVyLk1vZGVsKCk7XG4gICAgcGxheWVyLnNldCgndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHBsYXllci5zZXQoJ3VzZXInLCB1c2VyKTtcbiAgICBwbGF5ZXIuc2V0KHVzZXJEYXRhKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIExhZGRlcihQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdMYWRkZXInKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndXNlcicsICdiYXR0bGVUYWcnLCAndXNlcm5hbWUnLCAnbG9jYXRpb24nLFxuICAgICdoZXJvJywgJ3BsYXllcicsICdzdGF0dXMnLCAnY2FuY2VsVGltZXInLCAnd2lucycsICdsb3NzZXMnLCAnbW1yJywgJ3BvaW50cycsICdiYW5SZWFzb24nLCAnYWRtaW4nXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufTtcbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnbG9jYXRpb25TZXJ2aWNlcycsIFsnUGFyc2UnLCAnJGNvcmRvdmFHZW9sb2NhdGlvbicsICckcScsIGxvY2F0aW9uU2VydmljZXNdKTtcblxuZnVuY3Rpb24gbG9jYXRpb25TZXJ2aWNlcyAoUGFyc2UsICRjb3Jkb3ZhR2VvbG9jYXRpb24sICRxKSB7XG5cbiAgdmFyIGxvY2F0aW9uID0ge2Nvb3JkczogbmV3IFBhcnNlLkdlb1BvaW50KCl9O1xuICByZXR1cm4ge1xuICAgIGxvY2F0aW9uOiBsb2NhdGlvbixcbiAgICBnZXRMb2NhdGlvbjogZ2V0TG9jYXRpb24sXG4gICAgc2V0TG9jYXRpb246IHNldExvY2F0aW9uXG4gIH1cbiAgXG4gIGZ1bmN0aW9uIHNldExvY2F0aW9uIChjb29yZHMpIHtcbiAgICBsb2NhdGlvbi5jb29yZHMgPSBuZXcgUGFyc2UuR2VvUG9pbnQoe2xhdGl0dWRlOiBjb29yZHMubGF0aXR1ZGUsIGxvbmdpdHVkZTogY29vcmRzLmxvbmdpdHVkZX0pXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMb2NhdGlvbiAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgcG9zT3B0aW9ucyA9IHtlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlfTtcbiAgICAkY29yZG92YUdlb2xvY2F0aW9uXG4gICAgICAuZ2V0Q3VycmVudFBvc2l0aW9uKHBvc09wdGlvbnMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgY2IucmVzb2x2ZShwb3NpdGlvbi5jb29yZHMpO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGNiLnJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTWF0Y2hTZXJ2aWNlcycsIFsnUGFyc2UnLCAnTWF0Y2gnLCAnJHEnLCBNYXRjaFNlcnZpY2VzXSlcbiAgLmZhY3RvcnkoJ01hdGNoJywgWydQYXJzZScsIE1hdGNoXSk7XG5cbmZ1bmN0aW9uIE1hdGNoU2VydmljZXMoUGFyc2UsIE1hdGNoLCAkcSkge1xuICB2YXIgdXNlciA9IFBhcnNlLlVzZXI7XG4gIHJldHVybiB7XG4gICAgZ2V0Q29uZmlybWVkTWF0Y2g6IGdldENvbmZpcm1lZE1hdGNoLFxuICAgIGdldFBlbmRpbmdNYXRjaDogZ2V0UGVuZGluZ01hdGNoLFxuICAgIGdldExhdGVzdE1hdGNoOiBnZXRMYXRlc3RNYXRjaCxcbiAgICBnZXRNYXRjaDogZ2V0TWF0Y2gsXG4gICAgZ2V0UGxheWVyTWF0Y2hlczogZ2V0UGxheWVyTWF0Y2hlcyxcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFBsYXllck1hdGNoZXMocGxheWVyLCBzdGF0dXMpIHtcbiAgICB2YXIgcGxheWVyMSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcGxheWVyMS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKTtcbiAgICB2YXIgcGxheWVyMiA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcGxheWVyMi5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKTtcbiAgICB2YXIgbWFpblF1ZXJ5ID0gUGFyc2UuUXVlcnkub3IocGxheWVyMSwgcGxheWVyMik7XG4gICAgbWFpblF1ZXJ5LmxpbWl0KDEwKTtcbiAgICBtYWluUXVlcnkuZXF1YWxUbygnc3RhdHVzJywgc3RhdHVzKTtcbiAgICByZXR1cm4gbWFpblF1ZXJ5LmZpbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldExhdGVzdE1hdGNoKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJylcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ3dpbm5lcicpO1xuICAgIHF1ZXJ5LmluY2x1ZGUoJ2xvc2VyJyk7XG4gICAgcXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKTtcbiAgICB9XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldENvbmZpcm1lZE1hdGNoIChwbGF5ZXIpIHtcbiAgICB2YXIgdHlwZSA9IHBsYXllci5nZXQoJ3BsYXllcicpO1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSgnTWF0Y2gnKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAnYWN0aXZlJyk7XG4gICAgcXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpXG4gICAgfVxuICAgIHF1ZXJ5LmVxdWFsVG8oJ2NvbmZpcm0xJywgdHJ1ZSk7XG4gICAgcXVlcnkuZXF1YWxUbygnY29uZmlybTInLCB0cnVlKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcblxuICAgIHJldHVybiBxdWVyeS5maW5kKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0UGVuZGluZ01hdGNoKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJylcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTWF0Y2guTW9kZWwpO1xuICAgIHF1ZXJ5LmRlc2NlbmRpbmcoXCJjcmVhdGVkQXRcIik7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgaWYodHlwZSA9PT0gJ3BsYXllcjEnKSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIxJywgcGxheWVyKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcik7XG4gICAgfVxuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdwZW5kaW5nJyk7XG4gICAgcXVlcnkubGltaXQoMSk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRNYXRjaChpZCkge1xuICAgIHZhciBtYXRjaCA9IG5ldyBNYXRjaC5Nb2RlbCgpO1xuICAgIG1hdGNoLmlkID0gaWQ7XG4gICAgcmV0dXJuIG1hdGNoLmZldGNoKCk7XG4gIH1cbn1cblxuZnVuY3Rpb24gTWF0Y2goUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTWF0Y2gnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbXG4gICAgJ3RvdXJuYW1lbnQnLCAncGxheWVyMScsICdwbGF5ZXIyJywgJ2hlcm8xJywgJ2hlcm8yJywgJ3VzZXJuYW1lMScsICd1c2VybmFtZTInLCAnYmF0dGxlVGFnMScsICdiYXR0bGVUYWcyJywgJ3N0YXR1cycsICd3aW5uZXInLCAnbG9zZXInLFxuICAgICd3aW5JbWFnZScsICdyZXBvcnRSZWFzb24nLCAncmVwb3J0SW1hZ2UnLCAnYWN0aXZlRGF0ZScsICd1c2VyMScsICd1c2VyMidcbiAgXTtcbiAgUGFyc2UuZGVmaW5lQXR0cmlidXRlcyhNb2RlbCwgYXR0cmlidXRlcyk7XG5cbiAgcmV0dXJuIHtcbiAgICBNb2RlbDogTW9kZWxcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdjYW1lcmFTZXJ2aWNlcycsIGNhbWVyYVNlcnZpY2VzKTtcblxuZnVuY3Rpb24gY2FtZXJhU2VydmljZXMgKCkge1xuICBcbiAgdmFyIGNhbWVyYSA9IHtcbiAgICBxdWFsaXR5OiA5MCxcbiAgICB0YXJnZXRXaWR0aDogMzIwLFxuICAgIHRhcmdldEhlaWdodDogNTAwLFxuICAgIGFsbG93RWRpdDogdHJ1ZSxcbiAgICBkZXN0aW5hdGlvblR5cGU6IENhbWVyYS5EZXN0aW5hdGlvblR5cGUuREFUQV9VUkwsXG4gICAgc291cmNlVHlwZTogMCxcbiAgICBlbmNvZGluZ1R5cGU6IENhbWVyYS5FbmNvZGluZ1R5cGUuSlBFR1xuICB9XG4gIFxuICByZXR1cm4ge1xuICAgIGNhbWVyYTogY2FtZXJhXG4gIH1cblxuICAvLyBmdW5jdGlvbiBnZXREYXRhVXJpICh1cmwsIGNhbGxiYWNrKSB7XG4gIC8vICAgdmFyIGltYWdlID0gbmV3IEltYWdlKCk7XG4gIC8vICAgaW1hZ2Uub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAvLyAgICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAvLyAgICAgY2FudmFzLndpZHRoID0gdGhpcy5uYXR1cmFsV2lkdGg7IC8vIG9yICd3aWR0aCcgaWYgeW91IHdhbnQgYSBzcGVjaWFsL3NjYWxlZCBzaXplXG4gIC8vICAgICBjYW52YXMuaGVpZ2h0ID0gdGhpcy5uYXR1cmFsSGVpZ2h0OyAvLyBvciAnaGVpZ2h0JyBpZiB5b3Ugd2FudCBhIHNwZWNpYWwvc2NhbGVkIHNpemVcbiAgLy9cbiAgLy8gICAgIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpLmRyYXdJbWFnZSh0aGlzLCAwLCAwKTtcbiAgLy9cbiAgLy8gICAgIC8vIEdldCByYXcgaW1hZ2UgZGF0YVxuICAvLyAgICAgY2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJykucmVwbGFjZSgvXmRhdGE6aW1hZ2VcXC8ocG5nfGpwZyk7YmFzZTY0LC8sICcnKSk7XG4gIC8vXG4gIC8vICAgICAvLyAuLi4gb3IgZ2V0IGFzIERhdGEgVVJJXG4gIC8vICAgICAvL2NhbGxiYWNrKGNhbnZhcy50b0RhdGFVUkwoJ2ltYWdlL3BuZycpKTtcbiAgLy8gICB9O1xuICAvLyAgIGltYWdlLnNyYyA9IHVybDtcbiAgLy8gfVxuXG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1F1ZXVlU2VydmljZXMnLCBRdWV1ZVNlcnZpY2VzKVxuXG5mdW5jdGlvbiBRdWV1ZVNlcnZpY2VzKCkge1xuICB2YXIgb3Bwb25lbnQgPSB7XG4gICAgbGlzdDogWydFYXN5IFBpY2tpbmdzJywgJ1lvdXIgV29yc3QgTmlnaHRtYXJlJywgJ1dvcmxkIGNsYXNzIHBhc3RlIGVhdGVyJyxcbiAgICAgICdBIE11cmxvYycsICdHb3VyZCBjcml0aWMnLCAnTm9zZSBhbmQgbW91dGggYnJlYXRoZXInLCAnSG9nZ2VyJywgJ0EgY2FyZGlzaCBJYW4nLFxuICAgICAgJ01vcGV5IE1hZ2UnLCAnV29tYmF0IFdhcmxvY2snLCAnUm91Z2VkIHVwIFJvZ3VlJywgJ1dhaWZpc2ggV2FycmlvcicsICdEYW1wIERydWlkJyxcbiAgICAgICdTaGFiYnkgU2hhbWFuJywgJ1Blbm5pbGVzcyBQYWxhZGluJywgJ0h1ZmZ5IEh1bnRlcicsICdQZXJreSBQcmllc3QnLCAnVGhlIFdvcnN0IFBsYXllcicsXG4gICAgICAnWW91ciBPbGQgUm9vbW1hdGUnLCAnU3RhckNyYWZ0IFBybycsICdGaXNjYWxseSByZXNwb25zaWJsZSBtaW1lJywgJ1lvdXIgR3VpbGQgTGVhZGVyJyxcbiAgICAgICdOb25lY2sgR2VvcmdlJywgJ0d1bSBQdXNoZXInLCAnQ2hlYXRlciBNY0NoZWF0ZXJzb24nLCAnUmVhbGx5IHNsb3cgZ3V5JywgJ1JvYWNoIEJveScsXG4gICAgICAnT3JhbmdlIFJoeW1lcicsICdDb2ZmZWUgQWRkaWN0JywgJ0lud2FyZCBUYWxrZXInLCAnQmxpenphcmQgRGV2ZWxvcGVyJywgJ0dyYW5kIE1hc3RlcicsXG4gICAgICAnRGlhbW9uZCBMZWFndWUgUGxheWVyJywgJ0JyYW5kIE5ldyBQbGF5ZXInLCAnRGFzdGFyZGx5IERlYXRoIEtuaWdodCcsICdNZWRpb2NyZSBNb25rJyxcbiAgICAgICdBIExpdHRsZSBQdXBweSdcbiAgICBdXG4gIH07XG4gIHZhciBoZXJvZXMgPSBbXG4gICAge3RleHQ6ICdtYWdlJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnaHVudGVyJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAncGFsYWRpbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcnJpb3InLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdkcnVpZCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3dhcmxvY2snLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdzaGFtYW4nLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwcmllc3QnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdyb2d1ZScsIGNoZWNrZWQ6IGZhbHNlfVxuICBdXG4gIHJldHVybiB7XG4gICAgb3Bwb25lbnQ6IG9wcG9uZW50LFxuICAgIGhlcm9lczogaGVyb2VzXG4gIH1cbn1cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnKVxuXG4gIC5zZXJ2aWNlKCdUb3VybmFtZW50U2VydmljZXMnLCBbJ1BhcnNlJywgJyRxJywgJ1RvdXJuYW1lbnQnLCAnRGV0YWlscycsICdMYWRkZXInLCBUb3VybmFtZW50U2VydmljZXNdKVxuICAuZmFjdG9yeSgnVG91cm5hbWVudCcsIFsnUGFyc2UnLCBUb3VybmFtZW50XSlcbiAgLmZhY3RvcnkoJ0RldGFpbHMnLCBbJ1BhcnNlJywgRGV0YWlsc10pO1xuXG5mdW5jdGlvbiBUb3VybmFtZW50U2VydmljZXMoUGFyc2UsICRxLCBUb3VybmFtZW50LCBEZXRhaWxzLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb3VybmFtZW50OiBnZXRUb3VybmFtZW50LFxuICAgIGNyZWF0ZVRvdXJuYW1lbnQ6IGNyZWF0ZVRvdXJuYW1lbnQsXG4gICAgZ2V0TGFkZGVyOiBnZXRMYWRkZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH1cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgcGxheWVyKSB7XG4gICAgdmFyIHBsYXllciA9IG5ldyBMYWRkZXIuTW9kZWwocGxheWVyKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VybmFtZScsIFBhcnNlLlVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICBwbGF5ZXIuc2V0KCdtbXInLCAxMDAwKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VG91cm5hbWVudCgpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoRGV0YWlscy5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndHlwZScsICdsYWRkZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd0b3VybmFtZW50Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb3VybmFtZW50ICgpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0b3VybmFtZW50ID0gbmV3IFRvdXJuYW1lbnQuTW9kZWwoKTtcbiAgICB0b3VybmFtZW50LnNldCgnbmFtZScsICdPTk9HIE9QRU4nKTtcbiAgICB0b3VybmFtZW50LnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICB0b3VybmFtZW50LnNldCgnZ2FtZScsICdoZWFydGhzdG9uZScpO1xuICAgIHRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuZXkpIHtcbiAgICAgIHZhciBkZXRhaWxzID0gbmV3IERldGFpbHMuTW9kZWwoKTtcbiAgICAgIGRldGFpbHMuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgICBkZXRhaWxzLnNldCgndHlwZScsICdsYWRkZXInKTtcbiAgICAgIGRldGFpbHMuc2V0KCdwbGF5ZXJDb3VudCcsIDApO1xuICAgICAgZGV0YWlscy5zZXQoJ251bU9mR2FtZXMnLCA1KTtcbiAgICAgIGRldGFpbHMuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgZGVmZXIucmVzb2x2ZShkZXRhaWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhZGRlciAodG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5pbmNsdWRlKCdwbGF5ZXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnQoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVG91cm5hbWVudCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnbmFtZScsICdnYW1lJywgJ3N0YXR1cycsICdkaXNhYmxlZCcsICdkaXNhYmxlZFJlYXNvbicsICdsb2NhdGlvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG5mdW5jdGlvbiBEZXRhaWxzKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0RldGFpbHMnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndHlwZScsICdudW1PZkdhbWVzJywgJ3BsYXllckNvdW50J107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
