var lintspellMap = require('../lib/lintspell-map');

describe('Initialization', function () {
  it('should be a singleton with the map methods', function () {
    expect(lintspellMap.get).toBeDefined();
    expect(lintspellMap.add).toBeDefined();
    expect(lintspellMap.reset).toBeDefined();
  });
});

describe('Methods', function () {
  it('should return the lintspell map', function () {
    expect(lintspellMap.get()).toEqual({});
  });

  it('should add a value to the lintspell map for the given key', function () {
    lintspellMap.add('key', 'value');
    expect(lintspellMap.get()).toEqual({ 'key': 'value' });
  });

  it('should reset the lintspell map', function () {
    lintspellMap.add('key', 'value');
    expect(lintspellMap.get()).toEqual({ 'key': 'value' });

    lintspellMap.reset();
    expect(lintspellMap.get()).toEqual({});
  });

});
