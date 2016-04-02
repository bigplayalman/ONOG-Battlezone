
angular.module('ONOG.Controllers')

  .controller('MatchCtrl', MatchCtrl);

MatchCtrl.$inject = ['$scope', 'Parse'];
function MatchCtrl($scope, Parse) {
  $scope.user = Parse.User.current();
}
