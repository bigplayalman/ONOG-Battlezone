
angular.module('BattleZone')

  .factory('matchServices', matchServices);

function matchServices(Parse, matchParse, tournamentParse, ladderParse, playerParse) {

  return {
    getLatestMatch: getLatestMatch,
    createMatch: createMatch,
    findOpponent: findOpponent,
    recordMatch: recordMatch,
    fetchLatestMatch: fetchLatestMatch
  }

  function fetchLatestMatch (player, ladder) {
    var matches = new Parse.Query(matchParse.model);

    matches.equalTo('player', player);
    matches.equalTo('ladder', ladder);
    return matches.find().then(function (matches) {
      if(matches.length) {
        return matches[0];
      } else {
        return {};
      }
    });
  }

  function getLatestMatch(ladder, player) {
    var parseP = new playerParse.model();
    parseP.id = player.id;
    var matches = new Parse.Query(matchParse.model);
    matches.equalTo('status', 'active');
    matches.equalTo('player', parseP);
    matches.include('opponent');
    matches.equalTo('ladder', ladder);
    return matches.find().then(function(matches) {
      if(matches.length) {
        return matches[0];
      } else {
        return null;
      }
    });
  }

  function createMatch(ladder, player) {
    var match = new matchParse.model();
    match.set('ladder', ladder);
    match.set('player', player);
    match.set('opponent', null);
    match.set('status', 'active');
    return match.save();
  }

  function recordMatch(result, match) {
    var wins = 0;

    var resultObj = {
      match: match.id,
      opponentMatch: match.get('opponentMatch').id,
      player: match.get('player').id,
      opponent: match.get('opponent').id,
      result: result
    };

    return  Parse.Cloud.run('recordResult', resultObj);
  }

  function findOpponent (match, ladder) {
    return Parse.Cloud.run('findOpponent', {match: match.id, ladder: ladder.id, player: match.get('player').id});
  }

}
