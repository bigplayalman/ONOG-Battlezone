angular.module('BattleZone')
  .controller('MenuCtrl', MenuCtrl);

function MenuCtrl($scope, $state) {
  
  $scope.navigateTo = function(state) {
    $state.go(state);
  }
  
  $scope.menu = {
    items: [
      {
        state: 'app.news',
        icon: 'ion-planet',
        name: 'News'
      },
      {
        state: 'app.play',
        icon: 'ion-ios-game-controller-b',
        name: 'Play'
      }
    ]
  }
}
