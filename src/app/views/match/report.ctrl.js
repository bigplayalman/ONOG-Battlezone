angular.module('BattleZone')

  .controller('matchReportCtrl', matchReportCtrl);

function matchReportCtrl($scope, $state, $stateParams) {
  $scope.id = $stateParams.id;
};
