angular.module('BattleZone.Parse')

  .factory('ladder', ladder)

function ladder(Parse, tournamentParse) {
  var model = Parse.Object.extend('ladder');
  var attributes = [tournamentParse.model, 'win', 'days', 'match'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
