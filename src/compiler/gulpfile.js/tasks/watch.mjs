import { src, dest, watch, series } from 'gulp';
import * as del from 'del';
import { relative, resolve, parse, sep } from 'path';
import { base as config } from '../config/index.mjs';
import { js } from './js.mjs';

const monitoring = () => {

  const sass = watch([config.css.path.inputFiles].concat(config.ignore).concat(config.css.ignore), series('css'));
  sass.on('all', function (event, filepath) {
    console.log(`File ${filepath} was changed`);
    if (event === 'unlink') {
      const filePathFromSrc = relative(resolve(config.css.path.input), filepath);
      let distFilePath = resolve(config.pathDestination, filePathFromSrc).replace(/(?:\\|\/)?scss(?:\\|\/)?/, sep).replace(/\.scss$/, '.css');
      del.deleteAsync([distFilePath]);
    }
  });

  const onJsFileChange = function (event, filepath, srcInput) {
    if (event === 'unlink') {
      const regExpSrc = new RegExp(srcInput);
      let distFilePath = filepath.replace(regExpSrc, config.pathDestination);
      del.deleteAsync([distFilePath]);
    }
    console.log(`File ${filepath} was changed`);
  }

  const jsConfig = config.useTypescript ? config.ts : config.js;
  const jsWatcher = watch([jsConfig.path.inputFiles].concat(jsConfig.ignore).concat(jsConfig.ignore), series(js));
  jsWatcher.on('all', function (event, filepath) {
    onJsFileChange(event, filepath, jsConfig.path.input);
  });
};

const watchTask = monitoring;

export const myWatch = watchTask;
