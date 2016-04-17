
angular.module('ONOG.Controllers')

  .controller('LadderProfileCtrl',
    ['$scope', '$filter', '$ionicPopup', '$state', '$ionicHistory', '$q', 'Parse', 'tournament', 'LadderServices', 'player', LadderProfileCtrl]);

function LadderProfileCtrl
($scope, $filter, $ionicPopup, $state, $ionicHistory, $q, Parse,  tournament, LadderServices, player) {

  $ionicHistory.nextViewOptions({
    disableBack: true
  });
  $scope.tournament = tournament.tournament;
  $scope.user = Parse.User.current();
  $scope.player = player[0];

  $scope.registerPlayer = function () {
    validateBattleTag().then(
      function (tag) {
        $scope.player.save().then(function () {
          SuccessPopup(player).then(function(res) {
            $state.go('app.dashboard');
          });
        });
      },
      function (error) {
        ErrorPopup(error);
      });
  };

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
  };

  function ErrorPopup (message) {
    return $ionicPopup.alert({
      title: 'Update Error',
      template: message
    });
  };

  function SuccessPopup (player) {
    return $ionicPopup.alert({
      title: 'Congratulations ' + player.username + '!',
      template: 'You have successfully updated! Now go and play!'
    });
  };
};
