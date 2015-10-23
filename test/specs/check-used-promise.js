/* global expect */
/* global defaultPromise */
/* global StateMachine */
module.exports = function (promise) {
  it('should use the promise library configured per fsm instance', function (done) {
    StateMachine.Promise = promise;

    var usedPromise = StateMachine.Promise;

    var fsm = StateMachine({
      initial: 'init',
      events: [
        { name: 'test', from: 'init' }
      ],
      callbacks: {
        ontest: function (options) {
          expect(usedPromise).to.be.deep.equal(promise);
        }
      }
    });

    StateMachine.Promise = defaultPromise;

    fsm.test().then(function () {
      done();
    });
  });
}