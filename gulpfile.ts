'use strict';
import {dest, parallel, series, src, task, watch} from 'gulp';
import {DevMindGulpBuilder} from 'devmind-website';

import * as del from 'del';
import * as fs from 'fs';
import * as sourcemaps from 'gulp-sourcemaps';
import * as sass from 'gulp-sass';
import * as postcss from 'gulp-postcss';
import * as cssnano from 'cssnano';
import * as rev from 'gulp-rev';
import * as size from 'gulp-size';
import * as autoPrefixer from "autoprefixer";
import * as htmlmin from 'gulp-htmlmin';
import * as babel from 'gulp-babel';
import * as uglify from 'gulp-uglify';
import * as replace from 'gulp-replace';
import * as revReplace from 'gulp-rev-replace';
import * as imagemin from 'gulp-imagemin';
import * as workboxBuild from './node_modules/workbox-build/build/index.js'
import * as webp from './node_modules/gulp-webp/index.js';
import {Duplex} from "stream";

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
  jsmin: true
};

const HANDLEBARS_PARTIALS = [
  {key: '_html_header', path: 'src/main/client/templates/_html_header.handlebars'},
  {key: '_page_header', path: 'src/main/client/templates/_page_header.handlebars'},
  {key: '_page_footer', path: 'src/main/client/templates/_page_footer.handlebars'},
  {key: '_html_footer', path: 'src/main/client/templates/_html_footer.handlebars'}
];

const CACHE_BUSTING_EXTENSIONS = ['.js', '.css', '.html', '.xml', '.handlebars'];


const website = new DevMindGulpBuilder({
  metadata: {
    rss: 'src/main/client/metadata/rss.json',
    blog: 'src/main/client/metadata/blog.json',
    html: 'src/main/client/metadata/html.json',
    sitemap: 'src/main/client/metadata/sitemap.json'
  }
});
// Service worker version is read in a file
const SW_VERSION_FILE = './version';
const serviceWorkerVersion = require(SW_VERSION_FILE).swVersion;


// Clean the working directories
// =============================
task('clean', () => del('build'));
task('clean-backend', () => del('build/src'));

// Compile sass file in css
// =============================
task('styles', (cb) => {
  src(['src/main/client/sass/devmind.scss', 'src/main/client/sass/main.scss', 'src/main/client/sass/bloglist.scss', 'src/main/client/sass/blog/blog.scss'])
    .pipe(sass({precision: 10}).on('error', sass.logError))
    .pipe(dest('build/.tmp/css'))
    .pipe(rev())
    .pipe(sourcemaps.init())
    .pipe(postcss([autoPrefixer(), cssnano()]))
    .pipe(sourcemaps.write('./'))
    .pipe(size({title: 'styles'}))
    .pipe(dest('build/dist/css'))
    .pipe(rev.manifest())
    .pipe(dest('build/dist/css'))
    .on('end', () => cb())
});

task('styles-backend-dev', (cb) => src('build/.tmp/css/*.css').pipe(dest('build/dist/css')));

