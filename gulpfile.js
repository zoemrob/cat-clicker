"use strict";
const gulp = require('gulp'),
    browserSync = require('browser-sync').create(),
    autoprefixer = require('gulp-autoprefixer'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify-es').default;

gulp.task('styles', function () {
    gulp.src('styles/**/*.sass')
        .pipe(sass({
            outputStyle: 'compressed'
        }))
        .pipe(autoprefixer({
            browsers: ['last 2 versions']
        }))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.stream());
});

gulp.task('default', ['styles', 'js'], function () {
    gulp.watch('styles/**/*.sass', ['styles']).on('change', browserSync.reload);
    gulp.watch('js/refactored-clicker.js', ['js']).on('change', browserSync.reload);
    gulp.watch('index.html').on('change', browserSync.reload);
    browserSync.init({
        server: './'
    });
});

gulp.task('js', function() {
    return gulp.src('./js/refactored-clicker.js')
        .pipe(concat('app.js'))
        .pipe(uglify())
        .pipe(gulp.dest('dist/'));
});
