var lintspelljs = require('lintspelljs');
var lintspellMap = require('./lintspell-map');

var LintSpellPreprocessor = function (logger, helper, basePath, reporters, lintspellReporter) {
  var _ = helper._;
  var log = logger.create('preprocessor.lintspell');
  var spellChecker = new lintspelljs.JsSpellChecker(lintspellReporter);

  // if lintspell reporter is not used, do not preprocess the files
  if (!_.contains(reporters, 'lintspell')) {
    return function (content, _, done) {
      done(content);
    };
  }

  return function (content, file, done) {
    log.debug('Processing "%s".', file.originalPath);

    var jsPath = file.originalPath.replace(basePath + '/', './');

    var lintspellResults = spellChecker.checkString(content);
    lintspellResults.sort(function(a, b) {
        return a.line - b.line;
    });

    lintspellMap.add(jsPath, lintspellResults);

    done(content);
  };
};

LintSpellPreprocessor.$inject = [ 'logger', 'helper', 'config.basePath', 'config.reporters', 'config.lintspellReporter' ];

module.exports = LintSpellPreprocessor;
