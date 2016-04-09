
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', 
    [
      '$scope', '$state', '$filter', '$timeout', '$interval', '$ionicPopup', 
      'Parse', 'TournamentServices', 'MatchServices', 'QueueServices', 'LadderServices',
      DashboardCtrl
    ]);

function DashboardCtrl(
  $scope, $state, $filter, $timeout, $interval, $ionicPopup, 
  Parse, TournamentServices, MatchServices, QueueServices, LadderServices
) {
  var promise;
  $scope.user = Parse.User;
  $scope.status = 'open';
  TournamentServices.getTournament().then(function (tournaments) {
    $scope.tournament = tournaments[0].tournament;
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
  });
  
 
  $scope.heroList = QueueServices.heroes;
  $scope.selected = {status: true};

  $scope.opponent = QueueServices.opponent;
  $scope.myOpponent = {name:'PAX Attendee'};

  
  console.log($scope.status);

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
