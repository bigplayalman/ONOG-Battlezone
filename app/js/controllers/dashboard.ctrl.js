
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$scope', '$state', '$timeout', '$interval', '$ionicPopup', 'Parse', 'QueueServices', 'tournament', 'player', 'match', 'queue'];
function DashboardCtrl($scope, $state, $timeout, $interval, $ionicPopup, Parse, QueueServices, tournament, player, match, queue) {
  var promise;
  $scope.tournament = tournament[0].tournament;
  $scope.user = Parse.User;
  $scope.player = player;
  $scope.match = match;
  $scope.queue = queue;

  $scope.opponent = QueueServices.opponent;
  $scope.myOpponent = {name:'PAX Attendee'};

  checkUserStatus();
  console.log($scope.status);

  $scope.startQueue = function () {
    QueueServices.joinQueue($scope.tournament, $scope.user.current()).then(function (queue) {
      $scope.status = 'queue';
      $scope.queue.push(queue);
      $scope.startSearch();
    })
  }

  $scope.cancelQueue = function () {
    QueueServices.cancelQueue($scope.queue[0]).then(function () {
      $scope.status = 'open';
      $scope.stop();
    });
  }

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

  function checkUserStatus() {
    if(!$scope.user.current) {
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
  }
  
  function checkStatus () {
    QueueServices.checkStatus($scope.tournament, $scope.user.current()).then(function (queue) {
      if(!queue.length) {
        $scope.searching = false;
        return;
      }

      switch (queue[0].status) {
        case 'pending':
          $scope.queue = queue[0];
          $scope.startSearch();
          break;
        case 'found':
          worthyPopup(queue[0]);
          break;
      }

      if(queue[0].status != 'found') {
        $timeout(checkStatus, 15000)
      }

    });
  }
  
  function worthyPopup(queue) {
    var queue = queue;
    $ionicPopup.alert({
      title: 'Matchmaking',
      template: '<div class="text-center"><strong>A Worthy Opponent<br> has been found!</strong></div>'
    }).then(function(res) {
      queue.set('status', 'completed');
      queue.save().then(function () {
        $scope.status = 'match';
        $state.go('app.match.view');
      })

    });
  }

  function changeWord () {
    $scope.myOpponent.name = $scope.opponent.list[Math.floor(Math.random()*$scope.opponent.list.length)];

  }
}
