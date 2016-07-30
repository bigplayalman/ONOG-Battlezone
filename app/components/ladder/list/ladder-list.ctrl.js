
angular.module('BattleZone')

  .controller('ladderListCtrl', ladderListCtrl);

function ladderListCtrl($scope, ladderServices) {
  $scope.ladders = [];
  ladderServices.getLadders().then(function (ladders) {
    $scope.ladders = ladders;
  });
  $scope.getAttribute = function (model, name) {
    var objects = name.split('.');
    var display = null;
    switch(objects.length) {
      case 1: display =  model.get(objects[0]); break;
      case 2: display = model.get(objects[0]).get(objects[1]); break;
    }
    return display;
  }

  $scope.getImage = function (model) {
    var game = model.get('tournament').get('game');
    return 'assets/images/' + game + '.png';
  }
};
