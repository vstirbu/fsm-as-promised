describe('Initialisation', function () {
  var StateMachine = require('..'),
      Promise = Promise || require('es6-promise').Promise,
      chai = require('chai'),
      expect = chai.expect;

  it('should default to "none" state', function () {
    var fsm = StateMachine({
      events: [
        { name: 'start', from: 'one', to: 'another' }
      ]
    });

    expect(fsm.current).to.be.equal('none');
  });

  it('should initialize to provided state', function () {
    var fsm = StateMachine({
      initial: 'green',
      events: [
        { name: 'warn',  from: 'green',  to: 'yellow' },
        { name: 'panic', from: 'yellow', to: 'red'    },
        { name: 'calm',  from: 'red',    to: 'yellow' },
        { name: 'clear', from: 'yellow', to: 'green'  }
    ]});

    expect(fsm.current).to.be.equal('green');
  });

});
