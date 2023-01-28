import nock from 'nock';
import path from 'path';
import loadPage from '../src/index.js';
import fsp from 'fs/promises';
import os from 'os';

const getFixturePath = (filename) => path.join('__fixtures__', filename);

let tmpDirPath = '';
let replyData = '';
let imgData = '';
let styleSheet = '';
let script = '';
let assetsDirPath = '';
const imgAssetName = 'ru-hexlet-io-assets-professions-nodejs.png';
const cssAssetName = 'ru-hexlet-io-assets-application.css'
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
  styleSheet = await fsp.readFile(getFixturePath('application.css'));
  script = await fsp.readFile(getFixturePath('runtime.js'));
  imgData = await fsp.readFile(getFixturePath('nodejs_logo.png'));
  tmpDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  assetsDirPath = path.join(tmpDirPath, 'ru-hexlet-io-courses_files');
  assetData = [{ link: '/assets/professions/nodejs.png', data: imgData }, { link: '/assets/application.css', data: styleSheet },
    {link: '/packs/js/runtime.js', data: script}];
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
    expect(await fsp.readFile(path.join(assetsDirPath, imgAssetName))).toEqual(imgData);
    expect(await fsp.readFile(path.join(assetsDirPath, cssAssetName))).toEqual(styleSheet);
    expect(await fsp.readFile(path.join(tmpDirPath, fileName), 'utf8'))
      .toBe(await fsp.readFile(getFixturePath('expected.html'), 'utf8'));
    expect(await fsp.readFile(path.join(tmpDirPath, fileName), 'utf8'))
      .toBe(await fsp.readFile(getFixturePath('expected.html'), 'utf8'));
  }
  catch (e) {
    throw new Error(e);
  }
});
