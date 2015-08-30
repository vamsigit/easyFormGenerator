/**
 *  ------------------------------------------------------
 *  easy form generator — gulpfile —
 *  ------------------------------------------------------
 *
 * INFO on relevant tasks :
 * -------------------------
 * 
 * 1) want to build "only app dependencies"" (only), use :
 * - $ gulp
 * - $ gulp watch
 * 
 * 2) want to build "all dependencies" (vendor + app), use :
 * - $ gulp build:all
 * 
 * ——————————————————————————————————————————————
 * MIT (2015) - Erwan Datin (MacKentoch)
 * https://github.com/MacKentoch/easyFormGenerator
 * ——————————————————————————————————————————————
**/

var gulp 								= require('gulp');
var del    							= require('del');
var jshint 							= require('gulp-jshint');
var concat 							= require('gulp-concat');
var uglify 							= require('gulp-uglify');
var cssmin 							= require('gulp-cssmin');
var sass 								= require('gulp-sass');
var notify 							= require('gulp-notify');
var wrap 								= require('gulp-wrap');
var deleteLines 				= require('gulp-delete-lines');
var ngTemplateCache 		= require('gulp-angular-templatecache');
var minifyHtml					= require('gulp-minify-html');
var sourcemaps 					= require('gulp-sourcemaps');





/**
 * ////////////////////////////////////////////////////////////////
 * CONFIGS
 * ////////////////////////////////////////////////////////////////
 */
var appConfig = require('./easyFormGenConfig/app/appConfig');
var gulpConfig = require('./easyFormGenConfig/gulp/gulpConfig');






/**
 * ------------------
 * CLEANING TASKS :
 * ------------------
 * - dist (all)
 * - public (all)
 * - public (only stepway)
 * - public (only dragdropway)
 */

//clean all dist
gulp.task('dist:clean', function (cb) {
  del([gulpConfig.base.distDir + '**/*'], cb);
});

//clean all public : NOT USED -> use other cleaning tasks (safer)
gulp.task('public:clean', function (cb) {
  del([gulpConfig.base.publicDir + '**/*'], cb);
});

//clean all vendor css  : public dir
gulp.task('public:vendor:css:clean', function (cb) {
  del([gulpConfig.base.root + gulpConfig.destDirs.vendor.css + '/**/*.css'], cb);
});

//clean all vendor js  : public dir
gulp.task('public:vendor:js:clean', function (cb) {
  del([gulpConfig.base.root + gulpConfig.destDirs.vendor.js + '/**/*.js'], cb);
});


//clean all vendor fonts  : public dir
gulp.task('public:vendor:fonts:clean', function (cb) {
  del([gulpConfig.base.root + gulpConfig.destDirs.vendor.fonts + '/**/*'], cb);
});


//clean public : stepway
gulp.task('stepway:clean', function (cb) {
  del([
		gulpConfig.base.publicDir + 'js/' + gulpConfig.destFiles.app.stepway.js,
		gulpConfig.base.publicDir + 'css/' + gulpConfig.destFiles.app.stepway.css,
		], cb);
});

//clean public : dragdropway
gulp.task('dragdropway:clean', function (cb) {
  del([
		gulpConfig.base.publicDir + 'js/' + gulpConfig.destFiles.app.dragAndDropWay.js,
		gulpConfig.base.publicDir + 'css/' + gulpConfig.destFiles.app.dragAndDropWay.css,
		], cb);
});





/**
 * cleaning src/vendor/ temp files
 */
gulp.task('vendor:clean:temp', function(cb){
  del([
		gulpConfig.srcFiles.bowerFiles.css.minifyInThisDir + '**/*.css'
		], cb);	
});










/**
 * -------------------------------
 * VENDORS CSS TASKS
 * -------------------------------
 */
//vendor:css subtask
gulp.task('vendor:css:specialCases', 
		['public:vendor:css:clean'],
		function(){
	gulp.src(gulpConfig.srcFiles.bowerFiles.css.toMinify.srcFile, { cwd: gulpConfig.base.root })
		.pipe(concat(gulpConfig.srcFiles.bowerFiles.css.toMinify.destfileName))
		.pipe(cssmin())
		//.pipe(gulp.dest(gulpConfig.srcFiles.bowerFiles.css.minifyInThisDir, { cwd: gulpConfig.base.root }))
		.pipe(gulp.dest(gulpConfig.destDirs.vendor.css, { cwd: gulpConfig.base.root }))
		
	gulp.src(gulpConfig.srcFiles.bowerFiles.css.toCleanAndMinify.srcFile, { cwd: gulpConfig.base.root })
		.pipe(deleteLines({ 'filters': [/^@import url/] }))
		.pipe(concat(gulpConfig.srcFiles.bowerFiles.css.toCleanAndMinify.destfileName))
		.pipe(cssmin())
		.on('error', notify.onError(function (error) { return 'Error: ' + error.message;}))
		//.pipe(gulp.dest(gulpConfig.srcFiles.bowerFiles.css.minifyInThisDir, { cwd: gulpConfig.base.root }))
		.pipe(gulp.dest(gulpConfig.destDirs.vendor.css, { cwd: gulpConfig.base.root }))
				
});





