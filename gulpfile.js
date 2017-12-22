'use strict';

const gulp = require('gulp');
const del = require('del');
const path = require('path');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const runSequence = require('run-sequence');
const swPrecache = require('sw-precache');
const wbBuild = require('workbox-build');

const $ = require('gulp-load-plugins')();

const asciidoctorRead = require('./gulp-extensions/transformers/asciidoctor-read');
const asciidoctorConvert = require('./gulp-extensions/transformers/asciidoctor-convert');
const asciidoctorIndexing = require('./gulp-extensions/transformers/asciidoctor-indexing');
const asciidoctorRss = require('./gulp-extensions/transformers/asciidoctor-rss');
const htmlRead = require('./gulp-extensions/transformers/html-read');
const applyTemplate = require('./gulp-extensions/transformers/apply-template');
const highlightCode = require('./gulp-extensions/transformers/highlight-code');
const firebaseImgCacheBusting = require('./gulp-extensions/transformers/firebase-img-cache-busting');

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

const MUSTACHE_PARTIALS = [
  { key : '_html_header', path: 'src/templates/_html_header.mustache' },
  { key : '_page_header', path:'src/templates/_page_header.mustache' },
  { key : '_page_footer', path: 'src/templates/_page_footer.mustache' },
  { key : '_html_footer', path: 'src/templates/_html_footer.mustache' }
];

let modeDev = false;

gulp.task('styles', (cb) => {
  gulp.src(['src/sass/main.scss', 'src/sass/bloglist.scss', 'src/sass/blog/blog.scss'])
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
    .pipe($.if(!modeDev, $.rev()))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('build/dist/css'))
    .pipe($.if(!modeDev, $.rev.manifest()))
    .pipe(gulp.dest('build/dist/css'))
    .on('end', () => cb())
});

gulp.task('blog-indexing', (cb) => {
  // Hack to be able to stop the task when the async firebase requests are complete
  gulp.on('stop', () => {
    if (!modeDev) {
      process.nextTick(() => process.exit(0));
    }
  });
  gulp.src('src/blog/**/*.adoc')
    .pipe(asciidoctorRead(modeDev))
    .pipe(asciidoctorConvert())
    .pipe(asciidoctorIndexing(modeDev))
    .on('end', () => cb())
});

gulp.task('blog-rss', (cb) => {
  gulp.src('src/blog/**/*.adoc')
    .pipe(asciidoctorRead(modeDev))
    .pipe(asciidoctorConvert())
    .pipe(asciidoctorRss('blog.xml'))
    .pipe(gulp.dest('build/dist/rss'))
    .on('end', () => cb())
});

