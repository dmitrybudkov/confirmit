var gulp = require('gulp'),
    sass = require('gulp-sass'),
    pug = require('gulp-pug'),
    babel = require('gulp-babel'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    uglify = require('gulp-uglify'),
    plumber = require('gulp-plumber'),
    rename = require('gulp-rename'),
    csscomb = require('gulp-csscomb'),
    rimraf = require('rimraf'),
    browserSync = require('browser-sync'),

    cleanCSS = require('gulp-clean-css'),
    reload = browserSync.reload;

var path = {

    src: {
        /* ===========================  JavaScript files    =========================== */
        js: {
            script: './src/js/script.js',
            libs:   './src/js//libs/**/*.js'
        },
        /* ===========================  SCSS files  =========================== */
        scss: {
            style: [
                './src/scss/style.scss',
                './src/scss/_core/**/*.scss',
                './src/scss/_components/**/*.scss',
                './src/scss/_modules/**/*.scss',
                './src/scss/_helpers/**/*.scss'
            ],
            libs: './src/scss/libs/**/*.scss'
        },
        /* ===========================  Pug files  =========================== */
        templates: './src/templates/*.pug'
    },

    dest: {
        /* ====  JavaScript files  ==== */
        js: {
            script: '../js/',
            libs: '../js/libs/'
        },
        /* ====  SCSS files  ==== */
        css: {
            style: '../',
            libs: '../css/libs/'
        },
        /* ====  Pug files  ==== */
        templates: '../html/'
    },

    clean: './dest'
};


/* ===========================  JavaScript files  =========================== */
function jsTask(taskName, src, dest, concatNameFile) {
    gulp.task(taskName, function () {
        gulp.src(src)
            .pipe(babel({
                presets: ['es2015']
            }))
            .pipe(concat(concatNameFile))
            // .pipe(uglify())
            .pipe(gulp.dest(dest));
    });
}

gulp.task('dev-jsTransportLibs', function() {
    gulp.src(path.src.js.libs)
        .pipe(gulp.dest(path.dest.js.libs))
});

jsTask('dev-jsScript', path.src.js.script, path.dest.js.script, 'script.js');


/* ===========================  SCSS files  =========================== */
function scssTask(taskName, src, dest, name) {
    if (name !== undefined) {
        gulp.task(taskName, function () {
            gulp.src(src)
                .pipe(plumber({
                    errorHandler: notify.onError("Error: <%= error.message %>")
                }))
                .pipe(sass())
                .pipe(rename(name))
                .pipe(autoprefixer({
                    browsers: ['> 1%', 'last 15 versions'],
                    cascade: false
                }))
                .pipe(plumber.stop())
                .pipe(notify("style.scss (DEV) compiled success!"))
                .pipe(csscomb())
                .pipe(cleanCSS({compatibility: 'ie8'}))
                .pipe(gulp.dest(dest));
        });
    } else {
        gulp.task(taskName, function () {
            gulp.src(src)
                .pipe(plumber({
                    errorHandler: notify.onError("Error: <%= error.message %>")
                }))
                .pipe(sass())
                .pipe(autoprefixer({
                    browsers: ['> 1%', 'last 15 versions'],
                    cascade: false
                }))
                .pipe(plumber.stop())
                .pipe(notify("style.scss (DEV) compiled success!"))
                .pipe(csscomb())
                .pipe(cleanCSS({compatibility: 'ie8'}))
                .pipe(gulp.dest(dest))
                .pipe(reload({stream: true}));
        });
    }

}

scssTask('dev-sass', path.src.scss.style, path.dest.css.style, 'style.css');
scssTask('dev-sass-libs', path.src.scss.libs, path.dest.css.libs);

/* ===========================  Templates files  =========================== */
gulp.task('dev-pug', function () {
    return gulp.src(path.src.templates)
        .pipe(plumber({
            errorHandler: notify.onError("Error: <%= error.message %>")
        }))
        .pipe(pug({
            pretty: '\t'
            //debug: true
            //locals: jadedata
        }))
        .pipe(gulp.dest(path.dest.templates));
});

/*============= watch task =============*/
gulp.task('watch', function () {
    gulp.watch(path.src.js.script, ['dev-jsScript']);
    gulp.watch(path.src.js.libs, ['dev-jsTransportLibs']);
    gulp.watch(path.src.scss.style, ['dev-sass']);
    gulp.watch(path.src.scss.libs, ['dev-sass-libs']);
});

gulp.task('default', ['watch']);