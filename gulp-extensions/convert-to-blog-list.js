'use strict';

const Vinyl = require('vinyl');
const PluginError = require('plugin-error');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const through = require('through');
const pages = require('../src/metadata/blog');
/**
 * This plugin is used to read the firebase index. The final aim is to generate static page for blog post list
 * (everything has to be static for indexing bots)
 */
module.exports = (handlebarsTemplateFile, partials, filename, nbArticleMax) => {
  if (!handlebarsTemplateFile) throw new PluginError('convert-to-blog-list',
                                                     'Missing source handlebarsTemplateFile for convert-to-blog-list');
  if (!filename) throw new PluginError('convert-to-blog-list', 'Missing target filename for convert-to-blog-list');
  if (!partials) throw new PluginError('convert-to-blog-list', 'Missing source partials for convert-to-blog-list');

  partials.forEach(partial => handlebars.registerPartial(partial.key,
                                                         fs.readFileSync(path.resolve(__dirname, '../', partial.path),
                                                                         'utf8')));
  const handlebarsTemplate = handlebars.compile(
    fs.readFileSync(path.resolve(__dirname, '../', handlebarsTemplateFile), 'utf8'));

  const metadata = {
    keywords: () => pages[filename].keywords,
    title: () => pages[filename].title,
    description: () => pages[filename].description,
    gendate: () => moment().format('DD/MM/YYYY'),
    canonicalUrl: () => filename
  };

  function iterateOnStream(file) {
    const blogIndex = file
      .map(a => {
        a.date = a.revdate.substring(8, 10) + '/' + a.revdate.substring(5, 7) + '/' + a.revdate.substring(0, 4);
        return a;
      })
      .sort((a, b) => (a.strdate < b.strdate ? 1 : (a.strdate > b.strdate ? -1 : 0)));

    if (nbArticleMax) {
      metadata.firstArticle = () => blogIndex[0];
      metadata.secondArticles = () => blogIndex.filter((e, index) => index > 0 && index <= nbArticleMax);
      metadata.otherArticles = () => blogIndex.filter((e, index) => index > nbArticleMax);
      metadata.last15Articles = () => blogIndex.filter((e, index) => index < 10);
    }
    else {
      metadata.articleByYears = [];

      const years = blogIndex
        .map(article => moment(article.strdate).format("YYYY"))
        .filter((value, index, array) => array.indexOf(value) === index)
        .sort((a, b) => a < b ? 1 : -1)
        .forEach(year => metadata.articleByYears.push({
                                                        key: year,
                                                        value: []
                                                      }));

      blogIndex.forEach(article => metadata
        .articleByYears
        .filter(year => year.key === moment(article.strdate).format("YYYY"))[0]
        .value
        .push(article)
      );
    }
  }

  function endStream() {
    let target = new Vinyl({ path: filename, contents: new Buffer(handlebarsTemplate(metadata))});
    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);

};
