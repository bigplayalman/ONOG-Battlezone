
angular.module('ONOG.Controllers')

  .controller('MatchViewCtrl', MatchViewCtrl);

MatchViewCtrl.$inject = ['$scope', 'match'];
function MatchViewCtrl($scope, match) {
  console.log(match);
}
