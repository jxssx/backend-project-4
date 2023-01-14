import path from 'path';
import cheerio from 'cheerio';
import axios from 'axios';
import fsp from 'fs/promises';

export const urlToName = (url) => {
  const cutUrl = url.replace(`${new URL(url).protocol}//`, '');
  return `${cutUrl.replaceAll(/\W|_/ig, '-')}`;
};

export const buildPathToHtml = (url, output) => {
  const fileName = `${urlToName(url)}.html`;
  return path.resolve(process.cwd(), output, fileName);
};

export const loadAssets = (url, data, output) => {
  const dirName = `${urlToName(url)}_files`
  const dirPath = path.join(output, dirName);
  const buildAssetLink = (assetLink) => `${assetLink}`;
  fsp.mkdir(dirPath).then(() => {
      const $ = cheerio.load(data);
      $('img').each((_, elem) => {
        const assetLink = buildAssetLink(elem.attribs.src);
        console.log(assetLink);
        axios({
          url: assetLink,
          responseType: 'arraybuffer',
        }).then(({ data }) => fsp.writeFile(path.join(dirPath, urlToName(assetLink)), data));
    });
  });
};
