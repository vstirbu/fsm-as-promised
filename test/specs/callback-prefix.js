module.exports = function (promise) {
  StateMachine.Promise = promise;

  describe('Callback prefix: ', function () {
    var prefix;

    before(function () {
      prefix = StateMachine.callbackPrefix;
    });

    after(function () {
      StateMachine.callbackPrefix = prefix;
    });

    it('should call callbacks with custom prefix', function (done) {
      StateMachine.callbackPrefix = 'prefix';

      var callbacks = [];

      var fsm = StateMachine({
        initial: 'here',
        events: [
          {
            name: 'jump',
            from: 'here',
            to: 'there',
          },
        ],
        callbacks: {
          prefixleavehere: function () {
            callbacks.push('leave');
          },
          prefixjump: function () {
            callbacks.push('event');
          },
          prefixenterthere: function () {
            callbacks.push('enter');
          },
          prefixenteredthere: function () {
            callbacks.push('entered');
          },
        },
      });

      fsm.jump().then(function () {
        expect(callbacks).to.be.deep.equal([
          'leave',
          'event',
          'enter',
          'entered',
        ]);
        done();
      });
    });

    it('should call callbacks with no prefix', function (done) {
      StateMachine.callbackPrefix = '';

      var callbacks = [];

      var fsm = StateMachine({
        initial: 'here',
        events: [
          {
            name: 'jump',
            from: 'here',
            to: 'there',
          },
        ],
        callbacks: {
          leavehere: function () {
            callbacks.push('leave');
          },
          jump: function () {
            callbacks.push('event');
          },
          enterthere: function () {
            callbacks.push('enter');
          },
          enteredthere: function () {
            callbacks.push('entered');
          },
        },
      });

      fsm.jump().then(function () {
        expect(callbacks).to.be.deep.equal([
          'leave',
          'event',
          'enter',
          'entered',
        ]);
        done();
      });
    });
  });
};