// Blog generation
// =============================
// Step 1 : create a json file which contains all blog post descriptions
task('blog-indexing', () =>
  src('src/main/client/blog/**/*.adoc')
    .pipe(website.readAsciidoc())
    .pipe(website.convertToHtml())
    .pipe(website.convertToJson('blogindex.json'))
    .pipe(dest('build/.tmp'))
);
// Step 2 : generate an xml file for the RSS lovers
task('blog-rss', () =>
  src('build/.tmp/blogindex.json')
    .pipe(website.readIndex())
    .pipe(website.convertToRss('blog.xml'))
    .pipe(dest('build/dist/rss'))
);
// Step 3 : create index page with all blog post entries (the aim is to display the last 2 blog posts on homepage
task('blog-index', () =>
  src('build/.tmp/blogindex.json')
    .pipe(website.readIndex())
    .pipe(website.convertToBlogList('src/main/client/templates/index.handlebars', HANDLEBARS_PARTIALS, 'index.html', 1))
    .pipe(dest('build/.tmp'))
    .pipe(htmlmin(HTMLMIN_OPTIONS))
    .pipe(dest('build/dist'))
);
// Step 4 : create a page with the last 5 blog post entries (this the blog page on the website)
task('blog-list', () =>
  src('build/.tmp/blogindex.json')
    .pipe(website.readIndex())
    .pipe(website.convertToBlogList('src/main/client/templates/blog_list.handlebars', HANDLEBARS_PARTIALS, 'blog.html', 4))
    .pipe(dest('build/.tmp'))
    .pipe(htmlmin(HTMLMIN_OPTIONS))
    .pipe(dest('build/dist'))
);
// Step 5 : create a page for people who wants to navigate in blog archive
task('blog-archive', () =>
  src('build/.tmp/blogindex.json')
    .pipe(website.readIndex())
    .pipe(website.convertToBlogList('src/main/client/templates/blog_archive.handlebars', HANDLEBARS_PARTIALS, 'blog_archive.html', 0))
    .pipe(dest('build/.tmp'))
    .pipe(htmlmin(HTMLMIN_OPTIONS))
    .pipe(dest('build/dist'))
);
// Step 6 (last one) : generate an HTML page for each blog entry write in asciidoc
task('blog-page', (cb) => {
  src('src/main/client/blog/**/*.adoc')
    .pipe(website.readAsciidoc())
    .pipe(website.convertToHtml())
    .pipe(website.highlightCode({selector: 'pre.highlight code'}))
    .pipe(website.convertToBlogPage('src/main/client/templates/blog.handlebars', HANDLEBARS_PARTIALS, 'build/.tmp/blogindex.json'))
    .pipe(dest('build/.tmp/blog'))
    .pipe(htmlmin(HTMLMIN_OPTIONS))
    .pipe(dest('build/dist/blog'))
    .on('end', () => cb())
});

task('blog', series(
  'blog-indexing',
  parallel('blog-page', 'blog-list', 'blog-rss', 'blog-archive', 'blog-index')
));


// Student pages generation
// =============================
// Step 1 : create a json file which contains all courses descriptions
task('training-indexing', () =>
  src(`src/main/client/training/**/*.adoc`)
    .pipe(website.readAsciidoc())
    .pipe(website.convertToHtml())
    .pipe(website.convertToJson('trainingindex.json'))
    .pipe(dest('build/.tmp'))
);
// Step 2 : create a page with tall courses
task('training-list', () =>
  src('build/.tmp/trainingindex.json')
    .pipe(website.readIndex())
    .pipe(website.convertToBlogList('src/main/client/templates/trainings.handlebars', HANDLEBARS_PARTIALS, 'trainings.html', 100))
    .pipe(htmlmin(HTMLMIN_OPTIONS))
    .pipe(dest('build/dist/training'))
);
// Step 3 : generate an HTML page for each blog entry written in asciidoc
task('training-page', (cb) => {
  src('src/main/client/training/**/*.adoc')
    .pipe(website.readAsciidoc())
    .pipe(website.convertToHtml())
    .pipe(website.highlightCode({selector: 'pre.highlight code'}))
    .pipe(website.convertToBlogPage('src/main/client/templates/training.handlebars', HANDLEBARS_PARTIALS, 'build/.tmp/trainingindex.json'))
    .pipe(htmlmin(HTMLMIN_OPTIONS))
    .pipe(size({title: 'html', showFiles: true}))
    .pipe(dest('build/dist/training'))
    .on('end', () => cb())
});

task('training', series('training-indexing', 'training-list', 'training-page'));

// HTML pages generation
// =============================
task('html-indexing', () =>
  src(`src/main/client/html/**/*.html`)
    .pipe(website.readHtml())
    .pipe(website.convertToJson('pageindex.json'))
    .pipe(dest('build/.tmp')));

task('html-template', () =>
  src(`src/main/client/html/**/*.html`)
    .pipe(website.readHtml())
    .pipe(website.applyTemplate(`src/main/client/templates/site.handlebars`, HANDLEBARS_PARTIALS))
    .pipe(size({title: 'html', showFiles: true}))
    .pipe(dest('build/.tmp'))
    .pipe(htmlmin(HTMLMIN_OPTIONS))
    .pipe(dest('build/dist')));

