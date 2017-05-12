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
  if (!filename) throw new PluginError('asciidoctor-rss', 'Missing target filename for asciidoctor-rss');

  let xml = `
    <title>
        Le blog de Dev-Mind - articles sur le développement (Java, Web, ...) et différents sujets liés aux méthodes agiles.
    </title>
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
  `;

  function iterateOnStream(file) {
    let dir = file.path.substring(file.path.lastIndexOf("blog/") + 5, file.path.lastIndexOf("/"));
    xml += `
      <item>
        <link>
            https://www.dev-mind.fr/blog/${dir}/${file.path.substring(file.path.lastIndexOf("/") + 1, file.path.lastIndexOf("."))}.html
        </link>
        <title>${file.attributes.doctitle}</title>
        <description>${file.attributes.description}</description>
        <pubDate>${moment(file.attributes.revdate, 'YYYY-mm-DD').format('DD/mm/YYYY')}</pubDate>
        <enclosure url="https://www.dev-mind.fr/img/blog/${dir}/${file.attributes.teaser}" type="image/jpeg" length="76851"/>
      </item>
      `;
  }

  function endStream() {

    const comparator = (a, b) => {
      return -1 * a.strdate.localeCompare(b.strdate);
    };

    //We need to sort the different articles by dates
    let content = new Buffer(`<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
        <channel>${xml}</channel>
        </rss>
    `);

    let target = new gutil.File();

    target.path = filename;
    target.contents = content;

    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);
}




