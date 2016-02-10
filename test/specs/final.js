module.exports = function (promise) {
  StateMachine.Promise = promise;

  describe('isFinal', function () {
    describe('single final state', function () {
      it('should report if current state is final', function (done) {
        var fsm = StateMachine({
          initial: 'start',
          final: 'end',
          events: [
            { name: 'go',  from: 'start',  to: 'end' }
        ]});

        expect(fsm.isFinal()).to.be.false;
        fsm.go().then(function () {
          expect(fsm.isFinal()).to.be.true;
          done();
        });
      });

      it('should report if provided state is final', function () {
        var fsm = StateMachine({
          initial: 'start',
          final: 'end',
          events: [
            { name: 'go',  from: 'start',  to: 'end' }
        ]});

        expect(fsm.isFinal('start')).to.be.false;
        expect(fsm.isFinal('end')).to.be.true;
      });
    });
    
    describe('multiple final states', function () {
      it('should report if current state is final', function (done) {
        var fsm = StateMachine({
          initial: 'start',
          final: ['end1', 'end2'],
          events: [
            { name: 'go1',  from: 'start',  to: 'end1' },
            { name: 'go2',  from: 'start',  to: 'end2' }
        ]});

        expect(fsm.isFinal()).to.be.false;
        fsm.go1().then(function () {
          expect(fsm.isFinal()).to.be.true;
          done();
        });
      });

      it('should report if provided state is final', function () {
        var fsm = StateMachine({
          initial: 'start',
          final: ['end1', 'end2'],
          events: [
            { name: 'go1',  from: 'start',  to: 'end1' },
            { name: 'go2',  from: 'start',  to: 'end2' }
        ]});

        expect(fsm.isFinal('start')).to.be.false;
        expect(fsm.isFinal('end1')).to.be.true;
        expect(fsm.isFinal('end2')).to.be.true;
      });
    });
  });
}
