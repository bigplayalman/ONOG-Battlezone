angular.module('ONOG.Services')

  .service('MatchServices', MatchServices)
  .factory('Match', Match);

function MatchServices(Parse, Match, $q) {
  var user = Parse.User;
  return {
    getConfirmedMatch: getConfirmedMatch,
    getPendingMatch: getPendingMatch,
    getLatestMatch: getLatestMatch,
    getMatch: getMatch,
    getPlayerMatches: getPlayerMatches,
  }

  function getPlayerMatches(player, status) {
    var player1 = new Parse.Query(Match.Model);
    player1.equalTo('player1', player);
    var player2 = new Parse.Query(Match.Model);
    player2.equalTo('player2', player);
    var mainQuery = Parse.Query.or(player1, player2);
    mainQuery.descending("createdAt");
    mainQuery.limit(10);
    if(status) {
      mainQuery.equalTo('status', status);
    }
    return mainQuery.find();
  }

  function getLatestMatch(player) {
    var type = player.get('player')
    var query = new Parse.Query(Match.Model);
    query.include('winner');
    query.include('loser');
    query.descending("createdAt");
    query.limit(1);
    if(type === 'player1') {
      query.equalTo('player1', player);
    } else {
      query.equalTo('player2', player);
    }
    return query.find();
  }

  function getConfirmedMatch (player) {
    var type = player.get('player');
    var query = new Parse.Query('Match');
    query.equalTo('status', 'active');
    query.descending("createdAt");
    if(type === 'player1') {
      query.equalTo('player1', player)
    } else {
      query.equalTo('player2', player)
    }
    query.equalTo('confirm1', true);
    query.equalTo('confirm2', true);
    query.limit(1);

    return query.find();
  }
  function getPendingMatch(player) {
    var type = player.get('player')
    var query = new Parse.Query(Match.Model);
    query.descending("createdAt");
    query.limit(1);
    if(type === 'player1') {
      query.equalTo('player1', player);
    } else {
      query.equalTo('player2', player);
    }
    query.equalTo('status', 'pending');
    query.limit(1);
    return query.find();
  }
  function getMatch(id) {
    var match = new Match.Model();
    match.id = id;
    return match.fetch();
  }
}

function Match(Parse) {
  var Model = Parse.Object.extend('Match');
  var attributes = [
    'tournament', 'player1', 'player2', 'hero1', 'hero2', 'username1', 'username2', 'battleTag1', 'battleTag2', 'status', 'winner', 'loser',
    'winImage', 'reportReason', 'reportImage', 'activeDate', 'user1', 'user2'
  ];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}
