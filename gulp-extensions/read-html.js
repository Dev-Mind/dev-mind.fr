'use strict';

const map = require('map-stream')
const fs = require('fs');
const gutil = require('gulp-util');
const PluginError = gutil.PluginError;
const moment = require('moment');

module.exports = function (modedev) {

  const pageMetadata = {
    '404.html' : {
      keywords: 'Dev-mind Guillaume EHRET développeur indépendant spécialiste Java, Web',
      title: 'Dev-Mind 404',
      description : 'Page non trouvée sur le serveur',
      priority: -1
    },
    'index.html' : {
      keywords: 'Dev-mind Guillaume EHRET développeur indépendant spécialiste Java, Web',
      title: 'Dev-Mind',
      description : 'Dev-Mind aide les entreprises qui souhaitent créer de nouveaux logiciels ou s\'organiser pour réussir leurs défis, en proposant des prestations de développement, du conseil et de la formation.',
      priority: 0.7
    },
    'experience.html' : {
      keywords: 'Dev-mind,Java,JavaScript,HTML,CSS',
      title: 'Expérience de Guillaume EHRET',
      description : 'CV numérique de Guillaume EHRET fondateur de Dev-Mind',
      priority: 0.6
    },
    'formations.html' : {
      keywords: 'Dev-mind organisme de formation',
      title: 'Les formationds dispensées',
      description : 'Dev-Mind dispense plusieurs formations autour du web et de Java',
      priority: 0.6
    },
    'formation_javascript.html' : {
      keywords: 'JavaScript Formation Adapté ',
      title: 'Dev-Mind - réapprendre JavaScript',
      description : 'Dev-mind :formation JavaScript à la carte adaptée à votre niveau',
      priority: 0.4
    },
    'formation_optimiser.html' : {
      keywords: 'HTML CSS JavaScript Optimiser WebPerformance Formation',
      title: 'Dev-Mind - optimiser',
      description : 'Dev-mind : optimisez les performances de votre webapp',
      priority: 0.4
    },
    'formation_web.html' : {
      keywords: 'HTML CSS Spring JavaScript Formation',
      title: 'Dev-Mind - formation web',
      description : 'Dev-mind :formation le web de A à Z',
      priority: 0.4
    },
    'shell.html' : {
      keywords: 'Dev-mind',
      title: 'Dev-Mind - app loading',
      description : 'Dev-mind votre partenaire',
      priority: -1
    }
  };

    /**
     * This function is used to read the html files defined in a gulp pipe. For example
     * <pre>
     *     gulp.src("src/hmtl/*.html").pipe(htmlRead(modeDev));
     * </pre>
     * The function load all the html file and return a file object with the different
     * medatada
     *
     * @param modedev
     * @returns {stream}
     */
  return map((file, next) => {

    const html = fs.readFileSync(file.path, 'utf8');
    file.fileName = file.path.substring(file.path.lastIndexOf('/') + 1, file.path.length);

    if (!pageMetadata[file.fileName]) throw new PluginError('read-html', `Missing index definition for ${file.path} in the build script html-read`);

    file.templateModel = {
      keywords: () => pageMetadata[file.fileName].keywords.split(","),
      title: () => pageMetadata[file.fileName].title,
      description: () => pageMetadata[file.fileName].description,
      contents: () => new Buffer(html),
      gendate: () => moment().format('DD/MM/YYYY'),
      blog: () => pageMetadata[file.fileName].blog,
      canonicalUrl: () => file.fileName,
      modedev: () => modedev,
    };

    file.indexData =  {
      strdate: moment().format('DD/MM/YYYY'),
      revdate: moment().format('DD/MM/YYYY'),
      doctitle: pageMetadata[file.fileName].title,
      description: pageMetadata[file.fileName].description,
      keywords: pageMetadata[file.fileName].keywords.split(","),
      filename: file.fileName.substring(0, file.fileName.lastIndexOf('.')),
      priority: pageMetadata[file.fileName].priority,
      dir: '/'
    };

    next(null, file);
  });
};

