angular.module('BattleZone.Parse')

  .factory('playerParse', playerParse)

function playerParse(Parse) {
  var model = Parse.Object.extend('player');
  var attributes = ['ladder', 'wins', 'losses', 'points', 'status', 'user', 'battleNet'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
