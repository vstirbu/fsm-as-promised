/*jshint -W030 */
var sinon = require('sinon');
module.exports = function (promise) {
  describe('Basic operations', function () {

    it('should load standalone state machine', function (done) {
      StateMachine.Promise = promise;

      var fsm = StateMachine({
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' },
          { name: 'panic', from: 'yellow', to: 'red'    },
          { name: 'calm',  from: 'red',    to: 'yellow' },
          { name: 'clear', from: 'yellow', to: 'green'  }
        ]
      });

      expect(fsm.current).to.be.equal('green');
      fsm.warn().then(function () {
        expect(fsm.current).to.be.equal('yellow');

        return fsm.panic();
      }).then(function () {
        expect(fsm.current).to.be.equal('red');

        return fsm.calm();
      }).then(function () {
        expect(fsm.current).to.be.equal('yellow');

        return fsm.clear();
      }).then(function () {
        expect(fsm.current).to.be.equal('green');

        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('should load targeted state machine', function (done) {
      var fsm = {};

      StateMachine.Promise = promise;

      StateMachine({
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' },
          { name: 'panic', from: 'yellow', to: 'red'    },
          { name: 'calm',  from: 'red',    to: 'yellow' },
          { name: 'clear', from: 'yellow', to: 'green'  }
        ]
      }, fsm);

      expect(fsm.current).to.be.equal('green');
      fsm.warn().then(function () {
        expect(fsm.current).to.be.equal('yellow');

        return fsm.panic();
      }).then(function () {
        expect(fsm.current).to.be.equal('red');

        return fsm.calm();
      }).then(function () {
        expect(fsm.current).to.be.equal('yellow');

        return fsm.clear();
      }).then(function () {
        expect(fsm.current).to.be.equal('green');

        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('should access targeted state machine properties', function (done) {
      var fsm = {
            key: 'value'
          };

      StateMachine.Promise = promise;

      StateMachine({
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' }
        ],
        callbacks: {
          onleavegreen: function (options) {
            expect(this.key).to.be.equal('value');
          },
          onwarn: function (options) {
            expect(this.key).to.be.equal('value');
          },
          onenteryellow: function (options) {
            expect(this.key).to.be.equal('value');
          }
        }
      }, fsm);

      fsm.warn().then(function () {
        done();
      });
    });

    it('should indicate if can transition - can & cannot', function (done) {
      var fsm = StateMachine({
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' },
          { name: 'panic', from: 'yellow', to: 'red'    },
          { name: 'calm',  from: 'red',    to: 'yellow' }
        ]
      });

      StateMachine.Promise = promise;

      expect(fsm.current).to.be.equal('green');

      expect(fsm.can('warn')).to.be.true;
      expect(fsm.cannot('panic')).to.be.true;
      expect(fsm.cannot('calm')).to.be.true;

      fsm.warn().then(function () {
        expect(fsm.can('panic')).to.be.true;
        expect(fsm.cannot('calm')).to.be.true;
        expect(fsm.cannot('warn')).to.be.true;

        return fsm.panic();
      }).then(function () {
        expect(fsm.can('calm')).to.be.true;
        expect(fsm.cannot('panic')).to.be.true;
        expect(fsm.cannot('warn')).to.be.true;

        done();
      });
    });

    it('should find if state is the current state - is', function (done) {
      var fsm = StateMachine({
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' },
          { name: 'panic', from: 'yellow', to: 'red'    },
          { name: 'calm',  from: 'red',    to: 'yellow' },
          { name: 'clear', from: 'yellow', to: 'green'  }
        ]
      });

      StateMachine.Promise = promise;

      expect(fsm.is('green')).to.be.true;
      expect(fsm.is('yellow')).to.be.false;
      expect(fsm.is('red')).to.be.false;

      fsm.warn().then(function () {
        expect(fsm.is('green')).to.be.false;
        expect(fsm.is('yellow')).to.be.true;
        expect(fsm.is('red')).to.be.false;

        return fsm.panic();
      }).then(function () {
        expect(fsm.is('green')).to.be.false;
        expect(fsm.is('yellow')).to.be.false;
        expect(fsm.is('red')).to.be.true;

        done();
      });
    });

    it('should throw errors on inapropriate events', function (done) {
      var fsm = StateMachine({
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' },
          { name: 'panic', from: 'yellow', to: 'red'    },
          { name: 'calm',  from: 'red',    to: 'yellow' }
        ]
      });

      StateMachine.Promise = promise;

      expect(fsm.current).to.be.equal('green');

      fsm.panic().catch(function (err) {
        expect(err.message).to.be.equal('Invalid event in current state');
        expect(err.trigger).to.be.equal('panic');
        expect(err.current).to.be.equal(fsm.current);

        return fsm.calm();
      }).catch(function (err) {
        expect(err.message).to.be.equal('Invalid event in current state');
        expect(err.trigger).to.be.equal('calm');
        expect(err.current).to.be.equal(fsm.current);

        return fsm.warn();
      }).then(function () {
        expect(fsm.current).to.be.equal('yellow');

        return fsm.warn();
      }).catch(function (err) {
        expect(err.message).to.be.equal('Invalid event in current state');
        expect(err.trigger).to.be.equal('warn');
        expect(err.current).to.be.equal(fsm.current);

        return fsm.calm();
      }).catch(function (err) {
        expect(err.message).to.be.equal('Invalid event in current state');
        expect(err.trigger).to.be.equal('calm');
        expect(err.current).to.be.equal(fsm.current);

        return fsm.panic();
      }).then(function () {
        expect(fsm.current).to.be.equal('red');

        return fsm.warn();
      }).catch(function (err) {
        expect(err.message).to.be.equal('Invalid event in current state');
        expect(err.trigger).to.be.equal('warn');
        expect(err.current).to.be.equal(fsm.current);

        return fsm.panic();
      }).catch(function (err) {
        expect(err.message).to.be.equal('Invalid event in current state');
        expect(err.trigger).to.be.equal('panic');
        expect(err.current).to.be.equal(fsm.current);

        done();
      });

    });

    it('should call callbacks in proper order during transition events', function (done) {
      StateMachine.Promise = promise;

      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'walk', from: 'here', to: 'there' }
        ],
        callbacks: {
          onleavehere: function () {
            called.push('leavehere');
          },
          onwalk: function () {
            called.push('walk');
          },
          onenterthere: function () {
            called.push('enterthere');
          },
          onenteredthere: function () {
            called.push('enteredthere');
          },
          onleave: function () {
            called.push('leave');
          },
          onentered: function () {
            called.push('entered');
          },
          onenter: function () {
            called.push('enter');
          }
        }
      }),
      called = [];

      fsm.walk().then(function () {
        expect(called).to.be.deep.equal(['leavehere', 'leave', 'walk', 'enterthere', 'enter', 'enteredthere', 'entered']);
        done();
      });
    });

    it('should call callbacks in proper order during no-transition events', function (done) {
      StateMachine.Promise = promise;

      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'walk', from: 'here' }
        ],
        callbacks: {
          onleavehere: function () {
            called.push('leavehere');
          },
          onwalk: function (options) {
            called.push('walk');
            return options;
          },
          onenterhere: function () {
            called.push('enterhere');
          },
          onenteredhere: function () {
            called.push('enteredhere');
          },
          onleave: function () {
            called.push('leave');
          },
          onenter: function () {
            called.push('enter');
          },
          onentered: function () {
            called.push('entered');
          }
        }
      }),
      called = [];

      fsm.walk().then(function () {
        expect(called).to.be.deep.equal(['leavehere', 'leave', 'walk', 'enterhere', 'enter', 'enteredhere','entered']);

        done();
      });
    });

    it('should call callbacks with the value of "this" set to the state machine', function (done) {
      StateMachine.Promise = promise;
      const onWarnSpy = sinon.spy();
      var fsm = StateMachine({
        initial: 'green',
        events: [
          { name: 'warn',  from: 'green',  to: 'yellow' }
        ],
        callbacks: {
          onwarn: onWarnSpy,
        }
      });

      fsm.warn().then(function () {
        expect(onWarnSpy.thisValues[0]).to.eql(fsm);
        done();
      });
    });

    it('should call callbacks with correct arguments', function (done) {
      StateMachine.Promise = promise;

      var a = '1',
          b = '2',
          fsm = StateMachine({
            initial: 'green',
            events: [
              { name: 'warn',  from: 'green',  to: 'yellow' }
            ],
            callbacks: {
              onleavegreen: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              },
              onleave: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              },
              onenter: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              },
              onwarn: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              },
              onenteryellow: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              }
            }
          });

      fsm.warn(a, b).then(function () {
        done();
      });
    });

    it('should call with correct arguments when sync callbacks return undefined', function (done) {
      StateMachine.Promise = promise;

      var a = '1',
          b = '2',
          fsm = StateMachine({
            initial: 'green',
            events: [
              { name: 'warn',  from: 'green',  to: 'yellow' }
            ],
            callbacks: {
              onleavegreen: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              },
              onleave: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              },
              onenter: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              },
              onwarn: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              },
              onenteryellow: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return options;
              }
            }
          });

      fsm.warn(a, b).then(function (options) {
        expect(options.args[0]).to.be.equal(a);
        expect(options.args[1]).to.be.equal(b);

        done();
      });
    });

    it('should call with correct arguments when async callbacks return undefined', function (done) {
      StateMachine.Promise = promise;

      var a = '1',
          b = '2',
          fsm = StateMachine({
            initial: 'green',
            events: [
              { name: 'warn',  from: 'green',  to: 'yellow' }
            ],
            callbacks: {
              onleavegreen: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return makePromise;
              },
              onwarn: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return makePromise;
              },
              onenteryellow: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return makePromise;
              },
              onleave: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return makePromise;
              },
              onenter: function (options) {
                expect(options.args[0]).to.be.equal(a);
                expect(options.args[1]).to.be.equal(b);

                return makePromise;
              }
            }
          });

      function makePromise() {
        return new Promise(function (resolve, reject) {
          resolve();
        });
      }

      fsm.warn(a, b).then(function (options) {
        expect(options.args[0]).to.be.equal(a);
        expect(options.args[1]).to.be.equal(b);

        done();
      });
    });

    it('should call sync callback', function (done) {
      StateMachine.Promise = promise;

      var called = false,
          fsm = StateMachine({
            initial: 'green',
            events: [
              { name: 'warn',  from: 'green',  to: 'yellow' }
            ],
            callbacks: {
              onwarn: function (options) {
                called = true;
                return options;
              }
            }
          });

      fsm.warn().then(function () {
        expect(called).to.be.true;
        done();
      });
    });

    it('should call async callback', function (done) {
      StateMachine.Promise = promise;

      var called = false,
          fsm = StateMachine({
            initial: 'green',
            events: [
              { name: 'warn',  from: 'green',  to: 'yellow' }
            ],
            callbacks: {
              onwarn: function (options) {
                return new StateMachine.Promise(function (resolve, reject) {
                  called = true;
                  resolve(options);
                });
              }
            }
          });

      fsm.warn().then(function () {
        expect(called).to.be.true;
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('should call mixed sync & async callbacks', function (done) {
      StateMachine.Promise = promise;

      var called_async = false,
          called_sync = false,
          fsm = StateMachine({
            initial: 'green',
            events: [
              { name: 'warn',  from: 'green',  to: 'yellow' }
            ],
            callbacks: {
              onleavegreen: function (options) {
                called_sync = true;

                return options;
              },
              onwarn: function (options) {
                return new StateMachine.Promise(function (resolve, reject) {
                  called_async = true;

                  resolve(options);
                });
              }
            }
          });

      fsm.warn().then(function () {
        expect(called_async).to.be.true;
        expect(called_sync).to.be.true;
        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });
}
