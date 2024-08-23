(function() {
	"use strict";

	var
		gulp = require("gulp"),
		replace = require('gulp-replace'),
		sass = require('gulp-sass')(require('node-sass')),
		uglify = require("gulp-uglify"),
		eslint = require("gulp-eslint");

	var
		sources = {
			js: [ "web-src/smarthome.js", "web-src/static.js", "web-src/settings.js" ],
			sass: "web-src/smarthome.scss",
			snippets: {
				all: "snippets-src/**",
				versioned: [ "snippets-src/main.html", "snippets-src/main_static.html" ]
			}
		};

	var paths = {
	        FontLibs: [
			'./node_modules/material-icons/iconfont/material-icons.woff*',
			'./node_modules/framework7-icons/fonts/Framework7Icons-Regular.woff*',
			'./node_modules/framework7-icons/fonts/Framework7Icons-Regular.ttf'
	        ]
	    };
	
	gulp.task("copyFontLibs", function () {
	    return gulp.src(paths.FontLibs, { encoding: false })
	        .pipe(gulp.dest('./src/main/resources/web/fonts'));
	});

	gulp.task("css", function() {
		return gulp.src(sources.sass)
			.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
			.pipe(gulp.dest("./src/main/resources/web"));
	});

	gulp.task("eslint", function() {
		return gulp.src(sources.js)
			.pipe(eslint({
				configFile: "eslint.json"
			}))
			.pipe(eslint.format())
			.pipe(eslint.failAfterError());
	});

	gulp.task("js", function() {
		return gulp.src(sources.js)
			.pipe(uglify())
			.pipe(gulp.dest("./src/main/resources/web"));
	});

	gulp.task("snippetsAll", function() {
		return gulp.src(sources.snippets.all)
			.pipe(gulp.dest("./src/main/resources/snippets"))
	});

	gulp.task("snippetsVersioned", function() {
		// Convert ISO String "2011-10-05T14:48:00.000Z" -> "YYYYMMDDHHmm"
		var buildVersion = new Date().toISOString().slice(0, 16).replaceAll(/[T:-]/g, "");
		return gulp.src(sources.snippets.versioned)
			.pipe(replace("%version%", buildVersion))
			.pipe(gulp.dest("./src/main/resources/snippets"))
	});

	gulp.task("default", gulp.parallel("css", "copyFontLibs", gulp.series("eslint", "js"), 
		gulp.series("snippetsAll", "snippetsVersioned")));
})();
