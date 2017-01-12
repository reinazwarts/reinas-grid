'use strict';

var distFolder = './dist/';

// folders for source files
var srcFolder = './src/',
	sassSrcFolder = srcFolder + 'scss/';

// css
var sassSrcFiles = [
	srcFolder+'*.scss',
	sassSrcFolder+'**/*.scss',
	'!'+sassSrcFolder+'libs/*/**/*.scss'
],
cssDistFolder = distFolder + 'css/',

//views
//viewsSrcFiles = './Views/**/*.*',
//viewsDistFolder = distFolder + 'Views/',

// javascript
jsSrcFiles = srcFolder+'**/*.js',
jsDistFolder = distFolder + 'js/',

// images
imgSrcFiles = srcFolder + 'assets/img/**/*.*',
imgDistFolder = distFolder + 'images/',

// fonts
fontSrcFiles = srcFolder + 'assets/fonts/**/*.*',
fontDistFolder = distFolder + 'fonts/',

// libs
libsSrcFolder = 'bower_components/',
libsJsDistFolder = distFolder + 'js/',
libsCssDistFolder = sassSrcFolder+'libs/',// libs css files are put into src folder, and then included through app.scss
libsScssDistFolder = libsCssDistFolder,// libs scss files are put into src folder, and then included through app.scss
sourcemapDistFolder = 'maps/';// this is relative to the dest folder in the stream


// define gulp and its modules
var gulp = require('gulp-help')(require('gulp')),// define gulp and extend its task-api with help-functionality
	autoprefixer = require('gulp-autoprefixer'),// auto-prefix css properties
	concat = require('gulp-concat'),// concatenate files
	dedupe = require('gulp-dedupe'),// check for duplicates of files and remove them if present
	cssnano = require('gulp-cssnano'),// minify css
	del = require('del'),
	filter = require('gulp-filter'),// filter gulp src
	using = require('gulp-using'),// Lists all files used. Helps you to verify what your patterns catch
	ignore = require('gulp-ignore'),// ignore files in src
	imagemin = require('gulp-imagemin'),// optimize images
	imageminPngquant  = require('imagemin-pngquant'),// algorithm for imagemin
	jshint = require('gulp-jshint'),
	mainBowerFiles = require('main-bower-files'),
	notify = require('gulp-notify'),
	print = require('gulp-print'),
	runSequence = require('run-sequence'),// allows tasks to be run sequentially instead of concurrently
	sass = require('gulp-sass'),
	sourcemaps = require('gulp-sourcemaps'),
	stylish = require('jshint-stylish'),
	uglify = require('gulp-uglify'),// for minifying js files
	watch = require('gulp-watch'),// gulp has its own built in watch function, but that doesn't watch for new or deleted file. The gulp-watch module is more powerful.
	svgstore = require('gulp-svgstore'),
	//svgmin = require('gulp-svgmin'),
	rename = require('gulp-rename');

// set up sass tasks
var autoprefixerOptions = {
	browsers: ['last 2 versions'],
	cascade: false
};
var sassOptions = {
	errLogToConsole: true
};
var sassDescription = 'compile scss files into css and minify'
gulp.task('build-sass', sassDescription, function() {
	console.log('starting build-sass');
	return gulp.src(sassSrcFiles)
		//.pipe(print()) // prints all processed filenames to terminal
		.pipe(sourcemaps.init())
		.pipe(sass(sassOptions).on('error', sass.logError))
		.pipe(autoprefixer(autoprefixerOptions))
		.pipe(cssnano())
		.pipe(sourcemaps.write(sourcemapDistFolder))//needs to be used after minify
		.pipe(gulp.dest(cssDistFolder))
		.pipe(notify({ message: 'sass built', onLast: true }));
});



// set up stuff for libs
	var buildBowerDescription = 'Create merged js and css files for bower components';
	gulp.task('build-bower', buildBowerDescription, function() {

		var jsFilter = filter('**/*.js', {restore: true}),
			cssFilter = filter('**/*.css', {restore: true}),
			scssFilter = filter('**/*.scss', {restore: true}),
			jsDestFile = 'libs.js',
			libsCssDistFile = 'libs-css.scss',
			libsScssDistFile = '_libs-scss.scss';

		return gulp.src(mainBowerFiles({base: libsSrcFolder}))
			.pipe(jsFilter)
				//.pipe(print(function(filepath) {return 'build js: '+filepath;}))
				.pipe(concat(jsDestFile))
				.pipe(uglify())
				.pipe(gulp.dest(libsJsDistFolder))
			.pipe(jsFilter.restore)
			.pipe(cssFilter)
				//.pipe(print(function(filepath) {return 'build css:'+filepath;}))
				.pipe(concat(libsCssDistFile))
				.pipe(cssnano())
				.pipe(gulp.dest(libsCssDistFolder))
			.pipe(cssFilter.restore)
			.pipe(scssFilter)
				//.pipe(print(function(filepath) {return 'build scss: '+filepath;}))
				.pipe(concat(libsScssDistFile))
				.pipe(gulp.dest(libsScssDistFolder));
	});


