
angular.module('ONOG.Controllers')

  .controller('LadderJoinCtrl', LadderJoinCtrl);

LadderJoinCtrl.$inject =
  [
    '$scope', 'Parse', '$filter', '$ionicPopup', '$state', '$ionicHistory', 'tourney', 'TournamentServices', 'LadderServices', '$q'
  ];
function LadderJoinCtrl
(
  $scope, Parse, $filter, $ionicPopup, $state, $ionicHistory, tourney, TourneyServices, LadderServices, $q
) {
  $scope.tournament = tourney[0];
  $scope.user = Parse.User.current();
  $scope.player = {
    battleTag: ''
  };

  $scope.registerPlayer = function () {
    validateBattleTag().then(
      function (tag) {
        TourneyServices.joinTournament($scope.tournament.tournament, $scope.player).then(function (player) {
          $scope.tournament.increment('playerCount');
          $scope.tournament.save().then(function () {
            SuccessPopup(player).then(function(res) {
              $ionicHistory.nextViewOptions({
                disableBack: true
              });
              $state.go('app.dashboard');
            });
          })
        
        });
      },
      function (error) {
        ErrorPopup(error);
      });
  }

  function validateBattleTag () {
    var cb = $q.defer();

    var tag = $scope.player.battleTag;

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
    LadderServices.validatePlayer($scope.tournament.tournament, tag).then(function (results) {
      if(results.length) {
        cb.reject('The BATTLETAG™ you entered is already registered.')
      } else {
        cb.resolve(tag);
      } 
    });
    return cb.promise;
  }

  function ErrorPopup (message) {
    return $ionicPopup.alert({
      title: 'Registration Error',
      template: message
    });
  }

  function SuccessPopup (player) {
    return $ionicPopup.alert({
      title: 'Congratulations ' + player.battleTag + '!',
      template: 'You have successfully signed up! Now go find a valiant opponent.'
    });
  }
}
