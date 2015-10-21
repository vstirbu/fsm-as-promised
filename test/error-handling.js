Object.keys(promises).forEach(function (promise) {
  StateMachine.Promise = promises[promise];

  describe('Graceful error recovery: ' + promise, function () {

    it('should recover from error in sync callback and continue transition', function (done) {
      StateMachine.Promise = promises[promise];
  
      var errorHandled = false,
          fsm = StateMachine({
            initial: 'green',
            events: [
              { name: 'warn',  from: 'green',  to: 'yellow' }
            ],
            callbacks: {
              onwarn: function (options) {
                try {
                  throw new Error('TestError');
                } catch (err) {
                  expect(err.message).to.be.equal('TestError');
                  errorHandled = true;
                  return options;
                }
              }
            }
          });
  
      fsm.warn().then(function () {
        expect(errorHandled).to.be.true;
        expect(fsm.current).to.be.equal('yellow');
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('should recover from error in async callback and continue transition', function (done) {
      StateMachine.Promise = promises[promise];
  
      var errorHandled = false,
          fsm = StateMachine({
            initial: 'green',
            events: [
              { name: 'warn',  from: 'green',  to: 'yellow' }
            ],
            callbacks: {
              onwarn: function (options) {
                return new StateMachine.Promise(function (resolve, reject) {
                  reject(new Error('TestError'));
                }).catch(function (err) {
                  expect(err.message).to.be.equal('TestError');
                  errorHandled = true;
                  return options;
                });
              }
            }
          });
  
      fsm.warn().then(function () {
        expect(errorHandled).to.be.true;
        expect(fsm.current).to.be.equal('yellow');
        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });
  
});
