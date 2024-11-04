import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';
import { readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

function removeTimestamp(url: string) {
  return url.replace(/\?t=\d+/, '');
}

const filePattern = /\.spec\.js$/i;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scenariosSrc = path.resolve(__dirname, '../scenarios');

const scenarios = {};

async function getScenarios(src: string) {
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && filePattern.test(entry.name)) {
      const srcPath = path.join(src, entry.name).replace(scenariosSrc, '');

      const { dir, base } = path.parse(srcPath);
      const dirs = dir.replace(/^\//, '').split('/');
      const scenarioName = base.replace(filePattern, '');

      let currentScenarios = scenarios;

      dirs.forEach((dir) => {
        if (!currentScenarios[dir]) currentScenarios[dir] = {};

        currentScenarios = scenarios[dir];
      });

      currentScenarios[scenarioName] = `scenarios${srcPath}`;
    }

    if (entry.isDirectory()) await getScenarios(path.join(src, entry.name));
  }
}

getScenarios(scenariosSrc).then(() => {
  // writeFile(path.join(scenariosSrc, 'scenarios.json'), JSON.stringify(scenarios, null, 2));
});

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
    } else if (/^\/(src|scenarios|dist)\//.test(url)) {
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

server.listen(8000, () => {
  console.log('Server is running on port 8000');
});