gulp.task('blog', ['blog-indexing', 'blog-rss'], (cb) => {
  gulp.src('src/blog/**/*.adoc')
    .pipe(asciidoctorRead(modeDev))
    .pipe(asciidoctorConvert())
    .pipe(applyTemplate('src/templates/blog.mustache', MUSTACHE_PARTIALS))
    .pipe(highlightCode({selector: 'pre.highlight code'}))
    .pipe(gulp.dest('build/.tmp/blog'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist/blog'))
    .on('end', () => cb())
});

gulp.task('lint', () =>
  gulp.src('src/js/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

gulp.task('html', () =>
  gulp
    .src('src/partials/**/*.html')
    .pipe(htmlRead(modeDev))
    .pipe(applyTemplate('src/templates/site.mustache', MUSTACHE_PARTIALS))
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
    .pipe($.if(!modeDev, $.rev()))
    .pipe($.sourcemaps.write())
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest('build/dist/js'))
    .pipe($.if(!modeDev, $.rev.manifest()))
    .pipe(gulp.dest('build/dist/js'))
);

gulp.task('vendor-js', () =>
  gulp.src(['node_modules/fg-loadcss/src/*.js'])
    .pipe($.uglify({preserveComments: 'some'}))
    .pipe($.size({title: 'scripts'}))
    .pipe(gulp.dest('build/dist/js'))
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

gulp.task('images', () =>
  gulp.src('build/.tmp/img/**/*.{svg,png,jpg,webp}')
    .pipe($.if(!modeDev, $.rev()))
    .pipe(gulp.dest('build/dist/img'))
    .pipe($.if(!modeDev, $.rev.manifest()))
    .pipe(gulp.dest('build/dist/img'))
);

gulp.task('copy', (cb) => {
  gulp.src([
    'src/*.{ico,html,txt,json,webapp,xml}',
    'src/.htaccess'
  ], {
    dot: true
  })
    .pipe($.size({title: 'copy', showFiles: true}))
    .pipe(gulp.dest('build/dist'))
    .on('end', () => cb())
});

gulp.task('service-worker', ['bundle-sw'], (cb) => {
  gulp.src(`build/.tmp/workbox-sw.prod.(*).js`)
    .pipe(gulp.dest(`build/dist`));

  gulp.src(`build/.tmp/sw.js`)
    .pipe($.sourcemaps.init())
    .pipe($.sourcemaps.write())
    .pipe($.uglify({preserveComments: 'none'}))
    .pipe($.size({title: 'scripts'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(`build/dist`))
    .on('end', () => cb())
});

gulp.task('bundle-sw', () => {
  return wbBuild.injectManifest({
    swSrc: 'src/sw.js',
    swDest: 'build/.tmp/sw.js',
    globDirectory: './build/dist',
    staticFileGlobs: ['**\/*.{js,html,css,png,jpg,json,gif,svg,webp,eot,ttf,woff,woff2,gz}']
  })
    .catch((err) => {
      console.log('[ERROR] This happened: ' + err);
    });
});

gulp.task('cache-busting', (cb) => {
  const replaceInExtensions = ['.js', '.css', '.html', '.xml'];
  const manifestImg = gulp.src('build/dist/img/rev-manifest.json');
  const manifestCss = gulp.src('build/dist/css/rev-manifest.json');
  const manifestJs = gulp.src('build/dist/js/rev-manifest.json');

  gulp.src(['build/dist/blog/**/*.html'])
    .pipe(firebaseImgCacheBusting('build/dist/img/rev-manifest.json', modeDev))

  gulp.src(['build/dist/**/*.{html,js,css,xml}'])
    .pipe($.revReplace({manifest: manifestImg, replaceInExtensions: replaceInExtensions}))
    .pipe($.revReplace({manifest: manifestCss}))
    .pipe($.revReplace({manifest: manifestJs}))
    .pipe(gulp.dest('build/dist'))
    .on('end', () => cb());
});

gulp.task('compress-svg', (cb) => {
  gulp.src('build/dist/**/*.svg')
    .pipe($.svg2z())
    .pipe(gulp.dest('build/dist'))
    .on('end', () => cb())
});

gulp.task('compress', ['compress-svg'], (cb) => {
  gulp.src('build/dist/**/*.{js,css,png,webp,jpg,html}')
    .pipe($.gzip())
    .pipe(gulp.dest('build/dist'))
    .on('end', () => cb())
});

gulp.task('serveAndWatch', ['initModeDev', 'build'], () => {
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
  gulp.watch('src/**/*.js', ['lint', 'local-js', browserSync.reload]);
  gulp.watch('src/images/**/*', ['images', browserSync.reload]);
  gulp.watch('src/**/*.hbs', ['blog', 'html', browserSync.reload]);
});


gulp.task('clean', () => del('build', {dot: true}));

gulp.task('initModeDev', () => modeDev = true);

gulp.task('build', cb => {
  // Hack to be able to stop the task when the async firebase requests are complete
  gulp.on('stop', () => {
    if (!modeDev) {
      process.nextTick(() => process.exit(0));
    }
  });

  runSequence(
    'styles',
    'blog',
    'images-min',
    'images',
    'lint',
    ['html', 'local-js', 'vendor-js'],
    'copy',
    cb
  )
});


// Build production files, the default task
gulp.task('default', cb =>
  runSequence(
    'clean',
    'build',
    'cache-busting',
    'compress',
    'service-worker',
    cb
  )
);

// Build dev files
gulp.task('serve', cb =>
  runSequence(
    'initModeDev',
    'build',
    'serveAndWatch',
    cb
  )
);
