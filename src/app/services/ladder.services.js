
angular.module('BattleZone')

  .factory('ladderServices', ladderServices);

function ladderServices(Parse, ladderParse, settingsParse) {

  return {
    getActiveLadder: getActiveLadder,
    getCurrentLadder: getCurrentLadder,
    getLadderSettings: getLadderSettings,
    createNewLadder: createNewLadder,
    createSettings: createSettings,
    getLadderStatus: getLadderStatus
  }

  function getActiveLadder() {
    var query = new Parse.Query(ladderParse.model);
    query.equalTo('active', true);
    return query.find().then(function (ladders){
      if(ladders.length) {
        return ladders[0];
      } else {
        return null;
      }
    })
  }

  function getCurrentLadder() {
    var query = new Parse.Query(ladderParse.model);
    return query.find().then(function (ladders){
      if(ladders.length) {
        return ladders[0];
      } else {
        return null;
      }
    })
  }

  function createNewLadder() {
    var ladder = new ladderParse.model();
    ladder.set('active', true);
    ladder.set('players', 0);
    return ladder.save();
  }

  function getLadderStatus() {
    var query = new Parse.Query(settingsParse.model);
    return query.find().then(function (settings) {
      if (settings.length) {
        return settings[0].disabled;
      }
    });
  }

  function getLadderSettings() {
    var query = new Parse.Query(settingsParse.model);
    return query.find().then(function (settings) {
      if(settings.length) {
        return settings[0];
      } else {
        return createSettings();
      }
    });
  }

  function createSettings() {
    var settings = new settingsParse.model();
    settings.set('disabled', false);
    settings.set('points', 20);
    return settings.save();
  }

}
