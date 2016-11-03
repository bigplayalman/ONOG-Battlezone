angular.module('BattleZone').controller('NewsCtrl', NewsCtrl);

function NewsCtrl($scope, $state, NewsServices, $ionicScrollDelegate, playerServices, userServices, tournamentServices, $ionicPopup) {
  $scope.feature = {
    featured_media: 0
  }
  $scope.disablePlay = false;
  userServices.state.last = null;

  $scope.disableStandings = false;

  NewsServices.getLatestNews().then(function (news) {
    $scope.feature = news[0];
    $scope.news = news;
    getImages();
  });

  $scope.user = userServices.user;


  $scope.showNews = function() {
    $ionicScrollDelegate.scrollBy(0, 500, true);
  }

  function loginPopup() {
    return $ionicPopup.show({
      title: 'Please Login to Play',
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Login</b>',
          type: 'button-positive',
          onTap: function(e) {
            $state.go('login');
          }
        }
      ]
    });
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
