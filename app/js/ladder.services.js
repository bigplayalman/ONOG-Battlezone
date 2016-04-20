
angular.module('ONOG')

  .service('LadderServices', LadderServices)
  .factory('Ladder', Ladder);

function LadderServices(Parse, Ladder) {
  return {
    getPlayers: getPlayers
  };
  function getPlayers(tourney) {
    var query = new Parse.Query(Ladder.Model);
    query.equalTo('tournament', tourney);
    query.descending('points', 'mmr');
    query.limit(20);
    return query.find();
  };
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
