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
    loadPage(url, options.output)
      .catch((e) => {
        process.exitCode = 1;
        console.error(e.message);
      });
  })
  .parse(process.argv);
