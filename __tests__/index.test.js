import nock from 'nock';
import path from 'path';
import loadPage from '../src/index.js';
import fsp from 'fs/promises';
import os from 'os';

const getFixturePath = (filename) => path.join('__fixtures__', filename);

let tmpDirPath = '';
let replyData = '';
const fileName = 'web-ics-purdue-edu--gchopra-class-public-pages-webdesign-05-simple-html.html';

beforeAll(async () => {
  replyData = await fsp.readFile(getFixturePath('reply.txt'), 'utf8');
  tmpDirPath = await fsp.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterAll(async () => {
  await fsp.unlink(`${tmpDirPath}/${fileName}`);
  await fsp.rmdir(tmpDirPath);
});

test('loadPage', async () => {
  nock('https://web.ics.purdue.edu')
    .get('/~gchopra/class/public/pages/webdesign/05_simple.html')
    .reply(200, replyData);
  const result = await loadPage('https://web.ics.purdue.edu/~gchopra/class/public/pages/webdesign/05_simple.html', tmpDirPath);
  expect(result).toBe(`${tmpDirPath}/${fileName}`);
  expect(await fsp.readFile(`${tmpDirPath}/${fileName}`, 'utf8'))
    .toBe(await fsp.readFile(getFixturePath('expected.html'), 'utf8'));
});
