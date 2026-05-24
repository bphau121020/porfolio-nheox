import { src, dest, series } from 'gulp';
import gulpSass from 'gulp-sass';
import * as sass from 'sass';
import postcss from 'gulp-postcss';
import scssSyntax from 'postcss-scss';
import gulpSourcemaps from 'gulp-sourcemaps';
import replace from 'gulp-replace';
import { base as config } from '../config/index.mjs';
import { existsSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import gulpPrettier from 'gulp-prettier';
import stylelint from 'stylelint';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

const sassCompiler = gulpSass(sass);
const { init, identityMap, write } = gulpSourcemaps;
const argv = yargs(hideBin(process.argv)).argv;

const customLint = (root, result) => {
  root.walk((node) => {
    if (node.type === 'atrule') {
      if ((node.name === 'media' || node.name === 'include') && node.parent.type === 'root') {
        if (node.params !== 'print') {
          result.warn(`Do not use @media or @include in root-level. Found: @${node.name}`, {
            node: node,
          });
        }
      }
    } else if (node.type === 'decl') {
      if (node.value.indexOf('\'') !== -1) {
        result.warn(`Use double quotes instead of single quotes in SCSS files. Property: ${node.prop}`, {
          node: node,
        });
      }
      if (/-\d+(\.\d+)?/g.test(node.value)) {
        result.warn(`Avoid using negative values. Property: ${node.prop}`, {
          node: node,
        });
      }
    } else if (node.type === 'rule') {
      const selectors = node.selector.split(',');
      selectors.forEach((selector) => {
        if (selector.includes(':not')) {
          result.warn(`Avoid using :not() selector in SCSS. Selector: ${selector}`, {
            node: node,
          });
        }
      });
    }
  });
};

const lintStyles = (fix = false) => {
  const isFix = (typeof fix === 'boolean' && fix === true) ? true : false;
  let filesToCheck = [config.css.path.inputFiles].concat(config.ignore).concat(config.css.ignore);
  if (argv.file) {
    const targetFiles = argv.file.replace(/"/g, '').replace(/, /g, ',');
    filesToCheck = targetFiles.split(',');
  }
  return src(filesToCheck)
    .pipe(postcss([
      stylelint({
        configFile: '.stylelintrc.json',
        formatter: 'json',
        ignoreDisables: false,
        failOnError: false,
        outputFile: '',
        reportNeedlessDisables: false,
        quietDeprecationWarnings: true,
        fix: isFix,
        syntax: 'scss',
        quiet: true
      }),
      customLint,
    ], { syntax: scssSyntax }));
};

const lintStylesFix = () => {
  return lintStyles(true)
    .pipe(gulpPrettier({
      "printWidth": 160,
      "tabWidth": 2,
      "useTabs": false,
      "semi": true,
      "singleQuote": false,
      "trailingComma": "none",
      "bracketSpacing": true,
      "jsxBracketSameLine": false,
      "arrowParens": "always",
      "insertPragma": false,
      "requirePragma": false,
      "proseWrap": "preserve",
      "endOfLine": "lf"
    }))
    .pipe(dest(config.css.path.input));
};

const buildStyles = () => {
  if (!existsSync(config.css.path.input)) {
    return Promise.resolve();
  }
  const transpileOptions = [
    autoprefixer({
      map: false,
      cascade: false
    })
  ];
  if (config.css.options.minify) {
    transpileOptions.push(cssnano({
      preset: 'default'
    }));
  }
  return src([config.css.path.inputFiles].concat(config.ignore).concat(config.css.ignore))
    .pipe(init())
    .pipe(identityMap())
    .pipe(sassCompiler({
      outputStyle: 'expanded'
    }).on('error', sassCompiler.logError))
    .pipe(postcss(transpileOptions, { syntax: scssSyntax }))
    .pipe(write('.'))
    .pipe(replace(/\n$/, ''))
    .pipe(dest(config.css.path.output));
};

const css = series(lintStyles, buildStyles);

export {
  lintStyles,
  lintStylesFix,
  buildStyles,
  css
};
