Object.keys(promises).forEach(function (promise) {

  describe('Initialisation: ' + promise, function () {

    it('should default to "none" state', function () {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
        events: [
          { name: 'start', from: 'one', to: 'another' }
        ]
      });

      expect(fsm.current).to.be.equal('none');
    });

    it('should initialize to provided state', function () {
      StateMachine.Promise = promises[promise];

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

    it('should throw error on transition with array value for \'to\'', function (done) {
      StateMachine.Promise = promises[promise];

      try {
        var fsm = StateMachine({
          initial: 'here',
          events: [
            { name: 'jump', from: 'here', to: ['here', 'there'] }
          ]
        });
      } catch (e) {
        expect(e.message).to.be.equal('Ambigous transition jump');

        done();
      }
    });

    it('should use the configured promise library', function (done) {
      StateMachine.Promise = promises[promise];

      fsm = StateMachine({
        initial: 'init',
        events: [
          { name: 'test', from: 'init' }
        ],
        callbacks: {
          ontest: function (options) {
            expect(StateMachine.Promise).to.be.deep.equal(promises[promise]);
          }
        }
      });

      fsm.test().then(function () {
        done();
      });
    });

    if (promise !== 'Default') {
      it('should use the promise library configured per fsm instance', function (done) {
        StateMachine.Promise = promises[promise];

        var usedPromise = StateMachine.Promise;

        fsm = StateMachine({
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


  });
});
