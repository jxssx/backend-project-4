#!/usr/bin/env node

import loadPage from '../src/index.js';
import { program } from 'commander';

program
  .name('page-loader')
  .arguments('<url>')
  .description('Page loader utility')
  .version('0.0.1')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, options) => {
    console.log(loadPage(url, options.output));
  })
  .parse(process.argv);
