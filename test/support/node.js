var StateMachine = require('../..'),
    chai = require('chai'),
    expect = chai.expect;

global.expect = chai.expect;
global.StateMachine = StateMachine;

global.promises = {
  bluebird: require('bluebird'),
  RSVP: require('rsvp').Promise,
  Q: require('q').Promise,
  when: require('when').promise
};

try {
  global.promises.Default = Promise;
} catch (e) {
  global.promises.Default = require('es6-promise').Promise;
}
