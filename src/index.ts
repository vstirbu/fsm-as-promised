/*
 * @author Vlad Stirbu
 * @license MIT
 *
 * Copyright © 2014-2020
 */

import { FsmError } from './fsm-error';
import * as _ from 'lodash';
import { EventEmitter } from 'events';
import { v4 } from 'uuid';
import * as stampit from 'stampit';

const AssignFirstArgumentStamp = stampit.compose({
  init: function init(opts: StateMachineConfiguration) {
    Object.assign(this, opts);
  },
});

interface StateMachine extends EventEmitter {
  current: string;
  can(event: string): boolean;
  cannot(event: string): boolean;
  is(state: string): boolean;
  isFinal(state: string): boolean;
  hasState(state: string): boolean;
  instanceId(): string;
  [k: string]: any;
}

interface EventSpecification {
  name: string;
  from: string | string[];
  to: string | string[];
  condition?: {
    (args: any[]): string | number | Promise<string | number>;
  };
}

interface CallbackOptions {
  /**
   * Event name
   */
  name: string;
  from: string;
  to?: string;
  /**
   * Event arguments
   */
  args: any[];
  /**
   * Event returned value
   */
  res?: any;
}

interface StateMachineConfiguration {
  initial: string;
  final: string | string[];
  events: EventSpecification[];
  callbacks?: {
    [k: string]: {
      (options: CallbackOptions): void | Promise<void>;
    };
  };
  error?: {
    (
      message: string,
      options: {
        name: string;
        from: string;
      }
    ): Error;
  };
}

