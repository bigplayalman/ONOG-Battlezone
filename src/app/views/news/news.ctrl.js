angular.module('BattleZone').controller('NewsCtrl', NewsCtrl);

function NewsCtrl($scope, $state, NewsServices, $ionicScrollDelegate, playerServices, userServices, tournamentServices) {
  $scope.feature = {
    featured_media: 0
  }
  $scope.disablePlay = false;
  userServices.state.last = null;
  $scope.current = playerServices.current;
  $scope.tournaments = tournamentServices.getActiveTournaments();

  $scope.disableStandings = false;

  $scope.$on("$ionicView.enter", function(event, data){
    NewsServices.getLatestNews().then(function (news) {
      $scope.feature = news[0];
      $scope.news = news;
      getImages();
    });

    $scope.user = userServices.user;

    playerServices.fetchPlayer().then(function (tournaments) {
      $scope.current.player.tournaments = tournaments;

    });
  });

  $scope.showStandings = function () {
    $scope.tournaments.then(function (response) {
      $state.go('tournament.ladder', {id: response[0].id});
    });
  }

  $scope.playTournaments = function () {
    if($scope.current.player.tournaments.length == 1) {
      $state.go('tournament.play', {id: $scope.current.player.tournaments[0].tournament.id});
    } else {
      $state.go('tournament.list');
    }
  }


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
