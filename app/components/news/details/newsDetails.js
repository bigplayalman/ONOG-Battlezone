angular.module('BattleZone').controller('NewsDetailsCtrl', NewsDetailsCtrl);

function NewsDetailsCtrl($scope, $stateParams, NewsServices) {
  NewsServices.getStory($stateParams.id).then(function (news) {
    $scope.post = news;
  });
};
