angular.module('BattleZone.Parse')

  .factory('settingsParse', settingsParse)

function settingsParse(Parse) {
  var model = Parse.Object.extend('settings');
  var attributes = ['disabled', 'pointsWin', 'pointsLoss', 'message', 'messageShow'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
