
angular.module('ONOG.Controllers')

  .controller('LadderJoinCtrl', LadderJoinCtrl);

LadderJoinCtrl.$inject = ['$scope', 'Parse'];
function LadderJoinCtrl($scope, Parse) {
  $scope.user = Parse.User.current();
  $scope.player = {};
  
  $scope.selectHero = function (hero) {
    
  }
}
