/*
 * @author Vlad Stirbu
 * @license MIT
 *
 * Copyright © 2014-2016
 */

/* global Promise */

module.exports = StateMachine;

var noChoiceFound = 'no-choice';

try {
  StateMachine.Promise = Promise;
} catch (e) {
  StateMachine.Promise = require('es6-promise').Promise;
}

function StateMachine(configuration, target) {
  'use strict';

  var Promise = StateMachine.Promise,
      events = {},
      pseudoEvents = {},
      pseudoStates = {},
      responses = {},
      states = {},
      inTransition = false,
      current,
      final,
      Type = {
        NOOP: 0,
        INTER: 1,
        GENERAL: 2
      };

  target = target || {};
  configuration.events = configuration.events || [];
  configuration.callbacks = configuration.callbacks || {};
  current = configuration.initial || 'none';
  final = configuration.final;

  configuration.events.forEach(function (event) {
    addEvent(event);

    //NOTE: Add states
    addState(event.from);
    addState(event.to);
  });

  for (var name in events) {
    Object.defineProperty(target, name, {
      enumerable: true,
      value: buildEvent(name),
      writable: true
    });
  }

  Object.defineProperties(target, {
    can: {
      value: can,
      writable: true
    },
    cannot: {
      value: cannot,
      writable: true
    },
    current: {
      get: function () {
        return current;
      }
    },
    is: {
      value: is,
      writable: true
    },
    hasState: {
      value: function (state) {
        return states.hasOwnProperty(state);
      },
      writable: true
    },
    isFinal: {
      value: function (state) {
        var test = state || current;
        
        if (final instanceof Array) {
          return final.indexOf(test) !== -1 ? true : false;
        } else {
          return final === test;
        }
      },
      writable: true
    }
  });

  function identity(param) {
    return param;
  }

  function returnValue(options) {
    return options.res ? options.res : options;
  }

  function addEvent(event) {
    events[event.name] = events[event.name] || {};

    //NOTE: Add the choice pseudo-state for conditional transition
    if (isConditional(event)) {
      handleConditionalEvent(event);
    } else {
      handleBasicEvent(event);
    }
  }
  
  function handleBasicEvent(event) {
    if (event.to instanceof Array) {
      throw new FsmError('Ambigous transition', event);
    }

    if (event.from instanceof Array) {
      event.from.forEach(function (from) {
        events[event.name][from] = event.to || from;
      });
    } else {
      events[event.name][event.from] = event.to || event.from;
    }
  }
  
  function handleConditionalEvent(event) {
    var pseudoState;
    
    if (event.from instanceof Array) {
      event.from.forEach(function (from) {
        handleConditionalEvent({
          name: event.name,
          from: from,
          to: event.to,
          condition: event.condition
        });
      });
    } else {
      pseudoState = event.from + '__' + event.name;

      pseudoStates[pseudoState] = event.from;

      addState(pseudoState);

      addEvent({
        name: event.name,
        from: event.from,
        to: pseudoState
      });

      addEvent({
        name: pseudoEvent(pseudoState, noChoiceFound),
        from: pseudoState,
        to: event.from
      });

      pseudoEvents[pseudoEvent(pseudoState, noChoiceFound)] = event.name;

      event.to.forEach(function (toState) {
        addEvent({
          name: pseudoEvent(pseudoState, toState),
          from: pseudoState,
          to: toState
        });

        pseudoEvents[pseudoEvent(pseudoState, toState)] = event.name;
      });

      configuration.callbacks['onentered' + pseudoState] = function (options) {
        return new Promise(function (resolve) {
          resolve(event.condition(options));
        }).then(function (index) {
          var toState = event.to[index];

          if (toState === undefined) {
            return target[pseudoEvent(pseudoState, noChoiceFound)]().then(function () {
              throw new FsmError('Choice index out of range', event);
            });
          } else {
            return target[pseudoEvent(pseudoState, toState)].apply(target, options.args);
          }
        });
      }
    };
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
          },
          pOptions,
          isPseudo = pseudoEvents.hasOwnProperty(name);
      
      // transition to choice state in a conditional event
      if (pseudoStates.hasOwnProperty(options.to)) {
        Object.defineProperties(options, {
          res: {
            get: function () {
              return responses[name];
            },
            set: function (val) {
              responses[name] = val;
            }
          }
        });
        
        // reset previous results
        options.res = undefined;
      }
      
      // transition from choice state in a conditional event
      if (isPseudo) {
        pOptions = {
          name: pseudoEvents[name],
          from: pseudoStates[current],
          to: options.to,
          args: args
        }
        
        Object.defineProperties(pOptions, {
          res: {
            get: function () {
              return responses[pseudoEvents[name]];
            },
            set: function (val) {
              responses[pseudoEvents[name]] = val;
            }
          }
        });
      }

      promise = new Promise(function (resolve, reject) {
        resolve(options);
      });

      //NOTE: Internal error handling stub
      function revert(err) {
        switch (type(options)) {
        case Type.INTER:
          inTransition = false;
          break;
        case Type.NOOP:
          states[current].noopTransition = states[current].noopTransition - 1;
          break;
        }
        throw err;
      }

      return promise
      .then(isValidEvent)
      .then(canTransition)
      .then(callbacks['onleave' + current] ? callbacks['onleave' + current].bind(target, options) : identity)
      .then(callbacks.onleave ? callbacks.onleave.bind(target, options) : identity)
      .then(onleavestate.bind(target, options))
      .then(callbacks['on' + name] ? callbacks['on' + name].bind(target, options) : identity)
      //in the case of the transition from choice pseudostate we provide the options of the original transition
      .then(callbacks['onenter' + events[name][current]] ? callbacks['onenter' + events[name][current]].bind(target, isPseudo ? pOptions : options) : identity)
      .then(callbacks.onenter ? callbacks.onenter.bind(target, isPseudo ? pOptions : options) : identity)
      .then(onenterstate.bind(target, options))
      .then(callbacks['onentered' + events[name][current]] ? callbacks['onentered' + events[name][current]].bind(target, isPseudo ? pOptions : options) : identity)
      .then(callbacks.onentered ? callbacks.onentered.bind(target, isPseudo ? pOptions : options) : identity)
      .then(returnValue.bind(target, options))
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
        throw new FsmError('Previous transition pending', options);
      }
      break;
    case Type.INTER:
      if (states[current].noopTransition > 0 || inTransition) {
        throw new FsmError('Previous transition pending', options);
      }
      break;
    }

    return options;
  }

  function is(state) {
    return state === current;
  }

  function isConditional (event) {
    return event.hasOwnProperty('condition') && event.to instanceof Array;
  }

  function isValidEvent(options) {
    if (cannot(options.name)) {
      throw new FsmError('Invalid event in current state', options);
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

function pseudoEvent(state, name) {
  return state + '--' + name;
}

function FsmError(message, options) {
  Error.captureStackTrace(this, this.constructor);
  this.name = 'FsmError';
  this.message = message;
  this.trigger = options.name;
  this.current = options.from;
}

FsmError.prototype = Object.create(Error.prototype);
FsmError.prototype.constructor = FsmError;

StateMachine.FsmError = FsmError;
