const { src, dest, series, parallel, watch } = require('gulp');
const gutil = require('gulp-util'),
    plumber = require('gulp-plumber');
    newer = require('gulp-newer'),
    fileinclude = require('gulp-file-include'),
    htmlhint = require("gulp-htmlhint"),
    sass = require('gulp-sass'),
    autoprefixer = require('gulp-autoprefixer'),
    csscomb = require('gulp-csscomb'),
    cssmin = require('gulp-cssmin'),
    gcmq = require('gulp-group-css-media-queries'),
    jshint = require('gulp-jshint'),
    babel = require('gulp-babel'),
    browsersync = require("browser-sync").create(),
    merge = require('merge-stream'),
    data = require('gulp-data'),
    template = require('gulp-template'),
    fs = require('fs'),
    path = require('path'),
    del = require('del'),
    origin = "source/",
    project = "./",
    prefix = "";

// const clean = async (done) => {
//     await del([`${project}`]);
//     done();
// }

const html = ()=> src([`${origin}**/*.html`, `!${origin}**/include/*.html`])
    .pipe(newer(`${origin}**/*.html`))
    .pipe(htmlhint('hint/.htmlhintrc'))
    .pipe(template())
    .pipe(dest(`${project}`))
    .pipe(browsersync.stream());


const js = ()=> src(`${origin}**/js/*.js`)
    .pipe(newer(`${origin}**/js/*.js`))
    .pipe(plumber({errorHandler : gutil.log}))
    .pipe(jshint())
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(dest(`${project}${prefix}`))
    .pipe(browsersync.stream());


const css = () => src([`${origin}**/css/**/*.{scss,sass,css}`,`!${origin}**/css/mixin/*.{scss,sass}`])
    .pipe(newer(`${origin}**/css/**/*.{scss,sass,css}`))
    // .pipe(sourcemaps.init())
    .pipe(sass.sync().on('error', sass.logError))
    // .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gcmq())
    .pipe(csscomb({
        configPath: 'hint/.csscomb.json'
    }))
    // .pipe(sourcemaps.write())
    // .pipe(cssmin())
    .pipe(dest(`${project}${prefix}`))
    .pipe(browsersync.stream());;

const images = () => src([
    `${origin}**/images/**/*.{gif,jpeg,jpg,png,svg}`,
])
.pipe(newer(`${project}${prefix}**/*.{gif,jpeg,jpg,png,svg}`))
.pipe(dest(`${project}${prefix}`))

const browserSyncInit = (done)=>{
    browsersync.init({
        server: {
            baseDir: `${project}/`,
        },
        port: 5000
    },(err,bs)=>{
        console.log('err : ', err);
        console.log('server : ', bs.options.get('server'));
        console.log('urls : ', bs.options.get('urls'));
    });
    done();
}

const watcher = () => {
    watch([`${origin}**/*.html`, `${origin}json/**/*.json`], html).on('change', browsersync.reload);
    watch([`${origin}**/*.{scss,sass.css}`], css).on('change', browsersync.reload);
    watch([`${origin}**/*.js`], js).on('change', browsersync.reload);
    watch([`${origin}**/*.{gif,jpeg,jpg,png,svg}`], images).on('change', browsersync.reload);
}

exports.default = series(parallel(html, css, js, images));
exports.serve = series(parallel(html, css, js, images), parallel(browserSyncInit, watcher) );