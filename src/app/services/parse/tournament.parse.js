angular.module('BattleZone')

  .factory('tournament', tournament)

function tournament(Parse) {
  var model = Parse.Object.extend('tournament');
  var attributes = ['status', 'date', 'type', 'game', 'name'];
  Parse.defineAttributes(model, attributes);

  return {
    model: model
  };
}
