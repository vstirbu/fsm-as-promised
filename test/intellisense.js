/* global global */

var expect = require('chai').expect;
var ts = require('typescript');

describe('Intellisense', function () {
  it('should not give errors', function () {
    this.timeout(5000);

    const options = {
      allowJs: true,
      noEmit: true,
      target: ts.ScriptTarget.ES5,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs
    };
    const program = ts.createProgram([__dirname + '/intellisense/fsm.js'], options);
    const results = program.emit();

    const diagnostics = ts.getPreEmitDiagnostics(program).concat(results.diagnostics);

    expect(diagnostics).to.have.length(0);
  });
});
