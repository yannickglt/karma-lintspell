var preprocessor = require('../lib/preprocessor');
var lintspellMap = require('../lib/lintspell-map');
var util = require('util');
var _ = require('lodash');
var helper = { _: _ };
var fs = require('fs');

describe('Preprocessor', function () {

  var process;
  var file = { originalPath: '/base/path/file/path' };
  var done = { callback: _.noop };
  var mockLogger = {
    create: function () {
      return {
        error: function () {
          throw new Error(util.format.apply, util, arguments)
        },
        warn: _.constant(null),
        info: _.constant(null),
        debug: _.constant(null)
      }
    }
  };

  beforeEach(function () {
    spyOn(lintspellMap, 'add').and.callThrough();
    spyOn(done, 'callback').and.callThrough();
  });

  it('should by lintspell checking if the lintspell reporter is not included', function () {
    var content = 'var invaleedName = 2;';

    process = preprocessor(mockLogger, helper, '/base/path', ['progress'], {});
    process(content, file, done.callback);

    expect(lintspellMap.add).not.toHaveBeenCalled();
    expect(done.callback).toHaveBeenCalledWith(content);

    var map = lintspellMap.get();
    expect(map).toEqual({});
  });

  it('should return empty lintspell results if there is no spelling error', function () {
    var content = 'var validName = 2;';

    process = preprocessor(mockLogger, helper, '/base/path', ['progress', 'lintspell'], {});
    process(content, file, done.callback);

    expect(lintspellMap.add).toHaveBeenCalled();
    expect(done.callback).toHaveBeenCalledWith(content);

    var map = lintspellMap.get();
    expect(_.first(_.keys(map))).toBe('./file/path');
    expect(map['./file/path']).toEqual([]);
  });

  it('should return the given error detail in the lintspell results', function () {
    var content = 'var invaleedName = 2;';

    process = preprocessor(mockLogger, helper, '/base/path', ['progress', 'lintspell'], {});
    process(content, file, done.callback);

    expect(lintspellMap.add).toHaveBeenCalled();
    expect(done.callback).toHaveBeenCalledWith(content);

    var map = lintspellMap.get();
    expect(_.first(_.keys(map))).toBe('./file/path');
    expect(map['./file/path']).toEqual([{
      type: 'identifier',
      word: 'invaleed',
      line: 1,
      misspelled: true,
      message: 'You have a misspelled Identifier invaleedName misspelled: invaleed'
    }]);
  });

  it('should sort the errors by line number', function () {
    var content = 'var invaleedName = 2; \n var value = "Anotha invalid string"';

    process = preprocessor(mockLogger, helper, '/base/path', ['progress', 'lintspell'], {});
    process(content, file, done.callback);

    expect(lintspellMap.add).toHaveBeenCalled();
    expect(done.callback).toHaveBeenCalledWith(content);

    var result = lintspellMap.get()['./file/path'];
    expect(result).toEqual([{
      type: 'identifier',
      word: 'invaleed',
      line: 1,
      misspelled: true,
      message: 'You have a misspelled Identifier invaleedName misspelled: invaleed'
    }, {
      line: 2,
      message: 'You have a misspelled word on a String anotha'
    }]);

    expect(result[0].line).toBeLessThan(result[1].line);

  });

});
