angular.module('BattleZone')

  .controller('matchResultCtrl', matchResultCtrl);

function matchResultCtrl($scope, $state, $stateParams) {
  $scope.id = $stateParams.id;
  $scope.result = $stateParams.result === 'true';
};
