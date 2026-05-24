const pathSource = '..';
const pathDestination = '..';
const ignoreGlobal = ['!**/.DS_Store', '!**/* copy.*', '!./wp/**/*', '!./dist/wp/**/*'];

const baseConfig = {
  useTypescript: true,
  pathSource: pathSource,
  pathDestination: pathDestination,
  ignore: ignoreGlobal,
  css: {
    path: {
      input: pathSource + '/scss',
      inputFiles: pathSource + '/scss/**/*.scss',
      output: pathDestination + '/css',
      outputFiles: pathDestination + '/css/**/*.css',
    },
    ignore: [],
    options: {
      minify: false, // To Minify CSS files
    },
  },
  js: {
    path: {
      input: pathSource + '/js',
      inputFiles: pathSource + '/js/**/*.js',
      output: pathDestination + '/js',
      outputFiles: pathDestination + '/js/**/*.js',
    },
    ignore: [],
    options: {
      minify: false, // To Minify JS files
    },
  },
  ts: {
    path: {
      input: pathSource + '/ts',
      inputFiles: pathSource + '/ts/**/*.ts',
    },
    ignore: [],
    options: {
      minify: false, // To Minify JS files
    },
  },
};

export const base = baseConfig;

