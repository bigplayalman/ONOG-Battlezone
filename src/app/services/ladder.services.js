
angular.module('BattleZone')

  .factory('ladderServices', ladderServices);

function ladderServices(Parse, ladder, player) {

  return {
    createLadder: createLadder,
    getLadder: getLadder,
    saveLadder: saveLadder,
    getLadders: getLadders,
    getStandings: getStandings
  }

  function createLadder(tourney) {
    var newLadder = new ladder.model();
    newLadder.set('tournament', tourney);
    return newLadder.save();
  }
  function getLadder(id) {
    var current = new Parse.Query(ladder.model);
    current.include('tournament');
    return current.get(id);
  }
  function saveLadder(params) {
    var saveLadder = new ladder.model();
    saveLadder.set(params);
    return saveLadder.save();
  }
  function getLadders() {
    var ladders = new Parse.Query(ladder.model);
    ladders.include('tournament');
    return ladders.find();
  }
  function getStandings(id) {
    var players = new Parse.Query(player.model);
    var current = new Parse.Object(ladder.model);
    current.id = id;
    players.equalTo('ladder', current);
    return players.find();
  }

}
