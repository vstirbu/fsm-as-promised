/*jshint -W030 */
describe('Advanced operations', function () {

  it('should trigger event with multiple "from" states for same event', function (done) {
    var fsm = StateMachine({
          initial: 'here',
          events: [
           { name: 'one', from: ['here', 'there'], to: 'somewhere' }
          ]
        });

    fsm.one().then(function () {
      expect(fsm.current).to.be.equal('somewhere');

      done();
    });
  });

  it('should trigger event with multiple "to" states for same event', function (done) {
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
    });
  });

  it('should trigger appropriately with multiple "from" and "to" transitions', function (done) {
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
    });
  });

});
