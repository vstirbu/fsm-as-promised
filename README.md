# Finite State Machine as Promised

A minimalistic finite state machine framework for browser and node implemented using [promises](http://promises-aplus.github.io/promises-spec/).

[![Build Status](https://travis-ci.org/vstirbu/fsm-as-promised.svg?branch=master)](https://travis-ci.org/vstirbu/fsm-as-promised) [![Code Climate](https://codeclimate.com/github/vstirbu/fsm-as-promised/badges/gpa.svg)](https://codeclimate.com/github/vstirbu/fsm-as-promised)

[![browser support](https://ci.testling.com/vstirbu/fsm-as-promised.png)
](https://ci.testling.com/vstirbu/fsm-as-promised)

## How to use

### Installation and Setup

#### In node

Run ```npm install fsm-as-promised``` to get up and running. Then:

```javascript
var StateMachine = require('fsm-as-promised');
```

#### In browser

Use manually with [browserify](http://browserify.org) for now...

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
    onentersomewhere: function () {
      // do something when entering state somewhere
    },
    onenteredsomewhere: function () {
      // do something after entering state somewhere
      // transaction is complete and events can be triggered safely
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

otherwise the finite state machine's initial state is 'none'.

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

### Call Order

The callbacks are called in the following order:

- onleave{stateName}
- on{eventName}
- onenter{stateName}
- onentered{stateName}

### Handling Errors

Errors thrown by any of the callbacks called during a transition are propagated through the promise chain and can be handled like this:

```javascript
fsm.jump().catch(function (err) {
  // do something with err...
});
```

## Contributing

Installing the library and run tests:

```
npm install
npm test
```

## License

The library is available under MIT license.

## Credits

The framework is heavily influenced by Jake Gordon's [javascript-state-machine](https://github.com/jakesgordon/javascript-state-machine).
