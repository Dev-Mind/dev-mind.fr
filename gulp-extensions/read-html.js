'use strict';

const map = require('map-stream')
const fs = require('fs');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const moment = require('moment');
const pageMetadata = require('../src/metadata/html');

module.exports = function (modedev) {

    /**
     * This function is used to read the html files defined in a gulp pipe. For example
     * <pre>
     *     gulp.src("src/hmtl/*.html").pipe(htmlRead(modeDev));
     * </pre>
     * The function load all the html file and return a file object with the different
     * medatada
     *
     * @param modedev
     * @returns {stream}
     */
  return map((file, next) => {

    const html = fs.readFileSync(file.path, 'utf8');
    file.fileName = file.path.substring(file.path.lastIndexOf('/') + 1, file.path.length);

    if (!pageMetadata[file.fileName]) throw new PluginError('read-html', `Missing index definition for ${file.path} in the build script html-read`);

    file.templateModel = {
      keywords: () => pageMetadata[file.fileName].keywords.split(","),
      title: () => pageMetadata[file.fileName].title,
      description: () => pageMetadata[file.fileName].description,
      contents: () => new Buffer(html),
      gendate: () => moment().format('DD/MM/YYYY'),
      blog: () => pageMetadata[file.fileName].blog,
      canonicalUrl: () => file.fileName,
      modedev: () => modedev,
    };

    file.indexData =  {
      strdate: moment().format('DD/MM/YYYY'),
      revdate: moment().format('DD/MM/YYYY'),
      doctitle: pageMetadata[file.fileName].title,
      description: pageMetadata[file.fileName].description,
      keywords: pageMetadata[file.fileName].keywords.split(","),
      filename: file.fileName.substring(0, file.fileName.lastIndexOf('.')),
      priority: pageMetadata[file.fileName].priority,
      dir: '/'
    };

    next(null, file);
  });
};

