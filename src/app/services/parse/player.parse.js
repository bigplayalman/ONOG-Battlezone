angular.module('BattleZone.Parse')

  .factory('player', player)

function player(Parse, tournamentParse) {
  var model = Parse.Object.extend('player');
  var attributes = [tournamentParse.model, 'win', 'loss', 'points', 'games', 'user'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
