<h1 align="center">🔮 DevFortune 程序员运势日历</h1>

<p align="center">
  <strong>用天干地支和五行生克，为程序员生成每日运势</strong>
</p>

<p align="center">
  <a href="https://github.com/hzj-Jeff-07/-DevFortune/blob/main/LICENSE"><img src="https://img.shields.io/github/license/hzj-Jeff-07/-DevFortune?style=flat-square" alt="License" /></a>
  <a href="https://github.com/hzj-Jeff-07/-DevFortune/stargazers"><img src="https://img.shields.io/github/stars/hzj-Jeff-07/-DevFortune?style=flat-square" alt="Stars" /></a>
</p>

<!-- npm / VS Code Marketplace 徽章待包发布后恢复 -->



<p align="center">
  <a href="#-快速开始">快速开始</a> •
  <a href="#-功能特性">功能特性</a> •
  <a href="#-工作原理">工作原理</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-贡献指南">贡献指南</a> •
  <a href="#-路线图">路线图</a>
</p>

---

## 💡 这是什么？

DevFortune 将中国传统的**天干地支**和**五行生克**理论创造性地映射到程序员的日常活动中，为你生成每日编程运势。

它会告诉你今天适合写新功能还是修 Bug，该大胆重构还是保守维护——一切都有千年智慧的"理论依据" 😄

**三种使用方式，随你选择：**

| 🌐 Web 应用 | 💻 CLI 工具 | 🔌 VS Code 扩展 |
|:---:|:---:|:---:|
| 精美的每日运势页面 | 终端里的每日问候 | 编辑器内的运势提醒 |

## 🚀 快速开始

### Web 应用

