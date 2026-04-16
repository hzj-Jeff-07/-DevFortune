# 贡献指南

感谢你对 DevFortune 项目的关注！我们欢迎所有形式的贡献。本文档将帮助你了解如何参与到项目中来。

## 目录

- [贡献方式](#贡献方式)
- [开发流程](#开发流程)
- [运势文案贡献指南](#运势文案贡献指南)
- [提交规范](#提交规范)
- [Issue 指南](#issue-指南)
- [Code Review 标准](#code-review-标准)
- [本地开发环境](#本地开发环境)

---

## 贡献方式

DevFortune 接受以下类型的贡献：

### 💻 代码贡献

- 新功能开发
- Bug 修复
- 性能优化
- 测试用例补充

### 📝 运势文案贡献

这是本项目最独特的贡献形式！你可以：

- 编写新的运势文案模板
- 改进现有文案的趣味性和文化准确性
- 为特殊日期（节气、节日）编写特别运势

### 🌐 翻译贡献

- 将运势文案翻译为其他语言
- 确保翻译后的文案保留文化韵味

### 🔮 域知识校正

- 验证天干地支推算算法的准确性（对照万年历）
- 校正五行生克规则的实现
- 审查五行→编程概念映射的合理性

### 🐛 Bug 报告

- 在 Issues 中详细描述问题
- 提供复现步骤和环境信息

### 📖 文档改进

- 修正文档错误
- 改善文档可读性
- 补充使用示例

---

## 开发流程

### 1. Fork 与 Clone

```bash
# Fork 项目到你的 GitHub 账户，然后 clone
git clone https://github.com/YOUR_USERNAME/devfortune.git
cd devfortune

# 添加上游仓库
git remote add upstream https://github.com/ORIGINAL_OWNER/devfortune.git
```

### 2. 创建分支

```bash
# 确保你的 main 分支是最新的
git checkout main
git pull upstream main

# 创建功能分支
git checkout -b feat/your-feature-name
```

**分支命名规范：**

| 前缀 | 用途 | 示例 |
|------|------|------|
| `feat/` | 新功能 | `feat/add-fortune-sharing` |
| `fix/` | Bug 修复 | `fix/ganzhi-calculation-error` |
| `docs/` | 文档更新 | `docs/update-cli-usage` |
| `template/` | 运势文案模板 | `template/add-spring-fortune` |
| `refactor/` | 代码重构 | `refactor/wuxing-engine` |
| `test/` | 测试相关 | `test/add-boundary-cases` |

### 3. 开发与测试

```bash
# 安装依赖
pnpm install

# 启动开发环境
pnpm dev

# 运行测试
pnpm test

# 运行特定包的测试
pnpm --filter @devfortune/core test

# 类型检查
pnpm typecheck

# 代码格式检查
pnpm lint
```

### 4. 提交代码

```bash
git add .
git commit -m "feat(core): add lunar calendar boundary handling"
```

### 5. 推送与创建 PR

```bash
git push origin feat/your-feature-name
```

然后在 GitHub 上创建 Pull Request，填写 PR 模板中的信息。

### PR 要求

- [ ] 通过所有 CI 检查（lint、typecheck、test）
- [ ] 如果修改了核心引擎，附带对应的测试用例
- [ ] 如果修改了 API，更新相关文档
- [ ] 如果新增运势文案，通过模板 JSON Schema 验证
- [ ] PR 描述清楚说明改动的目的和方法

---

## 运势文案贡献指南

运势文案是 DevFortune 的灵魂，也是最容易参与的贡献方式。

### 文案存放位置

```
packages/templates/
├── fortunes/
│   ├── wood-prosperous.json     # 木旺时的运势文案
│   ├── wood-declining.json      # 木衰时的运势文案
│   ├── fire-prosperous.json     # 火旺时的运势文案
│   └── ...
├── special/
│   ├── lichun.json              # 立春特别运势
│   ├── zhongqiu.json            # 中秋特别运势
│   └── ...
└── schema/
    └── fortune-template.schema.json
```

### 文案模板格式

```json
{
  "id": "wood-prosperous-001",
  "trigger": {
    "wuxing": "wood",
    "state": "prosperous"
  },
  "category": "coding",
  "fortune": {
    "summary": "今日木气生发，万物萌动，代码如春笋破土",
    "detail": "甲木参天，生机勃发。今日五行木旺，正是播种新想法的好时机。不要犹豫，打开你的 IDE，创建那个你心心念念的新项目吧！",
    "yi": ["创建新项目", "搭建架构脚手架", "学习新框架", "写技术方案"],
    "ji": ["删除大量代码", "砍掉功能模块", "做减法优化"]
  },
  "tone": "encouraging",
  "tags": ["frontend", "backend", "fullstack"],
  "author": "your-github-username"
}
```

### 文案风格要求

1. **幽默但不低俗** — 让程序员会心一笑，而不是尬笑
2. **有文化底蕴** — 融入天干地支、五行的文化意象，但不要过于晦涩
3. **贴近开发者日常** — 使用程序员熟悉的术语和场景
4. **正面引导为主** — 即使是"忌"的事项，也用轻松的语气表达
5. **避免绝对化表述** — 不要说"一定会出 Bug"，可以说"Bug 出没概率较高"

### 文案审核流程

1. 提交 PR 后，至少需要 1 位核心维护者审核
2. 审核标准：格式正确、风格符合、文化准确、幽默有度
3. 社区投票：特别优秀的文案会获得"精选"标记

---

## 提交规范

本项目使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交格式

```
<type>(<scope>): <description>

[可选的正文]

[可选的脚注]
```

### Type 类型

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响运行的变动） |
| `refactor` | 重构（既不是新功能，也不是修 Bug） |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `chore` | 构建过程或辅助工具的变动 |
| `template` | 运势文案模板变更（本项目特有） |

### Scope 范围

| 范围 | 说明 |
|------|------|
| `core` | 核心运算引擎 |
| `web` | Web 应用 |
| `cli` | CLI 工具 |
| `vscode` | VS Code 扩展 |
| `template` | 运势模板 |
| `docs` | 文档 |
| `ci` | CI/CD |

### 示例

```bash
feat(core): add hourly pillar calculation for time-based fortune
fix(cli): fix unicode rendering on Windows terminal
template(fortune): add 24 solar term special fortunes
docs(domain): update wuxing-to-programming mapping table
```

---

## Issue 指南

### Issue 标签体系

| 标签 | 说明 |
|------|------|
| `bug` | 程序错误 |
| `feature` | 新功能需求 |
| `fortune-template` | 运势文案相关 |
| `domain-accuracy` | 天干地支/五行准确性问题 |
| `good-first-issue` | 适合新手的任务 |
| `help-wanted` | 需要社区帮助 |
| `discussion` | 需要讨论的问题 |
| `wontfix` | 不会修复 |
| `duplicate` | 重复问题 |

### Bug 报告模板

请在报告 Bug 时包含以下信息：

1. **环境信息**：OS、Node.js 版本、使用的是 Web/CLI/VS Code
2. **复现步骤**：尽可能详细的步骤
3. **期望行为**：你认为应该发生什么
4. **实际行为**：实际发生了什么
5. **相关日期**：如果运势结果有误，请提供具体日期

---

## Code Review 标准

### 审核重点

1. **正确性** — 代码逻辑是否正确，特别是天干地支推算和五行生克逻辑
2. **测试覆盖** — 核心引擎的改动必须有对应测试
3. **类型安全** — TypeScript 严格模式下无 `any` 类型
4. **平台无关** — Core 包不得引入任何平台特定的依赖
5. **文化敏感** — 运势文案内容尊重传统文化
6. **性能** — 运势计算应在毫秒级完成
7. **可读性** — 域知识相关代码必须有注释解释文化含义

### 不需要关注的

- 代码风格问题（由 ESLint + Prettier 自动处理）
- 琐碎的命名偏好（只要符合编码规范即可）

---

## 本地开发环境

详细的环境搭建步骤请参阅 [开发环境搭建指南](docs/dev/setup.md)。

**快速开始：**

```bash
# 前置要求：Node.js >= 18、pnpm >= 8
pnpm install && pnpm dev
```

---

## 行为准则

参与本项目意味着你同意遵守我们的 [行为准则](CODE_OF_CONDUCT.md)。

## 问题？

如果你在贡献过程中遇到任何问题，欢迎：

- 在 GitHub Discussions 中提问
- 加入我们的 Discord / 微信群交流
- 在 Issue 中标记 `help-wanted`

感谢你的贡献！每一份参与都让 DevFortune 变得更好。🎉
