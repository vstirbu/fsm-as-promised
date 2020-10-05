module.exports = function (promise) {
  StateMachine.Promise = promise;

  describe('Transition lifecycle with errors', function () {
    it('should remain in "from" state when error in onleave{stateName}', function (done) {
      StateMachine.Promise = promise;

      var errorHandled = false,
        fsm = StateMachine({
          initial: 'green',
          events: [{ name: 'warn', from: 'green', to: 'yellow' }],
          callbacks: {
            onleavegreen: function (options) {
              throw new Error('TestError');
            },
          },
        });

      fsm.warn().catch(function (err) {
        expect(fsm.current).to.be.equal('green');
        done();
      });
    });

    it('should remain in "from" state when error in onleave', function (done) {
      StateMachine.Promise = promise;

      var errorHandled = false,
        fsm = StateMachine({
          initial: 'green',
          events: [{ name: 'warn', from: 'green', to: 'yellow' }],
          callbacks: {
            onleave: function (options) {
              throw new Error('TestError');
            },
          },
        });

      fsm.warn().catch(function (err) {
        expect(fsm.current).to.be.equal('green');
        done();
      });
    });

    it('should revert to "from" state when error in on{eventName}', function (done) {
      StateMachine.Promise = promise;

      var errorHandled = false,
        fsm = StateMachine({
          initial: 'green',
          events: [{ name: 'warn', from: 'green', to: 'yellow' }],
          callbacks: {
            onwarn: function (options) {
              throw new Error('TestError');
            },
          },
        });

      fsm.warn().catch(function (err) {
        expect(fsm.current).to.be.equal('green');
        done();
      });
    });

    it('should revert to "from" state when error in onenter{stateName}', function (done) {
      StateMachine.Promise = promise;

      var errorHandled = false,
        fsm = StateMachine({
          initial: 'green',
          events: [{ name: 'warn', from: 'green', to: 'yellow' }],
          callbacks: {
            onenteryellow: function (options) {
              throw new Error('TestError');
            },
          },
        });

      fsm.warn().catch(function (err) {
        expect(fsm.current).to.be.equal('green');
        done();
      });
    });

    it('should revert to "from" state when error in onenter', function (done) {
      StateMachine.Promise = promise;

      var errorHandled = false,
        fsm = StateMachine({
          initial: 'green',
          events: [{ name: 'warn', from: 'green', to: 'yellow' }],
          callbacks: {
            onenter: function (options) {
              throw new Error('TestError');
            },
          },
        });

      fsm.warn().catch(function (err) {
        expect(fsm.current).to.be.equal('green');
        done();
      });
    });

    it('should move to "to" state when error in onentered{stateName}', function (done) {
      StateMachine.Promise = promise;

      var errorHandled = false,
        fsm = StateMachine({
          initial: 'green',
          events: [{ name: 'warn', from: 'green', to: 'yellow' }],
          callbacks: {
            onenteredyellow: function (options) {
              throw new Error('TestError');
            },
          },
        });

      fsm.warn().catch(function (err) {
        expect(fsm.current).to.be.equal('yellow');
        done();
      });
    });

    it('should move to "to" state when error in onentered', function (done) {
      StateMachine.Promise = promise;

      var errorHandled = false,
        fsm = StateMachine({
          initial: 'green',
          events: [{ name: 'warn', from: 'green', to: 'yellow' }],
          callbacks: {
            onentered: function (options) {
              throw new Error('TestError');
            },
          },
        });

      fsm.warn().catch(function (err) {
        expect(fsm.current).to.be.equal('yellow');
        done();
      });
    });
  });
};
