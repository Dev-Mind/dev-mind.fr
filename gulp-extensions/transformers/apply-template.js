'use strict';

const map = require('map-stream');
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');

module.exports = function (mustacheTemplateFile, partials) {
    const mustacheTemplate = fs.readFileSync(path.resolve(__dirname, '../..', mustacheTemplateFile), 'utf8');

    const mustachePartials = {}
    partials.forEach(partial => mustachePartials[partial.key] = fs.readFileSync(path.resolve(__dirname, '../..', partial.path), 'utf8'));
    mustache.parse(mustacheTemplate);

    return map(async (file, next) => {
        file.contents = Buffer(mustache.render(mustacheTemplate, file.templateModel, mustachePartials));
        next(null, file);
    });
};

