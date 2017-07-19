'use strict'

const map = require('map-stream');
const asciidoctor = require('asciidoctor.js')();
const firebaseConfig = require("../../firebase.json");
const moment = require('moment');

const asciidoctorOptions = {
  safe: 'safe',
  doctype: 'article',
  header_footer: false,
  attributes: {
    imagesdir: '/assets/images',
  },
}

module.exports = function (modedev) {

  return map(async (file, next) => {

    const opts = Object.assign({}, asciidoctorOptions, {});
    opts.attributes = Object.assign({}, opts.attributes);

    const asciidoc = file.contents.toString();
    file.ast = asciidoctor.load(asciidoc, opts);
    file.attributes = file.ast.getAttributes();
    file.attributes.strdate = file.attributes.revdate;

      // make all model properties accessible through fat-arrow "getters"
    // this way, file.* values can be changed before templating
    file.templateModel = {
      keywords: () => file.attributes.keywords,
      title: () => file.attributes.doctitle,
      revdate: () => moment(file.attributes.revdate, 'YYYY-mm-DD').format('DD/mm/YYYY'),
      contents: () => file.contents,
      'github-edit-url': () => file.git.githubEditUrl,
      filename: file.path.substring(file.path.lastIndexOf("/") + 1, file.path.lastIndexOf(".")),
      dir: file.path.substring(file.path.lastIndexOf("blog/") + 5, file.path.lastIndexOf("/")),
      category: file.attributes.category,
      teaser: file.attributes.teaser,
      imgteaser: file.attributes.imgteaser,
      status: file.attributes.status,
      firebaseApiKey: firebaseConfig.apiKey,
      modedev: () => modedev
    };

    next(null, file);
  })
}


