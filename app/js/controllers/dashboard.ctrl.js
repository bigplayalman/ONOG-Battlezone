
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$scope', 'Parse', 'LadderServices', 'tournament', '$interval', 'QueueServices', '$ionicPopup', '$timeout'];
function DashboardCtrl($scope, Parse, LadderServices, tournament, $interval, QueueServices, $ionicPopup, $timeout) {
  var promise;

  $scope.tournament = tournament[0].tournament;
  $scope.user = Parse.User;
  $scope.opponent = LadderServices.opponent;
  $scope.myOpponent = {name:'PAX Attendee'};

  LadderServices.getPlayer($scope.tournament, $scope.user.current()).then(function (players) {
    if(players.length) {
      $scope.player = players[0];
      checkStatus();
    }
  })
  
  $scope.startQueue = function () {
    QueueServices.joinQueue($scope.user.current(), $scope.tournament).then(function (queue) {
      $scope.queue = queue;
      $scope.startSearch();
    })
  }

  $scope.cancelQueue = function () {
    QueueServices.cancelQueue($scope.queue).then(function () {
      $scope.queue = null;
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
  
  function checkStatus () {
    QueueServices.checkStatus($scope.user.current(), $scope.tournament).then(function (queue) {
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
          worthyPopup(queue);
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
      queue.destroy();
      $scope.queue = null;
    });
  }

  function changeWord () {
    $scope.myOpponent.name = $scope.opponent.list[Math.floor(Math.random()*$scope.opponent.list.length)];

  }
}
