var StateMachine = require('../..'),
    chai = require('chai'),
    expect = chai.expect;

global.expect = chai.expect;
global.StateMachine = StateMachine;

global.promises = {
  Default: defaultPromise(),
  bluebird: require('bluebird'),
  ES6Shim: require('es6-shim').Promise,
  lie: require('lie'),
  RSVP: require('rsvp').Promise,
  Q: require('q').Promise,
  when: require('when').promise
};


function defaultPromise () {
  try {
    return Promise;
  } catch (e) {
    return require('es6-promise').Promise;
  }
}