task('html', parallel('html-indexing', 'html-template'));

// Javascript files
// =============================
task('local-js', () =>
  src(['src/main/client/js/*.js'])
    .pipe(babel({presets: ['@babel/env']}))
    .pipe(rev())
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(size({title: 'scripts'}))
    .pipe(replace('$serviceWorkerVersion', serviceWorkerVersion))
    .pipe(sourcemaps.write())
    .pipe(dest('build/dist/js'))
    .pipe(rev.manifest())
    .pipe(dest('build/dist/js'))
);

task('vendor-js', () =>
  src(['node_modules/fg-loadcss/src/*.js'])
    .pipe(uglify())
    .pipe(dest('build/dist/js'))
);

// Images files
// =============================
// Converts png and jpg in webp
task('images-webp', () =>
  src('src/main/client/img/**/*.{png,jpg}')
    .pipe(webp() as Duplex)
    .pipe(dest('build/.tmp/img'))
);
// minify assets
task('images-minify', () =>
  src('src/main/client/img/**/*.{svg,png,jpg}')
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.optipng(),
      imagemin.svgo()]))
    .pipe(size({title: 'images', showFiles: false}))
    .pipe(dest('build/.tmp/img'))
);
// In dev mode copy are just copied
task('images-dev', () =>
  src('src/main/client/images/**/*.{svg,png,jpg}').pipe(dest('build/.tmp/img'))
);

// Images generated in image pre processing are renamed with a MD5 (cache busting) and copied in the dist directory
task('images', () =>
  src('build/.tmp/img/**/*.{svg,png,jpg,webp}')
  //.pipe(dest('build/dist/img'))
    .pipe(rev())
    .pipe(dest('build/dist/img'))
    .pipe(rev.manifest())
    .pipe(dest('build/dist/img'))
);

// Image post processing is used to copy in dist directory images used without cache busting id
task('images-logo', () =>
  src('src/main/client/img/**/logo*.*')
    .pipe(dest('build/dist/img'))
);

// Copy static files
// =============================
task('copy', (cb) =>
  src(['src/main/client/*.{ico,html,txt,pdf,json,webapp,xml}', 'src/main/client/**/*.htaccess', 'node_modules/workbox-sw/build/*-sw.js'], {dot: true})
    .pipe(size({title: 'copy', showFiles: true}))
    .pipe(dest('build/dist'))
    .on('end', () => cb())
);
task('copy-backend', (cb) =>
  src(['src/main/server/**/*.handlebars'], {dot: true})
    .pipe(dest('build/src/main/server'))
    .on('end', () => cb())
);

// Service workers
// =============================
const SW_MANIFEST_OPTIONS = {
  swSrc: 'src/main/client/sw.js',
  swDest: 'build/.tmp/sw.js',
  globDirectory: './build/dist',
  globIgnores: ['training/**/*.*', '**/sw*.js', '**/workbox*.js'],
  globPatterns: ['**/*.{js,svg}']
};

task('service-worker-bundle', () =>
  workboxBuild.injectManifest(SW_MANIFEST_OPTIONS)
    .then(({count, size, warnings}) => {
      // Optionally, log any warnings and details.
      warnings.forEach(console.warn);
      console.log(`${count} files will be precached, totaling ${size} bytes.`);
    })
    .catch((err) => {
    console.log('[ERROR] This happened: ' + err);
  })
);

task('service-worker-optim', () =>
  src(`build/.tmp/*.js`)
    .pipe(rev())
    .pipe(replace('$serviceWorkerVersion', serviceWorkerVersion))
    .pipe(sourcemaps.init())
    .pipe(sourcemaps.write())
    //.pipe(uglify())
    .pipe(size({title: 'scripts'}))
    .pipe(sourcemaps.write('.'))
    .pipe(dest(`build/dist`))
    .pipe(rev.manifest())
    .pipe(dest(`build/dist`))
);

