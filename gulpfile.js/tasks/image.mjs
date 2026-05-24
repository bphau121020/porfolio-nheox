import { src, dest } from 'gulp';
import changed from 'gulp-changed';
// IMPORTANT: Avoid importing gulp-imagemin at module load to prevent ESM TLA issues during non-image tasks
// We'll dynamically import it inside task functions instead.
import mozjpeg from 'imagemin-mozjpeg';
import pngquant from 'imagemin-pngquant';
import webp from 'gulp-webp';
import rename from 'gulp-rename';
import { base as config } from '../config/index.mjs';

// Dynamically load gulp-imagemin and its named exports
const getImagemin = async () => {
  const mod = await import('gulp-imagemin');
  const imageMinify = mod.default ?? mod; // compatibility for different module shapes
  const { svgo, optipng, gifsicle } = mod;
  return { imageMinify, svgo, optipng, gifsicle };
};

// Build the shared imagemin plugins lazily
const getCommonImagePlugins = async () => {
  const { svgo, optipng, gifsicle } = await getImagemin();
  return [
    pngquant({
      quality: [0.7, 0.8],
      speed: 1,
    }),
    mozjpeg({ progressive: true, quality: 70 }),
    svgo({
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    }),
    optipng(),
    gifsicle({ optimizationLevel: 3 }),
  ];
};

const minifyImage = async () => {
  const { imageMinify } = await getImagemin();
  const commonImagePlugins = await getCommonImagePlugins();
  return src([config.image.path.inputFiles].concat(config.ignore).concat(config.image.ignore), { encoding: false })
    .pipe(changed(config.image.path.output))
    .pipe(imageMinify(commonImagePlugins))
    .pipe(dest(config.image.path.output));
};

const convertToWebp = async () => {
  const { imageMinify } = await getImagemin();
  const commonImagePlugins = await getCommonImagePlugins();
  return src([config.image.path.inputFiles].concat(config.ignore).concat(config.image.ignore), { encoding: false })
    .pipe(imageMinify(commonImagePlugins))
    .pipe(rename((path) => {
      path.basename += '.' + path.extname.replace(/^\./, '');
    }))
    .pipe(webp({
      quality: 80,
      method: 6
    }))
    .pipe(dest(config.image.path.output));
};

export {
  minifyImage,
  convertToWebp
};
