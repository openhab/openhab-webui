var clean = require('gulp-clean');
var concat = require('gulp-concat');
var cleanCSS = require('gulp-clean-css');
var eslint = require('gulp-eslint');
var gulp = require('gulp');
var gulpFilter = require('gulp-filter');
var mainBowerFiles = require('gulp-main-bower-files');
var path = require('path');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var uglify = require('gulp-uglify');
var watch = require('gulp-watch');
var webserver = require('gulp-webserver');
var through = require('through2');
var pofile = require('pofile');



// linting (not used)

gulp.task('lint', function() {
    return gulp.src(['app/**/*.js'])
        .pipe(eslint())
        .pipe(eslint.format());
});


// live reload for SASS development

gulp.task('web-server', function() {
    gulp.src('./')
        .pipe(webserver({
            livereload: true,
            directoryListing: false,
            open: true
        }));
});

gulp.task('watch', function() {
    gulp.watch([
        './app/widgets/**/[^_]*.scss', // omit internal styles starting with "_"
        './assets/styles/**/*.scss',
        './vendor/**/*.scss'
    ], ['sass']);
});

gulp.task('server', gulp.series('watch', 'web-server'));


// SASS processing

gulp.task('sass-vendor', function() {
    gulp.src('./vendor/styles.scss')
        .pipe(plumber())
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(cleanCSS({
            compatibility: '*,-properties.merging'
        }))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest('./vendor'));
});

gulp.task('sass', gulp.series('sass-vendor'));


// i18n PO files to JSON conversion

gulp.task('i18n-po2json', function() {
    return gulp.src('./assets/i18n/*/*.po')
        .pipe((function () {
            // Borrowed from the gulp-po-json package
            // https://github.com/Ulflander/gulp-po-json/
            // with the following changes:
            // use pofile instead of node-po (which doesn't support msgctxt lines),
            // use msgctxt as key instead of msgid, ignore empty lines, prettify the output
            function write(f, enc, cb) {
                // console.log('Processing ' + f.path);

                if (f.isNull()) {
                    this.push(f);
                    return cb();
                }

                if (f.path.indexOf('en.po') >= 0) {
                    this.push(f);
                    return cb();
                }

                if (f.isStream()) {
                    this.emit('error', 'po2json: Streaming not supported');
                    return cb();
                }

                var po = pofile.parse(f.contents.toString('utf-8'));
                if (!po) {
                    this.emit('error', 'po2json: Unable to parse file ' + f.path);
                    return cb();
                }

                var res = {};
                res._meta = po.headers;

                for (var i = 0, l = po.items.length; i < l; i += 1) {
                    if (po.items[i].msgstr[0]) {
                        res[po.items[i].msgctxt] = po.items[i].msgstr[0];
                    }
                }

                f.path = f.path.replace(/\.po$/gi, '.json');
                f.contents = new Buffer(JSON.stringify(res, null, 4));
                this.push(f);
                cb();
            }

            function end(cb) {
                cb();
            }

            return through.obj(write, end);
        })()).pipe(gulp.dest('./assets/i18n'));
});

gulp.task('i18n', gulp.series('i18n-po2json'));


// vendor resources processing

gulp.task('vendor-fonts', function() {
    return gulp.src([
        'bower_components/bootstrap-sass/assets/fonts/*/**',
        'bower_components/roboto-fontface/fonts/*/Roboto-Regular.*'
    ]).pipe(gulp.dest('fonts'));
});

gulp.task('uglify-timeline', function() {
    return gulp.src('bower_components/d3-timeline/src/d3-timeline.js')
        .pipe(uglify())
        .pipe(gulp.dest('bower_components/d3-timeline/dist'));
});

gulp.task('vendor-js', gulp.series('uglify-timeline', function() {
    // var filterJS = gulpFilter('**/*.js', { restore: true });
    // return gulp.src('./bower.json')
    //            .pipe(mainBowerFiles({debugging: true}))
    //            .pipe(filterJS)
    //            .pipe(concat('vendor.js'))
    //            .pipe(uglify())
    //            .pipe(filterJS.restore)
    //            .pipe(gulp.dest('lib'));

    return gulp.src([
        'bower_components/angular/angular.min.js',
        'bower_components/angular-route/angular-route.min.js',
        'bower_components/angular-touch/angular-touch.min.js',
        'bower_components/d3/d3.min.js',
        'bower_components/sprintf/dist/sprintf.min.js',
        'bower_components/angular-gridster/dist/angular-gridster.min.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'bower_components/angular-sanitize/angular-sanitize.min.js',
        'bower_components/angular-translate/angular-translate.min.js',
        'bower_components/angular-translate-loader-partial/angular-translate-loader-partial.min.js',
        'bower_components/angular-fullscreen/src/angular-fullscreen.js',
        'bower_components/sprintf/dist/angular-sprintf.min.js',
        'bower_components/angular-prompt/dist/angular-prompt.min.js',
        'bower_components/angular-local-storage/dist/angular-local-storage.min.js',
        'bower_components/angular-ui-codemirror/ui-codemirror.min.js',
        'bower_components/angularjs-slider/dist/rzslider.min.js',
        'bower_components/angular-clipboard/angular-clipboard.js',
        'bower_components/ng-knob/dist/ng-knob.min.js',
        'bower_components/inobounce/inobounce.min.js',
        'bower_components/oclazyload/dist/ocLazyLoad.min.js',
        'bower_components/angular-ui-clock/dist/angular-clock.min.js',
        'bower_components/angular-ui-select/dist/select.min.js',
        'bower_components/angular-dynamic-locale/dist/tmhDynamicLocale.min.js',
        'bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'bower_components/angular-file-saver/dist/angular-file-saver.bundle.min.js',
        'bower_components/snapjs/snap.min.js',
        'bower_components/angular-snap/angular-snap.min.js',
        'bower_components/event-source-polyfill/eventsource.min.js',
        'bower_components/d3-timeline/dist/d3-timeline.js',
        'bower_components/aCKolor/dist/js/aCKolor.min.js',
        'node_modules/n3-charts/build/LineChart.min.js',
        'vendor/angular-web-colorpicker.js'
    ]).pipe(concat('vendor.js')).pipe(gulp.dest('vendor'));

}));

