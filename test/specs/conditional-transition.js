/* global expect */
/* global StateMachine */
var sinon = require('sinon');
module.exports = function (promise) {
  StateMachine.Promise = promise;

  describe('Conditional transition', function () {
    it('should initialize state machine', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: 'init',
            to: ['a', 'b'],
            condition: function () {},
          },
        ],
      });

      expect(fsm.current).to.be.equal('init');
      expect(fsm.hasState('init__start')).to.be.true;
      expect(fsm).to.have.ownProperty('init__start--a');
      expect(fsm).to.have.ownProperty('init__start--b');
      expect(fsm).to.have.ownProperty('init__start--no-choice');

      done();
    });

    describe('when the condition callback returns a numeric index', function () {
      it('should transition to first choice', function (done) {
        var fsm = StateMachine({
          initial: 'init',
          events: [
            {
              name: 'start',
              from: 'init',
              to: ['a', 'b'],
              condition: function (options) {
                return 0;
              },
            },
          ],
        });

        fsm.start().then(function () {
          expect(fsm.current).to.be.equal('a');

          done();
        });
      });

      it('should transition to second choice', function (done) {
        var fsm = StateMachine({
          initial: 'init',
          events: [
            {
              name: 'start',
              from: 'init',
              to: ['a', 'b'],
              condition: function (options) {
                return 1;
              },
            },
          ],
        });

        fsm.start().then(function () {
          expect(fsm.current).to.be.equal('b');

          done();
        });
      });
    });

    describe('when the condition callback returns a state name', function () {
      it('should transition to first choice', function (done) {
        var fsm = StateMachine({
          initial: 'init',
          events: [
            {
              name: 'start',
              from: 'init',
              to: ['a', 'b'],
              condition: function (options) {
                return 'a';
              },
            },
          ],
        });

        fsm.start().then(function () {
          expect(fsm.current).to.be.equal('a');

          done();
        });
      });

      it('should transition to second choice', function (done) {
        var fsm = StateMachine({
          initial: 'init',
          events: [
            {
              name: 'start',
              from: 'init',
              to: ['a', 'b'],
              condition: function (options) {
                return 'b';
              },
            },
          ],
        });

        fsm.start().then(function () {
          expect(fsm.current).to.be.equal('b');

          done();
        });
      });
    });

    it('should transition async to selected choice', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: 'init',
            to: ['a', 'b'],
            condition: function (options) {
              var promise = new StateMachine.Promise(function (
                resolve,
                reject
              ) {
                resolve(0);
              });

              return promise;
            },
          },
        ],
      });

      fsm.start().then(function () {
        expect(fsm.current).to.be.equal('a');

        done();
      });
    });

    it('should transition from multiple states', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: ['init', 'other'],
            to: ['a', 'b'],
            condition: function (options) {
              return 1;
            },
          },
        ],
      });

      fsm.start().then(function () {
        expect(fsm.current).to.be.equal('b');

        done();
      });
    });

    it('should receive the state machine object as the value of "this" ', function (done) {
      const conditionStub = sinon.stub().returns(1);
      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: 'init',
            to: ['a', 'b'],
            condition: conditionStub,
          },
        ],
      });
      fsm.start('test').then(function () {
        expect(conditionStub.thisValues[0]).to.eql(fsm);
        done();
      });
    });

    it('should receive original options object', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: 'init',
            to: ['a', 'b'],
            condition: function (options) {
              return 1;
            },
          },
        ],
        callbacks: {
          onenter: function (opts) {
            expect(opts.name).to.be.equal('start');
            expect(opts.from).to.be.equal('init');
            expect(opts.args).to.be.deep.equal(['test']);
          },
          onentered: function (opts) {
            expect(opts.name).to.be.equal('start');
            expect(opts.from).to.be.equal('init');
            expect(opts.args).to.be.deep.equal(['test']);
          },
          onenterb: function (opts) {
            expect(opts.name).to.be.equal('start');
            expect(opts.from).to.be.equal('init');
            expect(opts.to).to.be.equal('b');
            expect(opts.args).to.be.deep.equal(['test']);
          },
          onenteredb: function (opts) {
            expect(opts.name).to.be.equal('start');
            expect(opts.from).to.be.equal('init');
            expect(opts.to).to.be.equal('b');
            expect(opts.args).to.be.deep.equal(['test']);
          },
        },
      });

      fsm.start('test').then(function () {
        done();
      });
    });

    it('should receive response set in choice transition callback', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: 'init',
            to: ['a', 'b'],
            condition: function (options) {
              expect(options.res).to.be.equal('start');
              options.res = 'abc';
              return 0;
            },
          },
        ],
        callbacks: {
          onstart: function (options) {
            expect(options.res).to.be.undefined;
            options.res = 'start';
          },
          onentera: function (options) {
            expect(options.res).to.be.equal('abc');
            options.res = '123';
          },
          onentereda: function (options) {
            expect(options.res).to.be.equal('123');
            options.res = 'xyz';
          },
        },
      });

      fsm.start().then(function (result) {
        expect(result).to.be.equal('xyz');
        done();
      });
    });

    it('should clear response cache before run', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: 'init',
            to: ['init', 'a'],
            condition: function () {
              return 0;
            },
          },
        ],
        callbacks: {
          onstart: function (options) {
            expect(options.res).to.be.undefined;
            options.res = 'start';
          },
        },
      });

      fsm.start().then(function (result) {
        expect(result).to.be.equal('start');
        fsm.start().then(function (result) {
          expect(result).to.be.equal('start');
          done();
        });
      });
    });

    it('should throw error when out of choice index', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: 'init',
            to: ['a', 'b'],
            condition: function (options) {
              return 2;
            },
          },
        ],
      });

      fsm.start().catch(function (err) {
        expect(err.message).to.be.equal('Choice index out of range');
        expect(fsm.current).to.be.equal('init');

        done();
      });
    });

    it('should not call `onenter` and `onentered` in pseudo state', function (done) {
      var enterCalled = [];
      var enteredCalled = [];

      var fsm = StateMachine({
        initial: 'init',
        events: [
          {
            name: 'start',
            from: 'init',
            to: ['a', 'b'],
            condition: function (options) {
              return 0;
            },
          },
        ],
        callbacks: {
          onenter: function (options) {
            enterCalled.push(options.to);
          },
          onentered: function (options) {
            enteredCalled.push(options.to);
          },
        },
      });

      fsm
        .start()
        .then(function () {
          expect(enterCalled).to.be.deep.equal(['a']);
          expect(enteredCalled).to.be.deep.equal(['a']);

          done();
        })
        .catch(done);
    });
  });
};