//vendor:css TASK : css, copyt to public dir
//NOTE : depending 'appConfig.js' : could concat vendor css
gulp.task('vendor:css', 
	[
		'vendor:css:specialCases'
	],  
	function(){
		
		var sources = gulpConfig.srcFiles.bowerFiles.css.noMinify;		
																	
		if(appConfig.concatVendorFiles === true){
			
			gulp.src( sources 
								,{ cwd: gulpConfig.base.root })
					.pipe(concat(gulpConfig.destFiles.vendor.css))
					.pipe(gulp.dest(gulpConfig.destDirs.vendor.css, { cwd: gulpConfig.base.root }))			
		}else{
						
			gulp.src( sources 
								,{ cwd: gulpConfig.base.root })
					.pipe(gulp.dest(gulpConfig.destDirs.vendor.css, { cwd: gulpConfig.base.root }))			
		}
		

});



/**
 * -------------------------------
 * VENDORS FONTS COPY TASK
 * -------------------------------
 */
gulp.task('vendor:fonts', 
			['public:vendor:fonts:clean'], 
			function(){	
 gulp.src(gulpConfig.srcFiles.bowerFiles.fonts, { cwd: gulpConfig.base.root })
 .pipe(gulp.dest(gulpConfig.destDirs.vendor.fonts, { cwd: gulpConfig.base.root }))
});









/**
 * ------------------------------------------------------------
 * VENDOR JS TASKS (SCRIPTS for HEADER : jquery, angular....)
 * ------------------------------------------------------------
 * 
 * NOTE these vendor js never concatenate
 */
gulp.task('vendor:header:js', 
		['public:vendor:js:clean'], 
		function(){
	gulp.src(	gulpConfig.srcFiles.bowerFiles.js.noConcat, 
 				{ cwd: gulpConfig.base.root }) 
 .pipe(gulp.dest(gulpConfig.destDirs.vendor.js, { cwd: gulpConfig.base.root }));
});

/**
 * ------------------------------------------------------------
 * VENDOR JS TASKS (SCRIPTS for FOOTER and concatenable)
 * ------------------------------------------------------------
 * 
 * NOTE : depending 'appConfig.js' : could concat footer vendor js
 */
 gulp.task('vendor:footer:js', 
	 	['public:vendor:js:clean'], 
		 function(){
			 
			if(appConfig.concatVendorFiles === true){			 
				gulp.src(	gulpConfig.srcFiles.bowerFiles.js.toConcat, 
							{ cwd: gulpConfig.base.root })
				.pipe(concat(gulpConfig.destFiles.vendor.js))			  
				.pipe(gulp.dest(gulpConfig.destDirs.vendor.js, { cwd: gulpConfig.base.root }));
			}else{
				gulp.src(	gulpConfig.srcFiles.bowerFiles.js.toConcat, 
							{ cwd: gulpConfig.base.root })
				.pipe(gulp.dest(gulpConfig.destDirs.vendor.js, { cwd: gulpConfig.base.root }));	
			}	 	 
 });
 
 /**
 * ------------------------------------------------------------
 * VENDOR JS TASKS (combine all vendor js tasks)
 * ------------------------------------------------------------
 */
 gulp.task('vendor:js', [
	 'vendor:header:js',
	 'vendor:footer:js'
	]);







/**
 * ------------------------------------------------------------
 * VENDOR MAP TASKS
 * ------------------------------------------------------------
 */
 gulp.task('vendor:map', 
	 	//['public:clean'], 
		 function(){
	gulp.src(	gulpConfig.srcFiles.bowerFiles.maps, 
 				{ cwd: gulpConfig.base.root })	  
 	.pipe(gulp.dest(gulpConfig.destDirs.vendor.js, { cwd: gulpConfig.base.root }));	 
 });










/**
 * -------------------------------
 * APP ANGULAR TEMPLATES CACHE  TASKS
 * -------------------------------
 */
gulp.task('stepway:templatecache', function() {
    return gulp
        .src(gulpConfig.templateCache.stepway.sourceDir + gulpConfig.templateCache.stepway.sourceFiles, 
					{ cwd: gulpConfig.base.root })
        .pipe(minifyHtml(gulpConfig.minifyHtmlOpts))
				.pipe(ngTemplateCache(
            gulpConfig.templateCache.stepway.destFile,
            gulpConfig.templateCache.stepway.options
        ))
        .pipe(gulp.dest(gulpConfig.templateCache.stepway.destDir, { cwd: gulpConfig.base.root }));
});

