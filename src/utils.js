import path from 'path';
import cheerio from 'cheerio';
import axios from 'axios';
import fsp from 'fs/promises';

export const urlToName = (url, type) => {
  const cutUrl = url.replace(`${new URL(url).protocol}//`, '');
  const symbolsReplaced = cutUrl.replaceAll(/\W|_/ig, '-');
  switch (type) {
    case 'html':
      return `${symbolsReplaced}.html`
      case 'img':
        return symbolsReplaced.replaceAll(/-(?=png|jpg|svg)/g, '.');
      default:
        return symbolsReplaced;
  }
};

export const buildPathToHtml = (url, output) => {
  const fileName = urlToName(url, 'html');
  return path.resolve(process.cwd(), output, fileName);
};

export const processAssets = (url, data, output) => {
  const dirName = `${urlToName(url)}_files`
  const dirPath = path.join(output, dirName);
  const buildAssetLink = (assetLink) => `${assetLink}`;
  const $ = cheerio.load(data);
  return fsp.mkdir(dirPath).then(() => {
      $('img').each(function (_, elem) {
        const attr = elem.attribs.src;
        const assetLink = buildAssetLink(attr);
        const assetName = urlToName(assetLink, 'img');
        axios({
          url: assetLink,
          responseType: 'arraybuffer',
        }).then(({ data }) => fsp.writeFile(path.join(dirPath, assetName), data));
        $(this).attr("src", path.join(dirName, assetName));
    })
  }).then(() => $.html());
};
