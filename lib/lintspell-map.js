var lintspellMap = {};

function add(path, lintspellResults) {
  lintspellMap[path] = lintspellResults;
}

function get() {
  return lintspellMap;
}

function reset() {
  lintspellMap = {};
}

module.exports = {
  add: add,
  get: get,
  reset: reset
};
