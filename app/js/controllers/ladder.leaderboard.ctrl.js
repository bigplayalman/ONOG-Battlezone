
angular.module('ONOG.Controllers')

  .controller('LeaderBoardsCtrl', LeaderBoardsCtrl);

LeaderBoardsCtrl.$inject = ['$scope', 'Parse'];
function LeaderBoardsCtrl($scope, Parse) {
  $scope.user = Parse.User.current();
}
