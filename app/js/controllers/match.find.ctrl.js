
angular.module('ONOG.Controllers')

  .controller('MatchFindCtrl', MatchFindCtrl);

MatchFindCtrl.$inject = ['$scope', 'Parse', '$ionicLoading', '$interval'];
function MatchFindCtrl($scope, Parse, $ionicLoading, $interval) {
  $scope.user = Parse.User.current();
  $scope.opponents = ['Easy Pickings', 'Your Worst Nightmare', 'World class paste eater',
    'A Murloc', 'Gourd critic', 'Nose and mouth breather', 'Hogger', 'A cardish Ian',
    'Mopey Mage', 'Wombat Warlock', 'Rouged up Rogue', 'Waifish Warrior', 'Damp Druid',
    'Shabby Shaman', 'Penniless Paladin', 'Huffy Hunter', 'Perky Priest', 'The Worst Player',
    'Your Old Roommate', 'StarCraft Pro', 'Fiscally responsible mime', 'Your Guild Leader',
    'Noneck George', 'Gum Pusher', 'Cheater McCheaterson', 'Really slow guy', 'Roach Boy',
    'Orange Rhymer', 'Coffee Addict', 'Inward Talker', 'Blizzard Developer', 'Grand Master',
    'Diamond League Player', 'Brand New Player', 'Dastardly Death Knight', 'Mediocre Monk',
    'A Little Puppy'
  ];

  $scope.myOpponent = {name:'PAX Attendee'};
  $scope.show = function() {
    $ionicLoading.show({
      noBackdrop: true,
      scope: $scope,
      template:
      '<div><ion-spinner icon="lines" class="spinner-energized"></ion-spinner></div>' +
      '<div>Searching for</div> ' +
      '<div> {{myOpponent.name }}</div>' +
      '<button class="button button-positive button-block" ng-click="stop()">Cancel</button>'
    });
  };

  $scope.stop = function() {
    $interval.cancel(promise);
    $ionicLoading.hide();
  };

  var promise;

  $scope.start = function() {
    $scope.stop();
    promise = $interval(function () {changeWord()}, 2000).then(function () {
      console.log('ended');
    });
    $scope.show();
  };
  $scope.$on('$destroy', function() {
    $scope.stop();
  });
  $scope.start();
  
  function changeWord () {
    $scope.myOpponent.name = $scope.opponents[Math.floor(Math.random()*$scope.opponents.length)];
    
  }
}
