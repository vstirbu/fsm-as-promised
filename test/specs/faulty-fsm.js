module.exports = function (promise) {

  describe('Faulty FSMs', function () {

    it('should handle FSM with initial state having no events', function () {
      var fsm = StateMachine({
        initial: 'state-with-no-events',
        events: [
            { name: 'warn',  from: 'green',  to: 'red' },
            { name: 'clear', from: 'yellow', to: 'green' }
          ]
        });

      return fsm.warn().catch(err => {
        console.log(err);
        expect(err.message).to.equal('Invalid event in current state');
      });
    });
  });
};
