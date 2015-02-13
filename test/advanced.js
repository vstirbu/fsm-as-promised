/*jshint -W030 */
Object.keys(promises).forEach(function (promise) {

  describe('Advanced operations: ' + promise, function () {

    it('should trigger event with multiple "from" states for same event', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'here',
            events: [
             { name: 'one', from: ['here', 'there'], to: 'somewhere' }
            ]
          });

      fsm.one().then(function () {
        expect(fsm.current).to.be.equal('somewhere');

        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('should trigger event with multiple "to" states for same event', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'hungry',
            events: [
              { name: 'eat',  from: 'hungry',                                to: 'satisfied' },
              { name: 'eat',  from: 'satisfied',                             to: 'full'      },
              { name: 'eat',  from: 'full',                                  to: 'sick'      },
              { name: 'rest', from: ['hungry', 'satisfied', 'full', 'sick'], to: 'hungry'    },
            ]
          });

      expect(fsm.can('eat')).to.be.true;
      expect(fsm.can('rest')).to.be.true;

      fsm.eat().then(function () {
        expect(fsm.current).to.be.equal('satisfied');

        return fsm.eat();
      }).then(function () {
        expect(fsm.current).to.be.equal('full');

        return fsm.eat();
      }).then(function () {
        expect(fsm.current).to.be.equal('sick');

        return fsm.rest();
      }).then(function () {
        expect(fsm.current).to.be.equal('hungry');

        return fsm.rest();
      }).then(function () {
        expect(fsm.current).to.be.equal('hungry');

        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('should trigger multiple times events with no state transition', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
        initial: 'here',
        events: [
          { name: 'wait', from: 'here' },
          { name: 'watch', from: 'here' }
        ]
      });

      fsm.wait().then(function () {
        expect(fsm.current).to.be.equal('here');
        return fsm.watch();
      }).then(function () {
        expect(fsm.current).to.be.equal('here');
        done();
      }).catch(function (err) {
        done(err);
      });
    });

    it('should trigger appropriately with multiple "from" and "to" transitions', function (done) {
      StateMachine.Promise = promises[promise];

      var fsm = StateMachine({
            initial: 'hungry',
            events: [
              { name: 'eat',  from: 'hungry',                                to: 'satisfied' },
              { name: 'eat',  from: 'satisfied',                             to: 'full'      },
              { name: 'eat',  from: 'full',                                  to: 'sick'      },
              { name: 'rest', from: ['hungry', 'satisfied', 'full', 'sick'], to: 'hungry'    },
            ],
            callbacks: {
              oneat: makeCallback('oneat'),
              onrest: makeCallback('onrest'),

              onleavesatisfied: makeCallback('onleavesatisfied'),
              onleavefull: makeCallback('onleavefull'),
              onleavesick: makeCallback('onleavesick'),
              onleavehungry: makeCallback('onleavehungry'),

              onentersatisfied: makeCallback('onentersatisfied'),
              onenterfull: makeCallback('onenterfull'),
              onentersick: makeCallback('onentersick'),
              onenterhungry: makeCallback('onenterhungry')
            }
          }),
          called = [];

      function makeCallback(name) {
        return function (options) {
          called.push(name);
        };
      }

      fsm.eat().then(function () {
        expect(called).to.be.deep.equal([ 'onleavehungry', 'oneat', 'onentersatisfied' ]);

        called = [];
        return fsm.eat();
      }).then(function () {
        expect(called).to.be.deep.equal([ 'onleavesatisfied', 'oneat', 'onenterfull' ]);

        called = [];
        return fsm.eat();
      }).then(function () {
        expect(called).to.be.deep.equal([ 'onleavefull', 'oneat', 'onentersick' ]);

        called = [];
        return fsm.rest();
      }).then(function () {
        expect(called).to.be.deep.equal([ 'onleavesick', 'onrest', 'onenterhungry' ]);

        called = [];
        return fsm.rest();
      }).then(function () {
        expect(called).to.be.deep.equal([ 'onleavehungry', 'onrest', 'onenterhungry' ]);

        done();
      }).catch(function (err) {
        done(err);
      });
    });

  });
});
