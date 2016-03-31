
angular.module('ONOG.Controllers')

  .controller('DashboardCtrl', DashboardCtrl);

DashboardCtrl.$inject = ['$scope','$ionicPopover', '$ionicHistory', '$state', 'Parse'];
function DashboardCtrl($scope, $ionicPopover, $ionicHistory, $state, Parse) {
  $scope.user = Parse.User.current();

  $ionicPopover.fromTemplateUrl('templates/popovers/profile.pop.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
  
  $scope.logout = function () {
    $scope.popover.remove();
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.login');
  }
  
  
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
}
