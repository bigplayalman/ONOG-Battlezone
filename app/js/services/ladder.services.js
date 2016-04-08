
angular.module('ONOG.Services')

  .service('LadderServices', LadderServices)
  .factory('Ladder', Ladder);

LadderServices.$inject = ['Parse', 'Ladder'];
Ladder.$inject = ['Parse'];

function LadderServices(Parse, Ladder) {
  return {
    getPlayers: getPlayers,
    getPlayer: getPlayer,
    validatePlayer: validatePlayer
  }

  function getPlayers(tourney) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.descending('points', 'mmr');
    return query.find();
  }

  function validatePlayer(tourney, battleTag) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.equalTo('battleTag', battleTag);
    return query.find();
  }

  function getPlayer(tourney, user) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.equalTo('user', user);
    return query.find();
  }
}

function Ladder(Parse) {
  var Model = Parse.Object.extend('Ladder');
  var attributes = ['tournament', 'user','battleTag', 'username', 'heroes', 'wins', 'losses', 'mmr', 'points'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}
