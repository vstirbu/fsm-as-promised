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

  configuration.events.forEach(function (event) {
    addEvent(event);

    //NOTE: Add states
    addState(event.from);
    addState(event.to);
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

  function addEvent(event) {
    events[event.name] = events[event.name] || {};

    if (event.to instanceof Array) {
      throw new Error('Ambigous transition ' + event.name);
    }
    if (event.from instanceof Array) {
      event.from.forEach(function (from) {
        events[event.name][from] = event.to || events[event.name][from];
      });
    } else {
      events[event.name][event.from] = event.to || events[event.name][event.from];
    }
  }

  function addState(state) {
    function addName(name) {
      states[name] = states[name] || {
        noopTransition: 0
      };
    }

    if (state instanceof Array) {
      state.forEach(addName);
    } else {
      addName(state);
    }
  }

  function buildEvent(name) {
    // console.log('build event', events[name]);
    // console.log('name', name);
    // console.log('from', current);
    // console.log('to', events[name][current]);
    return function() {
      var args = Array.prototype.slice.call(arguments),
          callbacks = configuration.callbacks,
          promise,
          options = {
            name: name,
            from: current,
            to: events[name][current],
            args: args
          };


      promise = new Promise(function (resolve, reject) {
        resolve(options);
      });

      //NOTE: Internal error handling stub
      function revert(err) {
        switch (type(options)) {
        case Type.INTER:
          inTransition = null;
          break;
        case Type.NOOP:
          states[current].noopTransition = states[current].noopTransition - 1;
          break;
        default:
        }
        throw err;
      }

      return promise
      .then(isValidEvent)
      .then(canTransition)
      .then(callbacks['onleave' + current] ? callbacks['onleave' + current].bind(target, options) : undefined)
      .then(onleavestate.bind(target, options))
      .then(callbacks['on' + name] ? callbacks['on' + name].bind(target, options) : undefined)
      .then(callbacks['onenter' + events[name][current]] ? callbacks['onenter' + events[name][current]].bind(target, options) : undefined)
      .then(onenterstate.bind(target, options))
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
      if (states[current].noopTransition > 0 || inTransition) {
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
      current = options.to;
    }

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

  function type(options) {
    if (options.from === options.to || options.to === undefined) {
      return Type.NOOP;
    } else if (options.from === '*') {
      return Type.GENERAL;
    } else {
      return Type.INTER;
    }
  }

  return target;
}
