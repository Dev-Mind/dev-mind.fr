'use strict';

const map = require('map-stream');
const Highlights = require('highlights');
const highlighter = new Highlights();
const cheerio = require('cheerio');

module.exports = function ({ selector }) {

  return map((file, next) => {
    const $ = cheerio.load(file.contents.toString(), { decodeEntities: false });
    $(selector).each((index, code) => {
      const elem = $(code);
      const fileContents = elem.html();
      const highlightedContents = highlighter.highlightSync({ fileContents, scopeName: 'source.js' });
      elem.parent().replaceWith(highlightedContents);
      elem.addClass('highlights');
    });

    file.contents = new Buffer($.html());
    next(null, file)
  });
};
