/* global global */

var expect = require('chai').expect;
var chai = require('chai');
var chaiAsTyped = require('chai-as-typed');
var ts = require('typescript');

chai.use(chaiAsTyped);

describe('Intellisense', function () {
  it('should not give errors', function () {
    this.timeout(5000);

    expect(__dirname + '/intellisense/fsm.js').to.have.types.validated();
  });
});
