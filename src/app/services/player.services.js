
angular.module('BattleZone')

  .factory('playerServices', playerServices);

function playerServices($http, Parse, $q, $ionicPopup, player, tournamentParse) {
  var current = {player: {}};

  return {
    current: current,
    fetchPlayer: fetchPlayer,
    registerPlayer: registerPlayer,
    getPlayers: getPlayers
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

  function fetchPlayer() {
    var defer = $q.defer();
    var user = Parse.User.current();
    if(!user) {
      defer.resolve([]);
    } else {
      var currentPlayer = new Parse.Query(player.model);
      currentPlayer.equalTo('user', user);
      currentPlayer.include('tournament');
      currentPlayer.find().then(function (tournaments) {
        defer.resolve(tournaments);
      },
      function (error) {
        $ionicPopup.alert({
          title: 'Error has Occurred',
          template: error.message
        })
      });
    }
    return defer.promise;
  }

  function registerPlayer(params, tournament) {
    var user = Parse.User.current();
    var newPlayer = new player.model();
    newPlayer.set('user', user);
    newPlayer.set('tournament', tournament);
    newPlayer.set(params);
    return newPlayer.save();
  }

}
