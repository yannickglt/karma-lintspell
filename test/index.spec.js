var index = require('../lib/index');
var preprocessor = require('../lib/preprocessor');
var reporter = require('../lib/reporter');

describe('Initialization', function () {
  it('should return the karma-lintspell plugin', function () {
    expect(index['preprocessor:lintspell']).toBeDefined();
    expect(index['reporter:lintspell']).toBeDefined();
  });

  it('should return the preprocessor', function () {
    var preprocessorConf = index['preprocessor:lintspell'];
    expect(preprocessorConf[0]).toBe('factory');
    expect(preprocessorConf[1]).toBe(preprocessor);
  });

  it('should return the reporter', function () {
    var reporterConf = index['reporter:lintspell'];
    expect(reporterConf[0]).toBe('type');
    expect(reporterConf[1]).toBe(reporter);
  });
});
