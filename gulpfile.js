import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import autoprefixer from 'autoprefixer';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import squoosh from 'gulp-libsquoosh';
import browser from 'browser-sync';
import { deleteAsync } from 'del';
import htmlmin from 'gulp-htmlmin';
import minify from 'gulp-minify';

// Styles

export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })
    .pipe(plumber())
    .pipe(less())
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// HTML

const html = () => {
  return gulp.src('source/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('build'))
}

// Scripts
const scripts = () => {
  return gulp.src('source/js/*.js', {
    base: 'source'
  })
    .pipe(minify({noSource: true}))
    .pipe(gulp.dest('build'))
}

// SVG

const svg = () => {
  return gulp.src([
    'source/img/**/*.svg',
    '!source/img/icons/*.svg'
  ], {
    base: 'source'
  })
    .pipe(svgo())
    .pipe(gulp.dest('build'));
}

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

// Copy

const copy = (done) => {
  gulp.src([
    'source/fonts/**/*.{woff2,woff}',
    'source/*.ico',
    'source/*.webmanifest',
  ], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

// Images

const optimizeImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}', {
    base: 'source'
  })
    .pipe(squoosh())
    .pipe(gulp.dest('build'));
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{jpg,png}', {
    base: 'source'
  })
    .pipe(gulp.dest('build'));
}

// WebP

const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}', {
    base: 'source'
  })
    .pipe(squoosh( {
      webp: {}
    }))
    .pipe(gulp.dest('build'));
}

// Clean

const clean = () => {
  return deleteAsync('build');
}

// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload

const reload = (done) => {
  browser.reload();
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/*.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Build

export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    html,
    styles,
    scripts,
    svg,
    sprite,
    createWebp
  )
);

// Default

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    html,
    styles,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
  server,
  watcher
));
