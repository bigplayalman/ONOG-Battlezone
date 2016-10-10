
angular.module('BattleZone')

  .factory('ladderServices', ladderServices);

function ladderServices(Parse, ladderParse, player) {

  return {
    createLadder: createLadder,
    getLadder: getLadder,
    saveLadder: saveLadder,
    getLadders: getLadders,
    getStandings: getStandings
  }

  function createLadder(tourney) {
    var newLadder = new ladderParse.model();
    newLadder.set('tournament', tourney);
    return newLadder.save();
  }
  function getLadder(id) {
    var current = new Parse.Query(ladderParse.model);
    current.include('tournament');
    return current.get(id);
  }
  function saveLadder(params) {
    var saveLadder = new ladderParse.model();
    saveLadder.set(params);
    return saveLadder.save();
  }
  function getLadders() {
    var ladders = new Parse.Query(ladderParse.model);
    ladders.include('tournament');
    return ladders.find();
  }
  function getStandings(id) {
    var players = new Parse.Query(player.model);
    var current = new Parse.Object(ladderParse.model);
    current.id = id;
    players.equalTo('ladder', current);
    return players.find();
  }

}
