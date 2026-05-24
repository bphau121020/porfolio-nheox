import gulp from 'gulp';
const { src, dest, series, lastRun } = gulp;
import pug from 'gulp-pug';
import posthtml from 'gulp-posthtml';
import htmlnano from 'gulp-htmlnano';
import { exec } from 'child_process';
import { promisify } from 'util';
import { glob } from 'glob';
import { base as config } from '../config/index.mjs';
import { existsSync } from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv)).argv;

const customLint = (root) => {
  const walkNode = (node) => {
    if (node.attrs) {
      const nodeOutput = `<${node.tag} ` + Object.entries(node.attrs)
        .map(([key, val]) => `${key}="${val}"`)
        .join(' ') + `>`;
      for (const [attr, value] of Object.entries(node.attrs)) {
        if (value && (value.includes('<') || value.includes('>'))) {
          console.log(`Attribute "${attr}" contains "<" or ">" in element <${node.tag}>. Found at ${nodeOutput}`);
        }
      }
    }
    if (node.content && Array.isArray(node.content)) {
      node.content.forEach((child) => {
        if (typeof child === 'object') {
          walkNode(child);
        }
      });
    }
  };
  root.walk(walkNode);
};

const execAsync = promisify(exec);

const lintPug = async () => {
  const stopOnError = argv.stopOnError || false;
  let filesToCheck = [config.html.path.inputFiles];
  if (argv.file) {
    const targetFiles = argv.file.replace(/"/g, '').replace(/, /g, ',');
    filesToCheck = targetFiles.split(',');
  }
  
  try {
    // Expand glob patterns to individual file paths
    const expandedFiles = [];
    
    for (const pattern of filesToCheck) {
      const matches = await glob(pattern);
      expandedFiles.push(...matches);
    }
    
    if (expandedFiles.length === 0) {
      console.log('No Pug files found to lint');
      return;
    }
    
    const filesPattern = expandedFiles.join(' ');
    const command = `npx pug-lint ${filesPattern}`;
    
    const { stdout, stderr } = await execAsync(command);
    
    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }
    
    if (stderr && stopOnError) {
      throw new Error('Pug linting failed');
    }
  } catch (error) {
    if (stopOnError) {
      throw error;
    } else {
      console.log(error.message);
    }
  }
};

const lintHtml = () => {
  const stopOnError = argv.stopOnError || false;
  let filesToCheck = [config.html.path.outputFiles];
  if (argv.file) {
    const targetFiles = argv.file.replace(/"/g, '').replace(/, /g, ',');
    filesToCheck = targetFiles.split(',');
  }
  return src(filesToCheck)
    .pipe(posthtml([
      customLint
    ])).on('error', (error) => {
      if (stopOnError) {
        throw error;
      } else {
        console.warn(error.message);
      }
    }
    );
};

const buildHtml = () => {
  if (!existsSync('./src/pug')) {
    return Promise.resolve();
  }
  const stream = src([config.html.path.inputFiles].concat(config.ignore).concat(config.html.ignore), { since: lastRun(buildHtml) })
    .pipe(
      pug({
        pretty: true
      })
    );
  if (config.html.options.minify) {
    stream.pipe(htmlnano({
      removeComments: false
    }));
  }
  return stream.pipe(dest('./dist'));
};

const html = series(lintPug, buildHtml);

export {
  buildHtml,
  lintPug,
  lintHtml,
  html
};

