
angular.module('BattleZone')

  .factory('playerServices', playerServices);

function playerServices($http, Parse, $q, $ionicPopup, player) {
  var current = {player: {}};

  return {
    current: current,
    fetchPlayer: fetchPlayer
  }

  function fetchPlayer() {
    var defer = $q.defer();
    var user = Parse.User.current();
    if(!user) {
      defer.resolve([]);
    } else {
      var player = new player.model();
      player.equalTo('user', user);
      player.find().then(function (tournaments) {
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

}
