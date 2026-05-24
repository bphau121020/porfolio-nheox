import { series, parallel } from 'gulp';
import { css, buildStyles, lintStyles, lintStylesFix } from './tasks/css.mjs';
import { myWatch } from './tasks/watch.mjs';
import { js, buildJs, lintJs } from './tasks/js.mjs';

const lint = series(lintStyles, lintJs);
const lintFix = series(lintStylesFix);
const build = series(buildStyles, buildJs);
const develop = series(build, lint, parallel(myWatch));
const developScss = series(buildStyles, lintStyles, parallel(myWatch));
const developTs = series(js, parallel(myWatch));

export {
  build,
  develop,
  developScss,
  developTs,
  css,
  lint,
  lintFix,
};
