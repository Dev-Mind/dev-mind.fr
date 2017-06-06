'use strict';

const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const moment = require('moment');
const map = require('map-stream');
const firebase = require("firebase");
const firebaseConfig = require("../../firebase.json");

/**
 * This plugin parse all the asciidoc files to build a Json index file with metadata
 */
module.exports = () => {

  console.log('Try to connect to firebase', firebaseConfig);

  firebase.initializeApp({
    apiKey: firebaseConfig.apiKey,
    authDomain: firebaseConfig.authDomain,
    databaseURL: firebaseConfig.databaseURL,
    storageBucket: firebaseConfig.storageBucket
  });

  const database = firebase.database();

  firebase.auth()
    .signInWithEmailAndPassword(firebaseConfig.user, firebaseConfig.password)
    .catch((error) => {
      throw new PluginError('asciidoctor-indexing', `Firebase authent failed : ${error.message}`);
    });

  database.ref('blogs')
    .remove()
    .catch((error) => {
      throw new PluginError('asciidoctor-indexing',`Firebase index remove failed : ${error.message}`);
    });


  return map(async (file, next) => {
    let filename = file.path.substring(file.path.lastIndexOf("/") + 1, file.path.lastIndexOf("."));

    database
      .ref('blogs/' + filename)
      .set({
        strdate: file.attributes.revdate,
        revdate: moment(file.attributes.revdate, 'YYYY-mm-DD').format('DD/mm/YYYY'),
        description: file.attributes.description,
        doctitle: file.attributes.doctitle,
        keywords: file.attributes.keywords,
        filename: filename,
        category: file.attributes.category,
        teaser: file.attributes.teaser,
        imgteaser: file.attributes.imgteaser,
        dir: file.path.substring(file.path.lastIndexOf("blog/") + 5, file.path.lastIndexOf("/"))
      })
      .then(() => next(null, file))
      .catch((error) => {
      throw new PluginError('asciidoctor-indexing', `Firebase insert failed : ${error.message}`);
    });
  })
}






