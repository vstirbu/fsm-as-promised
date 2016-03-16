'use strict';

var stampit = require('stampit');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');

var EventEmittable = stampit.convertConstructor(EventEmitter)
  .static({
    /**
     * This is a hack around EventEmitter's own static init() function in
     * some newer node versions.
     * @returns {Object}
     */
    init: function init() {
      return this.enclose.apply(this, arguments);
    },
    /**
     * Mixes an EventEmittable into an existing object.
     * @param {Object} obj Any object
     * @returns {Object} The same object with new EventEmittable powers
     */
    assign: function assign (obj) {
      _.assign(obj, this.fixed.methods);
      return _.first(this.fixed.init)({instance: obj});
    }
  });

module.exports = EventEmittable;
