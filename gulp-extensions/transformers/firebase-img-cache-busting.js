'use strict';

const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const moment = require('moment');
const map = require('map-stream');
const firebase = require("firebase");
const firebaseConfig = require("../../firebase.json");
const fs = require('fs');
const path = require('path');

/**
 * This plugin parse all the asciidoc files to build a Json index file with metadata
 */
module.exports = (cacheBustingFile) => {
  if (!cacheBustingFile) throw new PluginError('firebase-img-cache-busting', 'Missing rev file with file hashes for firebase-img-cache-busting');

  if (firebase.apps.length === 0) {
    console.log('Init firebase');
    firebase.initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      databaseURL: firebaseConfig.databaseURL,
      storageBucket: firebaseConfig.storageBucket
    });
  }
  const database = firebase.database();

  firebase.auth()
    .signInWithEmailAndPassword(firebaseConfig.user, firebaseConfig.password)
    .catch((error) => {
      throw new PluginError('firebase-img-cache-busting', `Firebase authent failed : ${error.message}`);
    });

  process.on('exit', function () {
    firebase.auth().signOut();
    console.log('firebase-img-cache-busting finished');
  });

  const cacheBustingPath = path.resolve(__dirname, '../..', cacheBustingFile);
  const template = JSON.parse(fs.readFileSync(cacheBustingPath, 'utf8'));

  return map(async (file, next) => {
    let filename = file.path.substring(file.path.lastIndexOf("/") + 1, file.path.lastIndexOf("."));

    database
      .ref(`blogs/${filename}`)
      .on('value', (snapshot) => {
        const imgteaser = snapshot.val().imgteaser ? snapshot.val().imgteaser.replace('../../img/', '') : undefined;
        if (imgteaser && template[imgteaser]) {
          const updates = {};
          updates[`blogs/${filename}/imgteaser`] = '../../img/' + template[imgteaser];
          firebase.database().ref().update(updates);
          console.log(`update [${'../../img/' + template[imgteaser]}]`)
        }
        next(null, file);
      })
  });
};






