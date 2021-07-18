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



// i18nMultitextEditor フィールド を処理
gulp.task('i18nMultitextEditor:js', function(){
	return webpackStream({
		mode: 'production',
		entry: "./src_gulp/fields/i18n_multitext/multitext.js",
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
		.pipe(gulp.dest( './fields/i18n_multitext/frontend/' ))
	;
});
gulp.task('i18nMultitextEditor:css', function(){
	return gulp.src(["./src_gulp/fields/i18n_multitext/multitext.scss"])
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(concat('multitext.css'))
		.pipe(gulp.dest( './fields/i18n_multitext/frontend/' ))
	;
});



// i18nSummernoteEditor フィールド を処理
gulp.task('i18nSummernoteEditor:js', function(){
	return webpackStream({
		mode: 'production',
		entry: "./src_gulp/fields/i18n_summernote/summernote.js",
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
		.pipe(gulp.dest( './fields/i18n_summernote/frontend/' ))
	;
});
gulp.task('i18nSummernoteEditor:css', function(){
	return gulp.src(["./src_gulp/fields/i18n_summernote/summernote.scss"])
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(concat('summernote.css'))
		.pipe(gulp.dest( './fields/i18n_summernote/frontend/' ))
	;
});


// i18nText フィールド を処理
gulp.task('i18nText:js', function(){
	return webpackStream({
		mode: 'production',
		entry: "./src_gulp/fields/i18n_text/text.js",
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
		.pipe(gulp.dest( './fields/i18n_text/frontend/' ))
	;
});
gulp.task('i18nText:css', function(){
	return gulp.src(["./src_gulp/fields/i18n_text/text.scss"])
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(concat('text.css'))
		.pipe(gulp.dest( './fields/i18n_text/frontend/' ))
	;
});


// i18nHtmlAttrText フィールド を処理
gulp.task('i18nHtmlAttrText:js', function(){
	return webpackStream({
		mode: 'production',
		entry: "./src_gulp/fields/i18n_html_attr_text/html_attr_text.js",
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
		.pipe(gulp.dest( './fields/i18n_html_attr_text/frontend/' ))
	;
});
gulp.task('i18nHtmlAttrText:css', function(){
	return gulp.src(["./src_gulp/fields/i18n_html_attr_text/html_attr_text.scss"])
		.pipe(plumber())
		.pipe(sass({
			"sourceComments": false
		}))
		.pipe(concat('html_attr_text.css'))
		.pipe(gulp.dest( './fields/i18n_html_attr_text/frontend/' ))
	;
});


let _tasks = gulp.parallel(
	'i18nMultitextEditor:js',
	'i18nMultitextEditor:css',
	'i18nSummernoteEditor:js',
	'i18nSummernoteEditor:css',
	'i18nText:js',
	'i18nText:css',
	'i18nHtmlAttrText:js',
	'i18nHtmlAttrText:css'
);

// src 中のすべての拡張子を監視して処理
gulp.task("watch", function() {
	return gulp.watch(["src_gulp/**/*"], _tasks);
});


// src 中のすべての拡張子を処理(default)
gulp.task("default", _tasks);
