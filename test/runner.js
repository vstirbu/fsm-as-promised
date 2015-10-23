/* global defaultPromise */
/* global global */
var expect = require('chai').expect;

var init = require('./specs/init');
var basic = require('./specs/basic');
var advanced = require('./specs/advanced');
var transition = require('./specs/transition');
var errorHandling = require('./specs/error-handling');
var transitionLifecycle = require('./specs/transition-lifecycle');

var promises = {
  Default: defaultPromise,
  bluebird: require('bluebird'),
  ES6Shim: require('es6-shim').Promise,
  lie: require('lie'),
  RSVP: require('rsvp').Promise,
  Q: require('q').Promise,
  when: require('when').promise
};


Object.keys(promises).forEach(function (promise) {
  describe('Promise library: ' + promise, function () {
    
    if (promise !== 'Default') {
      it('should use the promise library configured per fsm instance', function (done) {
        StateMachine.Promise = promises[promise];

        var usedPromise = StateMachine.Promise;

        var fsm = StateMachine({
          initial: 'init',
          events: [
            { name: 'test', from: 'init' }
          ],
          callbacks: {
            ontest: function (options) {
              expect(usedPromise).to.be.deep.equal(promises[promise]);
            }
          }
        });

        StateMachine.Promise = promises.Default;

        fsm.test().then(function () {
          done();
        });
      });
    }
    
    init(promises[promise]);
    basic(promises[promise]);
    advanced(promises[promise]);
    transition(promises[promise]);
    errorHandling(promises[promise]);
    transitionLifecycle(promises[promise]);
  })
});
