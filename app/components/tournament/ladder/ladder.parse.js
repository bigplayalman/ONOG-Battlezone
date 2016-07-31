angular.module('BattleZone')

  .factory('ladder', ladder)

function ladder(Parse) {
  var model = Parse.Object.extend('ladder');
  var attributes = ['tournament', 'win', 'days', 'match'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
