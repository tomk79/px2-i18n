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



// multilangMultitextEditor フィールド を処理
gulp.task('multilangMultitextEditor:js', function(){
	return webpackStream({
		mode: 'production',
		entry: "./src_gulp/fields/multilang_multitext/multitext.js",
		output: {
			filename: "multitext.js"
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
		.pipe(gulp.dest( './fields/multilang_multitext/frontend/' ))
	;
});
gulp.task('multilangMultitextEditor:css', function(){
	return gulp.src(["./src_gulp/fields/multilang_multitext/multitext.scss"])
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(concat('multitext.css'))
		.pipe(gulp.dest( './fields/multilang_multitext/frontend/' ))
	;
});



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
		.pipe(gulp.dest( './fields/multilang_summernote/frontend/' ))
	;
});
gulp.task('multilangSummernoteEditor:css', function(){
	return gulp.src(["./src_gulp/fields/multilang_summernote/summernote.scss"])
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(concat('summernote.css'))
		.pipe(gulp.dest( './fields/multilang_summernote/frontend/' ))
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
		.pipe(gulp.dest( './fields/multilang_text/frontend/' ))
	;
});
gulp.task('multilangText:css', function(){
	return gulp.src(["./src_gulp/fields/multilang_text/text.scss"])
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(concat('text.css'))
		.pipe(gulp.dest( './fields/multilang_text/frontend/' ))
	;
});


// multilangHtmlAttrText フィールド を処理
gulp.task('multilangHtmlAttrText:js', function(){
	return webpackStream({
		mode: 'production',
		entry: "./src_gulp/fields/multilang_html_attr_text/html_attr_text.js",
		output: {
			filename: "html_attr_text.js"
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
		.pipe(gulp.dest( './fields/multilang_html_attr_text/frontend/' ))
	;
});
gulp.task('multilangHtmlAttrText:css', function(){
	return gulp.src(["./src_gulp/fields/multilang_html_attr_text/html_attr_text.scss"])
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(concat('html_attr_text.css'))
		.pipe(gulp.dest( './fields/multilang_html_attr_text/frontend/' ))
	;
});


let _tasks = gulp.parallel(
	'multilangMultitextEditor:js',
	'multilangMultitextEditor:css',
	'multilangSummernoteEditor:js',
	'multilangSummernoteEditor:css',
	'multilangText:js',
	'multilangText:css',
	'multilangHtmlAttrText:js',
	'multilangHtmlAttrText:css'
);

// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	return gulp.watch(["src_gulp/**/*"], _tasks);
});


// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
