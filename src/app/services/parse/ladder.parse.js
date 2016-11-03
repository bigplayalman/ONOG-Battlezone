angular.module('BattleZone.Parse')

  .factory('ladderParse', ladderParse)

function ladderParse(Parse) {
  var model = Parse.Object.extend('ladder');
  var attributes = ['active', 'players'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
