Object.keys(promises).forEach(function (promise) {

  describe('Transitions: ' + promise, function () {

    it('should allow inter transition', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: 'here' },
             { name: 'two', from: 'here', to: 'there' }
            ]
          });

      fsm.two().then(function () {
        done();
      });
    });

    it('should allow nop transition', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: 'here' },
             { name: 'two', from: 'here', to: 'there' }
            ]
          });

      fsm.one().then(function () {
        expect(fsm.current).to.be.equal('here');
        done();
      });
    });

    it('should allow multiple nop transitions', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: 'here' },
             { name: 'two', from: 'here' }
            ],
            callbacks: {
              onone: function (options) {
                called.push('one');
                fsm.two().then(function () {
                  expect(called).to.be.length(2);
                  expect(called).to.be.deep.equal(['one', 'two']);

                  done();
                });
              },
              ontwo: function (options) {
                called.push('two');
              }
            }
          }),
          called = [];

      fsm.one();
    });

    it('should throw error on nop when previous inter transition not completed', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: 'here' },
             { name: 'two', from: 'here', to: 'there' }
            ],
            callbacks: {
              ontwo: function (options) {
                fsm.one().catch(function (err) {
                  expect(err.message).to.be.equal('Previous transition pending');

                  done();
                });
              }
            }
          });

      fsm.two();
    });

    it('should throw error on inter when previous inter transition not completed', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: 'here' },
             { name: 'two', from: 'here', to: 'there' },
             { name: 'three', from: 'here', to: 'somewhere' }
            ],
            callbacks: {
              ontwo: function (options) {
                fsm.three().catch(function (err) {
                  expect(err.message).to.be.equal('Previous transition pending');

                  done();
                });
              }
            }
          });

      fsm.two();
    });

    it('should throw error on inter when previous nop transition not completed', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: 'here' },
             { name: 'two', from: 'here', to: 'there' }
            ],
            callbacks: {
              onone: function (options) {
                fsm.two().catch(function (err) {
                  expect(err.message).to.be.equal('Previous transition pending');

                  done();
                });
              }
            }
          });

      fsm.one();
    });

    it('should clean up failed inter transition', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: 'here' },
             { name: 'two', from: 'here', to: 'there' },
             { name: 'three', from: 'here', to: 'somewhere' }
            ],
            callbacks: {
              ontwo: function (options) {
                throw new Error('Transition error');
              }
            }
          });

      fsm.two().catch(function (err) {
        expect(err.message).to.be.equal('Transition error');
        fsm.three().then(function () {
          done();
        });
      });
    });

    it('should clean up failed noop transition', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: 'here' },
             { name: 'two', from: 'here', to: 'there' },
             { name: 'three', from: 'here', to: 'somewhere' }
            ],
            callbacks: {
              onone: function (options) {
                throw new Error('Transition error');
              }
            }
          });

      fsm.one().catch(function (err) {
        expect(err.message).to.be.equal('Transition error');
        fsm.three().then(function () {
          done();
        });
      });
    });

    it('should trigger new transition immediately when entered a state', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'walk', from: 'here', to: 'there' },
          { name: 'jump', from: 'there', to: 'somewhere' }
        ],
        callbacks: {
          onenteredthere: function (options) {
            if (this.condition) {
              this.jump().then(function () {
                expect(fsm.is('somewhere')).to.be.true;
                expect(called).to.be.deep.equal([ 'walk', 'jump' ]);

                done();
              }).catch(done);
            }
          },
          onjump: function (options) {
            called.push(options.name);
          },
          onwalk: function (options) {
            called.push(options.name);
          }
        }
      }),
      called = [];

      fsm.condition = true;

      fsm.walk();
    });

    it('should trigger inter state transition after specific no-transition event', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'sit', from: 'here' },
          { name: 'think', from: 'here'},
          { name: 'walk', from: 'here', to: 'there' }
        ],
        callbacks: {
          onenteredhere: function (options) {
            if (options.name === 'sit') {
              expect(called).to.be.deep.equal(['think', 'sit']);
              this.walk();
            }
          },
          onenteredthere: function () {
            expect(called).to.be.deep.equal(['think', 'sit', 'walk']);

            done();
          },
          onsit: function () {
            called.push('sit');
          },
          onwalk: function () {
            called.push('walk');
          },
          onthink: function () {
            called.push('think');
          }
        }
      }),
      called = [];

      fsm.think().then(function () {
        expect(called).to.be.deep.equal(['think']);

        fsm.sit();
      });
    });

  });
});
