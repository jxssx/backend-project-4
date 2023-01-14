import fsp from 'fs/promises';
import axios from 'axios';
import { buildPathToHtml, loadAssets } from './utils.js';

const loadPage = (url, output = process.cwd()) => {
  let data = '';
  const outputPath = buildPathToHtml(url, output);
  return axios.get(url)
    .then((reply) => { data = reply.data; fsp.writeFile(outputPath, reply.data) })
    .then(() => {
      loadAssets(url, data, output);
    })
    .then(() => outputPath);
};

export default loadPage;