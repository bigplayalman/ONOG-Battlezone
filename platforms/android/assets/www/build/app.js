
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

  $scope.tournament = tournament.tournament;
  var promise = null;
  $scope.user = Parse.User;
  $scope.end = {
    canPlay: true,
    time: parseFloat(moment().format('x'))
  }
  $scope.location = locationServices.location;
  $scope.opponent = QueueServices.opponent;
  $scope.heroList = QueueServices.heroes;
  $scope.myOpponent = {name:'PAX Attendee'};

  $rootScope.$on('opponent:found', playerConfirm);
  $rootScope.$on('opponent:confirmed', opponentConfirmed);

  $scope.$on("$ionicView.enter", function(event) {
    if(navigator && navigator.splashscreen) {
      navigator.splashscreen.hide();
    }
    console.log($scope.location);
    LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
      $scope.player = players[0];
      $scope.player.set('location', $scope.location.coords);
      $scope.player.save().then(function (player) {
        $scope.player = player;
        console.log($scope.player);
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
        status();
      });
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
  $scope.$on('destroy', function () {
    console.log('controller destroyed');
  });

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
    $timeout(function () {
      Parse.Cloud.run('matchmaking').then(function (res){
        console.log(res);
        console.log('matchmaking started');
      });
    }, 2000);
  }

  function playerConfirm() {
    
    $timeout (function () {
      MatchServices.getLatestMatch($scope.player).then(function (matches) {
        $scope.match = matches[0];
        console.log($scope.match.status);
        $scope.stop();
        if($scope.match.get('status') === 'pending') {
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
        
        if($scope.match.get('status') === 'cancelled') {
          $scope.player.set('status', 'open');
          savePlayer();
        }
      });
    }, 2000);
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
    $timeout(function () {
      MatchServices.getLatestMatch($scope.player).then(function (matches) {
        $scope.match = matches[0];
        if($scope.match.get('status'), 'active') {
          $state.go('app.match.view');
        }
      })
    }, 1000);
  }

  function waitingForOpponent () {
    Parse.Cloud.run('confirmMatch').then(function (num) {
      checkOpponent(5000, false);
      checkOpponent(30000, true);
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
  $scope.tournament = tournament.tournament;
  $scope.user = Parse.User;
  $scope.end = {
    time: 0
  };

  $rootScope.$on('results:entered', matchPlayed);

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
    })

  });

  function matchPlayed() {
    if($scope.player.get('status') !== 'open') {
      $scope.player.set('status', 'open');
      
      MatchServices.getLatestMatch($scope.player).then(function (matches) {
        $scope.match = matches[0];
        $scope.player.save().then(function (player) {
          $scope.player = player;
          getMatchDetails();
          showMatchResultsPopup();
        });
      });
      
    }
  }
  function showMatchResultsPopup() {
    var popup = $ionicPopup.alert({
      title: 'Match Played',
      template: '<div class="text-center">Results have been submitting for this match</div>'
    }).then(function(res) {
      
    });
  }

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
      console.log('match fetched');
      console.log($scope.match.get('winner'));
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
        $timeout(matchPlayed, 2000);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5jb25maWcuanMiLCJhcHAuY29udHJvbGxlcnMuanMiLCJhcHAuanMiLCJhcHAucm91dGVzLmpzIiwiYXBwLnJ1bi5qcyIsImFwcC5zZXJ2aWNlcy5qcyIsImNvbnRyb2xsZXJzL2FkbWluLm1hdGNoZXMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnBsYXllcnMuY3RybC5qcyIsImNvbnRyb2xsZXJzL2FkbWluLnNldHRpbmdzLmN0cmwuanMiLCJjb250cm9sbGVycy9kYXNoYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5qb2luLmN0cmwuanMiLCJjb250cm9sbGVycy9sYWRkZXIubGVhZGVyYm9hcmQuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xhZGRlci5wYXNzd29yZC5jdHJsLmpzIiwiY29udHJvbGxlcnMvbGFkZGVyLnByb2ZpbGUuY3RybC5qcyIsImNvbnRyb2xsZXJzL2xvZ2luLmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5saXN0LmN0cmwuanMiLCJjb250cm9sbGVycy9tYXRjaC5yZXBvcnQuY3RybC5qcyIsImNvbnRyb2xsZXJzL21hdGNoLnZpZXcuY3RybC5qcyIsImNvbnRyb2xsZXJzL21lbnUuY3RybC5qcyIsImNvbnRyb2xsZXJzL3JlZ2lzdGVyLmN0cmwuanMiLCJyb3V0ZXMvYWRtaW4ucm91dGVzLmpzIiwicm91dGVzL2xhZGRlci5yb3V0ZXMuanMiLCJyb3V0ZXMvbWF0Y2gucm91dGVzLmpzIiwic2VydmljZXMvbGFkZGVyLnNlcnZpY2VzLmpzIiwic2VydmljZXMvbG9jYXRpb24uc2VydmljZXMuanMiLCJzZXJ2aWNlcy9tYXRjaC5zZXJ2aWNlcy5qcyIsInNlcnZpY2VzL3Bob3RvLnNlcnZpY2VzLmpzIiwic2VydmljZXMvcXVldWUuc2VydmljZXMuanMiLCJzZXJ2aWNlcy90b3VybmFtZW50LnNlcnZpY2VzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7K0VBQUEsUUFBUSxPQUFPLGVBQWU7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dEIsSUFBSSxRQUFRLE1BQU0sT0FBTyxPQUFPO0VBQ2hDLElBQUksYUFBYSxDQUFDLGNBQWMsUUFBUSxjQUFjO0VBQ3RELE1BQU0saUJBQWlCLE9BQU87O0VBRTlCLE9BQU87SUFDTCxPQUFPOzs7QUFHWCIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJhbmd1bGFyLm1vZHVsZSgnT05PRy5jb25maWcnLCBbXSlcbiAgLmNvbmZpZyhjb25maWcpO1xuXG5mdW5jdGlvbiBjb25maWcgKCRpb25pY0NvbmZpZ1Byb3ZpZGVyLCAkY29tcGlsZVByb3ZpZGVyLCBQYXJzZVByb3ZpZGVyKSB7XG5cbiAgJGNvbXBpbGVQcm92aWRlci5pbWdTcmNTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8ZmlsZXxibG9ifGNvbnRlbnR8bXMtYXBweHx4LXdtYXBwMCk6fGRhdGE6aW1hZ2VcXC98aW1nXFwvLyk7XG4gICRjb21waWxlUHJvdmlkZXIuYUhyZWZTYW5pdGl6YXRpb25XaGl0ZWxpc3QoL15cXHMqKGh0dHBzP3xmdHB8bWFpbHRvfGZpbGV8Z2h0dHBzP3xtcy1hcHB4fHgtd21hcHAwKTovKTtcblxuICBQYXJzZVByb3ZpZGVyLmluaXRpYWxpemUoXCJuWXNCNnRtQk1ZS1lNek01aVY5QlVjQnZIV1g4OUl0UFg1R2ZiTjZRXCIsIFwienJpbjhHRUJEVkdia2wxaW9HRXduSHVQNzBGZEc2SGh6VFM4dUdqelwiKTtcblxuICBpZiAoaW9uaWMuUGxhdGZvcm0uaXNJT1MoKSkge1xuICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnNjcm9sbGluZy5qc1Njcm9sbGluZyh0cnVlKTtcbiAgfVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnLCBbXSk7XG5cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJywgW1xuICAnaW9uaWMnLFxuICAnbmdQYXJzZScsXG4gICd0aW1lcicsXG4gICduZ0NvcmRvdmEnLFxuICAnbmdBbmltYXRlJyxcbiAgJ09OT0cuY29uZmlnJyxcbiAgJ09OT0cucm91dGVzJyxcbiAgJ09OT0cuQ29udHJvbGxlcnMnLFxuICAnT05PRy5TZXJ2aWNlcydcbl0pO1xuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzJywgW1xuICAnT05PRy5yb3V0ZXMubWF0Y2hlcycsXG4gICdPTk9HLnJvdXRlcy5sYWRkZXInLFxuICAnT05PRy5yb3V0ZXMuYWRtaW4nXG5dKVxuICAuY29uZmlnKHJvdXRlcyk7XG5cbmZ1bmN0aW9uIHJvdXRlcyAoJHN0YXRlUHJvdmlkZXIsICR1cmxSb3V0ZXJQcm92aWRlcikge1xuXG4gICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJ2FwcC9sb2FkaW5nJyk7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcCcsIHtcbiAgICAgIHVybDogJy9hcHAnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tZW51Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01lbnVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgdG91cm5hbWVudDogZnVuY3Rpb24gKFRvdXJuYW1lbnRTZXJ2aWNlcywgJHEsIFBhcnNlLCAkc3RhdGUpIHtcbiAgICAgICAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgICAgICAgIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCkudGhlbihmdW5jdGlvbiAodG91cm5hbWVudHMpIHtcbiAgICAgICAgICAgIGlmKHRvdXJuYW1lbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICBjYi5yZXNvbHZlKHRvdXJuYW1lbnRzWzBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgaW9uaWMuUGxhdGZvcm0uZXhpdEFwcCgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2FkaW5nJywge1xuICAgICAgdXJsOiAnL2xvYWRpbmcnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xvYWRpbmcuaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuZGFzaGJvYXJkJywge1xuICAgICAgdXJsOiAnL2Rhc2hib2FyZCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZGFzaGJvYXJkLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdEYXNoYm9hcmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbG9naW4uaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAucmVnaXN0ZXInLCB7XG4gICAgICB1cmw6ICcvcmVnaXN0ZXInLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ21lbnVDb250ZW50Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3JlZ2lzdGVyLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLnJlc2V0Jywge1xuICAgICAgdXJsOiAnL3Bhc3N3b3JkJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wYXNzd29yZC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnUmVzZXRQYXNzd29yZEN0cmwnXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuXG5cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HJylcbiAgLmNvbnN0YW50KFwibW9tZW50XCIsIG1vbWVudClcbiAgLnJ1bihydW4pO1xuXG5mdW5jdGlvbiBydW4gKCRpb25pY1BsYXRmb3JtLCAkc3RhdGUsICRyb290U2NvcGUsICRpb25pY0xvYWRpbmcsICRpb25pY1BvcHVwLCBsb2NhdGlvblNlcnZpY2VzLCAkaW9uaWNIaXN0b3J5KSB7XG4gICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuICAgIGlmKHdpbmRvdy5jb3Jkb3ZhICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgIC8vIEhpZGUgdGhlIGFjY2Vzc29yeSBiYXIgYnkgZGVmYXVsdCAocmVtb3ZlIHRoaXMgdG8gc2hvdyB0aGUgYWNjZXNzb3J5IGJhciBhYm92ZSB0aGUga2V5Ym9hcmRcbiAgICAgIC8vIGZvciBmb3JtIGlucHV0cylcbiAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG5cbiAgICAgIC8vIERvbid0IHJlbW92ZSB0aGlzIGxpbmUgdW5sZXNzIHlvdSBrbm93IHdoYXQgeW91IGFyZSBkb2luZy4gSXQgc3RvcHMgdGhlIHZpZXdwb3J0XG4gICAgICAvLyBmcm9tIHNuYXBwaW5nIHdoZW4gdGV4dCBpbnB1dHMgYXJlIGZvY3VzZWQuIElvbmljIGhhbmRsZXMgdGhpcyBpbnRlcm5hbGx5IGZvclxuICAgICAgLy8gYSBtdWNoIG5pY2VyIGtleWJvYXJkIGV4cGVyaWVuY2UuXG4gICAgICBjb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQuZGlzYWJsZVNjcm9sbCh0cnVlKTtcbiAgICB9XG4gICAgaWYod2luZG93LlN0YXR1c0Jhcikge1xuICAgICAgU3RhdHVzQmFyLnN0eWxlRGVmYXVsdCgpO1xuICAgIH1cblxuICAgICRyb290U2NvcGUuJG9uKCdzaG93OmxvYWRpbmcnLCBmdW5jdGlvbigpIHtcbiAgICAgICRpb25pY0xvYWRpbmcuc2hvdyh7dGVtcGxhdGU6ICc8aW9uLXNwaW5uZXIgaWNvbj1cInNwaXJhbFwiIGNsYXNzPVwic3Bpbm5lci1jYWxtXCI+PC9pb24tc3Bpbm5lcj4nLCBzaG93QmFja2Ryb3A6IHRydWUsIGFuaW1hdGlvbjogJ2ZhZGUtaW4nfSk7XG4gICAgfSk7XG5cbiAgICAkcm9vdFNjb3BlLiRvbignaGlkZTpsb2FkaW5nJywgZnVuY3Rpb24oKSB7XG4gICAgICAkaW9uaWNMb2FkaW5nLmhpZGUoKTtcbiAgICB9KTtcblxuICAgIGlmKHdpbmRvdy5QYXJzZVB1c2hQbHVnaW4pIHtcbiAgICAgIGNvbnNvbGUubG9nKCduZXcgdmVyc2lvbiAxJyk7XG4gICAgICBQYXJzZVB1c2hQbHVnaW4ub24oJ3JlY2VpdmVQTicsIGZ1bmN0aW9uKHBuKXtcbiAgICAgICAgY29uc29sZS5sb2cocG4pO1xuICAgICAgICBpZighcG4udGl0bGUpIHtcbiAgICAgICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgICAgICB0aXRsZTogJ0Fubm91bmNlbWVudCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPicrIHBuLmFsZXJ0ICsgJzwvZGl2PidcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc3dpdGNoIChwbi50aXRsZSkge1xuICAgICAgICAgICAgY2FzZSAnT3Bwb25lbnQgRm91bmQnOlxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ29wcG9uZW50OmZvdW5kJyk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnT3Bwb25lbnQgQ29uZmlybWVkJzpcbiAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdvcHBvbmVudDpjb25maXJtZWQnKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdSZXN1bHRzIEVudGVyZWQnOlxuICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Jlc3VsdHM6ZW50ZXJlZCcpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGxvY2F0aW9uU2VydmljZXMuZ2V0TG9jYXRpb24oKS50aGVuKGZ1bmN0aW9uIChsb2NhdGlvbikge1xuICAgICAgbG9jYXRpb25TZXJ2aWNlcy5zZXRMb2NhdGlvbihsb2NhdGlvbik7XG4gICAgICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgICB9KTtcbiAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgIH0pO1xuXG4gIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cuU2VydmljZXMnLCBbXSk7XG5cbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdBZG1pbk1hdGNoZXNDdHJsJywgQWRtaW5NYXRjaGVzQ3RybCk7XG5cbmZ1bmN0aW9uIEFkbWluTWF0Y2hlc0N0cmwoJHNjb3BlLCBQYXJzZSkge1xuICBcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignQWRtaW5QbGF5ZXJzQ3RybCcsIEFkbWluUGxheWVyc0N0cmwpO1xuXG5mdW5jdGlvbiBBZG1pblBsYXllcnNDdHJsKCRzY29wZSwgUGFyc2UpIHtcbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0FkbWluU2V0dGluZ3NDdHJsJywgQWRtaW5TZXR0aW5nc0N0cmwpO1xuXG5mdW5jdGlvbiBBZG1pblNldHRpbmdzQ3RybCgkc2NvcGUsIGxvY2F0aW9uU2VydmljZXMsIG5ld1RvdXJuYW1lbnQsIHRvdXJuYW1lbnQpIHtcbiAgJHNjb3BlLmRldGFpbHMgPSBuZXdUb3VybmFtZW50O1xuICBcbiAgJHNjb3BlLnRvdXJuYW1lbnQgPSB0b3VybmFtZW50LnRvdXJuYW1lbnQ7XG4gIFxuICAkc2NvcGUuc2V0VG91cm5hbWVudExvY2F0aW9uID0gZnVuY3Rpb24gKCkge1xuICAgIGxvY2F0aW9uU2VydmljZXMuZ2V0TG9jYXRpb24oKS50aGVuKGZ1bmN0aW9uIChsb2NhdGlvbikge1xuICAgICAgdmFyIHBvaW50ID0gbmV3IFBhcnNlLkdlb1BvaW50KHtsYXRpdHVkZTogbG9jYXRpb24ubGF0aXR1ZGUsIGxvbmdpdHVkZTogbG9jYXRpb24ubG9uZ2l0dWRlfSk7XG4gICAgICAkc2NvcGUudG91cm5hbWVudC5zZXQoXCJsb2NhdGlvblwiLCBwb2ludCk7XG4gICAgICAkc2NvcGUudG91cm5hbWVudC5zYXZlKCkudGhlbihmdW5jdGlvbiAodG91cm5hbWVudCkge1xuICAgICAgICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQ7XG4gICAgICAgIGFsZXJ0KCd0b3Vybm1hbmV0IGxvY2F0aW9uIHNldCcpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgXG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0Rhc2hib2FyZEN0cmwnLCBEYXNoYm9hcmRDdHJsKTtcblxuZnVuY3Rpb24gRGFzaGJvYXJkQ3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRmaWx0ZXIsICR0aW1lb3V0LCAkaW50ZXJ2YWwsICRpb25pY1BvcHVwLCAkcm9vdFNjb3BlLFxuICBQYXJzZSwgdG91cm5hbWVudCwgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcywgTGFkZGVyU2VydmljZXMsIGxvY2F0aW9uU2VydmljZXNcbikge1xuXG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICB2YXIgcHJvbWlzZSA9IG51bGw7XG4gICRzY29wZS51c2VyID0gUGFyc2UuVXNlcjtcbiAgJHNjb3BlLmVuZCA9IHtcbiAgICBjYW5QbGF5OiB0cnVlLFxuICAgIHRpbWU6IHBhcnNlRmxvYXQobW9tZW50KCkuZm9ybWF0KCd4JykpXG4gIH1cbiAgJHNjb3BlLmxvY2F0aW9uID0gbG9jYXRpb25TZXJ2aWNlcy5sb2NhdGlvbjtcbiAgJHNjb3BlLm9wcG9uZW50ID0gUXVldWVTZXJ2aWNlcy5vcHBvbmVudDtcbiAgJHNjb3BlLmhlcm9MaXN0ID0gUXVldWVTZXJ2aWNlcy5oZXJvZXM7XG4gICRzY29wZS5teU9wcG9uZW50ID0ge25hbWU6J1BBWCBBdHRlbmRlZSd9O1xuXG4gICRyb290U2NvcGUuJG9uKCdvcHBvbmVudDpmb3VuZCcsIHBsYXllckNvbmZpcm0pO1xuICAkcm9vdFNjb3BlLiRvbignb3Bwb25lbnQ6Y29uZmlybWVkJywgb3Bwb25lbnRDb25maXJtZWQpO1xuXG4gICRzY29wZS4kb24oXCIkaW9uaWNWaWV3LmVudGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYobmF2aWdhdG9yICYmIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4pIHtcbiAgICAgIG5hdmlnYXRvci5zcGxhc2hzY3JlZW4uaGlkZSgpO1xuICAgIH1cbiAgICBjb25zb2xlLmxvZygkc2NvcGUubG9jYXRpb24pO1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcigkc2NvcGUudG91cm5hbWVudCwgJHNjb3BlLnVzZXIuY3VycmVudCgpKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICAkc2NvcGUucGxheWVyID0gcGxheWVyc1swXTtcbiAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdsb2NhdGlvbicsICRzY29wZS5sb2NhdGlvbi5jb29yZHMpO1xuICAgICAgJHNjb3BlLnBsYXllci5zYXZlKCkudGhlbihmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5wbGF5ZXIpO1xuICAgICAgICBpZih3aW5kb3cuUGFyc2VQdXNoUGx1Z2luKSB7XG4gICAgICAgICAgUGFyc2VQdXNoUGx1Z2luLnN1YnNjcmliZSgkc2NvcGUucGxheWVyLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdzdWJiZWQgdG8gJyArICRzY29wZS5wbGF5ZXIudXNlcm5hbWUpO1xuICAgICAgICAgIH0sIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIHVzZXJHZW9Qb2ludCA9ICRzY29wZS5wbGF5ZXIuZ2V0KFwibG9jYXRpb25cIik7XG4gICAgICAgIGlmKHVzZXJHZW9Qb2ludCkge1xuICAgICAgICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSgnVG91cm5hbWVudCcpO1xuICAgICAgICAgIHF1ZXJ5LndpdGhpbk1pbGVzKFwibG9jYXRpb25cIiwgdXNlckdlb1BvaW50LCA1MCk7XG4gICAgICAgICAgcXVlcnkubGltaXQoMTApO1xuICAgICAgICAgIHF1ZXJ5LmZpbmQoe1xuICAgICAgICAgICAgc3VjY2VzczogZnVuY3Rpb24ocGxhY2VzT2JqZWN0cykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhwbGFjZXNPYmplY3RzKTtcbiAgICAgICAgICAgICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbiAmJiBwbGFjZXNPYmplY3RzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIFBhcnNlUHVzaFBsdWdpbi5zdWJzY3JpYmUoJ3BheC1lYXN0JywgZnVuY3Rpb24obXNnKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncGF4ZWQnKTtcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZmFpbGVkIHRvIHN1YicpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RhdHVzKCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG5cbiAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgIGdldEN1cnJlbnRTdGF0dXModHJ1ZSk7XG4gIH07XG5cbiAgJHNjb3BlLnN0YXJ0UXVldWUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYoJHNjb3BlLmVuZC5jYW5QbGF5KSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICBzYXZlUGxheWVyKCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5jYW5jZWxRdWV1ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgIHNhdmVQbGF5ZXIoKTtcbiAgfTtcblxuICAkc2NvcGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuICAgICRpbnRlcnZhbC5jYW5jZWwocHJvbWlzZSk7XG4gIH07XG5cbiAgJHNjb3BlLnNob3dPcHBvbmVudHMgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc3RvcCgpO1xuICAgIHByb21pc2UgPSAkaW50ZXJ2YWwoZnVuY3Rpb24gKCkge2NoYW5nZVdvcmQoKX0sIDIwMDApO1xuICB9O1xuXG4gICRzY29wZS4kb24oJyRkZXN0cm95JywgZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnN0b3AoKTtcbiAgfSk7XG4gICRzY29wZS5maW5pc2hlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAkdGltZW91dCh0aW1lciwgMTUwMCk7XG4gIH1cbiAgJHNjb3BlLiRvbignZGVzdHJveScsIGZ1bmN0aW9uICgpIHtcbiAgICBjb25zb2xlLmxvZygnY29udHJvbGxlciBkZXN0cm95ZWQnKTtcbiAgfSk7XG5cbiAgZnVuY3Rpb24gbWF0Y2hUaW1lKCkge1xuICAgIGlmKCEkc2NvcGUubWF0Y2gpIHtcbiAgICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICBpZiAobWF0Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICAgIHRpbWVyKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aW1lcigpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHRpbWVyICgpIHtcbiAgICB2YXIgbm93ID0gbW9tZW50KCk7XG4gICAgdmFyIHRpbWUgPSAkc2NvcGUubWF0Y2guZ2V0KCdhY3RpdmVEYXRlJyk7XG4gICAgaWYodGltZSkge1xuICAgICAgdmFyIGZpdmVNaW51dGVzID0gbW9tZW50KHRpbWUpLmFkZCgxLCAnbWludXRlcycpO1xuICAgICAgJHNjb3BlLmVuZC50aW1lID0gcGFyc2VGbG9hdChmaXZlTWludXRlcy5mb3JtYXQoJ3gnKSk7XG4gICAgICAkc2NvcGUuZW5kLmNhblBsYXkgPSBub3cuaXNBZnRlcihmaXZlTWludXRlcywgJ3NlY29uZHMnKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzYXZlUGxheWVyICgpIHtcbiAgICAkc2NvcGUucGxheWVyLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICBzdGF0dXMoKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXR1cyAoKSB7XG4gICAgaWYoJHNjb3BlLnBsYXllcikge1xuICAgICAgc3dpdGNoICgkc2NvcGUucGxheWVyLmdldCgnc3RhdHVzJykpIHtcbiAgICAgICAgY2FzZSAnb3Blbic6XG4gICAgICAgICAgJHNjb3BlLnN0b3AoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAncXVldWUnOlxuICAgICAgICAgICRzY29wZS5zaG93T3Bwb25lbnRzKCk7XG4gICAgICAgICAgbWF0Y2hNYWtpbmcoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZm91bmQnOlxuICAgICAgICAgIHBsYXllckNvbmZpcm0oKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY29uZmlybWVkJzpcbiAgICAgICAgICB3YWl0aW5nRm9yT3Bwb25lbnQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnbm9PcHBvbmVudCc6XG4gICAgICAgICAgbm9PcHBvbmVudCgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdwbGF5aW5nJzpcbiAgICAgICAgICBnZXRMYXN0TWF0Y2goKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnY2FuY2VsbGVkJzpcbiAgICAgICAgICBwbGF5ZXJDYW5jZWxsZWQoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSk7XG4gICAgICBtYXRjaFRpbWUoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRDdXJyZW50U3RhdHVzKHJlZnJlc2gpIHtcbiAgICB2YXIgcmVmcmVzaCA9IHJlZnJlc2g7XG4gICAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlci5jdXJyZW50KCkpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgICAgaWYgKCRzY29wZS5wbGF5ZXIpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2N1cnJlbnRTdGF0dXMnKTtcbiAgICAgICAgc3RhdHVzKCk7XG4gICAgICAgIGlmKHJlZnJlc2gpIHtcbiAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0TGFzdE1hdGNoKCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnY29tcGxldGVkJykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbWF0Y2hNYWtpbmcoKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaG1ha2luZycpLnRoZW4oZnVuY3Rpb24gKHJlcyl7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgIGNvbnNvbGUubG9nKCdtYXRjaG1ha2luZyBzdGFydGVkJyk7XG4gICAgICB9KTtcbiAgICB9LCAyMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXllckNvbmZpcm0oKSB7XG4gICAgXG4gICAgJHRpbWVvdXQgKGZ1bmN0aW9uICgpIHtcbiAgICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUubWF0Y2guc3RhdHVzKTtcbiAgICAgICAgJHNjb3BlLnN0b3AoKTtcbiAgICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdwZW5kaW5nJykge1xuICAgICAgICAgIHZhciBjb25maXJtUG9wdXAgPSAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgICAgICAgIHRpdGxlOiAnTWF0Y2htYWtpbmcnLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXJcIj48c3Ryb25nPkEgV29ydGh5IE9wcG9uZW50PC9zdHJvbmc+PGJyPiBoYXMgYmVlbiBmb3VuZCE8L2Rpdj4nLFxuICAgICAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBdXG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICBjb25maXJtUG9wdXAudGhlbihmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZihyZXMpIHtcbiAgICAgICAgICAgICAgaWYgKCRzY29wZS5wbGF5ZXIucGxheWVyID09PSAncGxheWVyMScpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdjb25maXJtMScsIHRydWUpO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ2NvbmZpcm0yJywgdHJ1ZSk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ2NvbmZpcm1lZCcpO1xuICAgICAgICAgICAgICAgIHNhdmVQbGF5ZXIoKTtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzaG93RmFpbFBvcHVwKCk7XG4gICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgXG4gICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpID09PSAnZm91bmQnKSB7XG4gICAgICAgICAgICAgIGNvbmZpcm1Qb3B1cC5jbG9zZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDIwMDAwKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJykgPT09ICdjYW5jZWxsZWQnKSB7XG4gICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9LCAyMDAwKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dGYWlsUG9wdXAoKSB7XG4gICAgdmFyIGZhaWxQb3B1cCA9ICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgdGl0bGU6ICdNYXRjaG1ha2luZycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdSBGYWlsZWQgdG8gQ29uZmlybSBNYXRjaDwvZGl2PicsXG4gICAgICBidXR0b25zOiBbXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+Q2xvc2U8L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSk7XG5cbiAgICBmYWlsUG9wdXAudGhlbihmdW5jdGlvbiAocmVzKSB7XG5cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9wcG9uZW50Q29uZmlybWVkICgpIHtcbiAgICAkdGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgJHNjb3BlLm1hdGNoID0gbWF0Y2hlc1swXTtcbiAgICAgICAgaWYoJHNjb3BlLm1hdGNoLmdldCgnc3RhdHVzJyksICdhY3RpdmUnKSB7XG4gICAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0sIDEwMDApO1xuICB9XG5cbiAgZnVuY3Rpb24gd2FpdGluZ0Zvck9wcG9uZW50ICgpIHtcbiAgICBQYXJzZS5DbG91ZC5ydW4oJ2NvbmZpcm1NYXRjaCcpLnRoZW4oZnVuY3Rpb24gKG51bSkge1xuICAgICAgY2hlY2tPcHBvbmVudCg1MDAwLCBmYWxzZSk7XG4gICAgICBjaGVja09wcG9uZW50KDMwMDAwLCB0cnVlKTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrT3Bwb25lbnQgKHRpbWVvdXQsIGFscmVhZHlDaGVja2VkKSB7XG4gICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgaWYoJHNjb3BlLnBsYXllci5nZXQoJ3N0YXR1cycpID09PSAnY29uZmlybWVkJykge1xuICAgICAgICBNYXRjaFNlcnZpY2VzLmdldExhdGVzdE1hdGNoKCRzY29wZS5wbGF5ZXIpLnRoZW4oZnVuY3Rpb24gKG1hdGNoZXMpIHtcbiAgICAgICAgICAkc2NvcGUubWF0Y2ggPSBtYXRjaGVzWzBdO1xuXG4gICAgICAgICAgc3dpdGNoICgkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSkge1xuICAgICAgICAgICAgY2FzZSAncGVuZGluZyc6XG4gICAgICAgICAgICAgIGlmKGFscmVhZHlDaGVja2VkKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdub09wcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgc2F2ZVBsYXllcigpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYWN0aXZlJzpcbiAgICAgICAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdwbGF5aW5nJyk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnc2hvdzpsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gudmlldycpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgZnVuY3Rpb24gbm9PcHBvbmVudCAoKSB7XG4gICAgJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICB0aXRsZTogJ01hdGNoIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+PHN0cm9uZz5Zb3VyIE9wcG9uZW50PC9zdHJvbmc+PGJyPiBmYWlsZWQgdG8gY29uZmlybSE8L2Rpdj4nLFxuICAgICAgYnV0dG9uczogW1xuICAgICAgICB7XG4gICAgICAgICAgdGV4dDogJzxiPkJhY2s8L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLWFzc2VydGl2ZScsXG4gICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICB0ZXh0OiAnPGI+UXVldWUgQWdhaW48L2I+JyxcbiAgICAgICAgICB0eXBlOiAnYnV0dG9uLXBvc2l0aXZlJyxcbiAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICBdXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGlmKHJlcykge1xuICAgICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ3F1ZXVlJyk7XG4gICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3N0YXR1cycsICdjYW5jZWxsZWQnKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci5zZXQoJ3N0YXR1cycsICdvcGVuJyk7XG4gICAgICAgICRzY29wZS5tYXRjaC5zZXQoJ3N0YXR1cycsICdjYW5jZWxsZWQnKTtcbiAgICAgICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzYXZlUGxheWVyKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gY2hhbmdlV29yZCAoKSB7XG4gICAgJHNjb3BlLm15T3Bwb25lbnQubmFtZSA9ICRzY29wZS5vcHBvbmVudC5saXN0W01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSokc2NvcGUub3Bwb25lbnQubGlzdC5sZW5ndGgpXTtcbiAgfTtcbn07XG4vLyBmdW5jdGlvbiBqb2luUXVldWVQb3B1cCAoKSB7XG4vLyAgIHN1YigpO1xuLy8gICAkc2NvcGUuc2VsZWN0ZWQgPSB7c3RhdHVzOiB0cnVlfTtcbi8vICAgJHNjb3BlLnNlbGVjdEhlcm8gPSBmdW5jdGlvbiAoaGVybykge1xuLy8gICAgICRzY29wZS5pbWFnZSA9IGFuZ3VsYXIuZWxlbWVudChkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuaGVyb0NsYXNzJykpWzBdLmNsaWVudFdpZHRoO1xuLy9cbi8vICAgICBpZihoZXJvLmNoZWNrZWQpIHtcbi8vICAgICAgIGhlcm8uY2hlY2tlZCA9ICFoZXJvLmNoZWNrZWQ7XG4vLyAgICAgICAkc2NvcGUuc2VsZWN0ZWQuc3RhdHVzID0gdHJ1ZTtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vL1xuLy8gICAgIGlmKCFoZXJvLmNoZWNrZWQgJiYgJHNjb3BlLnNlbGVjdGVkLnN0YXR1cykge1xuLy8gICAgICAgaGVyby5jaGVja2VkID0gIWhlcm8uY2hlY2tlZDtcbi8vICAgICAgICRzY29wZS5zZWxlY3RlZC5zdGF0dXMgPSBmYWxzZTtcbi8vICAgICAgIHJldHVybjtcbi8vICAgICB9XG4vLyAgIH07XG4vLyAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuLy8gICAgIHtcbi8vICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3BvcHVwcy9zZWxlY3QuaGVyby5odG1sJyxcbi8vICAgICAgIHRpdGxlOiAnU2VsZWN0IEhlcm8gQ2xhc3MnLFxuLy8gICAgICAgc2NvcGU6ICRzY29wZSxcbi8vICAgICAgIGJ1dHRvbnM6IFtcbi8vICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4vLyAgICAgICAgIHsgdGV4dDogJzxiPlF1ZXVlPC9iPicsXG4vLyAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4vLyAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbi8vICAgICAgICAgICAgIHZhciBoZXJvID0gJGZpbHRlcignZmlsdGVyJykoJHNjb3BlLmhlcm9MaXN0LCB7Y2hlY2tlZDogdHJ1ZX0sIHRydWUpO1xuLy8gICAgICAgICAgICAgaWYgKCFoZXJvLmxlbmd0aCkge1xuLy8gICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4vLyAgICAgICAgICAgICB9IGVsc2Uge1xuLy8gICAgICAgICAgICAgICByZXR1cm4gaGVyb1swXTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICB9XG4vLyAgICAgICAgIH1cbi8vICAgICAgIF1cbi8vICAgICB9KTtcbi8vIH07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTGFkZGVySm9pbkN0cmwnLCBMYWRkZXJKb2luQ3RybCk7XG5cbmZ1bmN0aW9uIExhZGRlckpvaW5DdHJsKFxuICAkc2NvcGUsICRmaWx0ZXIsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksICRxLCBQYXJzZSwgIHRvdXJuYW1lbnQsIExhZGRlclNlcnZpY2VzXG4pIHtcbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcbiAgJHNjb3BlLnBsYXllciA9IHtcbiAgICBiYXR0bGVUYWc6ICcnXG4gIH07XG5cbiAgJHNjb3BlLnJlZ2lzdGVyUGxheWVyID0gZnVuY3Rpb24gKCkge1xuICAgIHZhbGlkYXRlQmF0dGxlVGFnKCkudGhlbihcbiAgICAgIGZ1bmN0aW9uICh0YWcpIHtcbiAgICAgICAgJHNjb3BlLnBsYXllci51c2VybmFtZSA9ICRzY29wZS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAkc2NvcGUucGxheWVyLnN0YXR1cyA9ICdvcGVuJztcbiAgICAgICAgTGFkZGVyU2VydmljZXMuam9pblRvdXJuYW1lbnQoJHNjb3BlLnRvdXJuYW1lbnQsICRzY29wZS51c2VyLCAkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgICBTdWNjZXNzUG9wdXAocGxheWVyKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICBFcnJvclBvcHVwKGVycm9yKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlQmF0dGxlVGFnICgpIHtcbiAgICB2YXIgY2IgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0YWcgPSAkc2NvcGUucGxheWVyLmJhdHRsZVRhZztcblxuICAgIGlmKHRhZy5sZW5ndGggPCA4KSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBiYXR0bGUgdGFnJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgdmFyIHNwbGl0ID0gdGFnLnNwbGl0KCcjJyk7XG4gICAgaWYoc3BsaXQubGVuZ3RoICE9PSAyKSB7XG4gICAgICBjYi5yZWplY3QoJ0VudGVyIHlvdXIgZnVsbCBCQVRUTEVUQUfihKIgaW5jbHVkaW5nICMgYW5kIGZvdXIgZGlnaXRzJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoc3BsaXRbMV0ubGVuZ3RoIDwgMiB8fCBzcGxpdFsxXS5sZW5ndGggPiA0KSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIHVwIHRvIGZvdXIgZGlnaXRzIGFmdGVyICMhJyk7XG4gICAgICByZXR1cm4gY2IucHJvbWlzZTtcbiAgICB9XG4gICAgaWYoaXNOYU4oc3BsaXRbMV0pKSB7XG4gICAgICBjYi5yZWplY3QoJ1lvdXIgQkFUVExFVEFH4oSiIG11c3QgaW5jbHVkaW5nIGZvdXIgZGlnaXRzIGFmdGVyICMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBMYWRkZXJTZXJ2aWNlcy52YWxpZGF0ZVBsYXllcigkc2NvcGUudG91cm5hbWVudC50b3VybmFtZW50LCB0YWcpLnRoZW4oZnVuY3Rpb24gKHJlc3VsdHMpIHtcbiAgICAgIGlmKHJlc3VsdHMubGVuZ3RoKSB7XG4gICAgICAgIGNiLnJlamVjdCgnVGhlIEJBVFRMRVRBR+KEoiB5b3UgZW50ZXJlZCBpcyBhbHJlYWR5IHJlZ2lzdGVyZWQuJylcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNiLnJlc29sdmUodGFnKTtcbiAgICAgIH0gXG4gICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH07XG5cbiAgZnVuY3Rpb24gRXJyb3JQb3B1cCAobWVzc2FnZSkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ1JlZ2lzdHJhdGlvbiBFcnJvcicsXG4gICAgICB0ZW1wbGF0ZTogbWVzc2FnZVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIFN1Y2Nlc3NQb3B1cCAocGxheWVyKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnQ29uZ3JhdHVsYXRpb25zICcgKyBwbGF5ZXIudXNlcm5hbWUgKyAnIScsXG4gICAgICB0ZW1wbGF0ZTogJ1lvdSBoYXZlIHN1Y2Nlc3NmdWxseSBzaWduZWQgdXAhIE5vdyBnbyBmaW5kIGEgdmFsaWFudCBvcHBvbmVudC4nXG4gICAgfSk7XG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xlYWRlckJvYXJkc0N0cmwnLCBMZWFkZXJCb2FyZHNDdHJsKTtcblxuZnVuY3Rpb24gTGVhZGVyQm9hcmRzQ3RybCgkc2NvcGUsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50LCBQYXJzZSwgJGZpbHRlciwgJGlvbmljUG9wdXApIHtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICBnZXRQbGF5ZXJzKCk7XG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbiAoKSB7XG4gICAgZ2V0UGxheWVycygpO1xuICB9XG4gIFxuICBmdW5jdGlvbiBnZXRQbGF5ZXJzKCkge1xuICAgIExhZGRlclNlcnZpY2VzLmdldFBsYXllcnModG91cm5hbWVudC50b3VybmFtZW50KS50aGVuKGZ1bmN0aW9uIChwbGF5ZXJzKSB7XG4gICAgICB2YXIgcmFuayA9IDE7XG4gICAgICBhbmd1bGFyLmZvckVhY2gocGxheWVycywgZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICBwbGF5ZXIucmFuayA9IHJhbms7XG4gICAgICAgIHJhbmsrKztcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLnBsYXllcnMgPSBwbGF5ZXJzO1xuICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICB9KTtcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdSZXNldFBhc3N3b3JkQ3RybCcsIFJlc2V0UGFzc3dvcmRDdHJsKTtcblxuZnVuY3Rpb24gUmVzZXRQYXNzd29yZEN0cmxcbigkc2NvcGUsICRpb25pY1BvcHVwLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlKSB7XG5cbiAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gIH0pO1xuICAkc2NvcGUuZW1haWwgPSB7fTtcbiAgXG4gICRzY29wZS5yZXNldFBhc3N3b3JkID0gZnVuY3Rpb24gKGVtYWlsKSB7XG4gICAgUGFyc2UuVXNlci5yZXF1ZXN0UGFzc3dvcmRSZXNldChlbWFpbC50ZXh0LCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgU3VjY2Vzc1BvcHVwKCk7XG4gICAgICB9LFxuICAgICAgZXJyb3I6IGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIGVycm9yIG1lc3NhZ2Ugc29tZXdoZXJlXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnVXBkYXRlIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gU3VjY2Vzc1BvcHVwIChwbGF5ZXIpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdQYXNzd29yZCBSZXNldCcsXG4gICAgICB0ZW1wbGF0ZTogJ0FuIEVtYWlsIGhhcyBiZWVuIHNlbnQgdG8gcmVzZXQgeW91ciBwYXNzd29yZCdcbiAgICB9KS50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgIH0pXG4gIH07XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ0xhZGRlclByb2ZpbGVDdHJsJywgTGFkZGVyUHJvZmlsZUN0cmwpO1xuXG5mdW5jdGlvbiBMYWRkZXJQcm9maWxlQ3RybChcbiAgJHNjb3BlLCAkZmlsdGVyLCAkaW9uaWNQb3B1cCwgJHN0YXRlLCAkaW9uaWNIaXN0b3J5LCAkcSwgUGFyc2UsICB0b3VybmFtZW50LCBMYWRkZXJTZXJ2aWNlcywgcGxheWVyXG4pIHtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG4gICRzY29wZS50b3VybmFtZW50ID0gdG91cm5hbWVudC50b3VybmFtZW50O1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuICAkc2NvcGUucGxheWVyID0gcGxheWVyWzBdO1xuXG4gICRzY29wZS5yZWdpc3RlclBsYXllciA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YWxpZGF0ZUJhdHRsZVRhZygpLnRoZW4oXG4gICAgICBmdW5jdGlvbiAodGFnKSB7XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgIFN1Y2Nlc3NQb3B1cChwbGF5ZXIpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9LFxuICAgICAgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IpO1xuICAgICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGVCYXR0bGVUYWcgKCkge1xuICAgIHZhciBjYiA9ICRxLmRlZmVyKCk7XG4gICAgdmFyIHRhZyA9ICRzY29wZS5wbGF5ZXIuYmF0dGxlVGFnO1xuXG4gICAgaWYodGFnLmxlbmd0aCA8IDgpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIGJhdHRsZSB0YWcnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICB2YXIgc3BsaXQgPSB0YWcuc3BsaXQoJyMnKTtcbiAgICBpZihzcGxpdC5sZW5ndGggIT09IDIpIHtcbiAgICAgIGNiLnJlamVjdCgnRW50ZXIgeW91ciBmdWxsIEJBVFRMRVRBR+KEoiBpbmNsdWRpbmcgIyBhbmQgZm91ciBkaWdpdHMnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihzcGxpdFsxXS5sZW5ndGggPCAyIHx8IHNwbGl0WzFdLmxlbmd0aCA+IDQpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgdXAgdG8gZm91ciBkaWdpdHMgYWZ0ZXIgIyEnKTtcbiAgICAgIHJldHVybiBjYi5wcm9taXNlO1xuICAgIH1cbiAgICBpZihpc05hTihzcGxpdFsxXSkpIHtcbiAgICAgIGNiLnJlamVjdCgnWW91ciBCQVRUTEVUQUfihKIgbXVzdCBpbmNsdWRpbmcgZm91ciBkaWdpdHMgYWZ0ZXIgIycpO1xuICAgICAgcmV0dXJuIGNiLnByb21pc2U7XG4gICAgfVxuICAgIExhZGRlclNlcnZpY2VzLnZhbGlkYXRlUGxheWVyKCRzY29wZS50b3VybmFtZW50LnRvdXJuYW1lbnQsIHRhZykudGhlbihmdW5jdGlvbiAocmVzdWx0cykge1xuICAgICAgaWYocmVzdWx0cy5sZW5ndGgpIHtcbiAgICAgICAgY2IucmVqZWN0KCdUaGUgQkFUVExFVEFH4oSiIHlvdSBlbnRlcmVkIGlzIGFscmVhZHkgcmVnaXN0ZXJlZC4nKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2IucmVzb2x2ZSh0YWcpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBjYi5wcm9taXNlO1xuICB9O1xuXG4gIGZ1bmN0aW9uIEVycm9yUG9wdXAgKG1lc3NhZ2UpIHtcbiAgICByZXR1cm4gJGlvbmljUG9wdXAuYWxlcnQoe1xuICAgICAgdGl0bGU6ICdVcGRhdGUgRXJyb3InLFxuICAgICAgdGVtcGxhdGU6IG1lc3NhZ2VcbiAgICB9KTtcbiAgfTtcblxuICBmdW5jdGlvbiBTdWNjZXNzUG9wdXAgKHBsYXllcikge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICB0aXRsZTogJ0NvbmdyYXR1bGF0aW9ucyAnICsgcGxheWVyLnVzZXJuYW1lICsgJyEnLFxuICAgICAgdGVtcGxhdGU6ICdZb3UgaGF2ZSBzdWNjZXNzZnVsbHkgdXBkYXRlZCEgTm93IGdvIGFuZCBwbGF5ISdcbiAgICB9KTtcbiAgfTtcbn07XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignTG9naW5DdHJsJywgTG9naW5DdHJsKTtcblxuZnVuY3Rpb24gTG9naW5DdHJsKCRzY29wZSwgJHN0YXRlLCBQYXJzZSwgJGlvbmljSGlzdG9yeSkge1xuICAkc2NvcGUudXNlciA9IHt9O1xuICBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuICAkc2NvcGUubG9naW5Vc2VyID0gZnVuY3Rpb24gKCkge1xuICAgIFBhcnNlLlVzZXIubG9nSW4oJHNjb3BlLnVzZXIudXNlcm5hbWUsICRzY29wZS51c2VyLnBhc3N3b3JkLCB7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgICRzdGF0ZS5nbygnYXBwLmRhc2hib2FyZCcpO1xuICAgICAgfSxcbiAgICAgIGVycm9yOiBmdW5jdGlvbiAodXNlciwgZXJyb3IpIHtcbiAgICAgICAgJHNjb3BlLndhcm5pbmcgPSBlcnJvci5tZXNzYWdlO1xuICAgICAgfVxuICAgIH0pO1xuICB9O1xuICAkc2NvcGUuJHdhdGNoKCd1c2VyJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuICAgICRzY29wZS53YXJuaW5nID0gbnVsbDtcbiAgfSwgdHJ1ZSk7XG59O1xuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG5cbiAgLmNvbnRyb2xsZXIoJ01hdGNoTGlzdEN0cmwnLCBNYXRjaExpc3RDdHJsKTtcblxuZnVuY3Rpb24gTWF0Y2hMaXN0Q3RybChcbiAgJHNjb3BlLCAkc3RhdGUsICRpb25pY1BvcHVwLCAkcm9vdFNjb3BlLCBQYXJzZSwgTWF0Y2hTZXJ2aWNlcywgcGxheWVyXG4pIHtcbiAgJHNjb3BlLm1hdGNoZXMgPSBbXTtcbiAgJHNjb3BlLnBsYXllciA9IHBsYXllclswXTtcblxuICBpZigkc2NvcGUucGxheWVyKSB7XG4gICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdzaG93OmxvYWRpbmcnKTtcbiAgICBNYXRjaFNlcnZpY2VzLmdldFBsYXllck1hdGNoZXMoJHNjb3BlLnBsYXllciwgbnVsbCkudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoZXMgZmV0Y2hlZCcpO1xuICAgICAgJHNjb3BlLm1hdGNoZXMgPSBtYXRjaGVzO1xuICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRQbGF5ZXJNYXRjaGVzKCRzY29wZS5wbGF5ZXIsICdyZXBvcnRlZCcpLnRoZW4oZnVuY3Rpb24gKHJlcG9ydGVkKSB7XG4gICAgICAgICRzY29wZS5yZXBvcnRlZCA9IHJlcG9ydGVkO1xuICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hpZGU6bG9hZGluZycpO1xuICAgICAgfSk7XG4gICAgfSk7XG5cbiAgfVxuXG4gICRzY29wZS5wcm9jZXNzTWF0Y2ggPSBmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICBpZihtYXRjaC53aW5uZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYobWF0Y2gubG9zZXIuaWQgPT09ICRzY29wZS5wbGF5ZXIuaWQpIHtcbiAgICAgIGlmKG1hdGNoLnJlcG9ydFJlYXNvbil7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoJHNjb3BlLnJlcG9ydGVkLmxlbmd0aCkge1xuICAgICAgc2hvd1JlcG9ydGVkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmKG1hdGNoLnN0YXR1cyAhPT0gJ2NvbXBsZXRlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgJHN0YXRlLmdvKCdhcHAubWF0Y2gucmVwb3J0Jywge2lkOiBtYXRjaC5pZH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd1JlcG9ydGVkKCkge1xuICAgICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnVG9vIE1hbnkgUmVwb3J0cycsXG4gICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPllvdSBoYXZlIHRvbyBtYW55IHBlbmRpbmcgcmVwb3J0cy4gUGxlYXNlIHdhaXQuPC9kaXY+J1xuICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuXG4gICAgfSlcbiAgfVxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFJlcG9ydEN0cmwnLCBNYXRjaFJlcG9ydEN0cmwpO1xuXG5mdW5jdGlvbiBNYXRjaFJlcG9ydEN0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCwgJGlvbmljSGlzdG9yeSxcbiAgUGFyc2UsIE1hdGNoU2VydmljZXMsIGNhbWVyYVNlcnZpY2VzLCByZXBvcnRcbikge1xuXG4gICRzY29wZS5tYXRjaCA9IHJlcG9ydDtcblxuICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG5cbiAgdmFyIHBhcnNlRmlsZSA9IG5ldyBQYXJzZS5GaWxlKCk7XG4gIHZhciBpbWdTdHJpbmcgPSBudWxsO1xuXG4gICRzY29wZS5nZXRQaWN0dXJlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9wdGlvbnMgPSBjYW1lcmFTZXJ2aWNlcy5jYW1lcmE7XG4gICAgbmF2aWdhdG9yLmNhbWVyYS5nZXRQaWN0dXJlKG9uU3VjY2VzcyxvbkZhaWwsb3B0aW9ucyk7XG4gIH1cbiAgdmFyIG9uU3VjY2VzcyA9IGZ1bmN0aW9uKGltYWdlRGF0YSkge1xuICAgICRzY29wZS5waWN0dXJlID0gJ2RhdGE6aW1hZ2UvcG5nO2Jhc2U2NCwnICsgaW1hZ2VEYXRhO1xuICAgIGltZ1N0cmluZyA9IGltYWdlRGF0YTtcbiAgICAkc2NvcGUuJGFwcGx5KCk7XG4gIH07XG4gIHZhciBvbkZhaWwgPSBmdW5jdGlvbihlKSB7XG4gICAgY29uc29sZS5sb2coXCJPbiBmYWlsIFwiICsgZSk7XG4gIH1cblxuICAkc2NvcGUucHJvY2Vzc1JlcG9ydCA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgaWYoaW1nU3RyaW5nKSB7XG4gICAgICBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZShcInJlcG9ydC5wbmdcIiwge2Jhc2U2NDppbWdTdHJpbmd9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyc2VGaWxlID0gbnVsbDtcbiAgICB9XG4gICAgJHNjb3BlLm1hdGNoLnNldChcInJlcG9ydEltYWdlXCIsIHBhcnNlRmlsZSk7XG4gICAgJHNjb3BlLm1hdGNoLnNldCgnc3RhdHVzJywgJ3JlcG9ydGVkJyk7XG4gICAgJHNjb3BlLm1hdGNoLnNhdmUoKS50aGVuKGZ1bmN0aW9uIChtYXRjaCkge1xuICAgICAgJGlvbmljSGlzdG9yeS5uZXh0Vmlld09wdGlvbnMoe1xuICAgICAgICBkaXNhYmxlQmFjazogdHJ1ZVxuICAgICAgfSk7XG4gICAgICAkaW9uaWNQb3B1cC5hbGVydCh7XG4gICAgICAgIHRpdGxlOiAnTWF0Y2ggUmVwb3J0ZWQnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJ0ZXh0LWNlbnRlclwiPlRoYW5rIHlvdSBmb3Igc3VibWl0dGluZyB0aGUgcmVwb3J0LjwvZGl2PidcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuXG4gIH1cblxufTtcbiIsIlxuYW5ndWxhci5tb2R1bGUoJ09OT0cuQ29udHJvbGxlcnMnKVxuXG4gIC5jb250cm9sbGVyKCdNYXRjaFZpZXdDdHJsJywgTWF0Y2hWaWV3Q3RybCk7XG5cbmZ1bmN0aW9uIE1hdGNoVmlld0N0cmwoXG4gICRzY29wZSwgJHN0YXRlLCAkcm9vdFNjb3BlLCAkaW9uaWNQb3B1cCwgJGlvbmljSGlzdG9yeSwgJHRpbWVvdXQsXG4gIFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgTWF0Y2hTZXJ2aWNlcywgUXVldWVTZXJ2aWNlcywgY2FtZXJhU2VydmljZXMsIHRvdXJuYW1lbnRcbikge1xuICAkc2NvcGUudG91cm5hbWVudCA9IHRvdXJuYW1lbnQudG91cm5hbWVudDtcbiAgJHNjb3BlLnVzZXIgPSBQYXJzZS5Vc2VyO1xuICAkc2NvcGUuZW5kID0ge1xuICAgIHRpbWU6IDBcbiAgfTtcblxuICAkcm9vdFNjb3BlLiRvbigncmVzdWx0czplbnRlcmVkJywgbWF0Y2hQbGF5ZWQpO1xuXG4gICRzY29wZS4kb24oXCIkaW9uaWNWaWV3LmVudGVyXCIsIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgTGFkZGVyU2VydmljZXMuZ2V0UGxheWVyKCRzY29wZS50b3VybmFtZW50LCAkc2NvcGUudXNlci5jdXJyZW50KCkpLnRoZW4oZnVuY3Rpb24gKHBsYXllcnMpIHtcbiAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXJzWzBdO1xuICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgIGlmKCRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpID09PSAnY2FuY2VsbGVkJykge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2V0KCdzdGF0dXMnLCAnb3BlbicpO1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdhcHAuZGFzaGJvYXJkJyk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZ2V0TWF0Y2hEZXRhaWxzKCk7XG4gICAgICB9KTtcbiAgICB9KVxuXG4gIH0pO1xuXG4gIGZ1bmN0aW9uIG1hdGNoUGxheWVkKCkge1xuICAgIGlmKCRzY29wZS5wbGF5ZXIuZ2V0KCdzdGF0dXMnKSAhPT0gJ29wZW4nKSB7XG4gICAgICAkc2NvcGUucGxheWVyLnNldCgnc3RhdHVzJywgJ29wZW4nKTtcbiAgICAgIFxuICAgICAgTWF0Y2hTZXJ2aWNlcy5nZXRMYXRlc3RNYXRjaCgkc2NvcGUucGxheWVyKS50aGVuKGZ1bmN0aW9uIChtYXRjaGVzKSB7XG4gICAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICAgICRzY29wZS5wbGF5ZXIuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAgICRzY29wZS5wbGF5ZXIgPSBwbGF5ZXI7XG4gICAgICAgICAgZ2V0TWF0Y2hEZXRhaWxzKCk7XG4gICAgICAgICAgc2hvd01hdGNoUmVzdWx0c1BvcHVwKCk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBcbiAgICB9XG4gIH1cbiAgZnVuY3Rpb24gc2hvd01hdGNoUmVzdWx0c1BvcHVwKCkge1xuICAgIHZhciBwb3B1cCA9ICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnTWF0Y2ggUGxheWVkJyxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInRleHQtY2VudGVyXCI+UmVzdWx0cyBoYXZlIGJlZW4gc3VibWl0dGluZyBmb3IgdGhpcyBtYXRjaDwvZGl2PidcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgXG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG4gIHZhciBwYXJzZUZpbGUgPSBuZXcgUGFyc2UuRmlsZSgpO1xuICB2YXIgaW1nU3RyaW5nID0gbnVsbDtcblxuICAkaW9uaWNIaXN0b3J5Lm5leHRWaWV3T3B0aW9ucyh7XG4gICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgfSk7XG5cbiAgJHNjb3BlLmdldFBpY3R1cmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgb3B0aW9ucyA9IGNhbWVyYVNlcnZpY2VzLmNhbWVyYTtcbiAgICBuYXZpZ2F0b3IuY2FtZXJhLmdldFBpY3R1cmUob25TdWNjZXNzLG9uRmFpbCxvcHRpb25zKTtcbiAgfVxuICB2YXIgb25TdWNjZXNzID0gZnVuY3Rpb24oaW1hZ2VEYXRhKSB7XG4gICAgJHNjb3BlLnBpY3R1cmUgPSAnZGF0YTppbWFnZS9wbmc7YmFzZTY0LCcgKyBpbWFnZURhdGE7XG4gICAgaW1nU3RyaW5nID0gaW1hZ2VEYXRhO1xuICAgICRzY29wZS4kYXBwbHkoKTtcbiAgfTtcbiAgdmFyIG9uRmFpbCA9IGZ1bmN0aW9uKGUpIHtcbiAgICBjb25zb2xlLmxvZyhcIk9uIGZhaWwgXCIgKyBlKTtcbiAgfVxuXG4gICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbigpIHtcbiAgICBnZXRNYXRjaCh0cnVlKTtcbiAgfTtcblxuICAkc2NvcGUucmVjb3JkID0gZnVuY3Rpb24gKHJlY29yZCkge1xuICAgIE1hdGNoU2VydmljZXMuZ2V0TGF0ZXN0TWF0Y2goJHNjb3BlLnBsYXllcikudGhlbihmdW5jdGlvbiAobWF0Y2hlcykge1xuICAgICAgdmFyIHVzZXJuYW1lID0gbnVsbDtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoZXNbMF07XG4gICAgICBpZigkc2NvcGUubWF0Y2guZ2V0KCdzdGF0dXMnKSA9PT0gJ2FjdGl2ZScpIHtcbiAgICAgICAgc3dpdGNoIChyZWNvcmQpIHtcbiAgICAgICAgICBjYXNlICd3aW4nOlxuICAgICAgICAgICAgd2luTWF0Y2goKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICBpZihyZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCd3aW5uZXInLCAkc2NvcGUucGxheWVyKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCdsb3NlcicsICRzY29wZS5vcHBvbmVudC51c2VyKTtcbiAgICAgICAgICAgICAgICB1c2VybmFtZSA9ICRzY29wZS5vcHBvbmVudC51c2VybmFtZVxuICAgICAgICAgICAgICAgIHJlY29yZE1hdGNoKCRzY29wZS5tYXRjaCwgdXNlcm5hbWUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSAnbG9zcyc6XG4gICAgICAgICAgICBsb3NlTWF0Y2goKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICAgICAgICBpZihyZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubWF0Y2guc2V0KCd3aW5uZXInLCAkc2NvcGUub3Bwb25lbnQudXNlcik7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm1hdGNoLnNldCgnbG9zZXInLCAkc2NvcGUucGxheWVyKTtcbiAgICAgICAgICAgICAgICB1c2VybmFtZSA9ICRzY29wZS5vcHBvbmVudC51c2VybmFtZTtcbiAgICAgICAgICAgICAgICByZWNvcmRNYXRjaCgkc2NvcGUubWF0Y2gsIHVzZXJuYW1lKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGZ1bmN0aW9uIHdpbk1hdGNoICgpIHtcbiAgICAkc2NvcGUucGljdHVyZSA9IG51bGw7XG4gICAgJHNjb3BlLmVycm9yTWVzc2FnZSA9IG51bGw7XG5cbiAgICByZXR1cm4gJGlvbmljUG9wdXAuc2hvdyhcbiAgICAgIHtcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcG9wdXBzL3dpbi5tYXRjaC5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQgYSBXaW4nLFxuICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgeyB0ZXh0OiAnQ2FuY2VsJ30sXG4gICAgICAgICAgeyB0ZXh0OiAnPGI+Q29uZmlybTwvYj4nLFxuICAgICAgICAgICAgdHlwZTogJ2J1dHRvbi1wb3NpdGl2ZScsXG4gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgICBpZiAoISRzY29wZS5waWN0dXJlKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yTWVzc2FnZSA9ICdVcGxvYWQgYSBTY3JlZW5zaG90JztcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIF1cbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9zZU1hdGNoKCkge1xuICAgIHJldHVybiAkaW9uaWNQb3B1cC5zaG93KFxuICAgICAge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wb3B1cHMvbG9zZS5tYXRjaC5odG1sJyxcbiAgICAgICAgdGl0bGU6ICdSZXBvcnQgYSBMb3NzJyxcbiAgICAgICAgc2NvcGU6ICRzY29wZSxcbiAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgIHsgdGV4dDogJ0NhbmNlbCd9LFxuICAgICAgICAgIHsgdGV4dDogJzxiPkNvbmZpcm08L2I+JyxcbiAgICAgICAgICAgIHR5cGU6ICdidXR0b24tcG9zaXRpdmUnLFxuICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICBdXG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGdldE1hdGNoKHJlZnJlc2gpIHtcbiAgICBNYXRjaFNlcnZpY2VzLmdldE1hdGNoKCRzY29wZS5tYXRjaC5pZCkudGhlbihmdW5jdGlvbiAobWF0Y2gpIHtcbiAgICAgICRzY29wZS5tYXRjaCA9IG1hdGNoO1xuICAgICAgY29uc29sZS5sb2coJ21hdGNoJyArICRzY29wZS5tYXRjaC5nZXQoJ3N0YXR1cycpKTtcbiAgICAgIGNvbnNvbGUubG9nKCdtYXRjaCBmZXRjaGVkJyk7XG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUubWF0Y2guZ2V0KCd3aW5uZXInKSk7XG4gICAgICBpZihyZWZyZXNoKSB7XG4gICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGZ1bmN0aW9uIHJlY29yZE1hdGNoKG1hdGNoLCB1c2VybmFtZSkge1xuXG4gICAgbWF0Y2guc2V0KCdzdGF0dXMnLCAnY29tcGxldGVkJyk7XG4gICAgbWF0Y2guc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKG1hdGNoKSB7XG4gICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ3Nob3c6bG9hZGluZycpO1xuICAgICAgUGFyc2UuQ2xvdWQucnVuKCdtYXRjaFJlc3VsdHMnLCB7dXNlcm5hbWU6IHVzZXJuYW1lLCBtYXRjaDogbWF0Y2guaWR9KS50aGVuKGZ1bmN0aW9uIChyZXN1bHRzKSB7XG4gICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdCgnaGlkZTpsb2FkaW5nJyk7XG4gICAgICAgICR0aW1lb3V0KG1hdGNoUGxheWVkLCAyMDAwKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TWF0Y2hEZXRhaWxzKCkge1xuICAgICRzY29wZS5vcHBvbmVudCA9IHtcbiAgICAgIGhlcm86IG51bGwsXG4gICAgICBiYXR0bGVUYWc6IG51bGxcbiAgICB9XG4gICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIxJykge1xuICAgICAgJHNjb3BlLm9wcG9uZW50Lmhlcm8gPSAkc2NvcGUubWF0Y2guaGVybzI7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWUgPSAkc2NvcGUubWF0Y2gudXNlcm5hbWUyO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LmJhdHRsZVRhZyA9ICRzY29wZS5tYXRjaC5iYXR0bGVUYWcyO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXIgPSAkc2NvcGUubWF0Y2gucGxheWVyMjtcbiAgICB9XG4gICAgaWYoJHNjb3BlLnBsYXllci5wbGF5ZXIgPT09ICdwbGF5ZXIyJykge1xuICAgICAgJHNjb3BlLm9wcG9uZW50Lmhlcm8gPSAkc2NvcGUubWF0Y2guaGVybzE7XG4gICAgICAkc2NvcGUub3Bwb25lbnQudXNlcm5hbWUgPSAkc2NvcGUubWF0Y2gudXNlcm5hbWUxO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LmJhdHRsZVRhZyA9ICRzY29wZS5tYXRjaC5iYXR0bGVUYWcxO1xuICAgICAgJHNjb3BlLm9wcG9uZW50LnVzZXIgPSAkc2NvcGUubWF0Y2gucGxheWVyMTtcbiAgICB9XG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5Db250cm9sbGVycycpXG4gIC5jb250cm9sbGVyKCdNZW51Q3RybCcsIE1lbnVDdHJsKTtcblxuZnVuY3Rpb24gTWVudUN0cmwoJHNjb3BlLCAkaW9uaWNQb3BvdmVyLCAkc3RhdGUsICRpb25pY0hpc3RvcnksIFBhcnNlLCAkdGltZW91dCkge1xuICAkc2NvcGUudXNlciA9IFBhcnNlLlVzZXI7XG5cbiAgJGlvbmljUG9wb3Zlci5mcm9tVGVtcGxhdGVVcmwoJ3RlbXBsYXRlcy9wb3BvdmVycy9wcm9maWxlLnBvcC5odG1sJywge1xuICAgIHNjb3BlOiAkc2NvcGUsXG4gIH0pLnRoZW4oZnVuY3Rpb24ocG9wb3Zlcikge1xuICAgICRzY29wZS5wb3BvdmVyID0gcG9wb3ZlcjtcbiAgfSk7XG5cbiAgJHNjb3BlLm1lbnUgPSBmdW5jdGlvbiAobGluaykge1xuICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgIGRpc2FibGVCYWNrOiB0cnVlXG4gICAgfSk7XG4gICAgaWYobGluayA9PT0gJ2xvZ2luJykge1xuICAgICAgaWYod2luZG93LlBhcnNlUHVzaFBsdWdpbikge1xuICAgICAgICBQYXJzZVB1c2hQbHVnaW4udW5zdWJzY3JpYmUoJHNjb3BlLnVzZXIuY3VycmVudCgpLnVzZXJuYW1lLCBmdW5jdGlvbihtc2cpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygndW5zdWJiZWQnKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdmYWlsZWQgdG8gc3ViJyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICBQYXJzZS5Vc2VyLmxvZ091dCgpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAkc3RhdGUuZ28oJ2FwcC4nICsgbGluaywge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICB9KTtcbiAgICAgIH0sIDEwMDApO1xuICAgICAgXG4gICAgICBcbiAgICB9IGVsc2Uge1xuICAgICAgJHN0YXRlLmdvKCdhcHAuJyArIGxpbmssIHtyZWxvYWQ6IHRydWV9KTtcbiAgICB9XG4gICAgJHNjb3BlLnBvcG92ZXIuaGlkZSgpO1xuICB9XG4gIC8vQ2xlYW51cCB0aGUgcG9wb3ZlciB3aGVuIHdlJ3JlIGRvbmUgd2l0aCBpdCFcbiAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wb3Zlci5yZW1vdmUoKTtcbiAgfSk7XG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLkNvbnRyb2xsZXJzJylcblxuICAuY29udHJvbGxlcignUmVnaXN0ZXJDdHJsJywgUmVnaXN0ZXJDdHJsKTtcblxuUmVnaXN0ZXJDdHJsLiRpbmplY3QgPSBbJyRzY29wZScsICckc3RhdGUnLCAnUGFyc2UnLCAnJGlvbmljUG9wdXAnXTtcbmZ1bmN0aW9uIFJlZ2lzdGVyQ3RybCgkc2NvcGUsICRzdGF0ZSwgUGFyc2UsICRpb25pY1BvcHVwKSB7XG5cbiAgJHNjb3BlLnVzZXIgPSB7fTtcblxuICAkc2NvcGUuUmVnaXN0ZXJVc2VyID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICB2YXIgcmVnaXN0ZXIgPSBuZXcgUGFyc2UuVXNlcigpO1xuICAgIHJlZ2lzdGVyLnNldCh1c2VyKTtcbiAgICByZWdpc3Rlci5zaWduVXAobnVsbCwge1xuICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAkc3RhdGUuZ28oJ2FwcC5kYXNoYm9hcmQnKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgLy8gU2hvdyB0aGUgZXJyb3IgbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgICAgIEVycm9yUG9wdXAoZXJyb3IubWVzc2FnZSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG4gICRzY29wZS4kd2F0Y2goJ3VzZXInLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgJHNjb3BlLndhcm5pbmcgPSBudWxsO1xuICB9LCB0cnVlKTtcblxuICBmdW5jdGlvbiBFcnJvclBvcHVwIChtZXNzYWdlKSB7XG4gICAgcmV0dXJuICRpb25pY1BvcHVwLmFsZXJ0KHtcbiAgICAgIHRpdGxlOiAnUmVnaXN0cmF0aW9uIEVycm9yJyxcbiAgICAgIHRlbXBsYXRlOiBtZXNzYWdlXG4gICAgfSk7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLnJvdXRlcy5hZG1pbicsIFtdKVxuICAuY29uZmlnKEFkbWluUm91dGVzKTtcblxuZnVuY3Rpb24gQWRtaW5Sb3V0ZXMgKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FwcC5hZG1pbicsIHtcbiAgICAgIHVybDogJy9hZG1pbicsXG4gICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdtZW51Q29udGVudCc6IHtcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9hZG1pbi9hZG1pbi5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4uc2V0dGluZ3MnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZ3MnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWRtaW4vYWRtaW4uc2V0dGluZ3MuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5TZXR0aW5nc0N0cmwnLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0b3VybmV5OiBmdW5jdGlvbiAoVG91cm5hbWVudFNlcnZpY2VzKSB7XG4gICAgICAgICAgcmV0dXJuIFRvdXJuYW1lbnRTZXJ2aWNlcy5nZXRUb3VybmFtZW50KCk7XG4gICAgICAgIH0sXG4gICAgICAgIG5ld1RvdXJuYW1lbnQ6IGZ1bmN0aW9uIChUb3VybmFtZW50U2VydmljZXMsIHRvdXJuZXkpIHtcbiAgICAgICAgICBpZih0b3VybmV5Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIHRvdXJuZXlbMF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBUb3VybmFtZW50U2VydmljZXMuY3JlYXRlVG91cm5hbWVudCgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAuYWRtaW4ubWF0Y2hlcycsIHtcbiAgICAgIHVybDogJy9tYXRjaGVzJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2FkbWluL2FkbWluLm1hdGNoZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5NYXRjaGVzQ3RybCdcbiAgICB9KVxufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLmxhZGRlcicsIFtdKVxuICAuY29uZmlnKExhZGRlclJvdXRlcyk7XG5cbmZ1bmN0aW9uIExhZGRlclJvdXRlcyAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlcicsIHtcbiAgICAgIHVybDogJy9sYWRkZXInLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2xhZGRlci5odG1sJyxcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubGFkZGVyLmxlYWRlcmJvYXJkJywge1xuICAgICAgdXJsOiAnL2xlYWRlcmJvYXJkcycsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sYWRkZXIvbGVhZGVyYm9hcmQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGVhZGVyQm9hcmRzQ3RybCdcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLmxhZGRlci5qb2luJywge1xuICAgICAgdXJsOiAnL2pvaW4nLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbGFkZGVyL2pvaW4uaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTGFkZGVySm9pbkN0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5sYWRkZXIucHJvZmlsZScsIHtcbiAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2xhZGRlci9wcm9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0xhZGRlclByb2ZpbGVDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcGxheWVyOiBmdW5jdGlvbiAoUGFyc2UsIExhZGRlclNlcnZpY2VzLCB0b3VybmFtZW50KSB7XG4gICAgICAgICAgcmV0dXJuIExhZGRlclNlcnZpY2VzLmdldFBsYXllcih0b3VybmFtZW50LnRvdXJuYW1lbnQsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xufVxuIiwiYW5ndWxhci5tb2R1bGUoJ09OT0cucm91dGVzLm1hdGNoZXMnLCBbXSlcbiAgLmNvbmZpZyhNYXRjaFJvdXRlcyk7XG5cbmZ1bmN0aW9uIE1hdGNoUm91dGVzICgkc3RhdGVQcm92aWRlcikge1xuXG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gnLCB7XG4gICAgICB1cmw6ICcvbWF0Y2gnLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICB2aWV3czoge1xuICAgICAgICAnbWVudUNvbnRlbnQnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvbWF0Y2gvbWF0Y2guaHRtbCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcHAubWF0Y2gubGlzdCcsIHtcbiAgICAgIHVybDogJy92aWV3JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL21hdGNoL21hdGNoLmxpc3QuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hMaXN0Q3RybCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIHBsYXllcjogZnVuY3Rpb24gKFBhcnNlLCBMYWRkZXJTZXJ2aWNlcywgdG91cm5hbWVudCkge1xuICAgICAgICAgIHJldHVybiBMYWRkZXJTZXJ2aWNlcy5nZXRQbGF5ZXIodG91cm5hbWVudC50b3VybmFtZW50LCBQYXJzZS5Vc2VyLmN1cnJlbnQoKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwLm1hdGNoLnZpZXcnLCB7XG4gICAgICB1cmw6ICcvdmlldycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC52aWV3Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ01hdGNoVmlld0N0cmwnXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcC5tYXRjaC5yZXBvcnQnLCB7XG4gICAgICB1cmw6ICcvcmVwb3J0LzppZCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9tYXRjaC9tYXRjaC5yZXBvcnQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnTWF0Y2hSZXBvcnRDdHJsJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgcmVwb3J0OiBmdW5jdGlvbiAoTWF0Y2hTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgICAgcmV0dXJuIE1hdGNoU2VydmljZXMuZ2V0TWF0Y2goJHN0YXRlUGFyYW1zLmlkKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG59XG4iLCJcbmFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTGFkZGVyU2VydmljZXMnLCBMYWRkZXJTZXJ2aWNlcylcbiAgLmZhY3RvcnkoJ0xhZGRlcicsIExhZGRlcilcblxuZnVuY3Rpb24gTGFkZGVyU2VydmljZXMoUGFyc2UsIExhZGRlcikge1xuICByZXR1cm4ge1xuICAgIGdldFBsYXllcnM6IGdldFBsYXllcnMsXG4gICAgZ2V0UGxheWVyOiBnZXRQbGF5ZXIsXG4gICAgdmFsaWRhdGVQbGF5ZXI6IHZhbGlkYXRlUGxheWVyLFxuICAgIGpvaW5Ub3VybmFtZW50OiBqb2luVG91cm5hbWVudCxcbiAgICBnZXRQZW5kaW5nUGxheWVyczogZ2V0UGVuZGluZ1BsYXllcnNcbiAgfTtcblxuICBmdW5jdGlvbiBnZXRQZW5kaW5nUGxheWVycyh0b3VybmFtZW50LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5Lm5vdEVxdWFsVE8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdzdGF0dXMnLCAncXVldWUnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcnModG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKCdwb2ludHMnLCAnbW1yJyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfTtcblxuICBmdW5jdGlvbiB2YWxpZGF0ZVBsYXllcih0b3VybmV5LCBiYXR0bGVUYWcpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoTGFkZGVyLk1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcXVlcnkuZXF1YWxUbygnYmF0dGxlVGFnJywgYmF0dGxlVGFnKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9O1xuXG4gIGZ1bmN0aW9uIGdldFBsYXllcih0b3VybmV5LCB1c2VyKSB7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KExhZGRlci5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndG91cm5hbWVudCcsIHRvdXJuZXkpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3VzZXInLCB1c2VyKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgdXNlciwgdXNlckRhdGEpIHtcbiAgICB2YXIgcGxheWVyID0gbmV3IExhZGRlci5Nb2RlbCgpO1xuICAgIHBsYXllci5zZXQoJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VyJywgdXNlcik7XG4gICAgcGxheWVyLnNldCh1c2VyRGF0YSk7XG4gICAgcGxheWVyLnNldCgnd2lucycsIDApO1xuICAgIHBsYXllci5zZXQoJ2xvc3NlcycsIDApO1xuICAgIHBsYXllci5zZXQoJ3BvaW50cycsIDApO1xuICAgIHJldHVybiBwbGF5ZXIuc2F2ZSgpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBMYWRkZXIoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnTGFkZGVyJyk7XG4gIHZhciBhdHRyaWJ1dGVzID0gWyd0b3VybmFtZW50JywgJ3VzZXInLCAnYmF0dGxlVGFnJywgJ3VzZXJuYW1lJywgJ2xvY2F0aW9uJyxcbiAgICAnaGVybycsICdwbGF5ZXInLCAnc3RhdHVzJywgJ2NhbmNlbFRpbWVyJywgJ3dpbnMnLCAnbG9zc2VzJywgJ21tcicsICdwb2ludHMnLCAnYmFuUmVhc29uJywgJ2FkbWluJ107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn07XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ2xvY2F0aW9uU2VydmljZXMnLCBsb2NhdGlvblNlcnZpY2VzKTtcblxuZnVuY3Rpb24gbG9jYXRpb25TZXJ2aWNlcyAoUGFyc2UsICRjb3Jkb3ZhR2VvbG9jYXRpb24sICRxLCAkcm9vdFNjb3BlKSB7XG5cbiAgdmFyIGxvY2F0aW9uID0ge2Nvb3JkczogbmV3IFBhcnNlLkdlb1BvaW50KCl9O1xuICByZXR1cm4ge1xuICAgIGxvY2F0aW9uOiBsb2NhdGlvbixcbiAgICBnZXRMb2NhdGlvbjogZ2V0TG9jYXRpb24sXG4gICAgc2V0TG9jYXRpb246IHNldExvY2F0aW9uXG4gIH1cbiAgXG4gIGZ1bmN0aW9uIHNldExvY2F0aW9uIChjb29yZHMpIHtcbiAgICBsb2NhdGlvbi5jb29yZHMgPSBuZXcgUGFyc2UuR2VvUG9pbnQoe2xhdGl0dWRlOiBjb29yZHMubGF0aXR1ZGUsIGxvbmdpdHVkZTogY29vcmRzLmxvbmdpdHVkZX0pXG4gIH1cblxuICBmdW5jdGlvbiBnZXRMb2NhdGlvbiAoKSB7XG4gICAgdmFyIGNiID0gJHEuZGVmZXIoKTtcbiAgICB2YXIgcG9zT3B0aW9ucyA9IHtlbmFibGVIaWdoQWNjdXJhY3k6IGZhbHNlfTtcbiAgICAkY29yZG92YUdlb2xvY2F0aW9uXG4gICAgICAuZ2V0Q3VycmVudFBvc2l0aW9uKHBvc09wdGlvbnMpXG4gICAgICAudGhlbihmdW5jdGlvbiAocG9zaXRpb24pIHtcbiAgICAgICAgY2IucmVzb2x2ZShwb3NpdGlvbi5jb29yZHMpO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGNiLnJlamVjdChlcnIpO1xuICAgICAgfSk7XG4gICAgcmV0dXJuIGNiLnByb21pc2U7XG4gIH1cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnTWF0Y2hTZXJ2aWNlcycsIE1hdGNoU2VydmljZXMpXG4gIC5mYWN0b3J5KCdNYXRjaCcsIE1hdGNoKTtcblxuZnVuY3Rpb24gTWF0Y2hTZXJ2aWNlcyhQYXJzZSwgTWF0Y2gsICRxKSB7XG4gIHZhciB1c2VyID0gUGFyc2UuVXNlcjtcbiAgcmV0dXJuIHtcbiAgICBnZXRDb25maXJtZWRNYXRjaDogZ2V0Q29uZmlybWVkTWF0Y2gsXG4gICAgZ2V0UGVuZGluZ01hdGNoOiBnZXRQZW5kaW5nTWF0Y2gsXG4gICAgZ2V0TGF0ZXN0TWF0Y2g6IGdldExhdGVzdE1hdGNoLFxuICAgIGdldE1hdGNoOiBnZXRNYXRjaCxcbiAgICBnZXRQbGF5ZXJNYXRjaGVzOiBnZXRQbGF5ZXJNYXRjaGVzLFxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0UGxheWVyTWF0Y2hlcyhwbGF5ZXIsIHN0YXR1cykge1xuICAgIHZhciBwbGF5ZXIxID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBwbGF5ZXIxLmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIHZhciBwbGF5ZXIyID0gbmV3IFBhcnNlLlF1ZXJ5KE1hdGNoLk1vZGVsKTtcbiAgICBwbGF5ZXIyLmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIHZhciBtYWluUXVlcnkgPSBQYXJzZS5RdWVyeS5vcihwbGF5ZXIxLCBwbGF5ZXIyKTtcbiAgICBtYWluUXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBtYWluUXVlcnkubGltaXQoMTApO1xuICAgIGlmKHN0YXR1cykge1xuICAgICAgbWFpblF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsIHN0YXR1cyk7XG4gICAgfVxuICAgIHJldHVybiBtYWluUXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0TGF0ZXN0TWF0Y2gocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKVxuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuaW5jbHVkZSgnd2lubmVyJyk7XG4gICAgcXVlcnkuaW5jbHVkZSgnbG9zZXInKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjInLCBwbGF5ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG5cbiAgZnVuY3Rpb24gZ2V0Q29uZmlybWVkTWF0Y2ggKHBsYXllcikge1xuICAgIHZhciB0eXBlID0gcGxheWVyLmdldCgncGxheWVyJyk7XG4gICAgdmFyIHF1ZXJ5ID0gbmV3IFBhcnNlLlF1ZXJ5KCdNYXRjaCcpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3N0YXR1cycsICdhY3RpdmUnKTtcbiAgICBxdWVyeS5kZXNjZW5kaW5nKFwiY3JlYXRlZEF0XCIpO1xuICAgIGlmKHR5cGUgPT09ICdwbGF5ZXIxJykge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMScsIHBsYXllcilcbiAgICB9IGVsc2Uge1xuICAgICAgcXVlcnkuZXF1YWxUbygncGxheWVyMicsIHBsYXllcilcbiAgICB9XG4gICAgcXVlcnkuZXF1YWxUbygnY29uZmlybTEnLCB0cnVlKTtcbiAgICBxdWVyeS5lcXVhbFRvKCdjb25maXJtMicsIHRydWUpO1xuICAgIHF1ZXJ5LmxpbWl0KDEpO1xuXG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBnZXRQZW5kaW5nTWF0Y2gocGxheWVyKSB7XG4gICAgdmFyIHR5cGUgPSBwbGF5ZXIuZ2V0KCdwbGF5ZXInKVxuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShNYXRjaC5Nb2RlbCk7XG4gICAgcXVlcnkuZGVzY2VuZGluZyhcImNyZWF0ZWRBdFwiKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICBpZih0eXBlID09PSAncGxheWVyMScpIHtcbiAgICAgIHF1ZXJ5LmVxdWFsVG8oJ3BsYXllcjEnLCBwbGF5ZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBxdWVyeS5lcXVhbFRvKCdwbGF5ZXIyJywgcGxheWVyKTtcbiAgICB9XG4gICAgcXVlcnkuZXF1YWxUbygnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICBxdWVyeS5saW1pdCgxKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG4gIGZ1bmN0aW9uIGdldE1hdGNoKGlkKSB7XG4gICAgdmFyIG1hdGNoID0gbmV3IE1hdGNoLk1vZGVsKCk7XG4gICAgbWF0Y2guaWQgPSBpZDtcbiAgICByZXR1cm4gbWF0Y2guZmV0Y2goKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBNYXRjaChQYXJzZSkge1xuICB2YXIgTW9kZWwgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdNYXRjaCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFtcbiAgICAndG91cm5hbWVudCcsICdwbGF5ZXIxJywgJ3BsYXllcjInLCAnaGVybzEnLCAnaGVybzInLCAndXNlcm5hbWUxJywgJ3VzZXJuYW1lMicsICdiYXR0bGVUYWcxJywgJ2JhdHRsZVRhZzInLCAnc3RhdHVzJywgJ3dpbm5lcicsICdsb3NlcicsXG4gICAgJ3dpbkltYWdlJywgJ3JlcG9ydFJlYXNvbicsICdyZXBvcnRJbWFnZScsICdhY3RpdmVEYXRlJywgJ3VzZXIxJywgJ3VzZXIyJ1xuICBdO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG4iLCJhbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ2NhbWVyYVNlcnZpY2VzJywgY2FtZXJhU2VydmljZXMpO1xuXG5mdW5jdGlvbiBjYW1lcmFTZXJ2aWNlcyAoKSB7XG4gIFxuICB2YXIgY2FtZXJhID0ge1xuICAgIHF1YWxpdHk6IDkwLFxuICAgIHRhcmdldFdpZHRoOiAzMjAsXG4gICAgdGFyZ2V0SGVpZ2h0OiA1MDAsXG4gICAgYWxsb3dFZGl0OiB0cnVlLFxuICAgIGRlc3RpbmF0aW9uVHlwZTogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5EQVRBX1VSTCxcbiAgICBzb3VyY2VUeXBlOiAwLFxuICAgIGVuY29kaW5nVHlwZTogQ2FtZXJhLkVuY29kaW5nVHlwZS5KUEVHXG4gIH1cbiAgXG4gIHJldHVybiB7XG4gICAgY2FtZXJhOiBjYW1lcmFcbiAgfVxuXG4gIC8vIGZ1bmN0aW9uIGdldERhdGFVcmkgKHVybCwgY2FsbGJhY2spIHtcbiAgLy8gICB2YXIgaW1hZ2UgPSBuZXcgSW1hZ2UoKTtcbiAgLy8gICBpbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gIC8vICAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gIC8vICAgICBjYW52YXMud2lkdGggPSB0aGlzLm5hdHVyYWxXaWR0aDsgLy8gb3IgJ3dpZHRoJyBpZiB5b3Ugd2FudCBhIHNwZWNpYWwvc2NhbGVkIHNpemVcbiAgLy8gICAgIGNhbnZhcy5oZWlnaHQgPSB0aGlzLm5hdHVyYWxIZWlnaHQ7IC8vIG9yICdoZWlnaHQnIGlmIHlvdSB3YW50IGEgc3BlY2lhbC9zY2FsZWQgc2l6ZVxuICAvL1xuICAvLyAgICAgY2FudmFzLmdldENvbnRleHQoJzJkJykuZHJhd0ltYWdlKHRoaXMsIDAsIDApO1xuICAvL1xuICAvLyAgICAgLy8gR2V0IHJhdyBpbWFnZSBkYXRhXG4gIC8vICAgICBjYWxsYmFjayhjYW52YXMudG9EYXRhVVJMKCdpbWFnZS9wbmcnKS5yZXBsYWNlKC9eZGF0YTppbWFnZVxcLyhwbmd8anBnKTtiYXNlNjQsLywgJycpKTtcbiAgLy9cbiAgLy8gICAgIC8vIC4uLiBvciBnZXQgYXMgRGF0YSBVUklcbiAgLy8gICAgIC8vY2FsbGJhY2soY2FudmFzLnRvRGF0YVVSTCgnaW1hZ2UvcG5nJykpO1xuICAvLyAgIH07XG4gIC8vICAgaW1hZ2Uuc3JjID0gdXJsO1xuICAvLyB9XG5cbn1cbiIsImFuZ3VsYXIubW9kdWxlKCdPTk9HLlNlcnZpY2VzJylcblxuICAuc2VydmljZSgnUXVldWVTZXJ2aWNlcycsIFF1ZXVlU2VydmljZXMpXG5cbmZ1bmN0aW9uIFF1ZXVlU2VydmljZXMoKSB7XG4gIHZhciBvcHBvbmVudCA9IHtcbiAgICBsaXN0OiBbJ0Vhc3kgUGlja2luZ3MnLCAnWW91ciBXb3JzdCBOaWdodG1hcmUnLCAnV29ybGQgY2xhc3MgcGFzdGUgZWF0ZXInLFxuICAgICAgJ0EgTXVybG9jJywgJ0dvdXJkIGNyaXRpYycsICdOb3NlIGFuZCBtb3V0aCBicmVhdGhlcicsICdIb2dnZXInLCAnQSBjYXJkaXNoIElhbicsXG4gICAgICAnTW9wZXkgTWFnZScsICdXb21iYXQgV2FybG9jaycsICdSb3VnZWQgdXAgUm9ndWUnLCAnV2FpZmlzaCBXYXJyaW9yJywgJ0RhbXAgRHJ1aWQnLFxuICAgICAgJ1NoYWJieSBTaGFtYW4nLCAnUGVubmlsZXNzIFBhbGFkaW4nLCAnSHVmZnkgSHVudGVyJywgJ1Blcmt5IFByaWVzdCcsICdUaGUgV29yc3QgUGxheWVyJyxcbiAgICAgICdZb3VyIE9sZCBSb29tbWF0ZScsICdTdGFyQ3JhZnQgUHJvJywgJ0Zpc2NhbGx5IHJlc3BvbnNpYmxlIG1pbWUnLCAnWW91ciBHdWlsZCBMZWFkZXInLFxuICAgICAgJ05vbmVjayBHZW9yZ2UnLCAnR3VtIFB1c2hlcicsICdDaGVhdGVyIE1jQ2hlYXRlcnNvbicsICdSZWFsbHkgc2xvdyBndXknLCAnUm9hY2ggQm95JyxcbiAgICAgICdPcmFuZ2UgUmh5bWVyJywgJ0NvZmZlZSBBZGRpY3QnLCAnSW53YXJkIFRhbGtlcicsICdCbGl6emFyZCBEZXZlbG9wZXInLCAnR3JhbmQgTWFzdGVyJyxcbiAgICAgICdEaWFtb25kIExlYWd1ZSBQbGF5ZXInLCAnQnJhbmQgTmV3IFBsYXllcicsICdEYXN0YXJkbHkgRGVhdGggS25pZ2h0JywgJ01lZGlvY3JlIE1vbmsnLFxuICAgICAgJ0EgTGl0dGxlIFB1cHB5J1xuICAgIF1cbiAgfTtcbiAgdmFyIGhlcm9lcyA9IFtcbiAgICB7dGV4dDogJ21hZ2UnLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdodW50ZXInLCBjaGVja2VkOiBmYWxzZX0sXG4gICAge3RleHQ6ICdwYWxhZGluJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnd2FycmlvcicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ2RydWlkJywgY2hlY2tlZDogZmFsc2V9LFxuICAgIHt0ZXh0OiAnd2FybG9jaycsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3NoYW1hbicsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3ByaWVzdCcsIGNoZWNrZWQ6IGZhbHNlfSxcbiAgICB7dGV4dDogJ3JvZ3VlJywgY2hlY2tlZDogZmFsc2V9XG4gIF1cbiAgcmV0dXJuIHtcbiAgICBvcHBvbmVudDogb3Bwb25lbnQsXG4gICAgaGVyb2VzOiBoZXJvZXNcbiAgfVxufVxuIiwiXG5hbmd1bGFyLm1vZHVsZSgnT05PRy5TZXJ2aWNlcycpXG5cbiAgLnNlcnZpY2UoJ1RvdXJuYW1lbnRTZXJ2aWNlcycsIFRvdXJuYW1lbnRTZXJ2aWNlcylcbiAgLmZhY3RvcnkoJ1RvdXJuYW1lbnQnLCBUb3VybmFtZW50KVxuICAuZmFjdG9yeSgnRGV0YWlscycsIERldGFpbHMpO1xuXG5mdW5jdGlvbiBUb3VybmFtZW50U2VydmljZXMoUGFyc2UsICRxLCBUb3VybmFtZW50LCBEZXRhaWxzLCBMYWRkZXIpIHtcbiAgcmV0dXJuIHtcbiAgICBnZXRUb3VybmFtZW50OiBnZXRUb3VybmFtZW50LFxuICAgIGNyZWF0ZVRvdXJuYW1lbnQ6IGNyZWF0ZVRvdXJuYW1lbnQsXG4gICAgZ2V0TGFkZGVyOiBnZXRMYWRkZXIsXG4gICAgam9pblRvdXJuYW1lbnQ6IGpvaW5Ub3VybmFtZW50XG4gIH1cbiAgZnVuY3Rpb24gam9pblRvdXJuYW1lbnQodG91cm5leSwgcGxheWVyKSB7XG4gICAgdmFyIHBsYXllciA9IG5ldyBMYWRkZXIuTW9kZWwocGxheWVyKTtcbiAgICBwbGF5ZXIuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgcGxheWVyLnNldCgndXNlcicsIFBhcnNlLlVzZXIuY3VycmVudCgpKTtcbiAgICBwbGF5ZXIuc2V0KCd1c2VybmFtZScsIFBhcnNlLlVzZXIuY3VycmVudCgpLnVzZXJuYW1lKTtcbiAgICBwbGF5ZXIuc2V0KCdtbXInLCAxMDAwKTtcbiAgICBwbGF5ZXIuc2V0KCd3aW5zJywgMCk7XG4gICAgcGxheWVyLnNldCgnbG9zc2VzJywgMCk7XG4gICAgcGxheWVyLnNldCgncG9pbnRzJywgMCk7XG4gICAgcmV0dXJuIHBsYXllci5zYXZlKCk7XG4gIH1cbiAgZnVuY3Rpb24gZ2V0VG91cm5hbWVudCgpIHtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoRGV0YWlscy5Nb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbygndHlwZScsICdsYWRkZXInKTtcbiAgICBxdWVyeS5pbmNsdWRlKCd0b3VybmFtZW50Jyk7XG4gICAgcmV0dXJuIHF1ZXJ5LmZpbmQoKTtcbiAgfVxuICBmdW5jdGlvbiBjcmVhdGVUb3VybmFtZW50ICgpIHtcbiAgICB2YXIgZGVmZXIgPSAkcS5kZWZlcigpO1xuICAgIHZhciB0b3VybmFtZW50ID0gbmV3IFRvdXJuYW1lbnQuTW9kZWwoKTtcbiAgICB0b3VybmFtZW50LnNldCgnbmFtZScsICdPTk9HIE9QRU4nKTtcbiAgICB0b3VybmFtZW50LnNldCgnc3RhdHVzJywgJ3BlbmRpbmcnKTtcbiAgICB0b3VybmFtZW50LnNldCgnZ2FtZScsICdoZWFydGhzdG9uZScpO1xuICAgIHRvdXJuYW1lbnQuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKHRvdXJuZXkpIHtcbiAgICAgIHZhciBkZXRhaWxzID0gbmV3IERldGFpbHMuTW9kZWwoKTtcbiAgICAgIGRldGFpbHMuc2V0KCd0b3VybmFtZW50JywgdG91cm5leSk7XG4gICAgICBkZXRhaWxzLnNldCgndHlwZScsICdsYWRkZXInKTtcbiAgICAgIGRldGFpbHMuc2V0KCdwbGF5ZXJDb3VudCcsIDApO1xuICAgICAgZGV0YWlscy5zZXQoJ251bU9mR2FtZXMnLCA1KTtcbiAgICAgIGRldGFpbHMuc2F2ZSgpLnRoZW4oZnVuY3Rpb24gKGRldGFpbHMpIHtcbiAgICAgICAgZGVmZXIucmVzb2x2ZShkZXRhaWxzKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJldHVybiBkZWZlci5wcm9taXNlO1xuICB9XG4gIGZ1bmN0aW9uIGdldExhZGRlciAodG91cm5leSkge1xuICAgIHZhciBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeShMYWRkZXIuTW9kZWwpO1xuICAgIHF1ZXJ5LmVxdWFsVG8oJ3RvdXJuYW1lbnQnLCB0b3VybmV5KTtcbiAgICBxdWVyeS5pbmNsdWRlKCdwbGF5ZXInKTtcbiAgICByZXR1cm4gcXVlcnkuZmluZCgpO1xuICB9XG59XG5cbmZ1bmN0aW9uIFRvdXJuYW1lbnQoUGFyc2UpIHtcbiAgdmFyIE1vZGVsID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVG91cm5hbWVudCcpO1xuICB2YXIgYXR0cmlidXRlcyA9IFsnbmFtZScsICdnYW1lJywgJ3N0YXR1cycsICdkaXNhYmxlZCcsICdkaXNhYmxlZFJlYXNvbicsICdsb2NhdGlvbiddO1xuICBQYXJzZS5kZWZpbmVBdHRyaWJ1dGVzKE1vZGVsLCBhdHRyaWJ1dGVzKTtcblxuICByZXR1cm4ge1xuICAgIE1vZGVsOiBNb2RlbFxuICB9XG59XG5mdW5jdGlvbiBEZXRhaWxzKFBhcnNlKSB7XG4gIHZhciBNb2RlbCA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ0RldGFpbHMnKTtcbiAgdmFyIGF0dHJpYnV0ZXMgPSBbJ3RvdXJuYW1lbnQnLCAndHlwZScsICdudW1PZkdhbWVzJywgJ3BsYXllckNvdW50J107XG4gIFBhcnNlLmRlZmluZUF0dHJpYnV0ZXMoTW9kZWwsIGF0dHJpYnV0ZXMpO1xuXG4gIHJldHVybiB7XG4gICAgTW9kZWw6IE1vZGVsXG4gIH1cbn1cbiJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
