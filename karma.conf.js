var istanbul = require('browserify-istanbul');

module.exports = function (karma) {
  karma.set({

    files: [
      'lib/**/*.js',
      'test/**/*.spec.js'
    ],

    plugins: [
      require('karma-jasmine'),
      require('karma-browserify'),
      require('karma-phantomjs-launcher'),
      require('karma-spec-reporter'),
      require('karma-lintspell'),
      require('karma-coverage')
    ],

    preprocessors: {
      'lib/**/*.js': ['coverage','browserify'],
      'test/**/*.spec.js': ['browserify']
    },

    frameworks: ['jasmine', 'browserify'],

    reporters: ['progress', 'coverage', 'spec', 'lintspell'],

    coverageReporter: {
      type: 'lcovonly',
      dir: 'reports',
      subdir: 'coverage',
      file: 'lcov.info'
    },

    lintspellReporter: {
      skipWords: ['attrs', 'ctrls', 'formatters', 'noop', 'guid', 'unshift', 'eslint'],
      dir: 'reports/lintspell/',
      color: false,
      hideSuccessful: true,
      file: 'lintspell.json',
      minLength: 4,
      threshold: {
        global: {
          failures: 100
        }
      }
    },

    browsers: ['PhantomJS'],

    logLevel: 'LOG_DEBUG',

    singleRun: false,

    autoWatch: true,

    browserify: {
      debug: false,
      transform: ['brfs', 'browserify-shim', istanbul({
        ignore: ['**/node_modules/**', '**/test/**'],
        instrumenterConfig: {
          backdoor: {
            omitTrackerSuffix: true
          }
        }
      })]
    }

  });
};
