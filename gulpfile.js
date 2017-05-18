'use strict';

const gulp = require('gulp');
const del = require('del');
const path = require('path');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const runSequence = require('run-sequence');
const swPrecache = require('sw-precache');
const moment = require('moment');

const $ = require('gulp-load-plugins')();

const asciidoctorRead = require('./gulp-extensions/transformers/asciidoctor-read');
const asciidoctorConvert = require('./gulp-extensions/transformers/asciidoctor-convert');
const asciidoctorIndexing = require('./gulp-extensions/transformers/asciidoctor-indexing');
const asciidoctorRss = require('./gulp-extensions/transformers/asciidoctor-rss');
const htmlRead = require('./gulp-extensions/transformers/html-read');
const applyTemplate = require('./gulp-extensions/transformers/apply-template');
const highlightCode = require('./gulp-extensions/transformers/highlight-code');

const AUTOPREFIXER_BROWSERS = [
  'ie >= 11',
  'ie_mob >= 11',
  'ff >= 45',
  'chrome >= 45',
  'safari >= 7',
  'opera >= 23',
  'ios >= 9',
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
  removeOptionalTags: true,
  minifyCSS: true
};

let serve = false;

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
    .pipe($.rev())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('build/dist/css'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('build/dist/css'))
);

gulp.task('blog-indexing', (cb) => {
  // Hack to be able to stop the task when the async firebase requests are complete
  gulp.on('stop', () => {
      if(!serve) {
        process.nextTick(() => process.exit(0));
      }
  });
  gulp.src('src/blog/**/*.adoc')
    .pipe(asciidoctorRead())
    .pipe(asciidoctorConvert())
    .pipe(asciidoctorIndexing())
    .on('end', () => cb())
    .on('error', (e) => cb(e))
});

gulp.task('blog-rss', () =>
  gulp.src('src/blog/**/*.adoc')
    .pipe(asciidoctorRead())
    .pipe(asciidoctorConvert())
    .pipe(asciidoctorRss('blog.xml'))
    .pipe(gulp.dest('build/dist/rss'))
);

gulp.task('blog', ['blog-indexing', 'blog-rss'], () =>
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

gulp.task('local-js', () =>
  gulp.src(['src/js/*.js'])
    .pipe($.sourcemaps.init())
    .pipe($.babel({
      presets: ['es2015']
    }))
    .pipe($.rev())
    .pipe($.sourcemaps.write())
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest('build/dist/js'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('build/dist/js'))
);

gulp.task('vendor-js', () =>
  gulp.src(['node_modules/fg-loadcss/src/*.js'])
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest('build/dist/js'))
);

gulp.task('scripts', () =>
  runSequence('local-js', 'vendor-js')
);

gulp.task('images-min', () =>
  gulp.src('src/images/**/*.{svg,png,jpg}')
    .pipe(imagemin([imagemin.gifsicle(), imageminMozjpeg(), imagemin.optipng(), imagemin.svgo()], {
      progressive: true,
      interlaced: true,
      arithmetic: true,
    }))
    .pipe(gulp.dest('build/.tmp/img'))
    .pipe($.if('**/*.{jpg,png}', $.webp()))
    .pipe($.size({title: 'images', showFiles: false}))
    .pipe(gulp.dest('build/.tmp/img'))
);

gulp.task('images-copy', [], () =>
  gulp.src('build/.tmp/img/**/*.{svg,png,jpg,webp}')
    .pipe($.rev())
    .pipe(gulp.dest('build/dist/img'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('build/dist/img'))
);

gulp.task('images', [], () =>
  runSequence('images-min', 'images-copy')
);

gulp.task('copy', () => {
  gulp.src([
    'src/*.{ico,html,txt,json,webapp,xml}',
    'src/.htaccess'
  ], {
    dot: true
  })
    .pipe($.size({title: 'copy', showFiles: true}))
    .pipe(gulp.dest('build/dist'));
});

gulp.task('generate-service-worker', (callback) => {
  let config = {
    cacheId: `dev-mind${moment().format('YYYY-MM-DD_ss')}`,
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
    staticFileGlobs: ['build/dist/**/*.{js,html,css,png,jpg,json,gif,svg,webp,eot,ttf,woff,woff2,gz}'],
    stripPrefix: 'build/dist',
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

gulp.task('cache-busting', () => {
  const replaceInExtensions = ['.js', '.css', '.html', '.xml'];
  const manifestImg = gulp.src('build/dist/img/rev-manifest.json');
  const manifestCss = gulp.src('build/dist/css/rev-manifest.json');
  const manifestJs = gulp.src('build/dist/js/rev-manifest.json');

  gulp.src(['build/dist/**/*.{html,js,css,xml}'])
    .pipe($.revReplace({manifest: manifestImg, replaceInExtensions: replaceInExtensions}))
    .pipe($.revReplace({manifest: manifestCss}))
    .pipe($.revReplace({manifest: manifestJs}))
    .pipe(gulp.dest('build/dist'));
});

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
  serve = true;
  browserSync.init({
    server: {
      baseDir: "./build/dist/"
    },
    notify: false,
    port: 3000
  });

  gulp.watch('src/**/*.html', ['html', 'cache-busting', browserSync.reload]);
  gulp.watch('src/**/*.{scss,css}', ['styles', 'cache-busting', browserSync.reload]);
  gulp.watch('src/**/*.adoc', ['blog', 'cache-busting', browserSync.reload]);
  gulp.watch('src/**/*.js', ['lint', 'scripts', 'cache-busting', browserSync.reload]);
  gulp.watch('src/images/**/*', ['images', 'cache-busting', browserSync.reload]);
  gulp.watch('src/**/*.hbs', ['blog', 'html', 'cache-busting', browserSync.reload]);
});


gulp.task('clean', () => del('build', {dot: true}));

gulp.task('build', cb =>
  runSequence(
    'styles',
    'blog',
    ['lint', 'html', 'scripts', 'images'],
    'copy',
    'service-worker',
    'cache-busting',
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