gulp.task('vendor-angular-i18n', function () {
    /* don't copy regional-specific except for selected common particular cases -
       add exceptions to app/services/openhab.service.js too */
    return gulp.src([
        'bower_components/angular-i18n/angular-locale_??.js',
        'bower_components/angular-i18n/angular-locale_es-ar.js',
        'bower_components/angular-i18n/angular-locale_de-at.js',
        'bower_components/angular-i18n/angular-locale_en-au.js',
        'bower_components/angular-i18n/angular-locale_fr-be.js',
        'bower_components/angular-i18n/angular-locale_es-bo.js',
        'bower_components/angular-i18n/angular-locale_pt-br.js',
        'bower_components/angular-i18n/angular-locale_en-ca.js',
        'bower_components/angular-i18n/angular-locale_fr-ca.js',
        'bower_components/angular-i18n/angular-locale_fr-ch.js',
        'bower_components/angular-i18n/angular-locale_es-co.js',
        'bower_components/angular-i18n/angular-locale_en-gb.js',
        'bower_components/angular-i18n/angular-locale_en-hk.js',
        'bower_components/angular-i18n/angular-locale_zh-hk.js',
        'bower_components/angular-i18n/angular-locale_en-ie.js',
        'bower_components/angular-i18n/angular-locale_en-in.js',
        'bower_components/angular-i18n/angular-locale_fr-lu.js',
        'bower_components/angular-i18n/angular-locale_es-mx.js',
        'bower_components/angular-i18n/angular-locale_en-nz.js',
        'bower_components/angular-i18n/angular-locale_en-sg.js',
        'bower_components/angular-i18n/angular-locale_zh-sg.js',
        'bower_components/angular-i18n/angular-locale_es-us.js',
        'bower_components/angular-i18n/angular-locale_zh-tw.js',
        'bower_components/angular-i18n/angular-locale_en-za.js'
    ]).pipe(gulp.dest('vendor/i18n'));
});

gulp.task('codemirror-lib', function() {
    return gulp.src([
        'bower_components/codemirror/lib/codemirror.js'
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/lib'));
});

gulp.task('codemirror-css', function() {
    return gulp.src([
        'bower_components/codemirror/lib/codemirror.css'
    ]).pipe(gulp.dest('vendor/cm/lib'));
});

gulp.task('codemirror-addon-fold', function() {
    return gulp.src([
        'bower_components/codemirror/addon/fold/xml-fold.js',
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/addon/fold'));
});

gulp.task('codemirror-addon-mode', function() {
    return gulp.src([
        'bower_components/codemirror/addon/mode/overlay.js',
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/addon/mode'));
});

gulp.task('codemirror-addon-edit', function() {
    return gulp.src([
        'bower_components/codemirror/addon/edit/matchbrackets.js',
        'bower_components/codemirror/addon/edit/matchtags.js',
        'bower_components/codemirror/addon/edit/closebrackets.js',
        'bower_components/codemirror/addon/edit/closetag.js',
        'bower_components/codemirror/mode/xml/xml.js'
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/addon/edit'));
});

gulp.task('codemirror-mode-xml', function() {
    return gulp.src([
        'bower_components/codemirror/mode/xml/xml.js'
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/mode/xml'));
});

gulp.task('codemirror-mode-javascript', function() {
    return gulp.src([
        'bower_components/codemirror/mode/javascript/javascript.js'
    ]).pipe(uglify()).pipe(gulp.dest('vendor/cm/mode/javascript'));
});

gulp.task('codemirror-theme', function() {
    return gulp.src([
        'bower_components/codemirror/theme/rubyblue.css'
    ]).pipe(gulp.dest('vendor/cm/theme'));
});

gulp.task('codemirror', gulp.series(
    'codemirror-lib',
    'codemirror-css',
    'codemirror-addon-fold',
    'codemirror-addon-mode',
    'codemirror-addon-edit',
    'codemirror-mode-xml',
    'codemirror-mode-javascript',
    'codemirror-theme'
));

gulp.task('vendor', gulp.series(
    'vendor-js',
    'vendor-fonts'
));

gulp.task('default', gulp.series('vendor', 'codemirror'));
