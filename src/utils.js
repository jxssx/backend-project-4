import path from 'path';

const buildPath = (url, output) => {
  const cutUrl = url.replace(`${new URL(url).protocol}//`, '');
  const fileName = `${cutUrl.replaceAll(/\W|_/ig, '-')}.html`;
  return path.resolve(process.cwd(), output, fileName);
};

export default buildPath;
