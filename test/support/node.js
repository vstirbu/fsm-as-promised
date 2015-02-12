var StateMachine = require('../..'),
    chai = require('chai'),
    expect = chai.expect;

global.expect = chai.expect;
global.StateMachine = StateMachine;

global.promises = {
  Default: Promise || require('es6-promise').Promise,
  bluebird: require('bluebird'),
  RSVP: require('rsvp').Promise,
  Q: require('q').Promise,
  when: require('when').promise
};
