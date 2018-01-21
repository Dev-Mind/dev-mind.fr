'use strict';

const map = require('map-stream');

/**
 * This function receives a stream with different metadata on asciidoc files. For example
 *
 * <pre>
 *  gulp.src("src/blog/*.adoc")
 *      .pipe(asciidoctorRead(modeDev))
 *      .pipe(asciidoctorConvert())
 * </pre>
 *
 * The aim is to replace adoc extension by html extensions
 *
 * @returns {stream}
 */
module.exports = function () {

  return map((file, next) => {
    const html = file.ast.convert();
    file.contents = new Buffer(html);
    file.extname = '.html';
    file.path = file.path.replace('.adoc', '.html');
    next(null, file);
  });
};
