
angular.module('ONOG.Controllers')

  .controller('StandingsCtrl', StandingsCtrl);

StandingsCtrl.$inject = ['$scope', 'Parse'];
function StandingsCtrl($scope, Parse) {
  $scope.user = Parse.User.current();
}
