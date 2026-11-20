# 云盛推演台 · 巨魔版

一个纯前端、零依赖、单文件的生肖推演玩具。输入上一场结果与本场谜面，按固定权重算分排名，界面是一整套沼泽绿 + 霓虹粉的巨魔皮肤。

三份产物，同一套引擎：

| 入口 | 说明 |
| --- | --- |
| `index.html` | 原版深蓝金配色，克制、正经 |
| `troll.html` | 巨魔版，Comic Sans、嘲讽气泡、收割印章、跑马灯 |
| `troll-app/` | 巨魔版 PWA，可安装到桌面/手机主屏，支持离线 |

## 快速开始

```bash
node serve.js          # 默认 8080
node serve.js 8899     # 指定端口
```

打开：

- 原版 http://127.0.0.1:8080/
- 巨魔版 http://127.0.0.1:8080/troll.html
- 可安装 http://127.0.0.1:8080/troll-app/

没有 Node 也行：

```bash
python -m http.server 8080
```

双击 `troll.html` 同样能跑，只是 `file://` 下 Service Worker 不注册，装不了 PWA。

## 目录结构

```
.
├─ index.html                  原版（单文件，内联 CSS/JS）
├─ troll.html                  巨魔版（单文件）
├─ troll-app/
│  ├─ index.html               由 tools/build-app.js 生成，勿手改
│  ├─ manifest.webmanifest     PWA 清单，standalone + maskable 图标
│  ├─ sw.js                    应用外壳全缓存，断网可用
│  └─ icons/icon-{192,512}.png tools/make-icons.py 生成
├─ tools/
│  ├─ build-app.js             troll.html → troll-app/index.html
│  └─ make-icons.py            Pillow 画巨魔头图标
└─ serve.js                    零依赖静态服务器
```

## 怎么用

1. **上一场结果**：必须命中图鉴字典的 7 个键之一，才会触发顺延加分
   `蛇` `白鱼` `金鱼` `螃蟹` `蚯蚓` `猪` `白马`
2. **本场资料**：整段粘贴。识别这几类标签
   - 属相：`属相：蛇` `生肖：蛇` `[生肖]猪` `本肖：蛇`，都认不到时兜底取全文第一个生肖字
   - 诗句：`题目：` 后到行尾，自动去掉括号里的译注
   - 提示词：每行含「提示」的那句，多行用 ` / ` 连接
3. **撞「开始推演／开始被割」**，出前 10 名，每条带冷宝遗漏与标签

### 冷宝数据

点「编辑冷宝数据」，按 `名字:遗漏` 逗号分隔录入，中英文冒号逗号都认：

```
兔子:81,大象:20,野猫:19,狗:19,孔雀:18
```

存 `localStorage.coldData`，刷新不丢。名字要与候选池一致（`兔子` `马鹿` `飞龙` `螺丝` `螺蛳` `黄鳝` …），写错的那条不参与加减分。

## 打分规则

基准 50 分，全部条目同起点，最后降序取前 10。

| 环节 | 分值 | 触发 |
| --- | --- | --- |
| 图鉴 · 对头 | +30 | 等于该场 `duitou` |
| 图鉴 · 避出 | +20 | 落在该场 `bichu` 数组内，可叠加多条 |
| 生肖 · 六合 | +15 | `zodiacRules[属相].he` |
| 生肖 · 三合 | +10 | `zodiacRules[属相].sanhe` |
| 生肖 · 六冲 | +15 | `zodiacRules[属相].chong` |
| 文本 · 花草 | +10 | 含「花」或「草」→ 蝴蝶、家猫 |
| 文本 · 猫鼠 | +15 | 含「猫」或「鼠」→ 家猫、老鼠 |
| 文本 · 龙飞 | +10 | 含「龙」或「飞」→ 飞龙、金龙 |
| 文本 · 马 | +10 | 含「马」→ 马、马鹿 |
| 杀大赔小 · 极冷 | −60 | 遗漏 > 50 |
| 杀大赔小 · 中冷 | −20 | 20 < 遗漏 ≤ 50 |
| 杀大赔小 · 刚出 | −10 | 遗漏 ≤ 2 |

进度条宽度按 `clamp(分数, 0, 100)`，右侧显示原始分，负数也如实显示。

### 手算校验

上一场 `蛇`、属相 `蛇`、诗句「云深不知处，月照一庭花」、提示「草中藏影」：

```
马鹿 50 +30(对头)              = 80   → 标签「对头绝杀」
蝴蝶 50 +20(避出) +10(花草)     = 80
马   50 +20(避出)               = 70
```

页面输出 `1.马鹿(80) 2.蝴蝶(80) 3.马(70) …`，与手算一致。

## PWA 安装

`troll-app/` 走 http 或 https 打开后：

- **Chrome / Edge 桌面**：地址栏右侧「安装」图标，或菜单 → 应用 → 安装此站点为应用
- **Android Chrome**：页面底部自动弹「📲 安装到桌面（巨魔入住）」，也可走菜单 → 添加到主屏幕
- **iOS Safari**：分享 → 添加到主屏幕（走 `apple-touch-icon`）
- 断网时左上角出现「🃏 离线模式 · 巨魔照跑」，页面照常算分

装完是独立窗口，无地址栏，`start_url` 为 `./index.html`。

## 开发

```bash
node tools/build-app.js        # 改完 troll.html 后重新生成 PWA 页面
python tools/make-icons.py     # 重新画图标（需要 Pillow）
node --check troll-app/sw.js   # 语法自检
```

改配色/文案的热点都集中在各 HTML 的 `<style>` 里；嘲讽词库是 `troll.html` 的 `const MOCKS`；图鉴字典是 `const tuJianDB`。

## 已知边界

- `localStorage` 按源隔离：`file://`、`127.0.0.1:8080`、`127.0.0.1:8899` 各存一份冷宝数据，互不相通
- 图鉴字典只有 7 个键，填别的名字只会走生肖暗线与冷宝两条线
- 所有分值来自固定权重，不涉及任何开奖结果推断
- 冷宝列表只显示遗漏前 10，但全量参与加减分

## 许可

MIT，见 [LICENSE](LICENSE)。

[![](https://img.shields.io/badge/powered_by-dsh-4D6BFE?style=flat-square&logo=deepseek&logoColor=white)](https://github.com/deepseek-ai/deepseek-harness)
