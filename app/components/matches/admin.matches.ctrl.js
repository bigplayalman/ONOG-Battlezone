
angular.module('BattleZone')

  .controller('AdminMatchesCtrl', AdminMatchesCtrl);

function AdminMatchesCtrl($scope, Parse, MatchServices, moment) {
  
  MatchServices.getReportedMatches().then(function (matches) {
    $scope.matches = matches;
  });

  $scope.showDate = function (date) {
    return moment(date).format('MM/DD hh:mm A');
  }
};
