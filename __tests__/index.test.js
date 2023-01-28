import nock from 'nock';
import path from 'path';
import loadPage from '../src/index.js';
import fsp from 'fs/promises';
import os from 'os';

const getFixturePath = (filename) => path.join('__fixtures__', filename);

let tmpDirPath = '';
let replyData = '';
let assetsDirPath = '';
const fileName = 'ru-hexlet-io-courses.html';
const baseURL = 'https://ru.hexlet.io';
let assetData;

const nockAssetRequest = (link, data) => {
  return nock(baseURL)
    .get(link)
    .reply(200, data)
};

nock.disableNetConnect();

beforeAll(async () => {
  replyData = await fsp.readFile(getFixturePath('reply.txt'), 'utf8');
  tmpDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  assetsDirPath = path.join(tmpDirPath, 'ru-hexlet-io-courses_files');
  assetData = [{ filename: 'ru-hexlet-io-assets-professions-nodejs.png', link: '/assets/professions/nodejs.png',
    data: await fsp.readFile(getFixturePath('nodejs_logo.png')) },
    { filename: 'ru-hexlet-io-assets-application.css', link: '/assets/application.css', data: await fsp.readFile(getFixturePath('application.css')) },
    { filename: 'ru-hexlet-io-packs-js-runtime.js', link: '/packs/js/runtime.js', data: await fsp.readFile(getFixturePath('runtime.js')) }];
});

test('loadPage', async () => {
  nock('https://ru.hexlet.io')
    .persist()
    .get('/courses')
    .reply(200, replyData);
  assetData.forEach((obj) => { nockAssetRequest(obj.link, obj.data); });
  try {
    const result = await loadPage('https://ru.hexlet.io/courses', tmpDirPath);
    expect(result).toBe(path.join(tmpDirPath, fileName));
    assetData.forEach(async (asset) => { expect(await fsp.readFile(path.join(assetsDirPath, asset.filename))).toEqual(asset.data) });
    expect(await fsp.readFile(path.join(tmpDirPath, fileName), 'utf8'))
      .toBe(await fsp.readFile(getFixturePath('expected.html'), 'utf8'));
    expect(await fsp.readFile(path.join(tmpDirPath, fileName), 'utf8'))
      .toBe(await fsp.readFile(getFixturePath('expected.html'), 'utf8'));
  }
  catch (e) {
    throw new Error(e);
  }
});
