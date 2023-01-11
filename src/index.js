import fsp from 'fs/promises';
import axios from 'axios';
import buildPath from './utils.js';

const loadPage = (url, output = process.cwd()) => {
  const outputPath = buildPath(url, output);
  return axios.get(url)
    .then((reply) => fsp.writeFile(outputPath, reply.data))
    .then(() => outputPath);
};

export default loadPage;