import path from 'path';
import debug from 'debug';
import 'axios-debug-log';

export const log = debug('page-loader');

export const cutUrl = (url) => url.replace(`${new URL(url).protocol}//`, '');

export const processName = (name, replacer = '-') => name.match(/\w*/gi)
  .filter((x) => x)
  .join(replacer);

export const urlToName = (url, defaultFormat = 'html') => {
  const urlWithoutProtocol = cutUrl(url);
  const { ext } = path.parse(url);
  const format = ext.replace('.', '');
  const finalFormat = format || defaultFormat;
  const regex = new RegExp(`-${finalFormat}$`, 'g');
  const symbolsReplaced = processName(urlWithoutProtocol).replace(regex, '');
  return `${symbolsReplaced}.${finalFormat}`;
};

export const buildPathToHtml = (url, output) => {
  const fileName = urlToName(url);
  return path.resolve(process.cwd(), output, fileName);
};
