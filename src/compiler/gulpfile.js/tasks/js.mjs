import { src, dest, series } from 'gulp';
import eslint, { fix as _fix, format, failAfterError } from 'gulp-eslint-new';
import prettier from 'gulp-prettier';
import uglify from 'gulp-uglify';
import { base as config } from '../config/index.mjs';
import { existsSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { rollup } from 'rollup';
import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { writeFileSync, mkdirSync } from 'fs';
const argv = yargs(hideBin(process.argv)).argv;
let isFixing = false;

const lintJs = () => {
  const stopOnError = argv.stopOnError || false;
  let filesToCheck = [config.js.path.outputFiles];
  if (config.useTypescript) {
    filesToCheck = [config.ts.path.inputFiles];
  }
  if (argv.file) {
    const targetFiles = argv.file.replace(/"/g, '').replace(/, /g, ',');
    filesToCheck = targetFiles.split(',');
  }
  const stream = src(filesToCheck)
    .pipe(eslint({
      fix: false,
      overrideConfigFile: './.eslintrc-ts.js'
    }));

  if (stopOnError) {
    stream.pipe(failAfterError());
  }

  // Add format() to display ESLint results
  stream.pipe(format());

  return stream;
};

const lintJsFix = () => {
  const stopOnError = argv.stopOnError || false;
  let filesToCheck = [config.js.path.outputFiles];
  if (config.useTypescript) {
    if (isFixing) {
      isFixing = false;
      return;
    }
    isFixing = true;
    filesToCheck = [config.ts.path.inputFiles];
  }
  if (argv.file) {
    const targetFiles = argv.file.replace(/"/g, '').replace(/, /g, ',');
    filesToCheck = targetFiles.split(',');
  }
  const stream = src(filesToCheck)
    .pipe(prettier({
      singleQuote: true,
      proseWrap: 'never',
      endOfLine: 'lf',
      printWidth: 80,
      trailingComma: 'none'
    }))
    .pipe(eslint({
      fix: true,
      ...(config.useTypescript ? {
        overrideConfigFile: '.eslintrc-ts.js'
      } : {})
    }))
    .pipe(_fix())
    .pipe(format());
  if (stopOnError) {
    stream.pipe(failAfterError());
  }
  return stream.pipe(dest(config.useTypescript ? config.ts.path.input : config.js.path.output));
};

const buildTs = async () => {
  if (!existsSync(config.ts.path.input)) {
    return Promise.resolve();
  }

  try {
    // Bundle with Rollup
    const bundle = await rollup({
      input: `${config.ts.path.input}/scripts.ts`,
      plugins: [
        typescript({
          tsconfig: 'tsconfig.json',
          declaration: false,
          sourceMap: true
        }),
        nodeResolve({
          browser: true,
          preferBuiltins: false
        }),
        commonjs()
      ],
      external: ['jquery'] // Treat jQuery as an external library
    });

    // Generate bundle
    const { output } = await bundle.generate({
      format: 'iife',
      name: 'App',
      globals: {
        'jquery': '$'
      }
    });

    // Write output files
    for (const chunk of output) {
      if (chunk.type === 'chunk') {
        const outputPath = `${config.js.path.output}/scripts.js`;
        mkdirSync(config.js.path.output, { recursive: true });
        writeFileSync(outputPath, chunk.code);

        // Also output source maps
        if (chunk.map) {
          writeFileSync(`${outputPath}.map`, chunk.map.toString());
        }
      }
    }

    // Apply existing minify settings
    if (config.ts.options.minify) {
      return src(`${config.js.path.output}/scripts.js`)
        .pipe(uglify())
        .pipe(dest(config.js.path.output));
    }

    await bundle.close();
    return Promise.resolve();
  } catch (error) {
    console.error('Rollup build error:', error);
    throw error;
  }
};

const buildJs = () => {
  if (config.useTypescript) {
    return buildTs();
  }
  if (!existsSync(config.js.path.input)) {
    return Promise.resolve();
  }
  const stream = src([config.js.path.inputFiles].concat(config.ignore).concat(config.js.ignore));
  if (config.js.options.minify) {
    stream.pipe(uglify());
  }
  return stream.pipe(dest(config.js.path.output));
};

const js = series(lintJs, buildJs);

export {
  buildJs,
  buildTs,
  lintJs,
  lintJsFix,
  js
};

