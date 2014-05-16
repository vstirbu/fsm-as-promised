var StateMachine = require('../..'),
    Promise = Promise || require('es6-promise').Promise,
    chai = require('chai'),
    expect = chai.expect;

global.expect = chai.expect;
global.Promise = Promise;
global.StateMachine = StateMachine;
