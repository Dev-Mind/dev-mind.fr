'use strict';

const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const map = require('map-stream');
const firebase = require('firebase');
const firebaseConfig = require('../firebase.js');

/**
 * This plugin parse all the asciidoc files to build a Json index file with metadata
 */
module.exports = (modeDev) => {

  console.log(firebaseConfig, modeDev)

  let initializeDatabase = (callback) => {
    if (firebase.apps.length === 0) {
      firebase.initializeApp({
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        databaseURL: firebaseConfig.databaseURL,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId
      });

      firebase.auth()
        .signInWithEmailAndPassword(firebaseConfig.user, firebaseConfig.password)
        .then(() => callback())
        .catch((error) => {
          throw new PluginError('asciidoctor-indexing', `Firebase authent failed : ${error.message}`);
        });
    }
  };

  process.on('exit', () => {
    firebase.auth()
      .signOut()
      .then(() => console.log('Deconnected from Firebase'))
      .catch((error) => {
        throw new PluginError('asciidoctor-indexing', `Firebase exit failed : ${error.message}`);
      });
  });

  return map(async (file, next) => {
    const callback = () => {
      let filename = file.path.substring(file.path.lastIndexOf("/") + 1, file.path.lastIndexOf("."));

      if (file.attributes.status === 'draft') {
        next(null, file);
      }
      else {
        // Initialize counter if it does not exist
        firebase.database()
          .ref(`/stats/${filename}`)
          .transaction(count => count ? count : 0);

        firebase.database()
          .ref(`/statsDev/${filename}`)
          .transaction(count => count ? count : 0);

        firebase.database()
          .ref(`blogsDev/${filename}`)
          .remove()
          .then(() =>
            firebase.database()
              .ref(`blogsDev/${filename}`)
              .set(file.indexData)
              .then(() => firebase.database()
                .ref(`blogs/${filename}`)
                .remove()
                .then(() =>
                  firebase.database()
                    .ref(`blogs/${filename}`)
                    .set(file.indexData)
                    .then(() => next(null, file))
                    .catch((error) => {
                      throw new PluginError('asciidoctor-indexing', `Firebase insert failed : ${error.message}`);
                    })
                )
                .catch((error) => {
                  throw new PluginError('asciidoctor-indexing', `Firebase remove failed : ${error.message}`);
                })
              )
              .catch((error) => {
                throw new PluginError('asciidoctor-indexing', `Firebase insert in dev database failed : ${error.message}`);
              })
          )
          .catch((error) => {
            throw new PluginError('asciidoctor-indexing', `Firebase remove  in dev database failed : ${error.message}`);
          });
      }
    };

    initializeDatabase(callback);
  });
};






