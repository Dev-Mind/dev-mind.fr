'use strict'

const map = require('map-stream')

module.exports = function () {

  return map((file, next) => {

    const html = file.ast.convert()
    file.contents = new Buffer(html)
    file.extname = '.html'
    file.path = file.path.replace('.adoc', '.html')

    next(null, file)
  })
}
