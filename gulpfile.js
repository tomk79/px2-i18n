let gulp = require('gulp');
let webpack = require('webpack');
let webpackStream = require('webpack-stream');
let browserify = require("gulp-browserify");
let sass = require('gulp-sass');
let autoprefixer = require("gulp-autoprefixer");
let minifyCss = require('gulp-minify-css');
let uglify = require("gulp-uglify");
let concat = require('gulp-concat');
let plumber = require("gulp-plumber");
let rename = require("gulp-rename");
let packageJson = require(__dirname+'/package.json');



// multilangSummernoteEditor フィールド を処理
gulp.task('multilangSummernoteEditor:js', function(){
	return webpackStream({
		mode: 'production',
		entry: "./src_gulp/fields/multilang_summernote/summernote.js",
		output: {
			filename: "summernote.js"
		},
		module:{
			rules:[
				{
					test:/\.twig$/,
					use:['twig-loader']
				}
			]
		}
	}, webpack)
		.pipe(plumber())
		.pipe(gulp.dest( './fields/multilang_summernote/' ))
	;
});
gulp.task('multilangSummernoteEditor:css', function(){
	return gulp.src(["./src_gulp/fields/multilang_summernote/summernote.css"])
		.pipe(plumber())
		.pipe(concat('summernote.css'))
		.pipe(gulp.dest( './fields/multilang_summernote/' ))
	;
});


// multilangText フィールド を処理
gulp.task('multilangText:js', function(){
	return webpackStream({
		mode: 'production',
		entry: "./src_gulp/fields/multilang_text/text.js",
		output: {
			filename: "text.js"
		},
		module:{
			rules:[
				{
					test:/\.twig$/,
					use:['twig-loader']
				}
			]
		}
	}, webpack)
		.pipe(plumber())
		.pipe(gulp.dest( './fields/multilang_text/' ))
	;
});
gulp.task('multilangText:css', function(){
	return gulp.src(["./src_gulp/fields/multilang_text/text.css"])
		.pipe(plumber())
		.pipe(concat('text.css'))
		.pipe(gulp.dest( './fields/multilang_text/' ))
	;
});


let _tasks = gulp.parallel(
	'multilangSummernoteEditor:js',
	'multilangSummernoteEditor:css',
	'multilangText:js',
	'multilangText:css'
);

// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	return gulp.watch(["src_gulp/**/*"], _tasks);
});


// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
