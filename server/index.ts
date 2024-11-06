import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readdir, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Port = 8000;
const FilePattern = /\.spec\.js$/i;

const src = path.resolve(__dirname, '../tests');
const dest = path.resolve(__dirname, '../console');

function removeTimestamp(url: string) {
  return url.replace(/\?t=\d+/, '');
}

async function traverseDir(
  options: { basePath: string; src: string; filePattern: RegExp },
  tests: Record<string, any>,
) {
  const { src, filePattern, basePath } = options;
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && filePattern.test(entry.name)) {
      const srcPath = path.join(src, entry.name).replace(basePath, '');

      const { dir, base } = path.parse(srcPath);
      const dirs = dir.replace(/^\//, '').split('/');
      const testName = base.replace(filePattern, '');

      let currentTests = tests;

      dirs.forEach((dir) => {
        if (!currentTests[dir]) currentTests[dir] = {};

        currentTests = currentTests[dir];
      });

      currentTests[testName] = `tests${srcPath}`;
    } else if (entry.isDirectory())
      await traverseDir({ src: path.join(src, entry.name), filePattern, basePath }, tests);
  }
}

async function getTests(options: { src: string; dest: string; filePattern: RegExp }) {
  const { src, dest, filePattern } = options;
  const tests = {};

  await traverseDir({ src, filePattern, basePath: src }, tests);

  await writeFile(path.join(dest, 'tests.json'), JSON.stringify(tests, null, 2));
}

getTests({ src, dest, filePattern: FilePattern });

const server = http.createServer((req, res) => {
  const { url = '' } = req;

  if (req.method === 'GET') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (url === '/') {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'text/html');

      createReadStream(path.join(process.cwd(), 'server/index.html')).pipe(res);
    } else if (url === '/favicon.ico') {
      res.statusCode = 200;

      res.end();
    } else if (/^\/(src|tests|dist|console)\//.test(url)) {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'application/javascript');

      createReadStream(path.join(process.cwd(), removeTimestamp(url))).pipe(res);
    } else if (/\.(js|ts|map).*$/.test(url)) {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'application/javascript');

      createReadStream(path.join(process.cwd(), `dist${removeTimestamp(url)}`)).pipe(res);
    } else {
      res.statusCode = 404;

      res.end();
    }
  } else {
    res.statusCode = 404;

    res.end();
  }
});

server.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
