'use strict';

const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const map = require('map-stream');

/**
 * This plugin is used to read the firebase index. The final aim is to generate static page for blog post
 * (everything has to be static for indexing bots)
 */
module.exports = (handlebarsTemplateFile, partials, blogIndexFile) => {

  if (!handlebarsTemplateFile) throw new PluginError('convert-to-blog-page', 'Missing source handlebarsTemplateFile for convert-to-blog-page');
  if (!blogIndexFile) throw new PluginError('convert-to-blog-page', 'Missing source blogIndexFile for convert-to-blog-page');
  if (!partials) throw new PluginError('convert-to-blog-page', 'Missing source partials for convert-to-blog-page');

  partials.forEach(partial => handlebars.registerPartial(partial.key, fs.readFileSync(path.resolve(__dirname, '../', partial.path), 'utf8')));
  const handlebarsTemplate = handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../', handlebarsTemplateFile), 'utf8'));

  const blogIndexPath = path.resolve(__dirname, '..', blogIndexFile);
  const blogIndex = JSON.parse(fs.readFileSync(blogIndexPath, 'utf8'));

  return map((file, next) => {
    // We need to find the previous blog post, the current and the next
    let previousPost;
    let nextPost;

    blogIndex
      .sort((a, b) => (a.strdate < b.strdate ? 1 : (a.strdate > b.strdate ? -1 : 0)))
      .forEach((elt, index, array) => {
        if (elt.filename === file.templateModel.filename()) {

          nextPost = index > 0 ? array[index - 1] : undefined;
          previousPost = index < array.length ? array[index + 1] : undefined;
        }
      });

    if (previousPost) {
      file.templateModel.previous = {
        dir: previousPost.dir,
        filename: previousPost.filename,
        doctitle: previousPost.doctitle
      };
    }
    if (nextPost) {
      file.templateModel.next = {
        dir: nextPost.dir,
        filename: nextPost.filename,
        doctitle: nextPost.doctitle
      };
    }

    file.templateModel.contents = file.contents.toString();
    file.contents = Buffer(handlebarsTemplate(file.templateModel));

    next(null, file);
  });
};






