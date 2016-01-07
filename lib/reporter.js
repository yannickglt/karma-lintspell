var path = require('path');
var fs = require('fs');
var lintspellMap = require('./lintspell-map');

var LintSpellReporter = function (baseReporterDecorator, config, logger, helper) {
  var _ = helper._;
  var log = logger.create('lintspell');
  var lintSpellConfig = config.lintspellReporter || {};
  var outputFile = lintSpellConfig.file || 'lintspell.json';
  var expectations = lintSpellConfig.threshold || { global: { failures: false, failureRate: false }, perFile: {failures: false, failureRate: false }};
  var mainDir = lintSpellConfig.dir || config.dir;
  var subDir = lintSpellConfig.subdir || config.subdir;
  var pendingFileWritings = 0;
  var fileWritingFinished = _.noop;
  var failedExpectations = [];

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
      fileWritingFinished = logExpectations(done);
    } else {
      logExpectations(done);
    }
  };

  function logExpectations (done) {
    return function () {
      if (!_.isEmpty(failedExpectations)) {
        console.log(failedExpectations.join('\n'));
        log.error('Failed minimum lintspell expectations');
        process.exit(1);
      } else {
        done();
      }
    }
  }

  function generateOutputDir (browserName, dir, subdir) {
    dir = dir || 'lintspell';
    subdir = subdir || browserName;

    if (_.isFunction(subdir)) {
      subdir = subdir(browserName);
    }

    return path.join(dir, subdir);
  }

  function checkExpectations (numberOfFailures, failureRate, scope, file) {
    failureRate = Math.round(failureRate * 100, 2);
    scope = (scope === 'perFile') ? 'perFile' : 'global';

    var key = (scope === 'global') ? 'Global' : 'File "' + file + '"';
    var expectedFailures = _.get(expectations, scope + '.failures');
    var expectedFailureRate = _.get(expectations, scope + '.failureRate');

    if (_.isNumber(expectedFailures) && (numberOfFailures >= expectedFailures)) {
      failedExpectations.push(key + ': ' + numberOfFailures + ' failures, Threshold: ' + expectedFailures + ' failures');
    }
    else if (_.isNumber(expectedFailureRate) && (failureRate >= expectedFailureRate)) {
      failedExpectations.push(key + ': ' + failureRate + '% of failures, Threshold: ' + expectedFailureRate + '% of failures');
    }
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

    var failureRate = failures / (failures + successes);

    checkExpectations(failures, failureRate, 'global');

    return {
      summary: {
        successes: successes,
        failures: failures,
        failureRate: failureRate
      },
      files: _.mapValues(resultsByFile, function (results, file) {
        var failuresByFile = _(results)
          .filter('misspelled', true)
          .size();

        var successesByFile = _(results)
          .filter('misspelled', false)
          .size();

        var failureRateByFile = failuresByFile / (failuresByFile + successesByFile);

        checkExpectations(failuresByFile, failureRateByFile, 'perFile', file);

        return {
          summary: {
            successes: successesByFile,
            failures: failuresByFile,
            failureRate: failureRateByFile
          },
          detail: results
        };
      })
    };
  }
};

LintSpellReporter.$inject = ['baseReporterDecorator', 'config', 'logger', 'helper'];

module.exports = LintSpellReporter;
