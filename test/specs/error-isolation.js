module.exports = function (promise) {
  StateMachine.Promise = promise;

  describe('FSM error isolation', function () {
    it('instance has unique id', function() {
      const config = {
        initial: 'here',
        events: [
          { name: 'stay', from: 'here' },
          { name: 'move', from: 'here', to: 'there' }
        ]
      };

      const fsm1 = StateMachine(config);
      const fsm2 = StateMachine(config);

      expect(fsm1.instanceId()).to.not.equal(fsm2.instanceId);
    });

    it('`Invalid event in current state` error has originating instance id property', function() {
      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'stay', from: 'here' },
          { name: 'move', from: 'here', to: 'there' },
          { name: 'rest', from: 'there' }
        ]
      });

      return fsm.rest().catch(err => {
        expect(err.message).to.equal('Invalid event in current state');
        expect(err.instanceId).to.equal(fsm.instanceId());
        return fsm.move();
      });
    });

    it('handle noop transition error from another fsm instance', function (done) {
      var other = StateMachine({
        initial: 'one',
        events: [
          { name: 'init', from: 'one', to: 'two' },
          { name: 'crash', from: 'two' }
        ]
      });

      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'stay', from: 'here' },
          { name: 'move', from: 'here', to: 'there' }
        ],
        callbacks: {
          onstay: function(opts) {
            // throws a FsmError from a different fsm instance
            return other.crash();
          }
        }
      });

      fsm.stay().catch((e) => {
        fsm.move()
        .then(() => {
          done();
        });
      });
    });

    it('handle inter transition error from another fsm instance', function () {
      var other = StateMachine({
        initial: 'one',
        events: [
          { name: 'init', from: 'one', to: 'two' },
          { name: 'crash', from: 'two' }
        ]
      });

      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'stay', from: 'here' },
          { name: 'move', from: 'here', to: 'there' },
          { name: 'run', from: 'here', to: 'there' },

        ],
        callbacks: {
          onmove: function(opts) {
            // throws a FsmError from a different fsm instance
            return other.crash();
          }
        }
      });

      return fsm.move().catch(() => fsm.run());
    });
  });
}
