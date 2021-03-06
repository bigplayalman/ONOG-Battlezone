var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var uglify = require('gulp-uglify');
var foreach = require('gulp-foreach');
var htmlmin = require('gulp-htmlmin');
var notify = require("gulp-notify");
var preen = require('preen');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var clean = require('gulp-clean');
var autoprefixer = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');
var ngAnnotate = require('gulp-ng-annotate');

var paths = {
  sass: ['scss/**/*.scss'],
  index: 'app/index.html',
  scripts: ['app/js/**/*.js'],
  styles: 'app/scss/*.scss',
  templates: 'app/templates/**/*.html',
  images: 'app/img/**/*',
  parse: 'parse/dist/*.min.js',
  moment: 'moment/min/moment.min.js',

  //Destination folders
  destImages: './www/img/',
  destTemplates: './www/templates/'
};
var onError = function (err) {
  console.log(err.toString());
};

gulp.task('default', ['sass', 'clean-templates', 'scripts', 'styles', 'templates', 'parse', 'moment', 'lib', 'index']);

gulp.task('parse', function() {
  return gulp.src(paths.parse, {cwd: './node_modules/'})
    .pipe(gulp.dest("./www/lib/parse/"));
});

gulp.task('moment', function() {
  return gulp.src(paths.moment, {cwd: './node_modules/'})
    .pipe(gulp.dest("./www/lib/moment/"));
});

gulp.task('sass', function (done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('index', function () {
  return gulp.src(paths.index)
    .pipe(htmlmin({ collapseWhitespace: false }))
    .pipe(gulp.dest("./www/"))
    .pipe(notify({ message: 'Index builded' }));
});

gulp.task('scripts', function () {
	return gulp.src(paths.scripts)
    .pipe(plumber({
      errorHandler: onError
    }))
		.pipe(sourcemaps.init())
    .pipe(ngAnnotate({
      single_quotes: true
    }))
		.pipe(concat("app.js"))
    //.pipe(uglify())
    .pipe(sourcemaps.write())
		.pipe(gulp.dest("./www/build/"))
		.pipe(notify({ message: 'Scripts builded' }));
});

gulp.task('styles', function () {
	return gulp.src(paths.styles)
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer('last 2 version'))
		.pipe(concat('style.css'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('./www/css/'))
		.pipe(rename({suffix: '.min'}))
    .pipe(minifyCss())
    .pipe(gulp.dest('./www/css/'))
		.pipe(notify({ message: 'Styles builded' }));
});

gulp.task('templates', ['clean-templates'], function () {
  return gulp.src(paths.templates)
    .pipe(foreach(function (stream, file) {
      return stream
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.destTemplates))
    }))
    .pipe(notify({ message: 'Templates builded' }));
});

gulp.task('images', ['clean-images'], function() {
  return gulp.src(paths.images)
    .pipe(imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.destImages))
		.pipe(notify({ message: 'Images builded' }));
});

gulp.task('lib', function (done) {
  //https://forum.ionicframework.com/t/how-to-manage-bower-overweight/17997/10?u=jdnichollsc
  preen.preen({}, function () {
		gulp.src('').pipe(notify({ message: 'Lib builded' }));
		done();
  });
});

gulp.task('clean-images', function () {
  return gulp.src(paths.destImages, {read: false})
    .pipe(clean({force: true}));
});

gulp.task('clean-templates', function () {
  return gulp.src(paths.destTemplates, {read: false})
    .pipe(clean({force: true}));
});

gulp.task('watch', function () {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.index, ['index']);
  gulp.watch(paths.scripts, ['scripts']);
  gulp.watch(paths.styles, ['styles']);
  gulp.watch(paths.templates, ['templates']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.lib, ['lib']);
});

gulp.task('install', ['git-check'], function () {
  return bower.commands.install()
    .on('log', function (data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function (done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
			);
    process.exit(1);
  }
  done();
});
