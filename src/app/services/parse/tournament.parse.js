angular.module('BattleZone.Parse')

  .factory('tournamentParse', tournamentParse);

function tournamentParse(Parse) {
  var model = Parse.Object.extend('tournament');
  var attributes = ['status', 'date', 'type', 'game', 'name'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