访问 👉 [devfortune.dev](https://devfortune.dev)（即将上线）

### CLI 工具

```bash
# 安装
npm install -g devfortune

# 查看今日运势
devfortune

# 指定日期与时刻（附加时柱）
devfortune -d 2026-07-07 -t 14:30

# 单行简洁模式 / JSON 输出
devfortune --brief
devfortune -f json

# English output
devfortune --lang en

# 输出示例：
# ╭──────────────────────────────────────╮
# │  📅 2026年4月9日 丙午年 壬辰月 甲子日  │
# │  🔥 五行：火旺木相                     │
# │  ⭐ 综合运势：★★★★☆                   │
# │                                      │
# │  ✅ 宜：写新功能 | 搭建脚手架 | 学新框架  │
# │  ❌ 忌：重构遗留代码 | 删除线上数据      │
# │                                      │
# │  💬 今日木气生发，适合开创新项目。        │
# │     代码如春笋，节节拔高！              │
# ╰──────────────────────────────────────╯
```

**Shell 集成**：在 `~/.zshrc` 或 `~/.bashrc` 末尾加入一行，每次打开终端自动显示今日运势：

```bash
command -v devfortune >/dev/null 2>&1 && devfortune --brief
```

### VS Code 扩展

1. 在 VS Code 扩展市场搜索 `DevFortune`
2. 安装后，状态栏会显示今日运势摘要
3. 点击状态栏图标查看详细运势

```
# 或通过命令行安装
code --install-extension devfortune.devfortune
```

### JSON API

Web 应用内置开放接口（部署后即可用）：

```bash
# 指定日期的运势（可长缓存）
curl 'https://devfortune.dev/api/fortune?date=2026-07-07&locale=zh-CN'

# 附加时柱 / 英文
curl 'https://devfortune.dev/api/fortune?date=2026-07-07&time=14:30&locale=en-US'
```

## ✨ 功能特性

### 核心能力

- 🔮 **每日运势生成** — 基于天干地支和五行生克的运势推算
- 📊 **运势评分** — 1-5 星综合运势评级
- ✅ **宜忌推荐** — 今天适合做什么、不适合做什么
- 📝 **运势文案** — 有文化底蕴又幽默的运势描述

### Web 应用

- 🎨 精美的运势展示页面，支持暗色模式
- 📱 响应式设计，移动端友好
- 🔗 运势分享卡片生成（一键保存 PNG，适合发朋友圈/Twitter）
- 📅 任意日期运势回顾（1900-2100）
- 🌍 中英文切换（自动跟随浏览器语言）

### CLI 工具

- 🖥️ 彩色终端输出，赏心悦目
- 🐚 Shell 集成（打开终端自动显示运势，见下方配置）
- 🕐 时柱推算（`--time` 指定时刻，五鼠遁法）
- 📤 JSON / Markdown 输出模式（便于管道和脚本集成）
- 🌍 多语言支持（`--lang zh|en`，自动跟随系统语言）

### VS Code 扩展

- 📌 状态栏运势摘要
- 📋 侧边栏详细运势面板
- 🔔 每日运势通知（可在设置中开启）
- ⚙️ 可配置：语言（中/英/自动）、状态栏开关、每日通知

## 🔬 工作原理

```
┌─────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ 日期输入  │───▶│ 干支推算  │───▶│ 五行分析  │───▶│ 宜忌生成  │───▶│ 文案输出  │
└─────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
     │              │               │               │               │
  公历日期      年月日时柱     五行旺衰状态     编程活动映射     运势文案渲染
                干支组合       生克关系分析     宜忌事项列表     评分与展示
```

**核心映射示例：**

| 五行 | 编程活动 | 旺时宜 | 弱时忌 |
|:---:|---------|--------|--------|
| 🌳 木 | 新功能开发、架构搭建 | 开创新项目 | 大规模重构 |
| 🔥 火 | 性能优化、压测调试 | 优化热路径 | 仓促上线 |
| 🌍 土 | 基础设施、数据库维护 | 稳固架构 | 激进迁移 |
| ⚔️ 金 | 代码重构、技术选型 | 精简代码 | 增加依赖 |
| 💧 水 | 学习研究、文档编写 | 探索新技术 | 闭门造车 |

> 📖 完整映射规则请参阅 [天干地支编程映射手册](docs/domain/ganzhi-programming-mapping.md)

## 🏗️ 技术栈

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| **核心引擎** | TypeScript | 纯函数、零依赖、平台无关 |
| **Web 应用** | Next.js + Tailwind CSS | SSG 静态生成，性能极致 |
| **CLI 工具** | Node.js + chalk + boxen | 彩色终端输出 |
| **VS Code 扩展** | VS Code Extension API | 原生扩展开发 |
| **构建工具** | pnpm + turborepo | Monorepo 管理 |
| **测试** | Vitest | 快速、现代的测试框架 |
| **CI/CD** | GitHub Actions | 自动化构建、测试、发布 |

### 项目结构

```
DevFortune/
├── packages/
│   ├── core/              # 🔮 核心运算引擎（天干地支、五行、运势生成）
│   ├── fortune-web/       # 🌐 Web 应用
│   ├── fortune-cli/       # 💻 CLI 工具
│   ├── fortune-vscode/    # 🔌 VS Code 扩展
│   └── templates/         # 📝 运势文案模板
├── docs/                  # 📚 项目文档
│   ├── design/            # 架构与设计文档
│   ├── adr/               # 架构决策记录
│   ├── api/               # API 文档
│   ├── dev/               # 开发者文档
│   ├── domain/            # 域知识文档
│   ├── business/          # 商业与增长文档
│   └── ops/               # 运维与部署文档
├── ARCHITECTURE.md        # 系统架构总览
├── CONTRIBUTING.md        # 贡献指南
├── CHANGELOG.md           # 变更日志
├── CODE_OF_CONDUCT.md     # 行为准则
├── LICENSE                # Apache 2.0 许可证
└── SECURITY.md            # 安全政策
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论你是想贡献代码、运势文案、翻译还是 Bug 报告，都请参阅 [CONTRIBUTING.md](CONTRIBUTING.md)。

**特别欢迎的贡献方式：**

- 📝 **运势文案贡献** — 写出让程序员会心一笑的运势文案
- 🌐 **多语言翻译** — 让全球程序员都能用
- 🔮 **域知识校正** — 帮助我们确保天干地支推算的准确性
- 💻 **代码贡献** — 新功能、Bug 修复、性能优化

## 🗺️ 路线图

### v0.1.0 — MVP（已完成）

- [x] 核心引擎：天干地支推算 + 五行分析（节气天文精确计算）
- [x] 核心引擎：运势生成算法
- [x] CLI 工具：基础功能 + 时柱 + 详细分析
- [x] Web 应用：每日运势页面

### v0.2.0 — 扩展（已完成）

- [x] VS Code 扩展：状态栏 + 侧边栏 + 设置 + 每日通知
- [x] Web 应用：运势分享卡片 + 任意日期回顾
- [x] CLI：Shell 集成指南
- [x] 多语言支持（English，三端全覆盖）

### v0.3.0 — 社区

- [ ] 运势模板社区贡献系统
- [ ] 个人八字定制运势（Pro）
- [ ] 团队运势（适合站会）
- [x] API 开放接口（`GET /api/fortune?date=&time=&locale=`）

### v1.0.0 — 成熟

- [ ] 移动端 PWA
- [ ] 更多 IDE 支持（JetBrains）
- [ ] 运势数据分析仪表板
- [ ] 社区治理体系

## 📄 许可证

代码部分采用 [Apache License 2.0](LICENSE) 许可。

运势文案模板采用 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) 许可。

## 🙏 致谢

- 感谢中国传统文化中天干地支、五行学说的千年智慧
- 感谢所有贡献者和社区成员
- 灵感来源：[程序员老黄历](https://github.com/nickcao/jiejiari)、[好运 API](https://github.com/iNoBounce/chinese-fortune)

---

<p align="center">
  <strong>⭐ 如果这个项目让你会心一笑，请给个 Star！</strong>
</p>

<p align="center">
  Made with ❤️ and 五行生克
</p>
