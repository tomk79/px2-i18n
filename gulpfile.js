let gulp = require('gulp');
let plumber = require("gulp-plumber");//コンパイルエラーが起きても watch を抜けないようになる
let concat  = require('gulp-concat');
let browserify = require("gulp-browserify");//NodeJSのコードをブラウザ向けコードに変換


// multilangSummernoteEditor フィールド を処理
gulp.task('multilangSummernoteEditor:js', function(){
	return gulp.src(["./src_gulp/fields/multilang_summernote/summernote.js"])
		.pipe(plumber())
		.pipe(browserify({}))
		.pipe(concat('summernote.js'))
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
	return gulp.src(["./src_gulp/fields/multilang_text/text.js"])
		.pipe(plumber())
		.pipe(browserify({}))
		.pipe(concat('text.js'))
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
