'use strict';

const map = require('map-stream');
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');

/**
 * This function receives a stream with different medatadata on asciidoc files or static
 * html files. For example
 *
 * <pre>
 *  gulp.src("src/blog/*.adoc")
 *      .pipe(asciidoctorRead(modeDev))
 *      .pipe(asciidoctorConvert())
 *      .pipe(applyTemplate('src/templates/blog.mustache', MUSTACHE_PARTIALS))
 * </pre>
 *
 * or
 *
 * <pre>
 *  gulp.src("src/blog/*.html`)
 *      .pipe(htmlRead(modeDev))
 *      .pipe(applyTemplate('src/templates/static.mustache', MUSTACHE_PARTIALS))
 * </pre>
 *
 * The aim is to inject the data read in a mustache template to generate a static file
 *
 * @param mustacheTemplateFile
 * @param partials used in the mustacheTemplateFile
 * @returns {stream}
 */
module.exports = function (mustacheTemplateFile, partials) {
    const mustacheTemplate = fs.readFileSync(path.resolve(__dirname, '../', mustacheTemplateFile), 'utf8');

    const mustachePartials = {};
    partials.forEach(partial => mustachePartials[partial.key] = fs.readFileSync(path.resolve(__dirname, '../', partial.path), 'utf8'));
    mustache.parse(mustacheTemplate);

    return map(async (file, next) => {
        file.contents = Buffer(mustache.render(mustacheTemplate, file.templateModel, mustachePartials));
        next(null, file);
    });
};

