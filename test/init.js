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

  });
});
