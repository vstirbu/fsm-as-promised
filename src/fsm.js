/*
 * @author Vlad Stirbu
 * @license MIT
 *
 * Copyright © 2014
 */

module.exports = StateMachine;

function StateMachine(configuration, target) {
  'use strict';

  var events = {},
      inTransition = false,
      noopTransition = 0,
      current,
      Promise = Promise || require('es6-promise').Promise,
      Type = {
        NOOP: 0,
        INTER: 1,
        GENERAL: 2
      };

  target = target || {};
  configuration.events = configuration.events || [];
  configuration.callbacks = configuration.callbacks || {};
  current = configuration.initial || 'none';

  //NOTE: Normalize noop transitions
  configuration.events.forEach(function (event) {
    if (event.to === undefined) {
      event.to = event.from;
    }
  });

  configuration.events.forEach(function (event) {
    if (!events.hasOwnProperty(event.name)) {
      events[event.name] = event;
    }
  });

  for (var name in events) {
    Object.defineProperty(target, name, {
      enumerable: true,
      value: buildEvent(events[name])
    });
  }

  Object.defineProperties(target, {
    current: {
      value: current
    },
    is: {
      value: is
    }
  });

  function buildEvent(event) {
    return function() {
      var args = Array.prototype.slice.call(arguments),
          promise;

      promise = new Promise(function (resolve, reject) {
        resolve({
          name: event.name,
          from: event.from,
          to: event.to,
          args: args
        });
      });

      return promise
      .then(isValidEvent)
      .then(canTransition)
      .then(configuration.callbacks['onleave' + current])
      .then(onleavestate)
      .then(configuration.callbacks['on' + event.name])
      .then(configuration.callbacks['onenter' + event.to])
      .then(onenterstate)
      .catch(revert);
    };
  }

  function can(name) {
    return events[name].from === current;
  }

  function cannot(name) {
    return events[name].from !== current;
  }

  function canTransition(options) {
    switch(type(options)) {
    case Type.NOOP:
      if (inTransition) {
        throw new Error('Previous transition pending');
      }
      break;
    case Type.INTER:
      if (noopTransition > 0) {
        throw new Error('Previous transition pending');
      }
      break;
    default:
    }

    return options;
  }

  function is(state) {
    return state === current;
  }

  function isValidEvent(options) {
    if (cannot(options.name)) {
      throw new Error('Invalid event in current state');
    }

    return options;
  }

  function onenterstate(options) {
    switch (type(options)) {
    case Type.NOOP:
      noopTransition = noopTransition - 1;
      break;
    default:
      inTransition = false;
    }

    current = options.to;

    return options;
  }

  function onleavestate(options) {
    switch (type(options)) {
    case Type.NOOP:
      noopTransition = noopTransition + 1;
      break;
    default:
      inTransition = true;
    }

    return options;
  }

  //NOTE: Internal error handling stub
  function revert(err) {
    inTransition = null;
    throw err;
  }

  function type(options) {
    if (options.from === options.to) {
      return Type.NOOP;
    } else if (options.from === '*') {
      return Type.GENERAL;
    } else {
      return Type.INTER;
    }
  }

  return target;
}
