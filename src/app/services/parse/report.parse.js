angular.module('BattleZone.Parse')

  .factory('reportParse', reportParse);

function reportParse(Parse) {
  var model = Parse.Object.extend('report');
  var attributes = ['status', 'match', 'reason', 'screenshot', 'notes'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
