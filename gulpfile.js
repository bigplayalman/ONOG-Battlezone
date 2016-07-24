var gulp          = require('gulp');
var del           = require('del');
var concat        = require('gulp-concat');
var sass          = require('gulp-sass');
var merge         = require('merge-stream');
var templateCache = require('gulp-angular-templatecache');
var plumber       = require('gulp-plumber');
var sourcemaps    = require('gulp-sourcemaps');
var uglify        = require('gulp-uglify');
var ngAnnotate    = require('gulp-ng-annotate');
var runSequence   = require('run-sequence').use(gulp);
var autoprefixer  = require('gulp-autoprefixer');


var config = require('./gulpconfig.json');

var onError = function () {console.log('fail')};

gulp.task('clean', function() {
  return del([config.paths.dist + '**']);
});

gulp.task('copy', function() {

  var index = gulp.src(config.globs.index, {cwd: config.paths.src})
    .pipe(gulp.dest(config.paths.dist))

  var cordova = gulp.src(config.globs.cordova, {cwd: config.paths.src})
    .pipe(gulp.dest(config.paths.dist))

  var assets = gulp.src(config.globs.assets, {cwd: config.paths.src})
    .pipe(gulp.dest(config.paths.dist + 'assets'))

  var icons = gulp.src(config.globs.icons, {cwd: config.paths.src})
    .pipe(gulp.dest(config.paths.dist + 'assets/fonts'))

  return merge(index, cordova, assets, icons);
});

gulp.task('sass', function() {
  return gulp.src(config.globs.sass, {cwd: config.paths.src})
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(config.paths.dist + 'css'));
});

gulp.task('templates', function() {
  return gulp.src(config.globs.html, {cwd: config.paths.src})
    .pipe(templateCache({
      module: 'BattleZone.templates',
      standalone: true
    }))
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('app', function() {
  return gulp.src(config.globs.js, {cwd: config.paths.src})
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(ngAnnotate({single_quotes: true}))
    .pipe(concat('app.js'))
    //.pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('libs', function() {
  return gulp.src(getNodeModuleLibSources('dev'),
    {cwd: config.paths.resources}).pipe(plumber({
    errorHandler: onError
  }))
    .pipe(sourcemaps.init())
    .pipe(concat('libs.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(config.paths.dist));
});

gulp.task('default', function() {
  runSequence('clean', 'libs', 'build');
});

gulp.task('build', function () {
  runSequence('copy', 'sass', 'app', 'templates');
});

gulp.task('watch', function() {
  gulp.watch(config.paths.src + 'components/**/*', ['build']);
});

function getNodeModuleLibSources(env) {
  var targetEnv = env;
  var keys = Object.keys(config.lib.js);
  var sources = [];
  for (var i = 0; i < keys.length; i++) {
    sources.push(config.lib.js[keys[i]][targetEnv]);
  }
  return sources;
}
