import http, { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { readdir, writeFile } from 'node:fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 8000;
const FILE_PATTERN = /\.spec\.[tj]s$/i;

const TEST_FOLDER = 'tests';
const DIST_FOLDER = 'dist';
const CONSOLE_FOLDER = 'console';

const SRC = path.resolve(__dirname, `../${TEST_FOLDER}/${DIST_FOLDER}`);
const DEST = path.resolve(__dirname, `../${CONSOLE_FOLDER}`);

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

      currentTests[testName] = path.join(TEST_FOLDER, DIST_FOLDER, srcPath);
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

getTests({ src: SRC, dest: DEST, filePattern: FILE_PATTERN });

const errorHandler = (_req: IncomingMessage, res: ServerResponse, error: unknown) => {
  console.error('Error:', error);

  res.statusCode = 500;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error }));
};

const server = http.createServer((req, res) => {
  const { url = '' } = req;

  if (req.method === 'GET') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    if (url === '/') {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'text/html');

      const stream = createReadStream(path.join(process.cwd(), 'server/index.html'));

      stream.on('error', (err) => errorHandler(req, res, err));

      stream.pipe(res);
    } else if (url === '/favicon.ico') {
      res.statusCode = 200;

      res.end();
    } else if (/^\/(src|tests|dist|console)\//.test(url)) {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'application/javascript');

      const stream = createReadStream(path.join(process.cwd(), removeTimestamp(url)));

      stream.on('error', (err) => errorHandler(req, res, err));

      stream.pipe(res);
    } else if (/\.(js|ts|map).*$/.test(url)) {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'application/javascript');

      const stream = createReadStream(path.join(process.cwd(), `dist${removeTimestamp(url)}`));

      stream.on('error', (err) => errorHandler(req, res, err));

      stream.pipe(res);
    } else {
      res.statusCode = 404;

      res.end();
    }
  } else {
    res.statusCode = 404;

    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
