import path from 'path';
import cheerio from 'cheerio';
import axios from 'axios';
import fsp from 'fs/promises';


const cutUrl = (url) => url.replace(`${new URL(url).protocol}//`, '');

const processName = (name, replacer = '-') => name.match(/\w*/gi)
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

export const processAssets = (url, data, output) => {
  const dirName = `${processName(cutUrl(url))}_files`;
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
    const assetFileName = urlToName(assetLink);
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
