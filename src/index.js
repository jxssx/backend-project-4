import fsp from 'fs/promises';
import 'axios-debug-log';
import axios from 'axios';
import { buildPathToHtml, processAssets } from './utils.js';

const loadPage = (url, output = process.cwd()) => {
  const outputPath = buildPathToHtml(url, output);
  return axios.get(url)
    .catch((e) => {
      console.error(`Возникла ошибка при попытке произвести запрос по адресу ${e.config.url}. Код ошибки: ${e.request.res.statusCode}`);
      process.exit(1);
    })
    .then(({ data }) => processAssets(url, data, output))
    .catch(() => {
      console.error('Невозможно прочитать данные со страницы.');
      process.exit(1);
    })
    .then((processedData) => fsp.writeFile(outputPath, processedData))
    .catch((e) => {
      console.error(`Ошибка при записи файла. Код ошибки: ${e.code}`)
      process.exit(1);
    })
    .then(() => outputPath);
};

export default loadPage;