/*jshint -W030 */
module.exports = function (promise) {
  describe('Advanced operations', function () {
  
    it('should trigger event with multiple "from" states for same event', function (done) {
      StateMachine.Promise = promise;
  
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

    it('should trigger event with multiple "from" states but no "to"', function (done) {
      StateMachine.Promise = promise;
  
      var fsm = StateMachine({
            initial: 'here',
            events: [
              { name: 'one', from: ['here', 'there'] }
            ]
          });
  
      fsm.one().then(function () {
        expect(fsm.current).to.be.equal('here');
  
        done();
      }).catch(function (err) {
        done(err);
      });
    });
  
    it('should trigger event with multiple "to" states for same event', function (done) {
      StateMachine.Promise = promise;
  
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
      StateMachine.Promise = promise;
  
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
      StateMachine.Promise = promise;
  
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
              onenterhungry: makeCallback('onenterhungry'),
  
              onleave: makeCallback('onleave'),
              onenter: makeCallback('onenter')
            }
          }),
          called = [];
  
      function makeCallback(name) {
        return function (options) {
          called.push(name);
        };
      }
  
      fsm.eat().then(function () {
        expect(called).to.be.deep.equal([ 'onleavehungry', 'onleave', 'oneat', 'onentersatisfied', 'onenter' ]);
  
        called = [];
        return fsm.eat();
      }).then(function () {
        expect(called).to.be.deep.equal([ 'onleavesatisfied', 'onleave', 'oneat', 'onenterfull', 'onenter' ]);
  
        called = [];
        return fsm.eat();
      }).then(function () {
        expect(called).to.be.deep.equal([ 'onleavefull', 'onleave', 'oneat', 'onentersick', 'onenter' ]);
  
        called = [];
        return fsm.rest();
      }).then(function () {
        expect(called).to.be.deep.equal([ 'onleavesick', 'onleave', 'onrest', 'onenterhungry', 'onenter' ]);
  
        called = [];
        return fsm.rest();
      }).then(function () {
        expect(called).to.be.deep.equal([ 'onleavehungry', 'onleave', 'onrest', 'onenterhungry', 'onenter' ]);
  
        done();
      }).catch(function (err) {
        done(err);
      });
    });
  
    it('should support spying', function() {
      var sinon = require('sinon');
  
      var fsm = StateMachine({
            initial: 'here',
            events: [
              { name: 'one', from: ['here', 'there'], to: 'somewhere' },
              { name: 'two', from: 'somewhere', to: 'here' }
            ]
          });
  
      expect(function() {
        sinon.spy(fsm, 'one');
      }).not.to.throw();
  
      return fsm.one()
        .then(function() {
          expect(fsm.one.callCount).to.equal(1);
          expect(fsm.current).to.equal('somewhere');
          fsm.one.restore();
          return fsm.two();
        })
        .then(function() {
          expect(fsm.current).to.equal('here');
          return fsm.one();
        })
        .then(function() {
          expect(fsm.current).to.equal('somewhere');
        });
    });
    
  });
}
