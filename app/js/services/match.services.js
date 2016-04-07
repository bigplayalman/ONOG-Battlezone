angular.module('ONOG.Services')

  .service('MatchServices', MatchServices)
  .factory('Match', Match);

MatchServices.$inject = ['Parse', 'Match'];
Match.$inject = ['Parse'];

function MatchServices(Parse, Match) {

  return {
    checkQueueMatches: checkQueueMatches,
    checkPendingMatches: checkPendingMatches,
    activateMatch: activateMatch,
    createMatch: createMatch,
    fillMatch: fillMatch,
    concedeMatch: concedeMatch,
    matchWinner: matchWinner,
    reportMatch: reportMatch,
    adminMatch: adminMatch,
    cancelQueueMatch: cancelQueueMatch,
    cancelPendingMatch: cancelPendingMatch
  }
  
  function cancelQueueMatch(match) {
    return match.destroy();
  }
  function cancelPendingMatch(match) {
    match.unset('player2');
    match.set('status', 'queue');
    return match.save();
  }

  function checkQueueMatches(player) {
    var query = new Parse.Query(Match.Model);
    query.equalTo('status', 'queue');
    if(player.lastOpponent) {
      query.notEqualTo('lastOpponent', player.lastOpponent);
    }
    return query.find();
  }

  function checkPendingMatches(player) {
    var query = new Parse.Query(Match.Model);
    query.equalTo('player2', player);
    query.equalTo('status', 'pending');
    return query.find();
  }
  
  function activateMatch(match) {
    match.set('status', 'active');
    return match.save();
  }
  
  function fillMatch(match, player) {
    match.set('player2', player);
    match.set('status', 'pending');
    return match.save();
  }

  function createMatch(tourney, player) {
    var match = new Match.Model();
    match.set('tournament', tourney);
    match.set('player1', player);
    if(player.lastOpponent) {
      match.set('lastOpponent', player.lastOpponent);
    }
    match.set('status', 'queue');
    return match.save();
  }
  
  function concedeMatch(match, winner, loser) {
    match.set('winner', winner);
    match.set('loser', loser);
    match.set('status', 'finished');
  }

  function matchWinner(match, winner, loser, screenshot) {
    match.set('winner', winner);
    match.set('loser', loser);
    match.set('screenshot', screenshot);
    match.set('status', 'finished');
    return match.save();
  }
  
  function reportMatch(match, report, screenshot) {
    match.set('report', report);
    match.set('reportedScreenshot', screenshot);
    match.set('status', 'reported');
    return match.save();
  }

  function adminMatch(match, winner, loser) {
    match.set('winner', winner);
    match.set('loser', loser);
    match.set('status', 'administered');
    return match.save();
  }
  
}

function Match(Parse) {
  var Model = Parse.Object.extend('Match');
  var attributes = ['tournament', 'player1', 'player2', 'status', 'winner', 'loser', 'lastOpponent', 'screenshot', 'report', 'reportedScreenshot'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}