task('service-worker-updgrade', (fg) => {
  const errorCallback = (err) => {
    if (err) throw err;
    console.log('File with version saved!');
  };
  // We have to save the new service worker version for next build
  fs.writeFile(SW_VERSION_FILE + '.json', '{ "swVersion" : ' + (serviceWorkerVersion + 1) + '}', errorCallback);
  fg();
});

task('service-worker', series('service-worker-bundle', 'service-worker-optim', 'service-worker-updgrade'));

// Site
// =============================
task('sitemap', () =>
  src(['build/.tmp/blogindex.json', 'build/.tmp/pageindex.json'])
    //.pipe(website.readIndex())
    .pipe(website.convertToSitemap())
    .pipe(dest('build/dist'))
);

// Cache busting
// =============================
const cacheBusting = (path, target?: string) =>
  src(path)
    .pipe(revReplace({
      manifest: src('build/dist/img/rev-manifest.json'),
      replaceInExtensions: CACHE_BUSTING_EXTENSIONS
    }))
    .pipe(revReplace({
      manifest: src('build/dist/css/rev-manifest.json'),
      replaceInExtensions: CACHE_BUSTING_EXTENSIONS
    }))
    .pipe(revReplace({
      manifest: src('build/dist/js/rev-manifest.json'),
      replaceInExtensions: CACHE_BUSTING_EXTENSIONS
    }))
    .pipe(dest(target ? target : 'build/dist'));

task('cache-busting-backend', () => cacheBusting('build/src/main/server/views/**/*.handlebars', 'build/src/main/server/views'));
task('cache-busting-dev', () => cacheBusting('build/dist/**/*.{html,js,css}'));
task('cache-busting', () => cacheBusting('build/dist/**/*.{html,js,css,xml,json,webapp}'));
task('cache-busting-sw', () =>
  src('build/dist/**/main*.js')
    .pipe(revReplace({manifest: src('build/dist/rev-manifest.json'), replaceInExtensions: ['.js']}))
    .pipe(dest('build/dist')));

// Watcher used in dev
// =============================
task('watch-html', () =>
  watch('src/main/client/**/*.html', series('html', 'cache-busting-dev')));
task('watch-scss', () =>
  watch('src/main/client/**/*.{scss,css}', series('styles', 'blog', 'training', 'html', 'cache-busting-dev')));
task('watch-adoc', () =>
  watch('src/main/client/**/*.adoc', series('blog', 'training', 'cache-busting-dev')));
task('watch-js', () =>
  watch('src/main/client/**/*.js', series('local-js', 'blog', 'training', 'html', 'cache-busting-dev')));
task('watch-img', () =>
  watch('src/main/client/img/**/*', series('images', 'blog', 'training', 'html', 'cache-busting-dev')));
task('watch-template', () =>
  watch('src/main/client/**/*.handlebars', series('blog', 'training', 'html', 'cache-busting-dev')));
task('watch-backend', () =>
  watch('src/main/server/**/*.{handlebars,ts}', series('build-backend')));

task('watch', parallel('watch-html', 'watch-scss', 'watch-adoc', 'watch-js', 'watch-img', 'watch-template', 'watch-backend'));

task('build', series(
  'images-minify',
  'images-webp',
  'styles',
  'blog',
  'images',
  'images-logo',
  'html',
  'local-js',
  'vendor-js',
  'copy',
  'training',
  'cache-busting',
  'service-worker',
  'cache-busting-sw'
  ));

task('build-backend', series('clean-backend','copy-backend', 'cache-busting-backend'));

task('build-dev', series(
  'clean',
  'images-dev',
  'styles',
  'blog',
  'images',
  'images-logo',
  'html',
  'local-js',
  'vendor-js',
  'copy',
  'training',
  'cache-busting',
  'service-worker',
  'cache-busting-sw'));

//
// // Build production files, the default task
task('default', series('clean', 'build', 'sitemap'));

// // Build dev files
task('serve', series('build-dev', 'watch'));

