import nock from 'nock';
import path from 'path';
import loadPage from '../src/index.js';
import fsp from 'fs/promises';
import os from 'os';

const getFixturePath = (filename) => path.join('__fixtures__', filename);

let tmpDirPath = '';
let replyData = '';
let imgData = '';
let assetsDirPath = '';
let assetName = 'ru-hexlet-io-assets-professions-nodejs.png';
const fileName = 'ru-hexlet-io-courses.html';

beforeAll(async () => {
  replyData = await fsp.readFile(getFixturePath('reply.txt'), 'utf8');
  imgData = await fsp.readFile(getFixturePath('nodejs_logo.png'));
  tmpDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  assetsDirPath = path.join(tmpDirPath, 'ru-hexlet-io-courses_files');
});

afterAll(async () => { 
  await fsp.unlink(path.join(assetsDirPath, assetName));
  await fsp.rmdir(assetsDirPath);
  await fsp.unlink(path.join(tmpDirPath, fileName));
  await fsp.rmdir(tmpDirPath);
});

test('loadPage', async () => {
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, replyData);
  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, imgData);
  const result = await loadPage('https://ru.hexlet.io/courses', tmpDirPath);
  expect(result).toBe(`${tmpDirPath}/${fileName}`);
  // expect(await fsp.readFile(path.join(assetsDirPath, assetName))).toEqual(imgData);
  const wait = ms=>new Promise(resolve => setTimeout(resolve, ms));
  wait(7*1000).then(async () => {
    expect(await fsp.readFile(path.join(assetsDirPath, assetName))).toEqual(imgData);
    expect(await fsp.readFile(`${tmpDirPath}/${fileName}`, 'utf8'))
    .toBe(await fsp.readFile(getFixturePath('expected.html'), 'utf8'));
  });
  expect(await fsp.readFile(`${tmpDirPath}/${fileName}`, 'utf8'))
    .toBe(await fsp.readFile(getFixturePath('expected.html'), 'utf8'));
});
