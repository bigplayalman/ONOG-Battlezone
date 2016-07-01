
angular.module('BattleZone')

  .factory('NewsServices', NewsServices);

function NewsServices($http, news) {

  return {
    getLatestNews: getLatestNews
  }

  function getLatestNews() {
    return $http.get(news.url + 'posts').then(function (newsResults) {
      return newsResults.data;
    });
  }
}
