angular.module('BattleZone')

  .factory('player', player)

function player(Parse, tournament) {
  var model = Parse.Object.extend('player');
  var attributes = [tournament.model, 'win', 'loss', 'points', 'games'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
