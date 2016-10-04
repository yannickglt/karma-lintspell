var fs = require('fs');
var lintspelljs = require('lintspelljs');
var lintspellMap = require('./lintspell-map');

var LintSpellPreprocessor = function (logger, helper, basePath, reporters, lintSpellConfig) {
  var _ = helper._;
  var log = logger.create('preprocessor.lintspell');
  if (_.isEmpty(lintSpellConfig.dicts)) {
    lintSpellConfig.dicts = [{
        aff: fs.readFileSync(__dirname + '/../node_modules/lintspelljs/dicts/en_US.aff'),
        dic: fs.readFileSync(__dirname + '/../node_modules/lintspelljs/dicts/en_US.dic')
      },
      fs.readFileSync(__dirname + '/../dicts/english.dic'),
      fs.readFileSync(__dirname + '/../dicts/jetbrains.dic')
    ];
  }
  var spellChecker = new lintspelljs.JsSpellChecker(lintSpellConfig);

  // if lintspell reporter is not used, do not preprocess the files
  if (!_.includes(reporters, 'lintspell')) {
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
