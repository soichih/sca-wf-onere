var gulp = require('gulp'),
util = require("gulp-util"),
sass = require('gulp-sass'),
livereload = require('gulp-livereload'),
log = util.log;

var sassFiles = "**/*.scss";

gulp.task('default', function(){
});

gulp.task('sass', function(){
    log("Generate CSS files " + (new Date()).toString());
    gulp.src(sassFiles)
        .pipe(sass({ style: 'expanded' }))
        .pipe(gulp.dest(""))
        ;
});

gulp.task('reload', function(){
    gulp.src("*")
        .pipe(livereload());
});

gulp.task("watch", function(){
    livereload.listen();
    //log("Watching scss files for modifications.");
    gulp.watch(sassFiles, ["sass"]);
    gulp.watch(["*.html", "t/*.html", "css/style.css", "js/*.js"], ["reload"]);
    console.log("Watching...");
});
