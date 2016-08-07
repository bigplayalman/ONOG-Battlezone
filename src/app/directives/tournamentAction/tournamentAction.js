angular.module('BattleZone')
  .directive('tournamentAction', tournamentAction);

function tournamentAction() {
  return {
    restrict: 'E',
    templateUrl: 'directives/tournamentAction/tournamentAction.html'
  };
}
