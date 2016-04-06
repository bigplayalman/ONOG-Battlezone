
angular.module('ONOG.Controllers')

  .controller('MatchFindCtrl', MatchFindCtrl);

MatchFindCtrl.$inject = ['$scope', 'Parse'];
function MatchFindCtrl($scope, Parse) {
  $scope.user = Parse.User.current();
}
