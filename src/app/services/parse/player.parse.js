angular.module('BattleZone.Parse')

  .factory('player', player)

function player(Parse, tournamentParse) {
  var model = Parse.Object.extend('player');
  var attributes = [tournamentParse.model, 'wins', 'losses', 'points', 'games', 'user', 'battleNetId'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
