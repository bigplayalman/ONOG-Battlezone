angular.module('ONOG.Services')

  .service('MatchServices', MatchServices)
  .factory('Match', Match);

MatchServices.$inject = ['Parse', 'Match'];
Match.$inject = ['Parse'];

function MatchServices(Parse, Match) {
  var user = Parse.User.current();
  return {
    getMatch: getMatch
  }
  function getMatch() {
    var player1 = new Parse.Query(Match.Model);
    player1.equalTo('player1', user);

    var player2 = new Parse.Query(Match.Model);
    player2.equalTo('player2', user);

    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.equalTo('status', 'active');
    return mainQuery.find();
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
