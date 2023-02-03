import nock from 'nock';
import path from 'path';
import loadPage from '../src/index.js';
import fsp from 'fs/promises';
import os from 'os';
import { log } from '../src/utils.js'

const getFixturePath = (filename) => path.join('__fixtures__', filename);

let tmpDirPath = '';
let replyData = '';
let assetsDirPath = '';
const assetsDirName = 'ru-hexlet-io-courses_files';
const fileName = 'ru-hexlet-io-courses.html';
const baseURL = 'https://ru.hexlet.io';
const pageURL = 'https://ru.hexlet.io/courses';
let assetData;

const nockAssetRequest = (link, data) => {
  return nock(baseURL)
    .persist()
    .get(link)
    .reply(200, data)
};

const scope = nock(baseURL).persist();

nock.disableNetConnect();

beforeAll(async () => {
  replyData = await fsp.readFile(getFixturePath('reply.txt'), 'utf8');
  tmpDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  log('Creating temp dir', tmpDirPath);
  assetsDirPath = path.join(tmpDirPath, 'ru-hexlet-io-courses_files');
  assetData = [{ filename: 'ru-hexlet-io-assets-professions-nodejs.png', link: '/assets/professions/nodejs.png',
    data: await fsp.readFile(getFixturePath('nodejs_logo.png')) },
    { filename: 'ru-hexlet-io-assets-application.css', link: '/assets/application.css', data: await fsp.readFile(getFixturePath('application.css')) },
    { filename: 'ru-hexlet-io-packs-js-runtime.js', link: '/packs/js/runtime.js', data: await fsp.readFile(getFixturePath('runtime.js')) }];
  scope.get('/courses').reply(200, replyData);
  assetData.forEach((obj) => { nockAssetRequest(obj.link, obj.data); });
});

test('no reply error', async () => {
  const invalidURL = 'https://doesntexist.net';
  const noReplyError = `getaddrinfo ENOTFOUND ${invalidURL}`;
  nock(invalidURL).persist().get('/').replyWithError(noReplyError);
  await expect(loadPage(invalidURL, tmpDirPath)).rejects.toThrow(noReplyError);
});

test.each([404, 500])('status code error %s', async (code) => {
  scope.get(`/${code}`).reply(code, '');
  await expect(loadPage(`${baseURL}/${code}`, tmpDirPath)).rejects.toThrow(`Request failed with status code ${code}`);
});

test('filesystem errors', async () => {
  await expect(loadPage(pageURL, '/sys')).rejects.toThrow(`EACCES: permission denied, mkdir '/sys/ru-hexlet-io-courses_files'`)
  
  const filepath = getFixturePath('expected.html');
  await expect(loadPage(pageURL, filepath))
    .rejects.toThrow(`ENOTDIR: not a directory, mkdir '${filepath}/${assetsDirName}'`);
  
  await expect(loadPage(pageURL, 'doesntexist'))
    .rejects.toThrow(`ENOENT: no such file or directory, mkdir 'doesntexist/${assetsDirName}'`);
  
});

test('positive', async () => {
  try {
    await loadPage(pageURL, tmpDirPath);
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
