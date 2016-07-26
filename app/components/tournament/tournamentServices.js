
angular.module('BattleZone')

  .factory('tournamentServices', tournamentServices);

function tournamentServices(Parse) {

  return {
    createTournament: createTournament,
    getTournament: getTournament,
    saveTournament: saveTournament
  }
  function createTournament(params) {
    var tournament = new Parse.Object('tournament');
    tournament.set(params);
    return tournament.save();
  }
  function getTournament(id) {
    var tournament = new Parse.Object('tournament');
    tournament.id = id;
    return tournament.fetch();
  }
  function saveTournament(params) {
    var tournament = new Parse.Object('tournament');
    tournament.set(params);
    return tournament.save();
  }

}
