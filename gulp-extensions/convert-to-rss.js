'use strict';

const gutil = require('gulp-util');
const through = require('through');
const PluginError = gutil.PluginError;
const moment = require('moment');
const rssMetadata = require('../src/metadata/rss');

/**
 * This plugin parse all the asciidoc files to build a Rss XML descriptor
 */
module.exports = function (filename) {

  if (!filename) throw new PluginError('convert-to-rss', 'Missing target filename for asciidoctor-rss');

  let xml= '';

  function iterateOnStream(file) {
    const content = file
      .map(metadata => `
          <item>
            <link>${rssMetadata.blogurl}/${metadata.dir}/${metadata.filename}.html</link>
            <title>${metadata.doctitle}</title>
            <description>${metadata.teaser}</description>
            <pubDate>${moment(metadata.revdate, 'YYYY-mm-DD').format('DD/mm/YYYY')}</pubDate>
            <enclosure url="${rssMetadata.blogimgurl}/${metadata.dir}/${metadata.imgteaser}"/>
          </item>
        `)
      .reduce((a, b) => a + b);

    xml = `
        <rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
            <channel>
                <title>${rssMetadata.title}</title>
                <description>${rssMetadata.description}</description>
                <copyright>${rssMetadata.copyright}</copyright>
                <link>${rssMetadata.blogurl}</link>
                <atom:link href="${rssMetadata.blogurl}" rel="self" type="application/rss+xml"/>
                <pubDate>${moment().format('YYYY-MM-DD hh:mm:ss')}</pubDate>
                <image>
                  <url>${rssMetadata.logourl}</url>
                  <title>${rssMetadata.shorttile}</title>
                  <link>${rssMetadata.blogurl}</link>
                </image>
                ${content}
            </channel>
        </rss>`;
    }

  function endStream() {
    let target = new gutil.File();
    target.path = filename;
    target.contents = new Buffer(xml);

    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);
};
