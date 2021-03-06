/*
 * temperature-monitor - http://github.com/blueskyfish/temperature-monitor.git
 *
 * The MIT License (MIT)
 * Copyright (c) 2015 BlueSkyFish
 *
 * Purpose:
 * For distributing.
 */

'use strict';

var path = require('path');

var del = require('del');
var dateformat = require('dateformat');
var ejs = require('gulp-ejs');
var gulp = require('gulp');
var minimist = require('minimist');
var rename = require('gulp-rename');

var pkg = require('./package.json');
var params = minimist(process.argv.slice(2));
var target = params.target || '';
var contextPath = params.contextPath || '';
var configFile = 'web/shares/config/' + target + '.config.php';


var model = {
  target: target,
  contextPath: adjustPath(contextPath),
  datetime: dateformat('yyyy-mm-dd HH:MM:ss'),
  version: pkg.version
};

var settings = {
  ext: '.php'
};

function adjustPath(contextPath) {
  if (!contextPath || contextPath.length === 0) {
    return '';
  }
  if (contextPath.substr(0, 1) !== '/') {
    return '/' + contextPath;
  }
  return contextPath;
}

gulp.task('clean', function (done) {
  del(['dist'], function () {
    done();
  });
});

gulp.task('check-target', ['clean'], function () {
  if (target === '') {
    console.log('');
    console.log('missing parameter "--target=name"');
    console.log('cancel!!');
    console.log('');
    process.exit(1);
  }
  if (contextPath === '') {
    console.log('');
    console.log('missing parameter "--contextPath=path"');
    console.log('cancel!!');
    console.log('');
    process.exit(1);
  }
});

gulp.task('config-file', ['clean'], function () {
  return gulp.src(configFile)
    .pipe(ejs(model, settings))
    .pipe(rename('config.php'))
    .pipe(gulp.dest('dist/shares/config'));
});

function taskCopyHtAccess(rootPath) {
  return gulp.src(path.join('web', rootPath, '.htaccess'))
    .pipe(ejs(model, { ext: ''}))
    .pipe(gulp.dest(path.join('dist', rootPath)));
}

function taskCopyIndex(rootPath) {
  return gulp.src(path.join('web', rootPath, 'index.php'))
    .pipe(ejs(model, settings))
    .pipe(gulp.dest(path.join('dist', rootPath)));
}

function taskCopyLibrary(rootPath) {
  return gulp.src(path.join('web', rootPath, 'lib/**/*.php'))
    .pipe(ejs(model, settings))
    .pipe(gulp.dest(path.join('dist', rootPath, 'lib')));
}

gulp.task('copy-server-htaccess', ['clean'], function () {
  return taskCopyHtAccess('server');
});

gulp.task('copy-viewer-htaccess', ['clean'], function () {
  return taskCopyHtAccess('viewer');
});

gulp.task('copy-server-index', ['clean'], function () {
  return taskCopyIndex('server');
});

gulp.task('copy-viewer-index', ['clean'], function () {
  return taskCopyIndex('viewer');
});

gulp.task('copy-server-library', ['clean'], function () {
  return taskCopyLibrary('server');
});

gulp.task('copy-viewer-library', ['clean'], function () {
  return taskCopyLibrary('viewer');
});

gulp.task('copy-libraries', [
  'clean',
  'copy-libaries-htaccess',
  'copy-hasher',
  'copy-libraries-slim'
], function ()
{
  return gulp.src(['web/shares/lib/**/*.php'])
    .pipe(ejs(model, settings))
    .pipe(gulp.dest('dist/shares/lib'));
});

gulp.task('copy-libaries-htaccess', ['clean'], function () {
  return gulp.src(['web/shares/.htaccess'])
    .pipe(ejs(model, { ext: ''}))
    .pipe(gulp.dest('dist/shares'));
});

gulp.task('copy-libraries-slim', ['clean'], function () {
  return gulp.src(['web/shares/Slim/**/*.php'])
    .pipe(ejs(model, settings))
    .pipe(gulp.dest('dist/shares/Slim'));
});

gulp.task('copy-hasher', ['clean'], function () {
  return gulp.src(['web/shares/Hashids/**/*.php'])
    .pipe(ejs(model, settings))
    .pipe(gulp.dest('dist/shares/Hashids'));
});

gulp.task('copy-slim', ['clean'], function () {
  return gulp.src('shares/Slim/**/**')
    .pipe(gulp.dest('dist/shares/Slim'));
});

gulp.task('copy-index', ['clean'], function () {
  return gulp.src('web/index.html')
    .pipe(ejs(model, { ext: '.html'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-all', [
  'config-file',
  'copy-server-index',
  'copy-server-htaccess',
  'copy-server-library',
  'copy-viewer-index',
  'copy-viewer-htaccess',
  'copy-viewer-library',
  'copy-libraries',
  'copy-slim',
  'copy-index'
]);

/**
 * Build a distribution
 */
gulp.task('build', [
  'check-target',
  'copy-all'
]);

/**
 * Default Task (help)
 */
gulp.task('default', function () {
  console.log('');
  console.log('Sensor Server');
  console.log('');
  console.log('Usage:');
  console.log('   gulp build --target=name --contextPath=path');
  console.log('           create a distribution with the config file of the target');
  console.log('           - target        is the target configuration (config.php)');
  console.log('           - contextPath   is the context path on the server');
  console.log('   gulp clean     delete the distribution folder');
});
