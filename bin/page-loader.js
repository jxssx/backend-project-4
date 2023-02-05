#!/usr/bin/env node

import { program } from 'commander';
import loadPage from '../src/index.js';

program
  .name('page-loader')
  .arguments('<url>')
  .description('Page loader utility')
  .version('0.0.1')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, options) => {
    loadPage(url, options.output)
      .catch((e) => {
        console.error(e.message);
        process.exit(1);
      })
      .then((path) => { console.log(path); });
  })
  .parse(process.argv);
