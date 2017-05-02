'use strict';

const gulp = require('gulp');
const del = require('del');
const path = require('path');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const runSequence = require('run-sequence');
const swPrecache = require('sw-precache');

const $ = require('gulp-load-plugins')();

const asciidoctorRead = require('./gulp-extensions/transformers/asciidoctor-read');
const asciidoctorConvert = require('./gulp-extensions/transformers/asciidoctor-convert');
const asciidoctorIndexing = require('./gulp-extensions/transformers/asciidoctor-indexing');
const htmlRead = require('./gulp-extensions/transformers/html-read');
const applyTemplate = require('./gulp-extensions/transformers/apply-template');
const highlightCode = require('./gulp-extensions/transformers/highlight-code');

const AUTOPREFIXER_BROWSERS = [
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

const HTMLMIN_OPTIONS = {
  removeComments: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeRedundantAttributes: true,
  removeEmptyAttributes: true,
  removeScriptTypeAttributes: true,
  removeStyleLinkTypeAttributes: true,
  removeOptionalTags: true
};

gulp.task('styles', () =>
  gulp.src(['src/sass/main.scss', 'src/sass/blog/blog.scss'])
    .pipe($.newer('build/.tmp/css'))
    .pipe($.sourcemaps.init())
    .pipe($.sass({
      precision: 10
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('build/.tmp/css'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({title: 'styles'}))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('build/dist/css'))
);

gulp.task('blog-indexing', () =>
  gulp.src('src/blog/**/*.adoc')
    .pipe(asciidoctorRead())
    .pipe(asciidoctorConvert())
    .pipe(asciidoctorIndexing('blog-index.json'))
    .pipe(gulp.dest('build/dist/blog'))
);

gulp.task('blog', ['blog-indexing'], () =>
  gulp.src('src/blog/**/*.adoc')
    .pipe(asciidoctorRead())
    .pipe(asciidoctorConvert())
    .pipe(applyTemplate('src/templates/blog.hbs'))
    .pipe(highlightCode({selector: 'pre.highlight code'}))
    .pipe(gulp.dest('build/.tmp/blog'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist/blog'))
);

gulp.task('lint', () =>
  gulp.src('src/js/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

gulp.task('html', () =>
  gulp
    .src('src/partials/**/*.html')
    .pipe(htmlRead())
    .pipe(applyTemplate('src/templates/site.hbs'))
    .pipe($.size({title: 'html', showFiles: true}))
    .pipe(gulp.dest('build/.tmp'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist'))
);

gulp.task('scripts', () =>
  gulp.src(['src/js/*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe($.sourcemaps.write())
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest('build/dist/js'))
);

gulp.task('images', () =>
  gulp.src('src/images/**/*.{svg,png,jpg}')
    .pipe(imagemin([imagemin.gifsicle(), imageminMozjpeg(), imagemin.optipng(), imagemin.svgo()], {
      progressive: true,
      interlaced: true,
      arithmetic: true,
    }))
    .pipe(gulp.dest('build/.tmp/img'))
    .pipe($.if('**/*.{jpg,png}', $.webp()))
    .pipe($.size({title: 'images', showFiles: false}))
    .pipe(gulp.dest('build/dist/img'))
);

gulp.task('copy', () => {
  gulp.src([
    'build/.tmp/**/*.{png,jpg}',
    'src/*.{ico,html,txt,json,webapp,xml}',
    'src/.htaccess'
  ], {
    dot: true
  })
    .pipe($.size({title: 'copy', showFiles: true}))
    .pipe(gulp.dest('build/dist'));
});

gulp.task('generate-service-worker', (callback) => {
  var config = {
    cacheId: 'dev-mind',
    // Determines whether the fetch event handler is included in the generated service worker code. It is useful to
    // set this to false in development builds, to ensure that features like live reload still work. Otherwise, the content
    // would always be served from the service worker cache.
    handleFetch: true,
    runtimeCaching: [{
      urlPattern: '/(.*)',
      handler: 'networkFirst',
      options: {
        networkTimeoutSeconds: 3,
        maxAgeSeconds: 7200
      }
    }],
    staticFileGlobs: ['build/dist/**/*.{js,html,css,png,jpg,json,gif,svg,webp,eot,ttf,woff,woff2}'],
    stripPrefix: 'build/dist/',
    verbose: true
  };

  swPrecache.write(`build/.tmp/service-worker.js`, config, callback);
});

gulp.task('service-worker', ['generate-service-worker'], (callback) =>
  gulp.src(`build/.tmp/service-worker.js`)
    .pipe($.sourcemaps.init())
    .pipe($.sourcemaps.write())
    .pipe($.uglify({preserveComments: 'none'}))
    .pipe($.size({title: 'scripts'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(`build/dist`))
);

gulp.task('compress-svg', () =>
  gulp.src('build/dist/**/*.svg')
    .pipe($.svg2z())
    .pipe(gulp.dest('build/dist'))
);

gulp.task('compress', ['compress-svg'], () =>
  gulp.src('build/dist/**/*.{js,css,png,webp,jpg,html}')
    .pipe($.gzip())
    .pipe(gulp.dest('build/dist'))
);

gulp.task('serve', ['build'], () => {
  browserSync.init({
    server: {
      baseDir: "./build/dist/"
    },
    notify: false,
    port: 3000
  });

  gulp.watch('src/**/*.html', ['html', browserSync.reload]);
  gulp.watch('src/**/*.{scss,css}', ['styles', browserSync.reload]);
  gulp.watch('src/**/*.adoc', ['blog', browserSync.reload]);
  gulp.watch('src/**/*.js', ['lint', 'scripts', browserSync.reload]);
  gulp.watch('src/images/**/*', ['images', browserSync.reload]);
  gulp.watch('src/**/*.hbs', ['blog', 'html', browserSync.reload]);
});


gulp.task('clean', () => del('build', {dot: true}));

gulp.task('build', cb =>
  runSequence(
    'styles',
    'blog',
    ['lint', 'html', 'scripts', 'images'],
    'copy',
    'service-worker',
    'compress',
    cb
  )
);

// Build production files, the default task
gulp.task('default', cb =>
  runSequence(
    'clean',
    'build',
    cb
  )
);
