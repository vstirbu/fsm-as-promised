/* global expect */
/* global StateMachine */
module.exports = function (promise) {
  StateMachine.Promise = promise;

  describe('Conditional transition', function () {

    it('should initialize state machine', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          { name: 'start', from: 'init', to: ['a', 'b'], condition: function () {} }
        ]
      });
      
      expect(fsm.current).to.be.equal('init');
      expect(fsm.hasState('init__start')).to.be.true;
      expect(fsm).to.have.ownProperty('init__start--a');
      expect(fsm).to.have.ownProperty('init__start--b');
      expect(fsm).to.have.ownProperty('init__start--no-choice');
      
      done();
    });
    
    it('should transition to first choice', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          { name: 'start', from: 'init', to: ['a', 'b'], condition: function (options) {
            return 0;
          } }
        ]
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
          { name: 'start', from: 'init', to: ['a', 'b'], condition: function (options) {
            return 1;
          } }
        ]
      });
      
      fsm.start().then(function () {
        expect(fsm.current).to.be.equal('b');
      
        done();
      });
    });

    it('should transition async to selected choice', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          { name: 'start', from: 'init', to: ['a', 'b'], condition: function (options) {
            var promise = new StateMachine.Promise(function (resolve, reject) {
              resolve(0);
            });
            
            return promise;
          } }
        ]
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
          { name: 'start', from: ['init', 'other'], to: ['a', 'b'], condition: function (options) {
            return 1;
          } }
        ]
      });
      
      fsm.start().then(function () {
        expect(fsm.current).to.be.equal('b');
      
        done();
      });
    });
    
    it('should receive original options object', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          { name: 'start', from: 'init', to: ['a', 'b'], condition: function (options) {
            return 1;
          } }
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
          }
        }
      });
      
      fsm.start('test').then(function () {
        done();
      });
    });
    
    it('should throw error when out of choice index', function (done) {
      var fsm = StateMachine({
        initial: 'init',
        events: [
          { name: 'start', from: 'init', to: ['a', 'b'], condition: function (options) {
            return 2;
          } }
        ]
      });
      
      fsm.start().catch(function (err) {
        expect(err.message).to.be.equal('Choice index out of range');
        expect(fsm.current).to.be.equal('init');
      
        done();
      });
      
    });

  });
  
}
