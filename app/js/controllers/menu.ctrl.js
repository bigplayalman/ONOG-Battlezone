angular.module('ONOG.Controllers')
  .controller('MenuCtrl', MenuCtrl);

MenuCtrl.$inject = ['$scope','$ionicPopover', '$state', '$ionicHistory', 'Parse'];
function MenuCtrl($scope, $ionicPopover, $state, $ionicHistory, Parse) {
  $scope.user = Parse.User.current();

  $ionicPopover.fromTemplateUrl('templates/popovers/profile.pop.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.menu = function (link) {
    $state.go('app.' + link, {reload: true});
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $scope.popover.hide();
  }
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
}
