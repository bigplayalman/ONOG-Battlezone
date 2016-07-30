
angular.module('BattleZone')

  .factory('playerServices', playerServices);

function playerServices($http, Parse, $q, $ionicPopup) {
  var current = {player: {}};


  return {
    current: current,
    getPlayer: getPlayer
  }

  function getPlayer() {
    var defer = $q.defer();
    var user = Parse.User.current();
    if(!user) {
      defer.resolve(current);
    } else {
      var player = new Parse.Query('player');
      player.equalTo('user', user);
      player.find().then(function (tournaments) {
        current.player.tournaments = tournaments;
        defer.resolve(current);
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
