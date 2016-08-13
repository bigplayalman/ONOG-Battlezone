angular.module('BattleZone')
  .directive('tournamentAction', tournamentAction);

function tournamentAction() {
  return {
    restrict: 'E',
    controller: 'tournamentActionCtrl',
    scope: {
      tournament: '=tournament',
      players: '=players'
    },
    templateUrl: 'directives/tournament-action/tournament.action.html'
  };
}
