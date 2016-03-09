module.exports = FsmError;

function FsmError(message, options) {
  Error.captureStackTrace(this, this.constructor);
  this.name = 'FsmError';
  this.message = message;
  this.trigger = options.name;
  this.current = options.from;
}

FsmError.prototype = Object.create(Error.prototype);
FsmError.prototype.constructor = FsmError;
