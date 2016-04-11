angular.module('ONOG.Controllers')
  .controller('MenuCtrl', MenuCtrl);

MenuCtrl.$inject = ['$scope','$ionicPopover', '$state', '$ionicHistory', 'Parse', '$timeout'];
function MenuCtrl($scope, $ionicPopover, $state, $ionicHistory, Parse, $timeout) {
  $scope.user = Parse.User;

  $ionicPopover.fromTemplateUrl('templates/popovers/profile.pop.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });

  $scope.menu = function (link) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });
    $state.go('app.' + link, {reload: true});
    $scope.popover.hide();
  }
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });

  $scope.$on('$ionicView.loaded', function() {
    ionic.Platform.ready( function() {
      if(navigator && navigator.splashscreen) {
        navigator.splashscreen.hide();
      }
    });
  });
}
