
angular.module('ONOG.Services')

  .service('LadderServices', ['Parse', 'Ladder', LadderServices])
  .factory('Ladder', ['Parse', Ladder])

function LadderServices(Parse, Ladder) {
  return {
    getPlayers: getPlayers,
    getPlayer: getPlayer,
    validatePlayer: validatePlayer,
    joinTournament: joinTournament,
    getPendingPlayers: getPendingPlayers
  };

  function getPendingPlayers(tournament, user) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.notEqualTO('user', user);
    query.equalTo('status', 'queue');
    return query.find();
  };

  function getPlayers(tourney) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.descending('points', 'mmr');
    return query.find();
  };

  function validatePlayer(tourney, battleTag) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.equalTo('battleTag', battleTag);
    return query.find();
  };

  function getPlayer(tourney, user) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.equalTo('user', user);
    query.limit(1);
    return query.find();
  }

  function joinTournament(tourney, user, userData) {
    var player = new Ladder.Model();
    player.set('tournament', tourney);
    player.set('user', user);
    player.set(userData);
    player.set('wins', 0);
    player.set('losses', 0);
    player.set('points', 0);
    return player.save();
  }
};

function Ladder(Parse) {
  var Model = Parse.Object.extend('Ladder');
  var attributes = ['tournament', 'user', 'battleTag', 'username', 'location',
    'hero', 'player', 'status', 'cancelTimer', 'wins', 'losses', 'mmr', 'points', 'banReason', 'admin'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
};
