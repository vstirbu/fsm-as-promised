module.exports = function (promise) {
  StateMachine.Promise = promise;

  describe.only('Transition ID', function () {
    it('should exist for inter state transitions', function (done) {
      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'jump', from: 'here' }
        ],
        callbacks: {
          onjump: function (options) {
            expect(options.id).to.exist;
          }
        }
      });

      fsm.jump().then(function () {
        done();
      });
    });

    it('should not exist for inter state transitions', function (done) {
      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'jump', from: 'here', to: 'there' }
        ],
        callbacks: {
          onjump: function (options) {
            expect(options.id).to.be.undefined;
          }
        }
      });

      fsm.jump().then(function () {
        done();
      });
    });

    it('should be unique for different transitions of same event', function (done) {
      var ids = [];

      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'jump', from: 'here' }
        ],
        callbacks: {
          onjump: function(options) {
            ids.push(options.id);
          }
        }
      });

      fsm.jump().then(function () {
        fsm.jump().then(function () {
          expect(ids).to.have.length(2);
          expect(ids[0] !== ids[1]).to.be.true;

          done();
        });
      });
    });
  });
}
