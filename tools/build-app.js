// 构建 troll-app/index.html：把 troll.html 注入 PWA 头、安装条与 Service Worker
// 用法：node tools/build-app.js
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'troll.html'), 'utf8');
const outDir = path.join(root, 'troll-app');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const HEAD_INJECT = `
<link rel="manifest" href="manifest.webmanifest">
<meta name="theme-color" content="#0b1607">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="巨魔推演台">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<style>
.install-bar{position:fixed;left:8px;right:8px;bottom:34px;z-index:5;display:none;}
.install-bar button{width:100%;padding:11px;border:3px solid #0b1607;border-radius:11px;
background:linear-gradient(90deg,#ff4fd8,#b6ff3c);color:#0b1607;font-size:15px;font-weight:bold;
box-shadow:4px 4px 0 #a020f0;letter-spacing:1px;cursor:pointer;}
.install-bar button:active{transform:translate(4px,4px);box-shadow:0 0 0 #a020f0;}
.offline-pill{position:fixed;left:50%;top:10px;transform:translateX(-50%);z-index:6;
background:#ff4fd8;color:#0b1607;font-size:12px;font-weight:bold;padding:5px 10px;border-radius:20px;
border:2px solid #0b1607;display:none;}
</style>
`;

const BODY_INJECT = `
<div class="offline-pill" id="offlinePill">🃏 离线模式 · 巨魔照跑</div>
<div class="install-bar" id="installBar"><button id="installBtn">📲 安装到桌面（巨魔入住）</button></div>
<script>
(function () {
  // 注册 Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js', { scope: './' }).catch(function () {});
    });
  }

  // 安装提示：Chromium 系把 beforeinstallprompt 交给我们自己弹
  var deferred = null;
  var bar = document.getElementById('installBar');
  var btn = document.getElementById('installBtn');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferred = e;
    bar.style.display = 'block';
  });
  if (btn) {
    btn.addEventListener('click', function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.then(function () {
        deferred = null;
        bar.style.display = 'none';
        var t = document.getElementById('taunt');
        if (t) t.textContent = '装好了？巨魔已经住进你桌面了。';
      });
    });
  }
  window.addEventListener('appinstalled', function () {
    bar.style.display = 'none';
    var t = document.getElementById('taunt');
    if (t) t.textContent = '安装成功，现在关掉网页也甩不掉我。';
  });

  // 离线提示
  var pill = document.getElementById('offlinePill');
  function syncNet() { pill.style.display = navigator.onLine ? 'none' : 'block'; }
  window.addEventListener('online', syncNet);
  window.addEventListener('offline', syncNet);
  syncNet();
})();
</script>
`;

let out = src.replace('</head>', HEAD_INJECT + '</head>');
out = out.replace('</body>', BODY_INJECT + '</body>');
out = out.replace('<title>云盛推演台 · 巨魔版</title>', '<title>巨魔推演台</title>');

fs.writeFileSync(path.join(outDir, 'index.html'), out, 'utf8');
console.log('built troll-app/index.html  ' + Buffer.byteLength(out, 'utf8') + ' bytes');
