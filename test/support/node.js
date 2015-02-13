var StateMachine = require('../..'),
    chai = require('chai'),
    expect = chai.expect;

global.expect = chai.expect;
global.StateMachine = StateMachine;

global.promises = {
  Default: defaultPromise(),
  bluebird: require('bluebird'),
  RSVP: require('rsvp').Promise,
  // Q: require('q').Promise,
  when: require('when').promise
};


function defaultPromise () {
  try {
    return Promise;
  } catch (e) {
    return require('es6-promise').Promise;
  }
}
