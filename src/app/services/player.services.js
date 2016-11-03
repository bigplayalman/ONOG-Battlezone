
angular.module('BattleZone')

  .factory('playerServices', playerServices);

function playerServices($http, Parse, $q, $ionicPopup, player, ladderServices) {
  var current = {player: new player.model()};

  return {
    current: current,
    fetchPlayer: fetchPlayer,
    registerPlayer: registerPlayer,
    getPlayers: getPlayers,
    validateTag: validateTag
  }

  function getPlayers(id) {
    var players = new Parse.Query(player.model);
    var tourney = new Parse.Object.extend(tournamentParse.model);
    tourney.id = id;
    players.equalTo('tournament', tourney);
    players.include('user');
    players.descending('points');
    return players.find();
  }

  function fetchPlayer(user, ladder) {
    var playersQuery = new Parse.Query(player.model);
    playersQuery.equalTo('user', user);
    playersQuery.equalTo('ladder', ladder);
    return playersQuery.find().then(function (players) {
      if(players.length) {
        return players[0];
      } else {
        return null;
      }
    });
  }

  function registerPlayer(battleNet) {

    return ladderServices.getActiveLadder().then(function (ladder) {
      var playerQuery = new Parse.Query(player.model);
      playerQuery.equalTo('battleNet', battleNet);
      playerQuery.equalTo('ladder', ladder);
      return playerQuery.find().then(function(players) {
        if(players.length == 0) {
          var user = Parse.User.current();
          var newPlayer = new player.model();
          newPlayer.set('user', user);
          newPlayer.set('ladder', ladder);
          newPlayer.set('battleNet', battleNet);
          newPlayer.set('points', 0);
          newPlayer.set('wins', 0);
          newPlayer.set('losses', 0);
          newPlayer.set('status', 'active');
          return newPlayer.save();
        } else {
          return null;
        }
      });
    });
  }

  function validateTag (tag) {
    var cb = $q.defer();

    if(tag.length < 8) {
      cb.reject('Enter your full battle tag');
      return cb.promise;
    }
    var split = tag.split('#');
    if(split.length !== 2) {
      cb.reject('Enter your full BATTLETAG™ including # and four digits');
      return cb.promise;
    }
    if(split[1].length < 2 || split[1].length > 4) {
      cb.reject('Your BATTLETAG™ must including up to four digits after #!');
      return cb.promise;
    }
    if(isNaN(split[1])) {
      cb.reject('Your BATTLETAG™ must including four digits after #');
      return cb.promise;
    }
    cb.resolve(tag);
    return cb.promise;
  };

}
