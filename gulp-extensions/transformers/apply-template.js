'use strict';

const map = require('map-stream');
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');

module.exports = function (mustacheTemplateFile) {
    const mustacheTemplate = fs.readFileSync(path.resolve(__dirname, '../..', mustacheTemplateFile), 'utf8');
    return map(async (file, next) => {
        file.contents = Buffer(mustache.render(mustacheTemplate, file.templateModel));
        next(null, file);
    });
};

