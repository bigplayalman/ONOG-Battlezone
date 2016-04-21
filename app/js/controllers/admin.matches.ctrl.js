
angular.module('ONOG.Controllers')

  .controller('AdminMatchesCtrl', AdminMatchesCtrl);

function AdminMatchesCtrl($scope, Parse, MatchServices) {
  
  MatchServices.getReportedMatches().then(function (matches) {
    $scope.matches = matches;
  });
};
