'use strict';

const gulp = require('gulp');
const del = require('del');
const path = require('path');
const browserSync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const runSequence = require('run-sequence');
const swPrecache = require('sw-precache');

const $ = require('gulp-load-plugins')();
const reload = browserSync.reload;

const asciidoctorRead = require('./gulp-extensions/transformers/asciidoctor-read');
const asciidoctorConvert = require('./gulp-extensions/transformers/asciidoctor-convert');
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

gulp.task('styles', () => gulp.src(['src/sass/main.scss'])
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


gulp.task('asciidoctor', () => {
  const handlebarTemplate = path.resolve(__dirname, 'src/templates/blog.hbs');
  gulp
    .src('src/blog/**/*.adoc')
    .pipe(asciidoctorRead())
    .pipe(asciidoctorConvert())
    .pipe(applyTemplate({ handlebarTemplate }))
    .pipe(highlightCode({ selector: 'pre.highlight code' }))
    .pipe(gulp.dest('build/.tmp/blog'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist/blog'));
});

gulp.task('lint', () => gulp.src('src/js/**/*.js')
  .pipe($.eslint())
  .pipe($.eslint.format())
  .pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

gulp.task('html', () => {
  const handlebarTemplate = path.resolve(__dirname, 'src/templates/site.hbs');
  gulp
    .src('src/partials/**/*.html')
    .pipe(htmlRead())
    .pipe(applyTemplate({ handlebarTemplate }))
    .pipe($.size({title: 'html', showFiles: true}))
    .pipe(gulp.dest('build/.tmp'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist'));
});

gulp.task('scripts', () => gulp.src(['src/js/main.js'])
  .pipe($.newer('build/.tmp/js'))
  .pipe($.sourcemaps.init())
  .pipe($.babel())
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest('build/.tmp/js'))
  .pipe($.concat('main.js'))
  .pipe($.uglify({preserveComments: 'some'}))
  // Output files
  .pipe($.size({title: 'scripts'}))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('build/dist/js'))
);

gulp.task('images', () => gulp.src('src/images/**/*.{svg,png,jpg}')
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
  gulp.src('build/.tmp/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/dist/img'))
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
      options : {
        networkTimeoutSeconds: 3,
        maxAgeSeconds: 7200
      }
    }],
    staticFileGlobs: [ 'build/dist/**/*.{js,html,css,png,jpg,json,gif,svg,webp,eot,ttf,woff,woff2}'],
    stripPrefix: 'build/dist/',
    verbose: true
  };

  swPrecache.write(`build/.tmp/service-worker.js`, config, callback);
});

gulp.task('service-worker', ['generate-service-worker'], (callback) => gulp.src(`build/.tmp/service-worker.js`)
    .pipe($.sourcemaps.init())
    .pipe($.sourcemaps.write())
    .pipe($.uglify({preserveComments: 'none'}))
    .pipe($.size({title: 'scripts'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(`build/dist`))
);

gulp.task('compress', () => {

});

gulp.task('serve', ['build'], () => {
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    server: ['build/dist'],
    port: 3000
  });

  gulp.watch(['src/**/*.html'], ['html', reload]);
  gulp.watch(['src/sass/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['src/**/*.adoc'], ['asciidoctor', reload]);
  gulp.watch(['src/js/**/*.js'], ['lint', 'scripts']);
  gulp.watch(['src/images/**/*'], ['images', reload]);
  gulp.watch(['src/templates/**/*.hbs'], ['asciidoctor', 'html', reload]);
});


gulp.task('clean', () => del('build', {dot: true}));

gulp.task('build', cb =>
  runSequence(
    'styles',
    'asciidoctor',
    ['lint', 'html', 'scripts', 'copy', 'images'],
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