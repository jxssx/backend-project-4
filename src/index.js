import fsp from 'fs/promises';
import 'axios-debug-log';
import axios from 'axios';
import { buildPathToHtml, processAssets } from './utils.js';

const loadPage = (url, output = process.cwd()) => {
  const outputPath = buildPathToHtml(url, output);
  return axios.get(url)
    .then(({ data }) => processAssets(url, data, output))
    .then((processedData) => fsp.writeFile(outputPath, processedData))
    .then(() => { console.log(outputPath); });
};

export default loadPage;
