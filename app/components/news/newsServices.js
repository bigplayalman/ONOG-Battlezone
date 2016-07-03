
angular.module('BattleZone')

  .factory('NewsServices', NewsServices);

function NewsServices($http, news) {

  return {
    getLatestNews: getLatestNews,
    getStory: getStory,
    getImage: getImage
  }

  function getLatestNews() {
    return $http.get(news.url + 'posts').then(function (newsResults) {
      return newsResults.data;
    });
  }

  function getStory(id) {
    return $http.get(news.url + 'posts/' + id).then(function (newsResults) {
      return newsResults.data;
    });
  }
  
  function getImage(id) {
    return $http.get(news.url + 'media/' + id).then(function (imageResult) {
      return imageResult.data;
    });
  }
}