gulp.task('dragdropway:templatecache', function() {
    return gulp
        .src(gulpConfig.templateCache.dragAndDropWay.sourceDir + gulpConfig.templateCache.dragAndDropWay.sourceFiles, 
					{ cwd: gulpConfig.base.root })
        .pipe(minifyHtml(gulpConfig.minifyHtmlOpts))
				.pipe(ngTemplateCache(
            gulpConfig.templateCache.dragAndDropWay.destFile,
            gulpConfig.templateCache.dragAndDropWay.options
        ))
        .pipe(gulp.dest(gulpConfig.templateCache.dragAndDropWay.destDir, { cwd: gulpConfig.base.root }));
});








/**
 * -------------------------------
 * APP SASS TASKS (STEPWAY)
 * -------------------------------
 */

 //sass : stepway
 gulp.task('app:sass:stepway', 
	 	['stepway:clean'], 
		 function(){
	gulp.src(gulpConfig.srcFiles.app.stepway.sass, { cwd: gulpConfig.base.root })
		.pipe(sass().on('error', notify.onError(function (error) { return 'Error: ' + error.message;})))
		.pipe(concat(gulpConfig.destFiles.app.stepway.css))
		.pipe(cssmin())     
		.pipe(wrap(gulpConfig.decorate.stepway.templateCSS))    
		.pipe(gulp.dest(gulpConfig.destDirs.app.css, { cwd: gulpConfig.base.root }));	 
 });
 
/**
 * -------------------------------
 * APP SASS TASKS (DRAGDROP WAY)
 * -------------------------------
 */
 //sass drag_and_drop
 gulp.task('app:sass:dragdropway', 
	 	['dragdropway:clean'], 
		 function(){
	gulp.src(gulpConfig.srcFiles.app.dragAndDropWay.sass, { cwd: gulpConfig.base.root })
		.pipe(sass().on('error', notify.onError(function (error) { return 'Error: ' + error.message;})))
		.pipe(concat(gulpConfig.destFiles.app.dragAndDropWay.css))
		.pipe(cssmin())     
		.pipe(wrap(gulpConfig.decorate.dragAndDropWay.templateCSS))    
		.pipe(gulp.dest(gulpConfig.destDirs.app.css, { cwd: gulpConfig.base.root }));
});









/**
 * -------------------------------
 * APP JS TASKS (STEPWAY WAY)
 * -------------------------------
 */
gulp.task('app:js:stepway', 
		[
			'stepway:clean',
			'stepway:templatecache'
		], 
		function() {
	//NOTE : change ./easyFormGenConfig/app/appConfig to change environment
	if(appConfig.environment.current === 'PROD'){
		//prod version
		gulp.src(gulpConfig.srcFiles.app.stepway.js,
						{cwd: gulpConfig.base.root})
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(sourcemaps.init())	
			.pipe(uglify()) 
			.pipe(concat(gulpConfig.destFiles.app.stepway.js))
			.pipe(wrap(gulpConfig.decorate.stepway.templateJS))
			.pipe(sourcemaps.write('./'))
			.on('error', notify.onError(function (error) { return 'Error: ' + error.message;}))
			.pipe(gulp.dest(gulpConfig.destDirs.app.js, { cwd: gulpConfig.base.root })
		);
	}else{
		//dev version (no uglify/no source map)
		gulp.src(gulpConfig.srcFiles.app.stepway.js,
						{cwd: gulpConfig.base.root})
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(concat(gulpConfig.destFiles.app.stepway.js))
			.pipe(wrap(gulpConfig.decorate.stepway.templateJS))
			.on('error', notify.onError(function (error) { return 'Error: ' + error.message;}))
			.pipe(gulp.dest(gulpConfig.destDirs.app.js, { cwd: gulpConfig.base.root })
		);
	}

});


/**
 * -------------------------------
 * APP JS TASKS (DRAGDROP WAY)
 * -------------------------------
 */
