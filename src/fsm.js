/*
 * @author Vlad Stirbu
 * @license MIT
 *
 * Copyright © 2014
 */

module.exports = StateMachine;

function StateMachine(configuration, target) {
  'use strict';

  var Promise = Promise || require('es6-promise').Promise,
      events = {},
      states = {},
      inTransition = false,
      current,
      Type = {
        NOOP: 0,
        INTER: 1,
        GENERAL: 2
      };

  target = target || {};
  configuration.events = configuration.events || [];
  configuration.callbacks = configuration.callbacks || {};
  current = configuration.initial || 'none';

  Object.defineProperty(states, 'add', {
    value: function (state) {
      var self = this;

      function addName(name) {
        self[name] = self[name] || {
          noopTransition: 0
        };
      }

      if (state instanceof Array) {
        state.forEach(addName);
      } else {
        addName(state);
      }
      // console.log('states', self);
    }
  });

  Object.defineProperty(events, 'add', {
    value: function(event) {
      var self = this;

      self[event.name] = self[event.name] || {};

      if (event.from instanceof Array) {
        event.from.forEach(function (from) {
          self[event.name][from] = event.to || self[event.name][from];
        });
      } else {
        self[event.name][event.from] = event.to || self[event.name][event.from];
      }
      // console.log('events:', self);
    }
  });

  configuration.events.forEach(function (event) {
    events.add(event);

    //NOTE: Add states
    states.add(event.from);
    states.add(event.to);
  });

  for (var name in events) {
    Object.defineProperty(target, name, {
      enumerable: true,
      value: buildEvent(name)
    });
  }

  Object.defineProperties(target, {
    can: {
      value: can
    },
    cannot: {
      value: cannot
    },
    current: {
      get: function () {
        return current;
      }
    },
    is: {
      value: is
    }
  });

  function buildEvent(name) {
    // console.log('build event', events[name]);
    // console.log('name', name);
    // console.log('from', current);
    // console.log('to', events[name][current]);
    return function() {
      var args = Array.prototype.slice.call(arguments),
          promise;


      promise = new Promise(function (resolve, reject) {
        resolve({
          name: name,
          from: current,
          to: events[name][current],
          args: args
        });
      });

      return promise
      .then(isValidEvent)
      .then(canTransition)
      .then(configuration.callbacks['onleave' + current])
      .then(onleavestate)
      .then(configuration.callbacks['on' + name])
      .then(configuration.callbacks['onenter' + events[name][current]])
      .then(onenterstate)
      .catch(revert);
    };
  }

  function can(name) {
    return events[name].hasOwnProperty(current);
  }

  function cannot(name) {
    return !can(name);
  }

  function canTransition(options) {
    switch(type(options)) {
    case Type.NOOP:
      if (inTransition) {
        throw new Error('Previous transition pending');
      }
      break;
    case Type.INTER:
      if (states[current].noopTransition > 0) {
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
      states[current].noopTransition = states[current].noopTransition - 1;
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
      states[current].noopTransition = states[current].noopTransition + 1;
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
