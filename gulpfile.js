'use strict';

const gulp = require('gulp');
const del = require('del');
const browserSync = require('browser-sync');
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const runSequence = require('run-sequence');

const $ = require('gulp-load-plugins')();

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

});

gulp.task('lint', () => gulp.src('src/js/**/*.js')
  .pipe($.eslint())
  .pipe($.eslint.format())
  .pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

gulp.task('html', () => {

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
    .pipe($.if('*.{jpg,png}', $.webp()))
    .pipe($.size({title: 'images', showFiles: true}))
    .pipe(gulp.dest('build/dist/img'))
);

gulp.task('copy', () => {
  gulp.src('build/.tmp/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/dist/img'))
});

gulp.task('service-worker', () => {

});

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