'use strict';

const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const map = require('map-stream');

/**
 * This plugin is used to read the firebase index. The final aim is to generate static page for blog post
 * (everything has to be static for indexing bots)
 */
module.exports = (mustacheTemplateFile, partials, blogIndexFile) => {

  if (!mustacheTemplateFile) throw new PluginError('convert-to-blog-page', 'Missing source mustacheTemplateFile for convert-to-blog-page');
  if (!blogIndexFile) throw new PluginError('convert-to-blog-page', 'Missing source blogIndexFile for convert-to-blog-page');
  if (!partials) throw new PluginError('convert-to-blog-page', 'Missing source partials for convert-to-blog-page');

  const mustacheTemplate = fs.readFileSync(path.resolve(__dirname, '../', mustacheTemplateFile), 'utf8');
  const mustachePartials = {};
  partials.forEach(partial => mustachePartials[partial.key] = fs.readFileSync(path.resolve(__dirname, '..', partial.path), 'utf8'));
  mustache.parse(mustacheTemplate);

  const blogIndexPath = path.resolve(__dirname, '..', blogIndexFile);
  const blogIndex = JSON.parse(fs.readFileSync(blogIndexPath, 'utf8'));

  return map((file, next) => {
    // We need to find the previous blog post, the current and the next
    let previousPost;
    let nextPost;

    blogIndex
      .sort((a, b) => (a.strdate < b.strdate ? 1 : (a.strdate > b.strdate ? -1 : 0)))
      .forEach((elt, index, array) => {
      if (elt.filename === file.templateModel.filename) {
        nextPost = index  > 0 ? array[index - 1] : undefined;
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
    file.contents = Buffer(mustache.render(mustacheTemplate, file.templateModel, mustachePartials));
    next(null, file);
  });
};






