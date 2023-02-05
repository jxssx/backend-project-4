import fsp from 'fs/promises';
import 'axios-debug-log';
import axios from 'axios';
import path from 'path';
import cheerio from 'cheerio';
import Listr from 'listr';
import { buildPathToHtml, processName, cutUrl, urlToName, log } from './utils.js';

const makeAssetList = (url, $, assetDirName) => {
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
  return Object.keys(tagAttrMapping).flatMap((tag) => $(`${tag}[${tagAttrMapping[tag]}]`)
    .filter(function isLocalAsset() {
      const attrName = tagAttrMapping[tag];
      const link = new URL($(this).attr(attrName), urlAPI.origin);
      return link.origin === urlAPI.origin;
    })
    .map(function makeListOfAssetObjects() {
      const attrName = tagAttrMapping[tag];
      const attrValue = $(this).attr(tagAttrMapping[tag]);
      const assetLink = buildAssetLink(attrValue);
      const fileName = urlToName(assetLink);
      $(this).attr(attrName, path.join(assetDirName, fileName));
      return { link: assetLink, fileName };
    })
    .get())
};

const downloadAssets = (url, assetList, $, assetDirPath) => {
  const taskList = assetList
      .map(function createTaskObject(asset) {
        return {
          title: `Downloading '${asset.link}'`,
          task: () => axios({
            url: asset.link,
            responseType: 'arraybuffer',
          })
            .then((response) => {
              fsp.writeFile(path.join(assetDirPath, asset.fileName), response.data);
            }),
        };
      });

  const tasks = new Listr(taskList, { concurrent: true });
  
  return tasks.run().then(() => $.html());
};

const loadPage = (url, output = process.cwd()) => {
  const outputPath = buildPathToHtml(url, output);
  const assetDirName = `${processName(cutUrl(url))}_files`;
  const assetDirPath = path.join(output, assetDirName);
  log(`starting! trying to reach out to ${url}`);
  return axios.get(url)
    .then(({ data }) => {
      log('success!');
      log(`creating asset directory at ${assetDirPath}`);
      return fsp.mkdir(assetDirPath).then(() => data);
    })
    .then((data) => {
      const $ = cheerio.load(data);
      const assetList = makeAssetList(url, $, assetDirName);
      log('built asset list', assetList);
      log('downloading assets');
      return downloadAssets(url, assetList, $, assetDirPath);
    })
    .then((processedData) => {
      log(`writing main html file at ${outputPath}`)
      fsp.writeFile(outputPath, processedData);
    })
    .then(() => outputPath);
};

export default loadPage;
