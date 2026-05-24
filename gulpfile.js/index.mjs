import { series, parallel } from 'gulp';
import { cleanResources, cleanResourcesWithoutImage } from './tasks/clean.mjs';
import { html, lintPug, lintHtml } from './tasks/html.mjs';
import { css, lintStyles, lintStylesFix } from './tasks/css.mjs';
import { js, lintJs, lintJsFix } from './tasks/js.mjs';
import { minifyImage, convertToWebp } from './tasks/image.mjs';
import { copy } from './tasks/copy.mjs';
import { bs as browser } from './tasks/browser-sync.mjs';
import { myWatch } from './tasks/watch.mjs';

const lint = series(lintPug, lintHtml, lintStyles, lintJs);
const lintFix = series(lintStylesFix, lintJsFix);
const build = series(cleanResources, copy, html, css, js, minifyImage, convertToWebp);
const buildJsOnly = series(js);
const develop = series(cleanResources, copy, html, css, js, lintFix, minifyImage, convertToWebp, parallel(browser, myWatch));
const lintStylesOnly = series(lintStyles);
const lintPugOnly = series(lintPug);
const lintJsOnly = series(lintJs);
const lintJsFixOnly = series(lintJsFix);

export {
  build,
  develop,
  html,
  css,
  js,
  lint,
  lintFix,
  minifyImage,
  convertToWebp,
  lintStylesOnly,
  lintPugOnly,
  lintJsOnly,
  lintJsFixOnly,
  buildJsOnly,
};
