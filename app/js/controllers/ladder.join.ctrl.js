
angular.module('ONOG.Controllers')

  .controller('LadderJoinCtrl', LadderJoinCtrl);

LadderJoinCtrl.$inject = ['$scope', 'Parse', '$filter', '$ionicPopup', '$state', '$ionicHistory', 'tourney', 'TournamentServices'];
function LadderJoinCtrl($scope, Parse, $filter, $ionicPopup, $state, $ionicHistory, tourney, TourneyServices) {
  $scope.tournament = tourney[0];
  $scope.user = Parse.User.current();
  $scope.player = {
    battleTag: '',
    heroes: []
  };
  $scope.canSelect = 1;

  ionic.DomUtil.ready(function(){
    $scope.image = angular.element(document.querySelector('.heroClass'))[0].clientWidth;
  });

  $scope.selectHero = function (hero, element) {
    if(hero.checked) {
      $scope.canSelect--;
      hero.checked = !hero.checked;
      return;
    }

    if(!hero.checked && $scope.canSelect < 5) {
      $scope.canSelect++;
      hero.checked = !hero.checked;
      return;
    }
  }

  $scope.registerPlayer = function () {
    var heroes = $filter('filter')($scope.heroList, {checked: true}, true);
    if(!validateBattleTag()) {
      return;
    }
    if(!validateHeroes(heroes)){
      return;
    }

    $scope.player.heroes = [];
    angular.forEach(heroes, function (hero) {
      $scope.player.heroes.push(hero.text);
    });
    
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
  }

  function validateBattleTag () {
    var valid = true;
    var tag = $scope.player.battleTag;
    var message = '';
    if(tag.length < 8) {
      message = 'Enter your full battle tag'
      valid = false;
    }
    var split = tag.split('#');
    if(valid && split.length !== 2) {
      message = 'Enter your full BATTLETAG™ including # and four digits';
      valid = false;
    }
    if(valid && split[1].length != 4) {
      message = 'Your BATTLETAG™ must including four digits after #!';
      valid = false;
    }
    if(valid && isNaN(split[1])) {
      message = 'Your BATTLETAG™ must including four digits after #';
      valid = false;
    }

    if(!valid) {
      ErrorPopup(message);
    }
    return valid;
  }

  function validateHeroes (heroes) {
    if(heroes.length < 4) {
      ErrorPopup('Please Select at least four hero classes');
      return false;
    }
    return true;
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

  $scope.heroList = [
    {
      text: 'mage',
      checked: false
    },
    {
      text: 'hunter',
      checked: false
    },
    {
      text: 'paladin',
      checked: false
    },
    {
      text: 'warrior',
      checked: false
    },
    {
      text: 'druid',
      checked: false
    },
    {
      text: 'warlock',
      checked: false
    },
    {
      text: 'shaman',
      checked: false
    },
    {
      text: 'priest',
      checked: false
    },
    {
      text: 'rogue',
      checked: false
    }
  ]
}
