angular.module('BattleZone.Parse')

  .factory('matchParse', matchParse);

function matchParse(Parse, tournamentParse) {
  var model = Parse.Object.extend('match');
  var attributes = ['status', tournamentParse.model, 'player', 'opponent', 'result', 'image'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
