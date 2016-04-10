angular.module('ONOG.Services')

  .service('MatchServices', ['Parse', 'Match', MatchServices])
  .factory('Match', ['Parse', Match]);

function MatchServices(Parse, Match) {
  var user = Parse.User.current();
  return {
    getMatch: getMatch,
    getConfirmedMatch: getConfirmedMatch
  }
  function getConfirmedMatch () {
    var player1 = new Parse.Query('Match');
    player1.equalTo('username1', user.username);
    var player2 = new Parse.Query('Match');
    player2.equalTo('username2', user.username);

    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.equalTo('status', 'active');
    mainQuery.equalTo('confirm1', true);
    mainQuery.equalTo('confirm2', true);
    return mainQuery.find();
  }
  function getMatch(status) {
    var player1 = new Parse.Query('Match');
    player1.equalTo('username1', user.username);
    var player2 = new Parse.Query('Match');
    player2.equalTo('username2', user.username);

    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.equalTo('status', status);
    return mainQuery.find();
  }
}

function Match(Parse) {
  var Model = Parse.Object.extend('Match');
  var attributes = [
    'tournament', 'player1', 'player2', 'hero1', 'hero2', 'username1', 'username2', 'battleTag1', 'battleTag2', 'status', 'winner', 'loser',
    'screenshot', 'report', 'reportedScreenshot', 'activeDate', 'user1', 'user2'
  ];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}
