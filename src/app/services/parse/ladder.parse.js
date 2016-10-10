angular.module('BattleZone.Parse')

  .factory('ladderParse', ladderParse)

function ladderParse(Parse, tournamentParse) {
  var model = Parse.Object.extend('ladder');
  var attributes = [tournamentParse.model, 'win', 'days', 'match'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
