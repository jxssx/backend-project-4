import fsp from 'fs/promises';
import axios from 'axios';
import buildPath from './utils.js';

const loadPage = (url, output = process.cwd()) => {
  const outputPath = buildPath(url, output);
  axios.get(url)
    .then((answer) => fsp.writeFile(outputPath, answer.data));
  return outputPath;
};

export default loadPage;