'use strict'

const map = require('map-stream');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');

module.exports = function (handlebarTemplate) {

  const handleBarTemplateFile =  path.resolve(__dirname, '../..', handlebarTemplate);
  const template = handlebars.compile(fs.readFileSync(handleBarTemplateFile, 'utf8'));

  return map(async (file, next) => {
    file.contents = Buffer(template(file.templateModel));
    next(null, file);
  });
}

