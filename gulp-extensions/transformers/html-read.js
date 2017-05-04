'use strict'

const map = require('map-stream')
const fs = require('fs');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;

module.exports = function () {

  const pageMetadata = {
    '404.html' : {
      keywords: 'Dev-mind Guillaume EHRET développeur indépendant spécialiste Java, Web',
      title: 'Dev-Mind 404',
      description : 'Page non trouvée sur le serveur',
    },
    'index.html' : {
      keywords: 'Dev-mind Guillaume EHRET développeur indépendant spécialiste Java, Web',
      title: 'Dev-Mind',
      description : 'Dev-Mind aide les entreprises qui souhaitent créer de nouveaux logiciels ou s\'organiser pour réussir leurs défis, en proposant des prestations de développement, du conseil et de la formation.',
    },
    'blog.html' : {
      keywords: 'Dev-mind blog Java Agilité programmation Spring Web JavaScript',
      title: 'Le blog Dev-Mind',
      description : 'Le blog Dev-Mind regroupe des articles des interviews sur des sujets divers allant de la programmation Java JavaScript aux méthodes agiles',
      blog: true
    },
    'experience.html' : {
      keywords: 'Dev-mind,Java,JavaScript,HTML,CSS',
      title: 'Expérience de Guillaume EHRET',
      description : 'CV numérique de Guillaume EHRET fondateur de Dev-Mind',
    },
    'formation_javascript.html' : {
      keywords: 'JavaScript Formation Adapté ',
      title: 'Dev-Mind - réapprendre JavaScript',
      description : 'Dev-mind :formation JavaScript à la carte adaptée à votre niveau'
    },
    'formation_optimiser.html' : {
      keywords: 'HTML CSS JavaScript Optimiser WebPerformance Formation',
      title: 'Dev-Mind - optimiser',
      description : 'Dev-mind : optimisez les performances de votre webapp'
    },
    'formation_web.html' : {
      keywords: 'HTML CSS Spring JavaScript Formation',
      title: 'Dev-Mind - formation web',
      description : 'Dev-mind :formation le web de A à Z'
    }
  };

  return map((file, next) => {

    const html = fs.readFileSync(file.path, 'utf8');
    file.fileName = file.path.substring(file.path.lastIndexOf('/') + 1, file.path.length);

    if (!pageMetadata[file.fileName]) throw new PluginError('html-read', `Missing index definition for ${file.path} in the build script html-read`);

    file.templateModel = {
      keywords: () => pageMetadata[file.fileName].keywords,
      title: () => pageMetadata[file.fileName].title,
      description: () => pageMetadata[file.fileName].description,
      contents: () => new Buffer(html),
      blog: () => pageMetadata[file.fileName].blog,
      'canonical-url': () => file.fileName
    };

    next(null, file);
  });
}

