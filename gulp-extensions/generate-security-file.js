'use strict';

const trainingUserConfig = require("../training-users.js");
const gutil = require('gulp-util');
const through = require('through');
const path = require('path');
const md5 = require('md5');

/**
 * This plugin generates a htpasswd file
 */
module.exports = function () {

  function iterateOnStream(file) {

  }

  function endStream() {
    let target = new gutil.File();
    const content = trainingUserConfig.users.map(user => `${user.username}:${md5(user.password ? user.password : 'default')}`).join("\n");;
    target.path = '.htpasswd';
    target.contents = new Buffer(content);
    this.emit('data', target);
    this.emit('end');
  }

  return through(iterateOnStream, endStream);
};






