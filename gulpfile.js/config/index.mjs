const pathSource = './src';
const pathDestination = './dist';
const ignoreGlobal = ['!**/.DS_Store', '!**/* copy.*', '!./wp/**/*', '!./dist/wp/**/*'];
const cleanDirectory = ['./dist/css', './dist/img']; // Clean these directories before each time npm is building
const cleanDirectoryWithoutImage = ['./dist/css']; // Clean these directories before each time npm is building

const baseConfig = {
  useTypescript: true,
  pathSource: pathSource,
  pathDestination: pathDestination,
  cleanDirectory: cleanDirectory,
  cleanDirectoryWithoutImage: cleanDirectoryWithoutImage,
  ignore: ignoreGlobal,
  html: {
    path: {
      input: pathSource + '/pug',
      inputFiles: pathSource + '/pug/**/*.pug',
      output: pathDestination + '',
      outputFiles: pathDestination + '/**/*.html',
    },
    ignore: ['!./src/pug/_*/**'],
    options: {
      minify: false, // To Minify HTML files
    },
  },
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
  image: {
    path: {
      input: pathSource + '/img',
      inputFiles: pathSource + '/img/**/*',
      output: pathDestination + '/img',
      outputFiles: pathDestination + '/img/**/*',
    },
    ignore: [],
  },
  font: {
    path: {
      input: pathSource + '/font',
      inputFiles: pathSource + '/font/**/*',
      output: pathDestination + '/font',
      outputFiles: pathDestination + '/font/**/*',
    },
    ignore: [],
  },
  doc: {
    path: {
      input: pathSource + '/doc',
      inputFiles: pathSource + '/doc/**/*',
      output: pathDestination + '/doc',
      outputFiles: pathDestination + '/doc/**/*',
    },
    ignore: [],
  },
  pdf: {
    path: {
      input: pathSource + '/pdf',
      inputFiles: pathSource + '/pdf/**/*',
      output: pathDestination + '/pdf',
      outputFiles: pathDestination + '/pdf/**/*',
    },
    ignore: [],
  },
  video: {
    path: {
      input: pathSource + '/video',
      inputFiles: pathSource + '/video/**/*',
      output: pathDestination + '/video',
      outputFiles: pathDestination + '/video/**/*',
    },
    ignore: [],
  },
};

export const base = baseConfig;

