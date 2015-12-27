# karma-lintspell

> Check spelling of variables, strings and comments.

## Installation

The easiest way is to install `karma-lintspell` as a `devDependency`,
by running

```bash
npm install karma karma-lintspell --save-dev
```

## Configuration

For configuration details see [docs/configuration](docs/configuration.md).

## Examples

### Basic

```javascript
// karma.conf.js
module.exports = function(config) {
  config.set({
    files: [
      'src/**/*.js',
      'test/**/*.js'
    ],

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
      file: 'spelling-report.json'
    }
    
  });
};
```

----

For more information on Karma see the [homepage].


[homepage]: http://karma-runner.github.com
[Hunspell Spellchecker]: https://github.com/GitbookIO/hunspell-spellchecker