angular.module('BattleZone').controller('NewsCtrl', NewsCtrl);

function NewsCtrl($scope, NewsServices) {
  NewsServices.getLatestNews().then(function (news) {
    $scope.news = news;
  });
};
