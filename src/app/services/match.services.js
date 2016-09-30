
angular.module('BattleZone')

  .factory('matchServices', matchServices);

function matchServices(Parse, matchParse, tournamentParse) {

  return {
    getLatestMatch: getLatestMatch,
    createMatch: createMatch,
    findOpponent: findOpponent,
    recordMatch: recordMatch
  }

  function getLatestMatch(id, player) {
    var matches = new Parse.Query(matchParse.model);
    var tournament = new tournamentParse.model();
    tournament.id = id;
    matches.equalTo('status', 'active');
    matches.equalTo('player', player);
    matches.include('opponent');
    matches.equalTo('tournament', tournament);
    return matches.find();
  }

  function createMatch(id, player) {
    var tournament = new tournamentParse.model();
    tournament.id = id;
    var match = new matchParse.model();
    match.set('tournament', tournament);
    match.set('player', player);
    match.set('opponent', null);
    match.set('status', 'active');
    return match.save();
  }

  function recordMatch(result, match) {
    return Parse.Cloud.run('recordResult', {match: match.id, opponentMatch: match.get('opponentMatch').id, player: match.get('player').id, opponent: match.get('opponent').id, result: result});
  }

  function findOpponent (match) {
    return Parse.Cloud.run('findOpponent', {match: match.id, tournament: match.get('tournament').id, player: match.get('player').id});
  }

}
