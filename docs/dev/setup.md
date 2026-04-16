# 开发者上手指南

> 从零开始搭建 DevFortune 本地开发环境，直到提交第一个 PR。

## 前置要求

| 工具 | 最低版本 | 说明 |
|------|----------|------|
| Node.js | >= 18.0 | 推荐使用 LTS 版本 |
| pnpm | >= 8.0 | 包管理器（不支持 npm/yarn） |
| Git | >= 2.30 | 版本控制 |
| VS Code | 最新 | 推荐编辑器（非必需） |

### 安装 pnpm

```bash
# 如果尚未安装 pnpm
npm install -g pnpm
```

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/nicepkg/devfortune.git
cd devfortune
```

### 2. 安装依赖

```bash
pnpm install
```

pnpm 会根据 `pnpm-workspace.yaml` 自动识别所有子包并建立符号链接。

### 3. 构建核心包

```bash
# 构建所有包（按依赖顺序）
pnpm build

# 或仅构建核心引擎
pnpm --filter @devfortune/core build
```

### 4. 运行测试

```bash
# 全部测试
pnpm test

# 仅核心引擎测试
pnpm --filter @devfortune/core test

# 监听模式（开发时推荐）
pnpm --filter @devfortune/core test:watch
```

### 5. 启动开发服务

```bash
# Web 应用开发模式
pnpm --filter fortune-web dev

# CLI 开发模式
pnpm --filter fortune-cli dev
```

## 项目结构导览

```
DevFortune/
├── packages/
│   ├── core/                  # 核心引擎（最常改动的包）
│   │   ├── src/
│   │   │   ├── ganzhi/        # 天干地支计算 — 纯数学运算
│   │   │   ├── wuxing/        # 五行分析 — 生克关系判定
│   │   │   ├── fortune/       # 运势生成 — 管线式处理
│   │   │   └── templates/     # 模板加载与渲染
│   │   ├── data/              # JSON 数据文件（天干/地支/映射/模板）
│   │   └── tests/             # 单元测试
│   ├── fortune-web/           # Next.js Web 应用
│   ├── fortune-cli/           # Node.js CLI 工具
│   └── fortune-vscode/        # VS Code 扩展
├── templates/                 # 社区贡献的运势模板
├── docs/                      # 项目文档（你正在看的）
├── turbo.json                 # Turborepo 流水线配置
└── pnpm-workspace.yaml        # 工作区定义
```

**新手建议**：先从 `packages/core/` 开始阅读，理解核心引擎的纯函数设计。

## 开发工作流

### 分支策略

```
main（保护分支）
  └── feat/xxx        # 新功能
  └── fix/xxx         # Bug 修复
  └── docs/xxx        # 文档更新
  └── refactor/xxx    # 重构
```

### 日常开发流程

```bash
# 1. 从 main 创建功能分支
git checkout main
git pull origin main
git checkout -b feat/my-feature

# 2. 开发 & 测试
pnpm --filter @devfortune/core test:watch  # 后台跑测试

# 3. 提交（遵循 Conventional Commits）
git add .
git commit -m "feat(core): add lucky color calculation"

# 4. 推送并创建 PR
git push origin feat/my-feature
```

### Commit 规范

采用 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <description>

feat(core): add hidden stems calculation
fix(web): correct timezone display for overseas users
docs: update wuxing mapping handbook
test(core): add edge cases for leap month handling
refactor(cli): simplify output formatting logic
```

**type 列表**：`feat` | `fix` | `docs` | `test` | `refactor` | `chore` | `ci` | `style` | `perf`

**scope 列表**：`core` | `web` | `cli` | `vscode` | 留空（跨包改动）

## 调试指南

### 核心引擎调试

核心引擎是纯函数，调试最简单——直接写测试：

```typescript
// packages/core/tests/debug.test.ts
import { getDailyFortune } from '../src';

test('debug specific date', () => {
  const fortune = getDailyFortune(new Date('2026-04-09'));
  console.log(JSON.stringify(fortune, null, 2));
  // 检查输出是否符合预期
});
```

运行单个测试文件：

```bash
pnpm --filter @devfortune/core test -- debug.test.ts
```

### Web 应用调试

```bash
# 启动开发服务（含 HMR）
pnpm --filter fortune-web dev

# 打开浏览器 http://localhost:3000
# Next.js DevTools 自动可用
```

### CLI 调试

```bash
# 本地链接 CLI 命令
cd packages/fortune-cli
pnpm link --global

# 直接运行
devfortune --debug
```

### VS Code 扩展调试

1. 用 VS Code 打开项目根目录
2. 按 `F5` 启动扩展开发宿主
3. 在新窗口中测试扩展功能
4. 在原窗口的调试控制台查看日志

## 代码规范

### TypeScript 配置

- 严格模式（`strict: true`）
- 禁止 `any`（`noImplicitAny: true`）
- 核心引擎不允许使用 `import` 第三方运行时依赖

### 代码风格

项目使用 ESLint + Prettier 统一风格：

```bash
# 检查
pnpm lint

# 自动修复
pnpm lint:fix

# 格式化
pnpm format
```

### 测试要求

- 核心引擎：100% 分支覆盖率目标
- 新功能必须附带单元测试
- 修复 Bug 必须先写失败测试，再修复

## 推荐的 VS Code 插件

```json
// .vscode/extensions.json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "vitest.explorer"
  ]
}
```

## 常见问题

### Q: `pnpm install` 失败

```bash
# 清理缓存重试
pnpm store prune
rm -rf node_modules
pnpm install
```

### Q: 构建报类型错误

```bash
# 确保先构建核心包（其他包依赖它的类型声明）
pnpm --filter @devfortune/core build
pnpm typecheck
```

### Q: 测试运行时日期相关用例失败

核心引擎使用北京时间（UTC+8）。如果你在其他时区开发，确保测试中使用明确的日期对象而非 `new Date()`。

### Q: 如何贡献运势模板？

参见 [CONTRIBUTING.md](../../CONTRIBUTING.md) 的「贡献运势模板」章节和 [模板系统设计](../design/template-system.md)。

## 相关文档

- [CONTRIBUTING.md](../../CONTRIBUTING.md) — 贡献指南（PR 规范、Review 流程）
- [ARCHITECTURE.md](../../ARCHITECTURE.md) — 架构概览
- [核心 API 参考](../api/core-api.md) — `@devfortune/core` API 文档
- [五行编程映射手册](../domain/ganzhi-programming-mapping.md) — 五行与编程概念的对应关系
