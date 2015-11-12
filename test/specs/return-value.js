/* global StateMachine */
module.exports = function (promise) {
  describe('Promise chain returned values', function () {
    
    StateMachine.Promise = promise;
    
    it('should return "options" if not set', function (done) {
      var result;
      
      var fsm = StateMachine({
        initial: 'one',
        events: [
          { name: 'start', from: 'one', to: 'another' }
        ],
        callbacks: {
          onstart: function (options) {
            result = options;
          }
        }
      });
      
      fsm.start().then(function (res) {
        expect(res).to.be.deep.equal(result);
        done();
      });
    });
    
    it('should return object if "options.res" set in a callback', function (done) {
      var result = {
        key: 'this is the result'
      };
      
      var fsm = StateMachine({
        initial: 'one',
        events: [
          { name: 'start', from: 'one', to: 'another' }
        ],
        callbacks: {
          onstart: function (options) {
            options.res = result;
          }
        }
      });
      
      fsm.start().then(function (res) {
        expect(res).to.be.deep.equal(result);
        done();
      });
    });

    it('should return last object if "options.res" set in multiple callbacks', function (done) {
      var result = {
        key: 'this is the result'
      };
      
      var fsm = StateMachine({
        initial: 'one',
        events: [
          { name: 'start', from: 'one', to: 'another' }
        ],
        callbacks: {
          onstart: function (options) {
            options.res = {
              key: 'not the one'
            };
          },
          onentered: function (options) {
            options.res = result;
          }
        }
      });
      
      fsm.start().then(function (res) {
        expect(res).to.be.deep.equal(result);
        done();
      });
    });
    
    it('should return properties of "options" set in callbacks', function (done) {
      var fsm = StateMachine({
        initial: 'one',
        events: [
          { name: 'start', from: 'one', to: 'another' }
        ],
        callbacks: {
          onleaveone: function (options) {
            options.onleaveone = 1;
          },
          onleave: function (options) {
            options.onleave = 2;
          },
          onstart: function (options) {
            options.onstart = 3;
          },
          onenteranother: function (options) {
            options.onenteranother = 4
          },
          onenter: function (options) {
            options.onenter = 5;
          },
          onenteredanother: function (options) {
            options.onenteredanother = 6;
          },
          onentered: function (options) {
            options.onentered = 7;
          }
        }
      });
      
      fsm.start().then(function (options) {
        expect(options.onleaveone).to.be.equal(1);
        expect(options.onleave).to.be.equal(2);
        expect(options.onstart).to.be.equal(3);
        expect(options.onenteranother).to.be.equal(4);
        expect(options.onenter).to.be.equal(5);
        expect(options.onenteredanother).to.be.equal(6);
        expect(options.onentered).to.be.equal(7);
        done();
      });
    });

    it('should return last property of "options" value updated in callbacks', function (done) {
      var fsm = StateMachine({
        initial: 'one',
        events: [
          { name: 'start', from: 'one', to: 'another' }
        ],
        callbacks: {
          onstart: function (options) {
            options._value = 3;
          },
          onentered: function (options) {
            expect(options._value).to.be.equal(3);
            options._value = 7;
          }
        }
      });
      
      fsm.start().then(function (options) {
        expect(options._value).to.be.equal(7);
        done();
      });
    });

  });
}