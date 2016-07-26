
angular.module('BattleZone')

  .factory('tournamentServices', tournamentServices);

function tournamentServices(Parse, $q, ladderServices) {

  return {
    getTournament: getTournament,
    createTournament: createTournament,
    saveTournament: saveTournament
  }
  function getTournament(id) {
    var tournament = new Parse.Object('tournament');
    tournament.id = id;
    return tournament.fetch();
  }

  function createTournament(params) {
    var defer = $q.defer();

    var tournament = new Parse.Object('tournament');
    tournament.set(params);
    tournament.save().then(function (tourney) {
      switch(tourney.get('type')) {
        case 'ladder':
          ladderServices.createLadder(tourney).then(function (ladder) {
            defer.resolve(ladder);
          });
          break;
        case 'single': break;
        case 'double': break;
      }
    });

    return defer.promise;
  }

  function saveTournament(params) {
    var tournament = new Parse.Object('tournament');
    tournament.set(params);
    return tournament.save();
  }

}
