'use strict';

const gutil = require('gulp-util');
const through = require('through');
const PluginError = gutil.PluginError;
const moment = require('moment');

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
            <link>
                https://www.dev-mind.fr/blog/${metadata.dir}/${metadata.filename}.html
            </link>
            <title>${metadata.doctitle}</title>
            <description>${metadata.teaser}</description>
            <pubDate>${moment(metadata.revdate, 'YYYY-mm-DD').format('DD/mm/YYYY')}</pubDate>
            <enclosure url="https://www.dev-mind.fr/img/blog/${metadata.dir}/${metadata.imgteaser}"/>
          </item>
        `)
      .reduce((a, b) => a + b);

    xml = `
        <rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
            <channel>
                <title>Le blog de Dev-Mind - articles sur le développement (Java, Web, ...) et différents sujets liés aux méthodes agiles.</title>
                <description>
                    Le blog Dev-Mind regroupe des articles des interviews sur des sujets divers allant de la programmation Java 
                    JavaScript aux méthodes agiles Environnement, Blogs ...
                </description>
                <copyright>Copyright Dev-Mind</copyright>
                <link>https://www.dev-mind.fr/rss/blog.xml</link>
                <atom:link href="https://www.dev-mind.fr/rss/blog.xml" rel="self" type="application/rss+xml"/>
                <pubDate>${moment().format('YYYY-MM-DD hh:mm:ss')}</pubDate>
                <image>
                  <url>https://www.dev-mind.fr/img/logo/logo_200.png</url>
                  <title>Le blog de Dev-Mind</title>
                  <link>https://www.dev-mind.fr/rss/blog.xml</link>
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
