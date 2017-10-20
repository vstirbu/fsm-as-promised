// @ts-check

var StateMachine = require('../../');

StateMachine({
  initial: 'initial',
  final: ['final', 'end'],
  events: [
    { name: 'stay', from: 'initial' },
    { name: 'start', from: 'initial', to: 'final' },
    { name: 'conditional', from: 'initial', to: ['final', 'end'], condition: function () {}}
  ],
  callbacks: {
    onstart: function () {}
  }
});
