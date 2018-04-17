'use strict';

const gulp = require('gulp');
const del = require('del');
const path = require('path');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const wbBuild = require('workbox-build');

const $ = require('gulp-load-plugins')();

const convertToHtml = require('./gulp-extensions/convert-to-html');
const convertToBlogList = require('./gulp-extensions/convert-to-blog-list');
const convertToBlogPage = require('./gulp-extensions/convert-to-blog-page');
const convertToJson = require('./gulp-extensions/convert-to-json');
const convertToRss = require('./gulp-extensions/convert-to-rss');
const convertToSitemap = require('./gulp-extensions/convert-to-sitemap');
const readAsciidoc = require('./gulp-extensions/read-asciidoctor');
const readHtml = require('./gulp-extensions/read-html');
const readIndex = require('./gulp-extensions/read-index');
const applyTemplate = require('./gulp-extensions/apply-template');
const highlightCode = require('./gulp-extensions/highlight-code');
const firebaseIndexing = require('./gulp-extensions/firebase-indexing');
const fileExist = require('./gulp-extensions/file-exist');

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
  minifyCSS: true,
  minifyJS: true,
  jsmin:true
};

const MUSTACHE_PARTIALS = [
  {key: '_html_header', path: 'src/templates/_html_header.mustache'},
  {key: '_page_header', path: 'src/templates/_page_header.mustache'},
  {key: '_page_footer', path: 'src/templates/_page_footer.mustache'},
  {key: '_html_footer', path: 'src/templates/_html_footer.mustache'},
  {key: '_blog_intro', path: 'src/templates/_blog_intro.mustache'}
];

const CACHE_BUSTING_EXTENSIONS = ['.js', '.css', '.html', '.xml'];

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
    .pipe($.rev())
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('build/dist/css'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('build/dist/css'))
    .on('end', () => cb())
});

gulp.task('blog-firebase', (cb) => {
  // Hack to be able to stop the task when the async firebase requests are complete
  gulp.on('stop', () => {
    if (!modeDev) {
      process.nextTick(() => process.exit(0));
    }
  });
  gulp.src('src/blog/**/*.adoc')
    .pipe(readAsciidoc(modeDev))
    .pipe(firebaseIndexing(modeDev))
    .on('end', () => cb())
});

gulp.task('blog-indexing', () =>
  gulp.src('src/blog/**/*.adoc')
    .pipe(readAsciidoc(modeDev))
    .pipe(convertToHtml())
    .pipe(convertToJson('blogindex.json'))
    .pipe(gulp.dest('build/.tmp'))
);

gulp.task('blog-rss', () =>
  gulp.src('build/.tmp/blogindex.json')
    .pipe($.wait2(() => fileExist('build/.tmp/blogindex.json')))
    .pipe(readIndex())
    .pipe(convertToRss('blog.xml'))
    .pipe(gulp.dest('build/dist/rss'))
);

gulp.task('blog-index', () =>
    gulp.src('build/.tmp/blogindex.json')
        .pipe($.wait2(() => fileExist('build/.tmp/blogindex.json')))
        .pipe(readIndex())
        .pipe(convertToBlogList('src/templates/index.mustache', MUSTACHE_PARTIALS, 'index.html', 1))
        .pipe(gulp.dest('build/.tmp'))
        .pipe($.htmlmin(HTMLMIN_OPTIONS))
        .pipe(gulp.dest('build/dist'))
);

