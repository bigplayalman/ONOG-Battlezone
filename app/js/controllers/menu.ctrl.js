angular.module('ONOG.Controllers')
  .controller('MenuCtrl', MenuCtrl);

MenuCtrl.$inject = ['$scope', 'Parse'];
function MenuCtrl($scope, Parse) {
  $scope.user = Parse.User.current();
}
