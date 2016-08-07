
angular.module('BattleZone')

  .factory('playerServices', playerServices);

function playerServices($http, Parse, $q, $ionicPopup, player) {
  var current = {player: {}};

  return {
    current: current,
    fetchPlayer: fetchPlayer,
    registerPlayer: registerPlayer
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

  function registerPlayer(id, tournament) {
    var user = Parse.User.current();
    var newPlayer = new player.model();
    newPlayer.set('user', user);
    newPlayer.set('tournament', tournament);
    newPlayer.set('battleNet', id);
    return newPlayer.save();
  }

}
