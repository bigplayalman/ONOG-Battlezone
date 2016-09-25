
angular.module('BattleZone')

  .factory('matchServices', matchServices);

function matchServices(Parse, matchParse, tournamentParse) {

  return {
    getLatestMatch: getLatestMatch,
    createMatch: createMatch
  }

  function getLatestMatch(id, player) {
    var matches = new Parse.Query(matchParse.model);
    var tournament = new tournamentParse.model();
    tournament.id = id;
    matches.equalTo('status', 'active');
    matches.equalTo('player', player);
    matches.equalTo('tournament', tournament);
    return matches.find();
  }

  function createMatch(id, player) {
    var tournament = new tournamentParse.model();
    tournament.id = id;
    var match = new matchParse.model();
    match.set('tournament', tournament);
    match.set('player', player);
    match.set('status', 'active');
    return match.save();
  }

}
