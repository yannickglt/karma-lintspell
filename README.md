# karma-lintspell

> Check spelling of variables, strings and comments.

## Installation

The easiest way is to install `karma-lintspell` as a `devDependency`,
by running

```bash
npm install karma karma-lintspell --save-dev
```

## Configuration

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],
    
    plugins: ['karma-lintspell'],

    // lintspell reporter generates the spell checking report
    reporters: ['progress', 'lintspell'],

    preprocessors: {
      // source files, that you wanna check spelling for
      'src/**/*.js': ['lintspell']
    },

    // optionally, configure the reporter
    
    lintspellReporter: {
      skipWords: ['init', 'str', 'arg', 'fn'],
      dir: 'reports/lintspell/',
      color: false,
      hideSuccessful: false,
      file: 'spelling-report.json',
      threshold: { // Make the build failing if the number (or rate) of spelling mistakes exceed the threshold
        global: {
          failures: 200, // 200 spelling mistake
          failureRate: 10 // 10% of mistakes
        },
        perFile: {
          failureRate: 30 // 30% of mistakes per file
        }
      }
    }
    
  });
};
```

You can pass list of reporters as a CLI argument too:
```bash
karma start --reporters progress,lintspell
```

## Output
Example lintspell report: 
```javascript
{
  "summary": {
    "successes": 313,
    "failures": 28,
    "failureRate": 0.082111437
  },
  "files": {
    "./src/array.js": {
      "summary": {
        "successes": 17,
        "failures": 3,
        "failureRate": 0.15
      },
      "detail": [
        {
          "type": "identifier",
          "word": "prototype",
          "line": 1,
          "misspelled": false,
          "message": "No misspelled word"
        },
        {
          "type": "identifier",
          "word": "concat",
          "line": 9,
          "misspelled": true,
          "message": "You have a misspelled Identifier concat"
        },
        ...
      ]
    }
    ...
  }
}
```

## Threshold
Console output for threshold (if exceeded):
```bash
Global: 6% of failures, Threshold: 0% of failures
File "./src/array.js": 0% of failures, Threshold: 0% of failures
File "./src/function.js": 2% of failures, Threshold: 0% of failures
File "./src/number.js": 7% of failures, Threshold: 0% of failures
File "./src/math.js": 20% of failures, Threshold: 0% of failures
File "./src/string.js": 9% of failures, Threshold: 0% of failures
01 01 2016 01:23:45.678:ERROR [lintspell]: Failed minimum lintspell expectations
```
----

For more information on Karma see the [homepage](http://karma-runner.github.com).

karma-lintspell uses [lintspelljs](https://www.npmjs.com/package/lintspelljs) for source code checking which itself uses [hunspell-spellchecker](https://www.npmjs.com/package/hunspell-spellchecker) for spell checking.