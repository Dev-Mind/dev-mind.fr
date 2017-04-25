'use strict'

const map = require('map-stream');
const handlebars = require('handlebars');
const fs = require('fs');

module.exports = function ({ handlebarTemplate }) {

  const template = handlebars.compile(fs.readFileSync(handlebarTemplate, 'utf8'));

  return map(async (file, next) => {

    const data = {
      contents : file.contents
    }

    file.contents = Buffer(template(file.templateModel));

    next(null, file);
  });
}

