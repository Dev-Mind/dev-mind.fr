'use strict';

const gutil = require('gulp-util');
const through = require('through');
const PluginError = gutil.PluginError;

/**
 * This plugin writes the blog metadata in a local index
 */
module.exports = function (filename) {
  if (!filename) throw new PluginError('write-json', 'Missing target filename for convert-to-json');

  let json = [];

  function iterateOnStream(file) {
    json.push(JSON.stringify(file.indexData));
  }

  function endStream() {
    let target = new gutil.File();

    target.path = filename;
    target.contents = new Buffer(`[${json}]`);

    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);
};




