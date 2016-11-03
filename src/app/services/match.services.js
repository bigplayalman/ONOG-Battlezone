
angular.module('BattleZone')

  .factory('matchServices', matchServices);

function matchServices(Parse, matchParse, tournamentParse, ladderParse) {

  return {
    getLatestMatch: getLatestMatch,
    createMatch: createMatch,
    findOpponent: findOpponent,
    recordMatch: recordMatch,
    fetchLatestMatch: fetchLatestMatch
  }

  function fetchLatestMatch (player) {
    var matches = new Parse.Query(matchParse.model);
    var tournament = new tournamentParse.model();
    tournament.id = player.tournament.id;
    matches.equalTo('player', player);
    matches.equalTo('tournament', tournament);
    return matches.find();
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
    var wins = 0;
    var ladder = new Parse.Query(ladderParse.model);
    ladder.equalTo('tournament', match.get('tournament'));

    var resultObj = {
      wins: wins,
      match: match.id,
      opponentMatch: match.get('opponentMatch').id,
      player: match.get('player').id,
      opponent: match.get('opponent').id,
      result: result
    };

    return ladder.find().then(function (response) {
      resultObj.wins = response[0].win;
      return  Parse.Cloud.run('recordResult', resultObj);
    });
  }

  function findOpponent (match) {
    return Parse.Cloud.run('findOpponent', {match: match.id, tournament: match.get('tournament').id, player: match.get('player').id});
  }

}
