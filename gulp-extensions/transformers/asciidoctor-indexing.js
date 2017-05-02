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

  function iterateOnStream(file) {
    json.push({
      strdate: file.attributes.revdate,
      revdate: moment(file.attributes.revdate, 'YYYY-mm-DD').format('DD/mm/YYYY'),
      description: file.attributes.description,
      doctitle: file.attributes.doctitle,
      keywords: file.attributes.keywords,
      filename: file.path.substring(file.path.lastIndexOf("/") + 1, file.path.lastIndexOf(".")),
      category: file.attributes.category,
      teaser: file.attributes.teaser,
      imgteaser: file.attributes.imgteaser,
      dir: file.path.substring(file.path.lastIndexOf("blog/") + 5, file.path.lastIndexOf("/"))
    });
  }

  function endStream() {

    const comparator = (a, b) => {
      return -1 * a.strdate.localeCompare(b.strdate);
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



