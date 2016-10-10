
angular.module('BattleZone')

  .factory('reportServices', reportServices);

function reportServices(Parse, reportParse, matchParse) {

  return {
    reportMatch: reportMatch
  }

  function reportMatch(reportData) {
    var report = new reportParse.model();
    var match = new matchParse.model();
    var parseFile = new Parse.File('report.png', {base64:reportData.screenshot});
    match.id = reportData.matchId;
    report.set('match', match);
    report.set('reason', reportData.reason);
    report.set('screenshot', parseFile);
    match.set('status', 'reported');
    return Parse.Object.saveAll([match, report]);
  }

}
