'use strict';

const map = require('map-stream');
const Prism = require('node-prismjs');
const cheerio = require('cheerio');

module.exports = function ({ selector }) {

  return map((file, next) => {
    const $ = cheerio.load(file.contents.toString(), { decodeEntities: false });

    $(selector).each((index, code) => {
      const elem = $(code);
      const language = elem.prop('data-lang');
      const fileContents = elem.html();
      const highlightedContents = Prism.highlight(fileContents,  Prism.languages[language] || Prism.languages.autoit);
      elem.parent().replaceWith( `<pre class="language-${language}">${highlightedContents}</pre>`);
      elem.addClass('highlights');
    });

    file.contents = new Buffer($.html());
    next(null, file)
  });
};
