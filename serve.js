// 零依赖静态服务器：node serve.js [port]
// localhost / 127.0.0.1 属于安全上下文，Service Worker 与 PWA 安装都能用
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = __dirname;
const PORT = Number(process.argv[2] || process.env.PORT || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8'
};

function safeJoin(root, urlPath) {
  const p = path.normalize(path.join(root, urlPath));
  return p.startsWith(path.normalize(root)) ? p : null;
}

const server = http.createServer((req, res) => {
  let u = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
  if (u.endsWith('/')) u += 'index.html';

  const file = safeJoin(ROOT, u);
  if (!file) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('400 bad path');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      // 目录没写 index.html 时回落到两个主页之一
      if (!path.extname(file)) {
        const fallback = fs.existsSync(path.join(file, 'index.html')) ? path.join(file, 'index.html') : null;
        if (fallback) {
          res.writeHead(302, { Location: u + 'index.html' });
          res.end();
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 ' + u);
      return;
    }
    const ext = path.extname(file).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream' };
    // Service Worker 必须允许更新、允许跨作用域注册
    headers['Cache-Control'] = ext === '.js' || ext === '.webmanifest' ? 'no-cache' : 'no-store';
    if (file.endsWith('sw.js')) headers['Service-Worker-Allowed'] = '/';
    res.writeHead(200, headers);
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('本地   http://127.0.0.1:' + PORT + '/');
  console.log('巨魔版 http://127.0.0.1:' + PORT + '/troll.html');
  console.log('可安装 http://127.0.0.1:' + PORT + '/troll-app/');
  Object.values(os.networkInterfaces()).flat().forEach(n => {
    if (n && n.family === 'IPv4' && !n.internal) console.log('局域网 http://' + n.address + ':' + PORT + '/');
  });
});
