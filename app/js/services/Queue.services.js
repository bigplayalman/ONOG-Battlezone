angular.module('ONOG.Services')

  .service('QueueServices', QueueServices)
  .factory('Queue', Queue);

QueueServices.$inject = ['Parse', 'Queue'];
Queue.$inject = ['Parse'];

function QueueServices(Parse, Queue) {

  return {
    checkStatus: checkStatus,
    joinQueue: joinQueue,
    cancelQueue: cancelQueue,
    checkQueue: checkQueue
  }

  function checkQueue(user, tournament) {
    var query = new Parse.Query(Queue.Model);
    query.notEqualTo('user', user);
    query.equalTo('tournament', tournament);
    query.include('match');
    return query.find();
  }

  function checkStatus(user, tournament) {
    var query = new Parse.Query(Queue.Model);
    query.equalTo('user', user);
    query.equalTo('tournament', tournament);
    query.include('match');
    return query.find();
  }

  function joinQueue(user, tournament) {
    var queue = new Queue.Model();
    queue.set('user', user);
    queue.set('tournament', tournament);
    queue.set('status', 'pending');
    return queue.save();
  }

  function cancelQueue(cancel) {
    var queue = new Queue.Model();
    queue.id = cancel.id;
    return queue.destroy();
  }
}

function Queue(Parse) {
  var Model = Parse.Object.extend('Queue');
  var attributes = ['tournament', 'user', 'status', 'match'];
  Parse.defineAttributes(Model, attributes);

  return {
    Model: Model
  }
}
