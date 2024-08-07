import http from 'node:http';
import path from 'node:path';
import { createReadStream } from 'node:fs';

const server = http.createServer((req, res) => {
  const { url } = req;

  if (req.method === 'GET') {
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (url === '/') {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'text/html');

      createReadStream(path.join(process.cwd(), 'server/index.html')).pipe(res);
    } else if (url === '/favicon.ico') {
      res.statusCode = 200;

      res.end();
    } else if (url?.startsWith('/src')) {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'application/javascript');

      createReadStream(path.join(process.cwd(), `${url}`)).pipe(res);
    } else {
      res.statusCode = 200;

      res.setHeader('Content-Type', 'application/javascript');

      createReadStream(path.join(process.cwd(), `dist${url}`)).pipe(res);
    }
  } else {
    res.statusCode = 404;

    res.end();
  }
});

server.listen(8000, () => {
  console.log('Server is running on port 8000');
});
