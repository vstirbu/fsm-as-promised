![Finite State Machine as Promised](https://raw.github.com/vstirbu/fsm-as-promised/master/fsm-as-promised.png)

A minimalistic finite state machine library for browser and node implemented using [promises](http://promises-aplus.github.io/promises-spec/).

[![NPM Version](https://img.shields.io/npm/v/fsm-as-promised.svg)](https://www.npmjs.com/package/fsm-as-promised)
[![NPM License](https://img.shields.io/npm/l/fsm-as-promised.svg)](https://www.npmjs.com/package/fsm-as-promised)
[![Build Status](https://travis-ci.org/vstirbu/fsm-as-promised.svg?branch=master)](https://travis-ci.org/vstirbu/fsm-as-promised)
[![Coverage Status](https://coveralls.io/repos/vstirbu/fsm-as-promised/badge.svg?branch=master&service=github)](https://coveralls.io/github/vstirbu/fsm-as-promised?branch=master)
[![Code Climate](https://codeclimate.com/github/vstirbu/fsm-as-promised/badges/gpa.svg)](https://codeclimate.com/github/vstirbu/fsm-as-promised)
[![NPM Downloads](https://img.shields.io/npm/dm/fsm-as-promised.svg)](https://www.npmjs.com/package/fsm-as-promised)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/vstirbu/fsm-as-promised?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)


- [How to use](#how-to-use)
  - [Installation and Setup](#installation-and-setup)
    - [In node](#in-node)
    - [In browser](#in-browser)
- [Configuring promise library](#configuring-promise-library)
- [Create finite state machine](#create-finite-state-machine)
  - [Define events](#define-events)
  - [Define callbacks](#define-callbacks)
  - [Initialisation options](#initialisation-options)
    - [Initial state](#initial-state)
    - [Final states](#final-states)
    - [Target](#target)
- [Callbacks](#callbacks)
  - [Arguments](#arguments)
  - [Synchronous](#synchronous)
  - [Asynchronous](#asynchronous)
  - [Call order](#call-order)
  - [Returned values](#returned-values)
    - [Passing data between callbacks](#passing-data-between-callbacks)
    - [Beyond the library boundary](#beyond-the-library-boundary)
  - [Configuring callback prefix](#configuring-callback-prefix)
- [Common Methods](#common-methods)
- [Handling Errors](#handling-errors)
  - [Graceful error recovery](#graceful-error-recovery)
- [Recipes](#recipes)
  - [Conditional transitions](#conditional-transitions)
- [UML visualization](#uml-visualization)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)

## How to use

### Installation and Setup

#### In node

Run ```npm install fsm-as-promised``` to get up and running. Then:

```javascript
var StateMachine = require('fsm-as-promised');
```

#### In browser

Use manually with [browserify](http://browserify.org) for now...

## Configuring promise library

```javascript
StateMachine.Promise = YourChoiceForPromise
```

You can choose from the following promise libraries:

* [bluebird](https://github.com/petkaantonov/bluebird),
* [lie](https://github.com/calvinmetcalf/lie),
* [native-promise-only](https://github.com/getify/native-promise-only),
* [pinkie](https://github.com/floatdrop/pinkie),
* [promise](https://github.com/then/promise),
* [RSVP](https://github.com/tildeio/rsvp.js),
* [Q](https://github.com/kriskowal/q),
* [when](https://github.com/cujojs/when).

If the environment does not provide ```Promise``` support, the default implementation is [es6-promise](https://github.com/jakearchibald/ES6-Promises).

The library works also with the promise implementation bundled with [es6-shim](https://github.com/paulmillr/es6-shim).

## Create finite state machine

A state machine object can be created by providing a configuration object:

```javascript
var fsm = StateMachine({
  events: [
    { name: 'wait', from: 'here'},
    { name: 'jump', from: 'here', to: 'there' },
    { name: 'walk', from: ['there', 'somewhere'], to: 'here' }
  ],
  callbacks: {
    onwait: function () {
      // do something when executing the transition
    },
    onleavehere: function () {
      // do something when leaving state here
    },
    onleave: function () {
      // do something when leaving any state
    },
    onentersomewhere: function () {
      // do something when entering state somewhere
    },
    onenter: function () {
      // do something when entering any state
    },
    onenteredsomewhere: function () {
      // do something after entering state somewhere
      // transition is complete and events can be triggered safely
    },
    onentered: function () {
      // do something after entering any state
      // transition is complete and events can be triggered safely
    }
  }
});
```

### Define events

The state machine configuration contains an array of event that convey information about what transitions are possible. Typically a transition is triggered by an event identified by _name_, and happens between _from_ and _to_ states.

### Define callbacks

The state machine configuration can define callback functions that are invoked when leaving or entering a state, or during the transition between the respective states. The callbacks must return promises or be thenable.

### Initialisation options

#### Initial state

You can define the initial state by setting the initial property:

```javascript
var fsm = StateMachine({
  initial: 'here',
  events: [
    { name: 'jump', from: 'here', to: 'there' }
  ]
});

console.log(fsm.current);
// here
```

otherwise the finite state machine's initial state is `none`.

#### Final states

You can define the final state or states by setting the final property:

```javascript
var fsm = StateMachine({
  initial: 'here',
  final: 'there', //can be a string or array
  events: [
    { name: 'jump', from: 'here', to: 'there' }
  ]
});
```

#### Target

An existing object can be augmented with a finite state machine:

```javascript
var target = {
      key: 'value'
    };

StateMachine({
  events: [
    { name: 'jump', from: 'here', to: 'there' }
  ],
  callbacks: {
    onjump: function (options) {
      // accessing target properties
      console.log(target.key === this.key);
    }
  }
}, target);

target.jump();
```

## Callbacks

### Arguments

The following arguments are passed to the callbacks:

```javascript
var fsm = StateMachine({
    events: [
      { name: 'jump', from: 'here', to: 'there' }
    ],
    callbacks: {
      onjump: function (options) {
        // do something with jump arguments
        console.log(options.args);

        // do something with event name
        console.log(options.name);

        // do something with from state
        console.log(options.from);

        // do something with to state
        console.log(options.to);

        return options;
      }
    }
  });

fsm.jump('first', 'second');
```

### Synchronous

You can define synchronous callbacks as long as the callback returns the options object that is going to be passed to the next callback in the chain:

```javascript
var fsm = StateMachine({
    events: [
      { name: 'jump', from: 'here', to: 'there' }
    ],
    callbacks: {
      onjump: function (options) {
        // do something

        return options;
      }
    }
  });

fsm.jump();
```

### Asynchronous

You can define asynchronous callbacks as long as the callback returns a new promise that resolves with the options object when the asynchronous operation is completed. If the asynchronous operation is unsuccessful, you can throw an error that will be propagated throughout the chain.

```javascript
var fsm = StateMachine({
    events: [
      { name: 'jump', from: 'here', to: 'there' }
    ],
    callbacks: {
      onjump: function (options) {
        return new Promise(function (resolve, reject) {
          // do something
          resolve(options);
        });
      }
    }
  });

fsm.jump();
```

### Call order

The callbacks are called in the following order:

| callback | state in which the callback executes | 
| --- | --- |
| onleave{stateName} | from |
| onleave | from |
| on{eventName} | _from_ |
| onenter{stateName} | _from_ |
| onenter | _from_ |
| onentered{stateName} | to |
| onentered | to |

A state is _locked_ if there is an ongoing transition between two different states. While the state is locked no other transitions are allowed.

If the transition is not successful (e.g. an error is thrown from any callback), the state machine returns to the state in which it is executed.

### Returned values

By default, each callback in the promise chain is called with the `options` object.
 
#### Passing data between callbacks

Callbacks can pass values that can be used by subsequent callbacks in the promise chain.

```javascript
var fsm = StateMachine({
  initial: 'one',
  events: [
    { name: 'start', from: 'one', to: 'another' }
  ],
  callbacks: {
    onleave: function (options) {
      options.foo = 2;
    },
    onstart: function (options) {
      // can use options.foo value here
      if (options.foo === 2) {
        options.foo++;
      }
    },
    onenter: function (options) {
      // options.foo === 3
    }
  }
});
```

This also includes callbacks added to the chain by the user.

```javascript
fsm.start().then(function (options) {
  // options.foo === 3
});
```

#### Beyond the library boundary

The `options` object can be hidden from the promises added by the end user by setting the __options.res__ property. This way the subsequent promises that are not part of the state machine work do not receive the `options` object.

```javascript
var fsm = StateMachine({
  initial: 'one',
  events: [
    { name: 'start', from: 'one', to: 'another' }
  ],
  callbacks: {
    onstart: function (options) {
      options.res = {
        val: 'result of running start'
      };
    }
  }
});

fsm.start().then(function (data) {
  console.log(data);
  // { val: 'result of running start' }
});
```

### Configuring callback prefix

By default, the callback names start with `on`. You can omit the prefix by setting it to empty string or assign any other prefix:

```javascript
StateMachine.callbackPrefix = 'customPrefix';
```

## Common Methods

The library adds the following utilities to the finite state machine object:

* `can(event)` checks if the _event_ can be triggered in the current state,
* `cannot(event)` checks if the _event_ cannot be triggered in the current state,
* `is(state)` checks if the _state_ is the current state,
* `isFinal(state)` checks if the _state_ is final state. If no state is provided the current state is checked. 
* `hasState(state)` checks if the finite state machine has the _state_.

## Handling Errors

Errors thrown by any of the callbacks called during a transition are propagated through the promise chain and can be handled like this:

```javascript
fsm.jump().catch(function (err) {
  // do something with err...
  // err.trigger - the event that triggered the error
  // err.current - the current state of the state machine
  // err.message - described bellow...
});
```

The library throws errors with the following messages:

| message | explanation | note |
| --- | --- | --- |
| Ambigous transition | The state machine has one transition that starts from one state and ends in multiple | must be fixed during design time |
| Previous transition pending | The previous transition is in progress preventing new ones until it has completed | - |
| Invalid event in current state | The state machine is in a state that does not allow the requested transition | - |

:warning: Unhandled errors may lead to inconsistent state machine.

### Graceful error recovery

It is not advisable to let the errors that can be handled gracefully at callback level to propagate to the end of the promise chain.

The following is an example where the error is handled inside a synchronous callback:

```javascript
var fsm = StateMachine({
  initial: 'green',
  events: [
    { name: 'warn',  from: 'green',  to: 'yellow' }
  ],
  callbacks: {
    onwarn: function (options) {
      try {
        throw new Error('TestError');
      } catch (err) {
        // handle error
        return options;
      }
    }
  }
});

fsm.warn().then(function () {
  fsm.current === 'yellow';
  // true
});
```

The same inside an asynchronous callback:

```javascript
var fsm = StateMachine({
  initial: 'green',
  events: [
    { name: 'warn',  from: 'green',  to: 'yellow' }
  ],
  callbacks: {
    onwarn: function (options) {
      return new StateMachine.Promise(function (resolve, reject) {
        reject(new Error('TestError'));
      }).catch(function (err) {
        // handle error
        return options;
      });
    }
  }
});
  
fsm.warn().then(function () {
  fsm.current === 'yellow';
  // true
})
```

## Recipes

### Conditional transitions

The library provides a way to define conditional transitions:

```javascript
StateMachine({
  events: [
    { name: 'conditional',
      from: 'init',
      to: ['one', 'two'],
      condition: function (options) {
        return 0; // transition to state 'one'
      }
    }
  ]
});
```

The above is equivalent to:

```javascript
StateMachine({
  events: [
    { name: 'conditional',
      from: 'init',
      to: ['one', 'two'],
      condition: function (options) {
        return 'one'; // transition to state 'one'
      }
    }
  ]
});
```

The condition callback must return the `to` Array's index of the selected state, the name of the selected state, or a promise which resolves to either.  The condition callback is executed after `on{eventName}` callback.

If the above is not suitable, complex conditional transitions can be achieved through transitioning explicitly to a pseuso state where the condition is checked, then the appropriate event is triggered:

```javascript
StateMachine({
  events: [
    { name: 'trigger', from: 'existing', to: 'pseudo' },
    { name: 'triggerOptionA', from: 'pseudo', to: 'option-a' },
    { name: 'triggerOptionB', from: 'pseudo', to: 'option-b' }
  ],
  callbacks: {
    onenteredpseudo: function () {
      if (condition) {
        this.triggerOptionA();
      } else {
        this.triggerOptionB();
      }
    }
  }
});
```

If your pseudo state's callback returns a Promise, you must return the call to the event function; e.g. `return this.triggerOptionA()`.

## UML visualization

The state machine definitions can be visualized as UML diagrams using [fsm2dot](https://github.com/vstirbu/fsm2dot).

Install fsm2dot and [graphviz](http://www.graphviz.org/), then:

```bash
fsm2dot -f fsm.js -o fsm.dot
dot -Tpdf fsm.dot -o fsm.pdf
```

## Contributing

Install the library and run tests:

```
npm install
npm test
```

## License

The library is available under the MIT license.

## Credits

The framework is heavily influenced by Jake Gordon's [javascript-state-machine](https://github.com/jakesgordon/javascript-state-machine).
