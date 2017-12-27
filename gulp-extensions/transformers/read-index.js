'use strict';

const map = require('map-stream');

module.exports = function () {
  return map(async (file, next) => {
    next(null, JSON.parse(file.contents));
  });
};


