'use strict';

const gutil = require('gulp-util');
const through = require('through');
const siteMetadata = require('../src/metadata/sitemap');

/**
 * This plugin parse indexes (blog + page) and create a sitemap for bot indexer
 */
module.exports = function () {

  let xml= ``;

  function createUrlNode(metadata){
    if(!!metadata.priority && metadata.priority < 0){
      return '';
    }
    if(metadata.blog){
      return `<url>
        <loc>${siteMetadata.url}/blog/${metadata.dir}/${metadata.filename}.html</loc>
        <changefreq>weekly</changefreq>
        <priority>0.3</priority>
        <news:news>
          <news:publication>
              <news:name>${siteMetadata.name}</news:name>
              <news:language>fr</news:language>
          </news:publication>
          <news:genres>Blog</news:genres>
          <news:publication_date>${metadata.revdate}</news:publication_date>
          <news:title>${metadata.doctitle}</news:title>
          <news:keywords>${metadata.keywords}</news:keywords>
          <news:stock_tickers>${metadata.category}</news:stock_tickers>
        </news:news>
    </url>`;
    }
    return `<url>
        <loc>${siteMetadata.url}/${metadata.filename}.html</loc>
        <changefreq>weekly</changefreq>
        <priority>${metadata.priority ? metadata.priority : 0.3}</priority>
    </url>`;
  }

  function iterateOnStream(file) {
    xml += file
      .map(metadata => createUrlNode(metadata))
      .reduce((a, b) => a + b);
  }

  function endStream() {
    let target = new gutil.File();
    target.path = 'sitemap.xml';

    target.contents = new Buffer(`<?xml version="1.0" encoding="UTF-8"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
        <url>
          <loc>${siteMetadata.url}/</loc>
          <changefreq>weekly</changefreq>
          <priority>1</priority>
        </url>
        <url>
          <loc>${siteMetadata.url}/blog.html</loc>
          <changefreq>weekly</changefreq>
          <priority>0.9</priority>
        </url>
        <url>
          <loc>${siteMetadata.url}/blog_archive.html</loc>
          <changefreq>weekly</changefreq>
          <priority>0.9</priority>
        </url>
        ${xml}
      </urlset>`);

    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);
};
