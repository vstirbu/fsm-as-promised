/* global global, Promise */

global.StateMachine = require('../..');
global.expect = require('chai').expect;

try {
  global.defaultPromise = Promise;
} catch (e) {
  global.defaultPromise = require('es6-promise').Promise;
}
