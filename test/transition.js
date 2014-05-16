describe('Transitions', function () {
  var StateMachine = require('..'),
      Promise = Promise || require('es6-promise').Promise,
      chai = require('chai'),
      chaiAsPromised = require('chai-as-promised'),
      expect = chai.expect,
      assert = chai.assert;

  it('should allow inter transition', function (done) {
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
    var fsm = StateMachine({
          initial: 'here',
          events: [
           { name: 'one', from: 'here' },
           { name: 'two', from: 'here', to: 'there' }
          ]
        });

    fsm.one().then(function () {
      done();
    });
  });

  it('should allow multiple nop transitions', function (done) {
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

  it('should throw error on intra when previous nop transition not completed', function (done) {
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

});
