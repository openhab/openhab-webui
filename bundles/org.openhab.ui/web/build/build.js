const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);

const webpack = require('webpack');
const ora = require('ora');
const rm = require('rimraf').rimraf;
const chalk = require('chalk');
const replaceInFile = require('replace-in-file')

const config = require('./webpack.config.js');

const env = process.env.NODE_ENV || 'development';
const target = process.env.TARGET || 'web';
const timestamp = new Date().toISOString().slice(0, 16).replaceAll(/[T:-]/g, "");
let version = process.argv[2] || timestamp;
if (version.endsWith('SNAPSHOT')) version += '-' + timestamp;

const spinner = ora(env === 'production' ? chalk.cyan('Building for production...') : chalk.cyan('Building development version...'));
spinner.start();

exec('git rev-parse --short HEAD').then((result) => {
  return Promise.resolve(result.stdout.trim());
}).then((commit) => {
  const versionReplace = {
    files: './src/components/app.vue',
    from: /%VERSION%/g,
    to: version
  }
  const commitReplace = {
    files: './src/js/store/index.js',
    from: /%GIT_COMMIT_HASH%/g,
    to: commit || ''
  }
  return Promise.all([rm('./www/'), replaceInFile(versionReplace), replaceInFile(commitReplace)]);
}).then(() => {
  webpack(config, (err, stats) => {
    if (err) throw err;
    spinner.stop();

    process.stdout.write(`${stats.toString({
      colors: env === 'development',
      modules: false,
      children: false, // If you are using ts-loader, setting this to true will make TypeScript errors show up during build.
      chunks: false,
      chunkModules: false,
    })}\n\n`);

    if (stats.hasErrors()) {
      console.log(chalk.red('Build failed with errors.\n'));
      process.exit(1);
    }

    console.log(chalk.cyan('Build complete.\n'));
  });
}).catch((e) => {
  throw e;
});
