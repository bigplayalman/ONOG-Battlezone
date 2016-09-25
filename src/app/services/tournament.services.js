
angular.module('BattleZone')

  .factory('tournamentServices', tournamentServices);

function tournamentServices(Parse, $q, ladderServices, tournamentParse) {

  return {
    getTournament: getTournament,
    createTournament: createTournament,
    saveTournament: saveTournament,
    getActiveTournaments: getActiveTournaments
  }

  function getActiveTournaments() {
    var tournaments = new Parse.Query(tournamentParse.model);
    tournaments.equalTo('status', 'active');
    return tournaments.find();
  }
  function getTournament(id) {
    var current = new tournamentParse.model();
    current.id = id;
    return current.fetch();
  }

  function createTournament(params) {
    var defer = $q.defer();

    var newTourney = new tournamentParse.model();
    newTourney.set(params);
    newTourney.set('status', 'pending');
    newTourney.save().then(function (tourney) {
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
    var tournament = new tournamentParse.model();
    tournament.set(params);
    return tournament.save();
  }

}