// set up javascript stuff

	// TODO: jshint doesn't report undeclared variables yet?
	// does it abort on fail?
	// define a named function, so we can assign it to a task, but also pass it into pipe
	var checkJshint = function() {
		return gulp.src(jsSrcFiles)
			//.pipe(print()) // prints all processed filenames to terminal
			.pipe(jshint())
			.pipe(jshint.reporter(stylish))
			.pipe(jshint.reporter('fail'));
	};
	var jshintDescription = 'Check js-files with jshint';
	gulp.task('check-jshint', jshintDescription, checkJshint);


	// build-js: jshint, uglify, concatenate.
	var buildJsDescription = 'Run jshint, uglify and concat js files';
	gulp.task('build-js', buildJsDescription, function() {
		console.log('starting build-js');
		console.log(jsSrcFiles);
		return gulp.src(jsSrcFiles)
			//.pipe(print())// can come in handy while debugging: prints all processed filenames to terminal
			//.pipe(checkJshint())
			.pipe(using())
			.pipe(dedupe())
			.pipe(concat('app.min.js'))// concat has to be done *before* uglify, otherwise app.js gets included twice - no idea why?!
			.pipe(uglify())
			.pipe(gulp.dest(jsDistFolder))
			.pipe(notify({ message: 'javascript built', onLast: true }));
	});

	// copy views
	//var copyViewsDescription = 'copy views (.cshtml) to project build folder';
	//gulp.task('copy-views', copyViewsDescription, function () {
		//console.log('starting copy-views');
		//return gulp.src(viewsSrcFiles)
			//.pipe(print())  // prints all processed filenames to terminal
			//.pipe(gulp.dest(viewsDistFolder))
			//.pipe(notify({ message: 'views copied', onLast: true }));
	//});


// set up gulp-watch

	var watchSassDescription = false;// don't show this with gulp-help
	gulp.task('watch-sass', watchSassDescription, function() {
		watch(sassSrcFiles, function() {
			gulp.start('build-sass');
		});
	});

	var watchJsDescription = false;// don't show this with gulp-help
	gulp.task('watch-javascript', watchJsDescription, function () {
		watch(jsSrcFiles, watchJsDescription, function () {
			gulp.start('build-js');
		});
	});

	//var watchViewsDescription = false;// don't show this with gulp-help
	//gulp.task('watch-views', watchViewsDescription, function () {
	//	watch(viewsSrcFiles, function () {
	//		gulp.start('copy-views');
	//	});
	//});


	gulp.task('svgstore', function () {
		return gulp
			.src(srcFolder + '**/*.svg')
			.pipe(rename({ prefix: 'iconnn-' }))
			.pipe(svgstore())
			.pipe(gulp.dest(distFolder + 'svg/'));
	});

	// set up image tasks
	var optimizeImagesDescription = 'Optimize/compress images';
	gulp.task('optimize-images', optimizeImagesDescription, function() {
		return gulp.src(imgSrcFiles)
			//.pipe(print()) // prints all processed filenames to terminal
			.pipe(imagemin({
				progressive: true,
				svgoPlugins: [{removeViewBox: false}],
				use: [imageminPngquant()]
			}))
			.pipe(gulp.dest(imgDistFolder));
	});

	// set up cleaning fonts
	var cleanFontsDescription = 'clean font files and folders';
	gulp.task('clean-fonts', cleanFontsDescription, function () {
		return del(fontDistFolder, { force: true });
	});

	// set up font tasks
	var copyFontsDescription = 'Copy font files';
	gulp.task('copy-fonts', copyFontsDescription, function () {
		return gulp.src(fontSrcFiles)
			//.pipe(print()) // prints all processed filenames to terminal
			.pipe(gulp.dest(fontDistFolder));
	});

	// set up cleaning tasks
	var cleanLibsDescription = 'clean libs files and folders';
	gulp.task('clean-libs', cleanLibsDescription, function() {
		console.log(libsJsDistFolder);
		return del([
			libsJsDistFolder,
			libsCssDistFolder,
			libsScssDistFolder
		], { force: true });
	});


// main gulp tasks

	// initialization task - initialize dependencies, merge 3rd party scripts etc
	gulp.task('init', 'Initialize dependencies', ['build-bower']);

	// combined watch task
	gulp.task('watch', 'Watch js and sass files', ['watch-sass', 'watch-javascript']);

	// combined distribute fonts task
	gulp.task('dist-fonts', 'Clean and copy font files', function () {
		runSequence('clean-fonts', 'copy-fonts');
	});


	// all-compassing build task - running this task should give you all necessary frontend files
	var buildDescription = 'Do all necessary stuff for deployment';
	gulp.task('build', buildDescription, function() {
		//we're using runSequence because init has to be finished before building js and sass
		runSequence('clean-libs', 'init', ['build-js', 'build-sass', 'optimize-images', 'dist-fonts', 'svgstore']);
		// runSequence('clean-libs', 'init', ['build-js', 'build-sass']);
	});


