var path = require('path');
var fs = require('fs');
var lintspellMap = require('./lintspell-map');

var LintSpellReporter = function (baseReporterDecorator, config, logger, helper) {
  var _ = helper._;
  var log = logger.create('lintspell');
  var lintSpellConfig = config.lintspellReporter || {};
  var outputFile = lintSpellConfig.file || 'lintspell.json';
  var mainDir = lintSpellConfig.dir || config.dir;
  var subDir = lintSpellConfig.subdir || config.subdir;
  var pendingFileWritings = 0;
  var fileWritingFinished = _.noop;

  baseReporterDecorator(this);

  this.adapters = [function (msg) {
    process.stdout.write.bind(process.stdout)(msg + "\r\n");
  }];

  this.onBrowserComplete = function (browser) {
    var simpleOutputDir = generateOutputDir(browser.name, mainDir, subDir);
    var resolvedOutputDir = path.resolve(config.basePath, simpleOutputDir);
    var outputDir = helper.normalizeWinPath(resolvedOutputDir);
    var newOutputFile = path.join(outputDir, outputFile);

    pendingFileWritings++;
    helper.mkdirIfNotExists(path.dirname(newOutputFile), function () {
      var report = getReport(lintspellMap.get());
      fs.writeFile(newOutputFile, JSON.stringify(report, null, 2), function (err) {
        if (err) {
          log.warn('Cannot write lintspell JSON: ' + err.message)
        } else {
          log.debug('Lintspell results written to "%s".', newOutputFile)
        }

        if (!--pendingFileWritings) {
          fileWritingFinished()
        }
      });
    });
  };

  // wait for writing all the xml files, before exiting
  this.onExit = function (done) {
    if (pendingFileWritings) {
      fileWritingFinished = done;
    } else {
      done();
    }
  };

  function generateOutputDir (browserName, dir, subdir) {
    dir = dir || 'lintspell';
    subdir = subdir || browserName;

    if (_.isFunction(subdir)) {
      subdir = subdir(browserName);
    }

    return path.join(dir, subdir);
  }

  function getReport (resultsByFile) {

    var failures = _(resultsByFile)
      .values()
      .flatten(true)
      .filter('misspelled', true)
      .size();

    var successes = _(resultsByFile)
      .values()
      .flatten(true)
      .filter('misspelled', false)
      .size();

    return {
      summary: {
        successes: successes,
        failures: failures,
        failureRate: failures/(failures+successes)
      },
      files: _.mapValues(resultsByFile, function (results) {
        var failuresByFile = _(results)
          .filter('misspelled', true)
          .size();

        var successesByFile = _(results)
          .filter('misspelled', false)
          .size();

        return {
          summary: {
            successes: successesByFile,
            failures: failuresByFile,
            failureRate: failuresByFile/(failuresByFile+successesByFile)
          },
          detail: results
        };
      })
    };
  }
};

LintSpellReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper'];

module.exports = LintSpellReporter;
