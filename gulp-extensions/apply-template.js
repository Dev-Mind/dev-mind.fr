'use strict';

const map = require('map-stream');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

/**
 * This function receives a stream with different medatadata on asciidoc files or static
 * html files. For example
 *
 * <pre>
 *  gulp.src("src/blog/*.adoc")
 *      .pipe(asciidoctorRead(modeDev))
 *      .pipe(r())
 *      .pipe(applyTemplate('src/templates/blog.handlebars', HANDLEBARS_PARTIALS))
 * </pre>
 *
 * or
 *
 * <pre>
 *  gulp.src("src/blog/*.html`)
 *      .pipe(htmlRead(modeDev))
 *      .pipe(applyTemplate('src/templates/static.handlebars', HANDLEBARS_PARTIALS))
 * </pre>
 *
 * The aim is to inject the data read in a handlebars template to generate a static file
 *
 * @param handlebarsTemplateFile
 * @param partials used in the handlebarsTemplateFile
 * @returns {stream}
 */
module.exports = function (handlebarsTemplateFile, partials) {
    partials.forEach(partial => handlebars.registerPartial(partial.key, fs.readFileSync(path.resolve(__dirname, '../', partial.path), 'utf8')));
    const handlebarsTemplate = handlebars.compile(fs.readFileSync(path.resolve(__dirname, '../', handlebarsTemplateFile), 'utf8'));

    return map(async (file, next) => {
        file.contents = Buffer(handlebarsTemplate(file.templateModel));
        next(null, file);
    });
};

