angular.module('BattleZone').controller('NewsDetailsCtrl', NewsDetailsCtrl);

function NewsDetailsCtrl($scope, $stateParams, NewsServices) {
  NewsServices.getStory($stateParams.id).then(function (news) {
    $scope.post = news;
    if($scope.post.featured_media !== 0) {
      NewsServices.getImage($scope.post.featured_media).then(function(image) {
        $scope.post.featured_media = image.media_details.sizes.medium_large.source_url;
        $scope.post.imageFetched = true;
      });
    }
  });
};
