# unreleased

# 0.16.0 / 2018-02-13

* added instanceId method to fsm object
* handle only `Invalid event in current state` thrown by own instance

# 0.15.1 / 2017-10-20

* set `final` configuration option type checking to optional

# 0.15.0 / 2017-10-20

* added intellisense type checking support

# 0.14.5 / 2017-09-08

* proper handling of subsequent inter state transitions (reported in #70)

# 0.14.4 / 2017-06-20

* gracefully handle invalid (initial) state (reported in #65)

# 0.14.3 / 2017-02-07

* improved error reporting:
  * `Previous transition pending` error thrown when one or more intr-state tansitions pending, includes also the details of the pending transitions
  * `Previous inter-state transition start` error when another inter-state transition has already started.

# 0.14.2 / 2016-10-28

* conditional pseudo states are silent and do not emit events or call `onenter` and `onentered`
* document event emiter functionality

# 0.14.1 / 2016-10-20

* bind condition function to `target` ([@yarandoo](https://github.com/yarandoo))

# 0.14.0 / 2016-10-16

* custom error handler ([@yarandoo](https://github.com/yarandoo))
* added emitter tests to runner

# 0.13.2 / 2016-09-30

* upgraded lodash and stampit dependencies
* dropped support for node 0.10 and 0.12

# 0.13.1 / 2016-09-12

* added documentation for common methods
* dropped iojs tests

# 0.13.0 / 2016-05-10

* added custom callback prefix support

# 0.12.0 / 2016-03-15

* FSM target is EventEmitter
* Reimplemented library using composable factories (aka [stampit](https://github.com/stampit-org/stampit))

# 0.11.0 / 2016-03-14

* Condition calback returns state name in conditional transitions

# 0.10.1 / 2016-02-24

* pass options.res corectly in conditional transitions 

# 0.10.0 / 2016-02-10

* added final configuration property
* added isFinal state machine object function

# 0.9.1 / 2016-01-31

* add captureStackTrace and expose FsmError ([dsuket](https://github.com/dsuket))

# 0.9.0 /

* Added support for conditional transitions
* Added hasState method

# 0.8.2 / 2016-01-04

* Added promise library support and updated dependencies

# 0.8.1 / 2015-12-09

* Added costom error with properties trigger and current to improve debugging

# 0.8.0

* Added transition shortcut

```javascript
{ name: 'event', from: ['state1', 'state2'] }
```

equivalent with:

```javascript
{ name: 'event', from: 'state1' }
{ name: 'event', from: 'state2' }
```

# 0.7.0

* Added option to pass cleaned values to promises add by the fsm user
* Added deocumentation on how to pass valuess between callbacks

# 0.6.1

* Improved transition lifecycle documetation and tests
* Added graceful error recovery documentation and tests

# 0.6.0 / 2015-10-19

* Make properties writable

# 0.5.2 / 2015-10-17

* Tested agains lie and Q libraries

# 0.5.1 / 2015-10-16

* Fixed warnings with Bluebird in debug mode

# 0.5.0 / 2015-08-24

* Added generic event hooks

# 0.4.1 / 2015-08-13

* Updated dependency on es6-promise

# 0.3.0 / 2015-02-13

* Added configurable support for promise libraries
* Tested against Bluebird, RSVP and when libraries

# 0.2.0 / 2014-09-21

* Added ```onentered{stateName}``` callback
