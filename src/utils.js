import path from 'path';
import cheerio from 'cheerio';
import axios from 'axios';
import fsp from 'fs/promises';

export const urlToName = (url, type) => {
  const cutUrl = url.replace(`${new URL(url).protocol}//`, '');
  const symbolsReplaced = cutUrl.replaceAll(/\W|_/ig, '-');
  switch (type) {
    case 'html':
      return `${symbolsReplaced}.html`;
      case 'img':
        return symbolsReplaced.replaceAll(/-(?=png$|jpg$|svg$)/g, '.');
      case 'link':
        if (symbolsReplaced.includes('html') || symbolsReplaced.includes('css')) {
          return symbolsReplaced.replaceAll(/-(?=css$|html$)/g, '.');
        }
        return `${symbolsReplaced}.html`
      case 'script':
        return symbolsReplaced.replaceAll(/-(?=js$)/g, '.');
      default:
        return symbolsReplaced;
  }
};

export const buildPathToHtml = (url, output) => {
  const fileName = urlToName(url, 'html');
  return path.resolve(process.cwd(), output, fileName);
};

export const processAssets = (url, data, output) => {
  const dirName = `${urlToName(url)}_files`;
  const dirPath = path.join(output, dirName);
  const urlAPI = new URL(url);
  const buildAssetLink = (assetLink) => {
    if (assetLink.includes(urlAPI.host)) {
      return assetLink;
    }
    return `${urlAPI.protocol}//${urlAPI.host}${assetLink}`;
  };
  const tagAttrMapping = {
    img: 'src',
    link: 'href',
    script: 'src',
  };
  const $ = cheerio.load(data);
  
  const makeAssetsPromises = (tag) => $(`${tag}[${tagAttrMapping[tag]}]`)
  .filter(function () {
    const attrName = tagAttrMapping[tag];
    const link =  new URL($(this).attr(attrName), urlAPI.origin);
    return link.origin === urlAPI.origin; 
  })
  .map(function () {
    const attrName = tagAttrMapping[tag];
    const attrValue = $(this).attr(tagAttrMapping[tag]);
    const assetLink = buildAssetLink(attrValue);
    const assetFileName = urlToName(assetLink, tag);
    $(this).attr(attrName, path.join(dirName, assetFileName));
    return axios({
      url: assetLink,
      responseType: 'arraybuffer',
    }).then(({ data }) => fsp.writeFile(path.join(dirPath, assetFileName), data))}).get();

  const assetsPromises = Object.keys(tagAttrMapping).flatMap((tag) => {
    return makeAssetsPromises(tag);
  });
  return fsp.mkdir(dirPath)
    .then(() => Promise.all(assetsPromises))
    .then(() => $.html());
};
