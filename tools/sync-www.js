// 把 troll-app/ 的产物同步到 www/，供 Capacitor 打进 iOS/Android 壳
// 用法：node tools/sync-www.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const from = path.join(root, 'troll-app');
const to = path.join(root, 'www');

function rmrf(p) {
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}
function copy(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const f of fs.readdirSync(src)) copy(path.join(src, f), path.join(dst, f));
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
}

if (!fs.existsSync(path.join(from, 'index.html'))) {
  console.error('troll-app/index.html 不存在，先跑 node tools/build-app.js');
  process.exit(1);
}

rmrf(to);
copy(from, to);

// WKWebView 里没有 beforeinstallprompt，把安装条相关逻辑换成原生提示，避免留空块
const idx = path.join(to, 'index.html');
let html = fs.readFileSync(idx, 'utf8');
html = html.replace(
  "<div class=\"install-bar\" id=\"installBar\"><button id=\"installBtn\">📲 安装到桌面（巨魔入住）</button></div>",
  "<div class=\"install-bar\" id=\"installBar\" style=\"display:none\"></div>"
);
fs.writeFileSync(idx, html, 'utf8');

let bytes = 0;
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else bytes += fs.statSync(p).size;
  }
})(to);

console.log('www/ synced: ' + bytes + ' bytes');
