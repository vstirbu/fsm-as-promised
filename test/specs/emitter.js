var EventEmitter = require('events').EventEmitter;

Object.keys(promises)
  .forEach(function (promise) {
    StateMachine.Promise = promises[promise];

    describe('Event emitter: ' + promise, function () {

      it('should emit events (new object)', function (done) {
        var states = [];

        var fsm = StateMachine({
          initial: 'here',
          events: [
            {
              name: 'jump',
              from: 'here',
              to: 'there'
            },
            {
              name: 'walk',
              from: 'there',
              to: 'here'
            }
          ],
          callbacks: {
            onenteredthere: function () {
            }
          }
        });

        fsm.on('state', function (newState) {
          expect(newState)
            .to
            .be
            .equal(fsm.current);
          states.push(newState);
        });

        fsm.jump()
          .then(function () {
            return fsm.walk();
          })
          .then(function () {
            expect(states)
              .to
              .be
              .deep
              .equal([
                'there',
                'here'
              ]);
            done();
          });
      });

      it('should emit events (target provided)', function (done) {
        var states = [];

        var fsm = StateMachine({
          initial: 'here',
          events: [
            {
              name: 'jump',
              from: 'here',
              to: 'there'
            },
            {
              name: 'walk',
              from: 'there',
              to: 'here'
            }
          ],
          callbacks: {
            onenteredthere: function () {
            }
          }
        }, new EventEmitter());

        fsm.on('state', function (newState) {
          expect(newState)
            .to
            .be
            .equal(fsm.current);
          states.push(newState);
        });

        fsm.jump()
          .then(function () {
            return fsm.walk();
          })
          .then(function () {
            expect(states)
              .to
              .be
              .deep
              .equal([
                'there',
                'here'
              ]);
            done();
          });
      });

    });
  });
