'use strict';

const Vinyl = require('vinyl');
const through = require('through');
const PluginError = require('plugin-error');

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
    let target = new Vinyl({ path: filename, contents: new Buffer(`[${json}]`)});
    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);
};




