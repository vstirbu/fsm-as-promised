/*jshint -W030 */
describe('Basic operations', function () {

  it('should load standalone state machine', function (done) {
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
    })
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

    expect(fsm.current).to.be.equal('green');

    fsm.panic().catch(function (err) {
      expect(err.message).to.be.equal('Invalid event in current state');

      return fsm.calm();
    }).catch(function (err) {
      expect(err.message).to.be.equal('Invalid event in current state');

      return fsm.warn();
    }).then(function () {
      expect(fsm.current).to.be.equal('yellow');

      return fsm.warn();
    }).catch(function (err) {
      expect(err.message).to.be.equal('Invalid event in current state');

      return fsm.calm();
    }).catch(function (err) {
      expect(err.message).to.be.equal('Invalid event in current state');

      return fsm.panic();
    }).then(function () {
      expect(fsm.current).to.be.equal('red');

      return fsm.warn();
    }).catch(function (err) {
      expect(err.message).to.be.equal('Invalid event in current state');

      return fsm.panic();
    }).catch(function (err) {
      expect(err.message).to.be.equal('Invalid event in current state');

      done();
    });

  });

  it('should call callbacks with correct arguments', function (done) {
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
            },
            onwarn: function (options) {
              expect(options.args[0]).to.be.equal(a);
              expect(options.args[1]).to.be.equal(b);
            },
            onenteryellow: function (options) {
              expect(options.args[0]).to.be.equal(a);
              expect(options.args[1]).to.be.equal(b);
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
    var called = false,
        fsm = StateMachine({
          initial: 'green',
          events: [
            { name: 'warn',  from: 'green',  to: 'yellow' }
          ],
          callbacks: {
            onwarn: function (options) {
              return new Promise(function (resolve, reject) {
                called = true;
                resolve(options);
              });
            }
          }
        });

    fsm.warn().then(function () {
      expect(called).to.be.true;
      done();
    });
  });

  it('should call mixed sync & async callbacks', function (done) {
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
              return new Promise(function (resolve, reject) {
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
    });
  });

});
