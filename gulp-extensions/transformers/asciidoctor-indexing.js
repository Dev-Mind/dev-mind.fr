'use strict';

const reduce = require("stream-reduce");
const gutil = require('gulp-util');
const through = require('through');
const PluginError = gutil.PluginError;

/**
 * This plugin parse all the asciidoc files to build a Json index file with metadata
 */
module.exports = function (filename) {
  if (!filename) throw new PluginError('asciidoctor-indexing', 'Missing target filename for asciidoctor-indexing');

  let json = '';

  function collect( file, json ){
    let metadata = {
      revdate: file.attributes.revdate,
      description: file.attributes.description,
      doctitle: file.attributes.doctitle,
      keywords: file.attributes.keywords,
      filename: file.path.substring(file.path.lastIndexOf("/") + 1, file.path.length),
      category: file.attributes.category
    };

    json += `${json.length ===0 ? '' : ','}${JSON.stringify(metadata)}`;
    return json;
  }

  function iterateOnStream(file) {
    json = collect(file, json);
  }

  function endStream() {
    let content = new Buffer(`[${json}]`);
    let target = new gutil.File();

    target.path = filename;
    target.contents = content;


    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);
}