gulp.task('blog-list', () =>
  gulp.src('build/.tmp/blogindex.json')
    .pipe($.wait2(() => fileExist('build/.tmp/blogindex.json')))
    .pipe(readIndex())
    .pipe(convertToBlogList('src/templates/blog_list.mustache', MUSTACHE_PARTIALS, 'blog.html', 4))
    .pipe(gulp.dest('build/.tmp'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist'))
);

gulp.task('blog-archive', () =>
  gulp.src('build/.tmp/blogindex.json')
    .pipe($.wait2(() => fileExist('build/.tmp/blogindex.json')))
    .pipe(readIndex())
    .pipe(convertToBlogList('src/templates/blog_archive.mustache', MUSTACHE_PARTIALS, 'blog_archive.html'))
    .pipe(gulp.dest('build/.tmp'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist'))
);

gulp.task('blog-page', ['blog-indexing', 'blog-list', 'blog-rss', 'blog-archive', 'blog-index'], (cb) => {
  gulp.src('src/blog/**/*.adoc')
    .pipe(readAsciidoc(modeDev))
    .pipe(convertToHtml())
    .pipe(highlightCode({selector: 'pre.highlight code'}))
    .pipe(convertToBlogPage('src/templates/blog.mustache', MUSTACHE_PARTIALS, 'build/.tmp/blogindex.json'))

    .pipe(gulp.dest('build/.tmp/blog'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist/blog'))
    .on('end', () => cb())
});

gulp.task('blog', cb => {
  $.sequence(
    'blog-indexing',
    'blog-page',
    ['blog-list', 'blog-rss', 'blog-archive'],
    cb
  )
});

gulp.task('lint', () =>
  gulp.src('src/js/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failOnError()))
);

gulp.task('html-indexing', () =>
  gulp.src(`src/html/**/*.html`)
    .pipe(readHtml(modeDev))
    .pipe(convertToJson('pageindex.json'))
    .pipe(gulp.dest('build/.tmp')));

gulp.task('html', ['html-indexing'], () =>
  gulp.src(`src/html/**/*.html`)
    .pipe(readHtml(modeDev))
    .pipe(applyTemplate(`src/templates/site.mustache`, MUSTACHE_PARTIALS))
    .pipe($.size({title: 'html', showFiles: true}))
    .pipe(gulp.dest('build/.tmp'))
    .pipe($.htmlmin(HTMLMIN_OPTIONS))
    .pipe(gulp.dest('build/dist')));

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
    .pipe(gulp.dest('build/dist/js'))
);

/**
 * Image pre processing is used to minify these assets
 */
gulp.task('images-pre', () =>
  gulp.src('src/images/**/*.{svg,png,jpg}')
    .pipe($.if(!modeDev, imagemin([imagemin.gifsicle(), imageminMozjpeg(), imagemin.optipng(), imagemin.svgo()], {
      progressive: true,
      interlaced: true,
      arithmetic: true,
    })))
    .pipe(gulp.dest('build/.tmp/img'))
    .pipe($.if('**/*.{jpg,png}', $.webp()))
    .pipe($.size({title: 'images', showFiles: false}))
    .pipe(gulp.dest('build/.tmp/img'))
);

/**
 * Images generated in image pre processing are renamed with a MD5 (cache busting) and copied
 * in the dist directory
 */
gulp.task('images', () =>
  gulp.src('build/.tmp/img/**/*.{svg,png,jpg,webp}')
    //.pipe(gulp.dest('build/dist/img'))
    .pipe($.rev())
    .pipe(gulp.dest('build/dist/img'))
    .pipe($.rev.manifest())
    .pipe(gulp.dest('build/dist/img'))
);

/**
 * Image post processing is used to copy in dist directory images used without cache busting id
 */
gulp.task('images-post', () =>
  gulp.src('src/images/**/logo*.*')
    .pipe(gulp.dest('build/dist/img'))
);

gulp.task('copy', (cb) => {
  gulp.src([
    'src/*.{ico,html,txt,json,webapp,xml}',
    'src/.htaccess',
    'node_modules/workbox-sw/build/*-sw.js'
  ], {
    dot: true
  })
    .pipe($.size({title: 'copy', showFiles: true}))
    .pipe(gulp.dest('build/dist'))
    .on('end', () => cb())
});

gulp.task('sitemap', () =>
  gulp.src('build/.tmp/*index.json')
    .pipe(readIndex())
    .pipe(convertToSitemap())
    .pipe(gulp.dest('build/dist'))
);

gulp.task('service-worker', ['service-worker-bundle'], () =>
  gulp.src(`build/.tmp/sw.js`)
    .pipe($.sourcemaps.init())
    .pipe($.sourcemaps.write())
    .pipe($.uglify({preserveComments: 'none'}))
    .pipe($.size({title: 'scripts'}))
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest(`build/dist`))
);

gulp.task('service-worker-bundle', () => {
  return wbBuild.injectManifest({
    swSrc: 'src/sw.js',
    swDest: 'build/.tmp/sw.js',
    globDirectory: './build/dist',
    globPatterns: ['**\/*.{js,html,css,svg}']
    // we don't load image files on SW precaching step
  })
    .catch((err) => {
      console.log('[ERROR] This happened: ' + err);
    });
});

gulp.task('cache-busting-dev', () =>
    gulp.src(['build/dist/**/*.{html,js,css}'])
        .pipe($.revReplace({manifest: gulp.src('build/dist/img/rev-manifest.json'), replaceInExtensions: CACHE_BUSTING_EXTENSIONS}))
        .pipe($.revReplace({manifest: gulp.src('build/dist/css/rev-manifest.json')}))
        .pipe($.revReplace({manifest: gulp.src('build/dist/js/rev-manifest.json')}))
        .pipe(gulp.dest('build/dist'))
);

gulp.task('cache-busting', () =>
  gulp.src(['build/dist/**/*.{html,js,css,xml,json,webapp}'])
    .pipe($.revReplace({manifest: gulp.src('build/dist/img/rev-manifest.json'), replaceInExtensions: CACHE_BUSTING_EXTENSIONS}))
    .pipe($.revReplace({manifest: gulp.src('build/dist/css/rev-manifest.json')}))
    .pipe($.revReplace({manifest: gulp.src('build/dist/js/rev-manifest.json')}))
    .pipe(gulp.dest('build/dist'))
);

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

gulp.task('serveAndWatch', () => {
  browserSync.init({
    server: {
      baseDir: "./build/dist/"
    },
    notify: false,
    port: 3000
  });

  gulp.watch('src/**/*.html', () => $.sequence('html', 'cache-busting-dev', browserSync.reload));
  gulp.watch('src/**/*.{scss,css}', () => $.sequence('styles', 'blog', 'html', 'cache-busting-dev', browserSync.reload));
  gulp.watch('src/**/*.adoc', () => $.sequence('blog', 'cache-busting-dev', browserSync.reload));
  gulp.watch('src/**/*.js', () => $.sequence('lint', 'local-js', 'blog', 'html', 'cache-busting-dev', browserSync.reload));
  gulp.watch('src/images/**/*', () => $.sequence('images', browserSync.reload));
  gulp.watch('src/**/*.mustache', () => $.sequence('blog', 'html', 'cache-busting-dev', browserSync.reload));
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

  $.sequence(
    'images-pre',
    'styles',
    'blog',
    'images',
    'images-post',
    'lint',
    ['html', 'local-js', 'vendor-js'],
    'copy',
    'cache-busting',
    'service-worker',
    cb
  )
});


// Build production files, the default task
// Before a delivery we need to launch blog-firebase to update the pages on database
gulp.task('default', cb =>
  $.sequence(
    'clean',
    'build',
    'sitemap',
    cb
  )
);

// Build dev files
gulp.task('serve', cb =>
  $.sequence(
    'initModeDev',
    'build',
    'serveAndWatch',
    cb
  )
);
