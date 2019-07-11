module.exports = function (promise) {

  describe('Initialisation', function () {

    it('should default to "none" state', function () {
      StateMachine.Promise = promise;

      var fsm = StateMachine({
        events: [
          { name: 'start', from: 'one', to: 'another' }
        ]
      });

      expect(fsm.current).to.be.equal('none');
    });

    it('should initialize to provided state', function () {
      StateMachine.Promise = promise;

      var fsm = StateMachine({
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' },
          { name: 'panic', from: 'yellow', to: 'red'    },
          { name: 'calm',  from: 'red',    to: 'yellow' },
          { name: 'clear', from: 'yellow', to: 'green'  }
      ]});

      expect(fsm.current).to.be.equal('green');
    });

    it('should accept an Object for events property', function () {
      StateMachine.Promise = promise;

      var fsm = StateMachine({
        events: {
          start: {
            from: 'one',
            to: 'another'
          }
        }
      });

      expect(fsm.start).to.be.a('function');
    });

    it('should throw error on transition with array value for \'to\'', function (done) {
      StateMachine.Promise = promise;

      try {
        var fsm = StateMachine({
          initial: 'here',
          events: [
            { name: 'jump', from: 'here', to: ['here', 'there'] }
          ]
        });
      } catch (e) {
        expect(e.message).to.be.equal('Ambigous transition');
        expect(e.trigger).to.be.equal('jump');
        expect(e.current).to.be.equal('here');

        done();
      }
    });

    it('should use the configured promise library', function (done) {
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
            expect(StateMachine.Promise).to.be.deep.equal(promise);
          }
        }
      });

      fsm.test().then(function () {
        done();
      });
    });
  });
}
