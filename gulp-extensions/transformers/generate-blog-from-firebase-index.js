'use strict';

const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const firebase = require("firebase");
const firebaseConfig = require("../../firebase.js");
const mustache = require('mustache');
const fs = require('fs');
const path = require('path');
const map = require('map-stream');
const moment = require('moment');

/**
 * This plugin is used to read the firebase index. The final aim is to generate static page for blog post list
 * (everything has to be static for indexing bots)
 */
module.exports = (modeDev, partials, filename, templateName, nbArticleMax) => {

    // Initialize firebase if necessary
    if (firebase.apps.length === 0) {
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
            throw new PluginError('read-firebase-index', `Firebase authent failed : ${error.message}`);
        });

    // Firebase has to be closed on exit
    process.on('exit', function () {
        firebase.auth().signOut();
        console.log('read-firebase-index finished');
    });

    const pages = {
        'blog.html' :{
            keywords: 'Dev-mind blog Java Agilité programmation Spring Web JavaScript',
            title: 'Le blog Dev-Mind',
            description: 'Le blog Dev-Mind regroupe des articles des interviews sur des sujets divers allant de la programmation Java JavaScript aux méthodes agiles',
        }
    };

    const mustachePartials = {};
    partials.forEach(partial => mustachePartials[partial.key] = fs.readFileSync(path.resolve(__dirname, '../..', partial.path), 'utf8'));

    return map(async (file, next) => {
        database
            .ref(modeDev ? '/blogsDev' : '/blogs')
            .on('value', (snapshot) => {
                const template = file.contents.toString();

                const blogIndex = ((snapshot && snapshot.val()) ? Object.keys(snapshot.val()).map(key => snapshot.val()[key]) : [])
                    .map(a => {
                      a.date = a.revdate.substring(8, 10) + '/' + a.revdate.substring(5, 7) + '/' + a.revdate.substring(0, 4);
                      return a;
                    })
                    .sort((a, b) => (a.strdate < b.strdate ? 1 : (a.strdate > b.strdate ? -1 : 0)));

                const metadata = {
                    keywords: () => pages[filename].keywords,
                    title: () => pages[filename].title,
                    description: () => pages[filename].description,
                    gendate: () => moment().format('DD/MM/YYYY'),
                    canonicalUrl: () => filename,
                    modedev: () => modeDev
                };

                if (nbArticleMax) {
                    metadata.firstArticle = () => blogIndex[0];
                    metadata.secondArticles = () => blogIndex.filter((e, index) => index > 0 && index <= nbArticleMax);
                    metadata.otherArticles = () => blogIndex.filter((e, index) => index > nbArticleMax);
                    metadata.last15Articles = () => blogIndex.filter((e, index) => index < 15);
                }
                else {
                    metadata.articles = blogIndex;
                }

                file.contents = Buffer(mustache.render(template, metadata, mustachePartials));
                file.extname = '.html';
                file.path = file.path.replace(templateName, filename);
                next(null, file);
            });
    });
};






