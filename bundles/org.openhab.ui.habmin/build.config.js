/**
 * This file/module contains all configuration for the build process.
 */
module.exports = {
    /**
     * The `build_dir` folder is where our projects are compiled during
     * development and the `compile_dir` folder is where our app resides once it's
     * completely built.
     */
    build_lib_dir: "target/web/lib",
    build_dir: 'target/web/build',
    compile_dir: 'target/web/compile',
    compile_tmp_dir: 'target/web/tmp',
    cordova_dir: 'cordova',
    output_dir: 'target/web/output',
    bundle_dir: 'web',
    language_dir: 'src/web/languages',

    /**
     * This is a collection of file patterns that refer to our app code (the
     * stuff in `src/`). These file paths are used in the configuration of
     * build tasks. `js` is all project javascript, less tests. `ctpl` contains
     * our reusable components' (`src/common`) template HTML files, while
     * `atpl` contains the same, but for our app's code. `html` is just our
     * main HTML file, `less` is our main stylesheet, and `unit` contains our
     * app's unit tests.
     */
    app_files: {
        js: [ '**/*.js', '!**/*.spec.js', '!assets/**/*.js' ],
        jsunit: [ 'src/web/**/*.spec.js' ],

        atpl: [ 'src/web/app/**/*.tpl.html' ],
        ctpl: [ 'src/web/common/**/*.tpl.html' ],

        html:  'src/web/index.html' ,
        less: 'src/web/less/main.less'
    },

    /**
     * This is a collection of files used during testing only.
     */
    test_files: {
        js: [
            'angular-mocks/angular-mocks.js'
        ]
    },

    /**
     * This is the same as `app_files`, except it contains patterns that
     * reference vendor code (`vendor/`) that we need to place into the build
     * process somewhere. While the `app_files` property ensures all
     * standardized files are collected for compilation, it is the user's job
     * to ensure non-standardized (i.e. vendor-related) files are handled
     * appropriately in `vendor_files.js`.
     *
     * The `vendor_files.js` property holds files to be automatically
     * concatenated and minified with our project source files.
     *
     * The `vendor_files.css` property holds any CSS files to be automatically
     * included in our app.
     *
     * The `vendor_files.assets` property holds any assets to be copied along
     * with our app's assets. This structure is flattened, so it is not
     * recommended that you use wildcards.
     */
    vendor_files: {
        js: [
            'jquery/dist/jquery.js',
            'angular/angular.js',
            'angular-animate/angular-animate.js',
            'angular-growl-v2/build/angular-growl.js',
            'angular-http-auth/src/http-auth-interceptor.js',
            'angular-resource/angular-resource.js',
            'angular-sanitize/angular-sanitize.js',
            'angular-touch/angular-touch.js',
            'angular-ui-router/release/angular-ui-router.js',
//            'angular-ui-utils/modules/route/route.js',
            'tinycolor/tinycolor.js',
            'moment/moment.js',
            'moment/locale/da.js',
            'moment/locale/de.js',
            'moment/locale/fr.js',
            'moment/locale/it.js',
            'moment/locale/nl.js',
            'moment/locale/pl.js',
            'moment/locale/ru.js',
            'moment/locale/sv.js',
            'ace-builds/src-min-noconflict/ace.js',
            'ace-builds/src-min-noconflict/theme-tomorrow.js',
            'ace-builds/src-min-noconflict/theme-tomorrow_night_bright.js',
            'angular-ui-ace/ui-ace.js',
            'angular-gridster/src/angular-gridster.js',
            'jquery-ui/ui/core.js',
            'jquery-ui/ui/widget.js',
            'jquery-ui/ui/mouse.js',
            'jquery-ui/ui/draggable.js',
            'jquery-ui/ui/resizable.js',
            'angular-ui-calendar/src/calendar.js',
            'fullcalendar/dist/fullcalendar.js',
            'vis/dist/vis.js',
            'angular-base64/angular-base64.js',
            'checklist-model/checklist-model.js',
            'angular-rt-popup/dist/angular-rt-popup.js',
            'angular-ui-select/dist/select.js',
            'angular-input-modified/dist/angular-input-modified.js',
            'angular-drag-and-drop-lists/angular-drag-and-drop-lists.js',
            'angularjs-slider/src/rzslider.js',
            'screenfull/dist/screenfull.js',
            'angular-screenfull/dist/angular-screenfull.js',
            'slimScroll/jquery.slimscroll.js',
            'angular-slimscroll/angular-slimscroll.js',
            'angular-clipboard/angular-clipboard.js',
            'angular-promise-extras/angular-promise-extras.js',
            'angular-moment/angular-moment.js',
            'angular-xeditable/dist/js/xeditable.js',
            'pick-a-color/src/js/pick-a-color.js',
            'angular-pick-a-color/src/angular-pick-a-color.js',
            'angular-bootstrap/ui-bootstrap-tpls.js',
            'angular-visjs/angular-vis.js',
            'angular-localization/angular-localization.js',
            'angular-toggle-switch/angular-toggle-switch.js',
            'angular-blockly/build/angular-blockly.js',
            'angular-blockly/build/blockly_compressed.js',
            'angular-blockly/build/blocks_compressed.js',
            'angular-blockly/build/en.js',
            'angular-dialgauge/src/angular-dialgauge.js'
        ],
        css: [
            'angular-growl-v2/build/angular-growl.css',
            'jquery-ui/themes/base/core.css',
            'jquery-ui/themes/base/resizable.css',
            'oa-font/css/style.css',
            'fullcalendar/dist/fullcalendar.css',
            'angular-ui-select/dist/select.css',
            'vis/dist/vis.css',
            'angular-xeditable/dist/css/xeditable.css',
            'angular-toggle-switch/angular-toggle-switch.css',
            'angular-toggle-switch/angular-toggle-switch-bootstrap.css',
            'font-awesome/css/font-awesome.css',
            'weather-icons/css/weather-icons.css'
        ],
        assets: [
            'flag-icon-css/flags/4x3/de.svg',
            'flag-icon-css/flags/4x3/dk.svg',
            'flag-icon-css/flags/4x3/fr.svg',
            'flag-icon-css/flags/4x3/gb.svg',
            'flag-icon-css/flags/4x3/it.svg',
            'flag-icon-css/flags/4x3/nl.svg',
            'flag-icon-css/flags/4x3/pl.svg',
            'flag-icon-css/flags/4x3/ru.svg',
            'flag-icon-css/flags/4x3/se.svg',
            'angular-blockly/media/*'
        ],
        fonts: [
            'oa-font/fonts/*',
            'font-awesome/fonts/*',
            'weather-icons/font/*'
        ]
    },

    /**
     * The name of each skin.
     */
    skins: [
        'skin-blue'
    ],

    /**
     * The list of languages we support
     */
    languages: [
        'da-DK',
        'de-DE',
        'en-GB',
        'fr-FR',
        'it-IT',
        'pl-PL',
        'sv-SE',
        'ru-RU'
    ],

    /**
     * Customisation of splashscreen and navscreen
     */
    splashScreen: {
        image: "",
        background: "white"
    },
    navScreen: {
        image: ""
    }
};
