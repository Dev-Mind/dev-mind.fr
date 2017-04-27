'use strict'

const map = require('map-stream');
const asciidoctor = require('asciidoctor.js')();

const asciidoctorOptions = {
  safe: 'safe',
  doctype: 'article',
  header_footer: false,
  attributes: {
    imagesdir: '/assets/images',
  },
}

module.exports = function ({ includes } = {}) {

  return map(async (file, next) => {

    const opts = Object.assign({}, asciidoctorOptions, {});
    opts.attributes = Object.assign({}, opts.attributes);

    const asciidoc = file.contents.toString();
    file.ast = asciidoctor.load(asciidoc, opts);
    file.attributes = file.ast.getAttributes();

    // make all model properties accessible through fat-arrow "getters"
    // this way, file.* values can be changed before templating
    file.templateModel = {
      keywords: () => file.attributes.keywords,
      title: () => file.attributes.doctitle,
      revdate: () => file.attributes.revdate,
      contents: () => file.contents,
      'github-edit-url': () => file.git.githubEditUrl,
      'canonical-url': () => 'dummy-canonical-url',
    };

    next(null, file);
  })
}


