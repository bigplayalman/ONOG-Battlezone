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
    var player1 = new Parse.Query('Match');
    player1.equalTo('username1', user.username);
    var player2 = new Parse.Query('Match');
    player2.equalTo('username2', user.username);
    
    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.equalTo('status', 'active');
    return mainQuery.find();
  }
}

function Match(Parse) {
  var Model = Parse.Object.extend('Match');
  var attributes = [
    'tournament', 'player1', 'player2', 'hero1', 'hero2', 'username1', 'username2', 'battleTag1', 'battleTag2', 'status', 'winner', 'loser',
    'screenshot', 'report', 'reportedScreenshot'
  ];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}