gulp.task('app:js:dragdropway', 
		[
			'dragdropway:clean',
			'dragdropway:templatecache'
		],  
		function() {
	//NOTE : change ./easyFormGenConfig/app/appConfig to change environment
	if(appConfig.environment.current === 'PROD'){
		//prod version
		gulp.src(gulpConfig.srcFiles.app.dragAndDropWay.js,
						{cwd: gulpConfig.base.root})
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(sourcemaps.init())	
			.pipe(uglify()) 
			.pipe(concat(gulpConfig.destFiles.app.dragAndDropWay.js))
			.pipe(wrap(gulpConfig.decorate.dragAndDropWay.templateJS))
			.pipe(sourcemaps.write('./'))
			.on('error', notify.onError(function (error) { return 'Error: ' + error.message;}))
			.pipe(gulp.dest(gulpConfig.destDirs.app.js, { cwd: gulpConfig.base.root })
		);
	}else{
		//dev version (no uglify/no source map)
		gulp.src(gulpConfig.srcFiles.app.dragAndDropWay.js,
						{cwd: gulpConfig.base.root})
			.pipe(jshint())
			.pipe(jshint.reporter('default'))
			.pipe(concat(gulpConfig.destFiles.app.dragAndDropWay.js))
			.pipe(wrap(gulpConfig.decorate.dragAndDropWay.templateJS))
			.on('error', notify.onError(function (error) { return 'Error: ' + error.message;}))
			.pipe(gulp.dest(gulpConfig.destDirs.app.js, { cwd: gulpConfig.base.root })
		);
	}

});









 
 
 


/**
 * --------------------------------------
 * WATCH TASK (developments friend task)
 * --------------------------------------
 */
gulp.task('watch', function() {
	var watcher = gulp.watch(	[	
									//app : drag and drop way sources
									gulpConfig.templateCache.dragAndDropWay.sourceDir + gulpConfig.templateCache.dragAndDropWay.sourceFiles,
									gulpConfig.srcFiles.app.dragAndDropWay.js,
									gulpConfig.srcFiles.app.dragAndDropWay.sass,
									'!' + gulpConfig.templateCache.dragAndDropWay.destDir + gulpConfig.templateCache.dragAndDropWay.destFile,
									//app : step way sources
									gulpConfig.templateCache.stepway.sourceDir + gulpConfig.templateCache.stepway.sourceFiles,
									gulpConfig.srcFiles.app.stepway.js,
									gulpConfig.srcFiles.app.stepway.sass,
									'!' + gulpConfig.templateCache.stepway.destDir + gulpConfig.templateCache.stepway.destFile	
								], 
								[
									'default'
								]
							);
	watcher.on('change', function(event) {
	  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
	});
});


/**
 * ---------------------------------------------------------
 * DEFAULT TASK : 'gulp' command or ctrl+shift+B (in VSCode)
 * -> build app only
 * ---------------------------------------------------------
 */
gulp.task('default', [	 
						//app tasks
						'app:sass:stepway',
						'app:sass:dragdropway',
						'app:js:stepway',
						'app:js:dragdropway'
					 ]);
					 

/**
 * ------------------------------------------------------------
 * BUILD:ALL TASK : 'gulp build:all' refresh all (vendors + app)
 * ------------------------------------------------------------
 */
gulp.task('build:all', [ 
						//vendor tasks
						'vendor:css:specialCases',
						'vendor:css',
						'vendor:fonts',
						'vendor:js',
						'vendor:map',
						//app tasks
						'app:sass:stepway',
						'app:sass:dragdropway',
						'app:js:stepway',
						'app:js:dragdropway'
					 ], function(){
						 console.info('building app + vendors. \concat vendors param set to : ' + appConfig.concatVendorFiles);
					 });
					 




  // //server  - ejs sources
  // gulp.src(config.sysDirs.serverEJS)
  //   .pipe(gulp.dest(config.baseDirs.dist + config.sysDirs.serverRootDir));
     
  //public  - all content 
 
 
 
 gulp.task('dist:copy', 
	 	['dist:clean'], 
		 function(){
	//all public dir	 
  gulp.src(gulpConfig.base.publicDir + '**/*', {base : './'})
    .pipe(gulp.dest(gulpConfig.base.distDir ,{cwd: gulpConfig.base.root}));
	
	var indexHtmlFiles = [
		gulpConfig.base.root + gulpConfig.stepWayHtmlFile.name,
		gulpConfig.base.root + gulpConfig.dragDropWayHtmlFile.name,
	];
	//html files
	gulp.src(indexHtmlFiles) 
	.pipe(gulp.dest(gulpConfig.base.distDir ,{cwd: gulpConfig.base.root}));
 })
 
 
 gulp.task('dist:uglify:app:js', 
	 ['dist:copy'],
	 function(){
	 
	 var appJsFiles = [
		 	gulpConfig.base.distDir + gulpConfig.destDirs.app.js + '/' + gulpConfig.destFiles.app.stepway,
			gulpConfig.base.distDir +	gulpConfig.destDirs.app.js + '/' + gulpConfig.destFiles.app.dragAndDropWay
	 ];
		return gulp.src(appJsFiles)
			.pipe(sourcemaps.init())
			.pipe(uglify())
			.pipe(sourcemaps.write('.'))
			//.pipe(gulp.dest(config.baseDirs.app + config.publicDirs.js));
 });