const StateMachineStamp = stampit.compose<StateMachine>({
  props: {
    // can be an object or an array
    events: [],
    pseudoStates: {},
    responses: {},
    pseudoEvents: {},
    callbacks: {},
    states: {},
    final: null,
    initial: 'none',
    current: 'none',
  },
  statics: {
    Promise: global.Promise || require('es6-promise').Promise,
    FsmError: FsmError,
    callbackPrefix: 'on',
    noChoiceFound: 'no-choice',
    type: function type(options: { from: string; to: string }) {
      var Type = this.Type;
      if (options.from === options.to || _.isUndefined(options.to)) {
        return Type.NOOP;
      } else if (options.from === '*') {
        return Type.GENERAL;
      }
      return Type.INTER;
    },
    Type: {
      NOOP: 0,
      INTER: 1,
      GENERAL: 2,
    },
    isConditional: function isConditional(event: EventSpecification) {
      return _.isFunction(event.condition) && _.isArray(event.to);
    },
    pseudoEvent: function pseudoEvent(state: string, name: string) {
      return state + '--' + name;
    },
  },
  methods: {
    emit: _.noop,
    error: function (msg, options) {
      if (this.target) {
        options.instanceId = this.target.instanceId();
      }

      throw new this.factory.FsmError(msg, options);
    },
    instanceErrorHandler: function instanceErrorHandler(
      err,
      instanceId,
      action
    ) {
      if (err instanceof this.factory.FsmError) {
        if (err.message === 'Invalid event in current state') {
          if (err.instanceId !== instanceId) {
            action();
          }
        } else {
          action();
        }
      } else {
        action();
      }
    },
    canTransition: function canTransition(options) {
      var factory = this.factory;
      var Type = factory.Type;

      switch (factory.type(options)) {
        case Type.NOOP:
          if (this.inTransition) {
            this.error('Previous transition pending', options);
          }
          break;
        case Type.INTER:
          if (_.size(this.states[this.current].noopTransitions) > 0) {
            options.pending = _.clone(
              this.states[this.current].noopTransitions
            );
            this.error('Previous transition pending', options);
          }
          if (this.inTransition) {
            this.error('Previous inter-state transition started', options);
          }
          this.inTransition = true;
          break;
        default:
      }

      return options;
    },
    can: function can(name) {
      return Boolean(this.events[name][this.current]);
    },
    cannot: function cannot(name) {
      return !this.can(name);
    },
    hasState: function hasState(state) {
      return Boolean(this.states[state]);
    },
    is: function is(state) {
      return state == this.current;
    },
    isFinal: function isFinal(state) {
      state = state || this.current;
      if (_.isArray(this.final)) {
        return _.includes(this.final, state);
      }
      return this.final === state;
    },
    isValidEvent: function isValidEvent(options) {
      if (this.cannot(options.name)) {
        this.error('Invalid event in current state', options);
      }

      return options;
    },
    // internal callbacks
    onenterstate: function onenterstate(options) {
      const factory = this.factory;
      const Type = this.factory.Type;

      switch (factory.type(options)) {
        case Type.NOOP:
          delete this.states[this.current].noopTransitions[options.id];
          break;
        default:
          this.inTransition = false;
          this.current = options.to;
          if (!this.pseudoStates[this.current]) {
            this.emit('state', this.current);
          }
      }

      return options;
    },
    onleavestate: function onleavestate(options) {
      var factory = this.factory;
      var Type = this.factory.Type;

      switch (factory.type(options)) {
        case Type.NOOP:
          this.states[this.current].noopTransitions[options.id] = options;
          break;
        default:
      }

      return options;
    },
    returnValue: function returnValue(options) {
      return options.res || options;
    },
    revert: function (options) {
      return function revert(err: Error) {
        var factory = this.factory;
        var Type = this.factory.Type;
        var instanceId = this.target.instanceId();

        switch (factory.type(options)) {
          case Type.INTER:
            this.instanceErrorHandler(err, instanceId, () => {
              this.inTransition = false;
            });
            break;
          case Type.NOOP:
            this.instanceErrorHandler(err, instanceId, () => {
              delete this.states[this.current].noopTransitions[options.id];
            });
            break;
          default:
        }

        throw err;
      };
    },

    // configure methods
    addEvents: function addEvents(events) {
      _.forEach(
        events,
        function (event: EventSpecification) {
          this.addEvent(event);
        }.bind(this)
      );
    },
    addEvent: function addEvent(event: EventSpecification) {
      this.events[event.name] = this.events[event.name] || {};

      //NOTE: Add the choice pseudo-state for conditional transition
      if (this.factory.isConditional(event)) {
        return this.addConditionalEvent(event);
      }
      this.addBasicEvent(event);
    },
    addBasicEvent: function addBasicEvent(event: EventSpecification) {
      if (_.isArray(event.to)) {
        this.error('Ambigous transition', event);
      }

      event.from = [].concat(event.from || []);

      _.forEach(
        event.from,
        function (from: string) {
          this.events[event.name][from] = event.to || from;
        }.bind(this)
      );
    },
    addConditionalEvent: function addConditionalEvent(event) {
      var pseudoState: string;
      var factory = this.factory;
      var callbackPrefix = factory.callbackPrefix;
      var noChoiceFound = factory.noChoiceFound;
      var pseudoEvent = factory.pseudoEvent;
      var Promise = factory.Promise;

      if (_.isArray(event.from)) {
        return _.forEach(
          event.from,
          function (from: string) {
            this.addConditionalEvent({
              name: event.name,
              from: from,
              to: event.to,
              condition: event.condition,
            });
          }.bind(this)
        );
      }
      pseudoState = event.from + '__' + event.name;

      this.pseudoStates[pseudoState] = event.from;

      this.addState(pseudoState);

      this.addEvent({
        name: event.name,
        from: event.from,
        to: pseudoState,
      });

      this.addEvent({
        name: pseudoEvent(pseudoState, noChoiceFound),
        from: pseudoState,
        to: event.from,
      });

      this.pseudoEvents[pseudoEvent(pseudoState, noChoiceFound)] = event.name;

      _.forEach(
        event.to,
        function (toState: string) {
          this.addEvent({
            name: pseudoEvent(pseudoState, toState),
            from: pseudoState,
            to: toState,
          });

          this.pseudoEvents[pseudoEvent(pseudoState, toState)] = event.name;
        }.bind(this)
      );

      this.callbacks[
        callbackPrefix + 'entered' + pseudoState
      ] = function (options: {
        name: string;
        from: string;
        to: string;
        args: any[];
      }) {
        var target = this.target;
        _.defaults(options, {
          args: [],
        });

        return new Promise(function (resolve: Function) {
          resolve(event.condition.call(target, options));
        }).then(
          function (index: number) {
            var toState;

            if (_.isNumber(index)) {
              toState = event.to[index];
            } else if (_.includes(event.to, index)) {
              toState = index;
            }
            if (_.isUndefined(toState)) {
              return target[pseudoEvent(pseudoState, noChoiceFound)]().then(
                this.error.bind(this, 'Choice index out of range', event)
              );
            } else {
              return target[pseudoEvent(pseudoState, toState)].apply(
                target,
                options.args
              );
            }
          }.bind(this)
        );
      }.bind(this);
    },
    addState: function addState(state) {
      var states = this.states;
      state = [].concat(state || []);
      state.forEach(function (name: string) {
        states[name] = states[name] || {
          noopTransitions: {},
        };
      });
    },
    preprocessPseudoState: function preprocessPseudoState(name, options) {
      var responses = this.responses;

      // transition to choice state in a conditional event
      Object.defineProperty(options, 'res', {
        get: function getRes() {
          return responses[name];
        },
        set: function setRes(value) {
          responses[name] = value;
        },
      });

      // reset previous results
      delete responses[name];

      return options;
    },
    preprocessPseudoEvent: function preprocessPseudoEvent(name, options) {
      // transition from choice state in a conditional event
      var pseudoEvent = this.pseudoEvents[name];
      var responses = this.responses;
      var pseudoStates = this.pseudoStates;
      var pOptions = {
        name: pseudoEvent,
        from: pseudoStates[this.current],
        to: options.to,
        args: options.args,
      };

      Object.defineProperties(pOptions, {
        res: {
          get: function () {
            return responses[pseudoEvent];
          },
          set: function (val) {
            responses[pseudoEvent] = val;
          },
        },
      });

      return pOptions;
    },
    buildEvent: function buildEvent(name) {
      var callbacks = this.callbacks;
      var pseudoEvents = this.pseudoEvents;
      var pseudoStates = this.pseudoStates;
      var events = this.events;
      var Type = this.factory.Type;
      var callbackPrefix = this.factory.callbackPrefix;

      return function triggerEvent() {
        var args = _.toArray(arguments);
        var current = this.current;
        var target = this.target;
        var options: {
          name: string;
          from: string;
          to: string;
          args: any[];
          id?: string;
        } = {
          name: name,
          from: current,
          to: events[name][current],
          args: args,
        };
        var pOptions;
        var isPseudo = pseudoEvents[name];

        if (options.from === options.to) {
          options.id = v4();
        }

        if (pseudoStates[options.to]) {
          options = this.preprocessPseudoState(name, options);
        }

        if (isPseudo) {
          pOptions = this.preprocessPseudoEvent(name, options);
        }

        return (
          new this.factory.Promise(function (resolve: Function) {
            resolve(options);
          })
            .then(this.isValidEvent.bind(this))
            .then(this.canTransition.bind(this))
            .then(
              callbacks[callbackPrefix + 'leave' + current]
                ? callbacks[callbackPrefix + 'leave' + current].bind(
                    target,
                    options
                  )
                : _.identity
            )
            .then(
              callbacks.onleave
                ? callbacks.onleave.bind(target, options)
                : _.identity
            )
            .then(this.onleavestate.bind(this, options))
            .then(
              callbacks[callbackPrefix + name]
                ? callbacks[callbackPrefix + name].bind(target, options)
                : _.identity
            )
            //in the case of the transition from choice pseudostate we provide
            // the options of the original transition
            .then(
              callbacks[callbackPrefix + 'enter' + events[name][current]]
                ? callbacks[
                    callbackPrefix + 'enter' + events[name][current]
                  ].bind(target, isPseudo ? pOptions : options)
                : _.identity
            )
            .then(
              callbacks.onenter && !pseudoStates[options.to]
                ? callbacks.onenter.bind(target, isPseudo ? pOptions : options)
                : _.identity
            )
            .then(this.onenterstate.bind(this, options))
            .then(
              callbacks[callbackPrefix + 'entered' + events[name][current]]
                ? callbacks[
                    callbackPrefix + 'entered' + events[name][current]
                  ].bind(target, isPseudo ? pOptions : options)
                : _.identity
            )
            .then(
              callbacks.onentered && !pseudoStates[options.to]
                ? callbacks.onentered.bind(
                    target,
                    isPseudo ? pOptions : options
                  )
                : _.identity
            )
            .then(this.returnValue.bind(this, options))
            .catch(this.revert(options).bind(this))
        );
      }.bind(this);
    },
    initTarget: function initTarget(target) {
      var mixin;
      const id = v4();

      if (!_.isObject(target)) {
        target = new EventEmitter();
      }

      if (_.isFunction(target.emit)) {
        this.emit = function emit() {
          return target.emit.apply(target, arguments);
        };
      }

      mixin = _.mapValues(
        this.events,
        function (event: EventSpecification, name: string) {
          return this.buildEvent(name);
        }.bind(this)
      );

      _.assign(target, mixin, {
        can: this.can.bind(this),
        cannot: this.cannot.bind(this),
        is: this.is.bind(this),
        hasState: this.hasState.bind(this),
        isFinal: this.isFinal.bind(this),
        instanceId: () => id,
      });

      Object.defineProperty(target, 'current', {
        get: function getCurrent() {
          return this.current;
        }.bind(this),
      });

      this.target = target;

      return target;
    },
  },
  init: function init(
    opts,
    { stamp, args }: { stamp: StateMachineConfiguration; args: any[] }
  ) {
    this.factory = stamp;

    this.states = {};

    var events = this.events;
    this.events = {};
    _.forEach(
      events,
      function (event: EventSpecification, name: string) {
        if (_.isString(name)) {
          event.name = name;
        }

        this.addEvent(event);

        //NOTE: Add states
        this.addState(event.from);
        this.addState(event.to);
      }.bind(this)
    );

    this.current = this.initial;
    // return this.initTarget(_.first(context.args));
    const target = this.initTarget(args[1]);

    return target;
  },
});

interface StateMachineFactory {
  (configuration: StateMachineConfiguration, target?: object): StateMachine;
}

const StateMachine: StateMachineFactory = stampit
  .compose(AssignFirstArgumentStamp)
  .compose<StateMachine>(StateMachineStamp);

export default StateMachine;
