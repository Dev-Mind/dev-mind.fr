'use strict';

const reduce = require("stream-reduce");
const gutil = require('gulp-util');
const through = require('through');
const PluginError = gutil.PluginError;
const moment = require('moment');

/**
 * This plugin parse all the asciidoc files to build a Json index file with metadata
 */
module.exports = function (filename) {
  if (!filename) throw new PluginError('asciidoctor-indexing', 'Missing target filename for asciidoctor-indexing');

  const json = [];

  function collect(file) {
    json.push({
      revdate: file.attributes.revdate,
      description: file.attributes.description,
      doctitle: file.attributes.doctitle,
      keywords: file.attributes.keywords,
      filename: file.path.substring(file.path.lastIndexOf("/") + 1, file.path.length),
      category: file.attributes.category,
      teaser: file.attributes.teaser,
      imgteaser: file.attributes.imgteaser,
    });
    return json;
  }

  function iterateOnStream(file) {
    collect(file);
  }

  function endStream() {

    const comparator = (a, b) => {
      let momentA = moment(a.revdate, 'yyyy/mm/DD');
      let momentB = moment(b.revdate, 'yyyy/mm/DD');
      if (momentA.isAfter(momentB)) return -1;
      if (momentA.isBefore(momentB)) return 1;
      return 0;
    };

    //We need to sort the different articles by dates
    let content = new Buffer(JSON.stringify(json.sort(comparator)));
    let target = new gutil.File();

    target.path = filename;
    target.contents = content;

    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);
}



