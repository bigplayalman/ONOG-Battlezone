angular.module('BattleZone').controller('NewsCtrl', NewsCtrl);

function NewsCtrl($scope, NewsServices, $ionicScrollDelegate) {
  $scope.feature = {
    featured_media: 0
  }
  NewsServices.getLatestNews().then(function (news) {
    $scope.feature = news[0];
    $scope.news = news;
    getImages();
  });

  $scope.showNews = function () {
    $ionicScrollDelegate.scrollBy(0, 500, true);
  }

  function getImages() {
    angular.forEach($scope.news, function (post) {
      if(post.featured_media !== 0) {
        NewsServices.getImage(post.featured_media).then(function(image) {
          post.featured_media = image.media_details.sizes.medium_large.source_url;
          post.imageFetched = true;
        });
      }
    })
  }
};
