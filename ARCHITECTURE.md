# DevFortune 架构文档

## 项目概览

DevFortune 是一个基于天干地支和五行生克理论，为程序员生成每日运势的工具。采用 Monorepo 架构，核心引擎共享，支持 Web、CLI、VS Code Extension 三种交付形态。

## 架构图

```
┌─────────────────────────────────────────────────────┐
│                    DevFortune Monorepo               │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐  │
│  │ fortune-web │ │ fortune-cli │ │ fortune-vscode│  │
│  │  (Next.js)  │ │  (Node.js)  │ │  (Extension)  │  │
│  └──────┬──────┘ └──────┬──────┘ └───────┬───────┘  │
│         │               │                │          │
│         └───────────────┼────────────────┘          │
│                         │                           │
│                  ┌──────▼──────┐                    │
│                  │    @devfortune/core    │          │
│                  │  (Pure TypeScript)     │          │
│                  └──────┬──────┘                    │
│                         │                           │
│              ┌──────────┼──────────┐                │
│              │          │          │                │
│        ┌─────▼───┐ ┌───▼────┐ ┌──▼──────┐         │
│        │ GanZhi  │ │ WuXing │ │ Fortune │         │
│        │ Engine  │ │ Engine │ │ Engine  │         │
│        └─────────┘ └────────┘ └─────────┘         │
│                         │                           │
│                  ┌──────▼──────┐                    │
│                  │  Templates  │                    │
│                  │  (JSON)     │                    │
│                  └─────────────┘                    │
└─────────────────────────────────────────────────────┘
```

## 目录结构

```
DevFortune/
├── packages/
│   ├── core/                  # 核心引擎（零依赖）
│   │   ├── src/
│   │   │   ├── ganzhi/        # 天干地支计算模块
│   │   │   │   ├── calculator.ts  # 年/月/日/时柱推算
│   │   │   │   ├── jieqi.ts       # 节气天文计算（太阳视黄经）
│   │   │   │   ├── data.ts        # 天干/地支/纳音/藏干数据表
│   │   │   │   └── index.ts
│   │   │   ├── wuxing/        # 五行分析模块
│   │   │   │   ├── analyzer.ts    # 生克关系、分布、强度、幸运五行
│   │   │   │   └── index.ts
│   │   │   ├── fortune/       # 运势生成模块
│   │   │   │   ├── pipeline.ts    # 运势生成管线（主入口）
│   │   │   │   ├── scorer.ts      # 评分引擎
│   │   │   │   ├── yiji.ts        # 宜忌生成器
│   │   │   │   └── index.ts
│   │   │   ├── templates/     # 运势模板与五行映射（zh-CN / en-US）
│   │   │   │   ├── defaults.ts / defaults.en.ts
│   │   │   │   ├── mapping.ts / mapping.en.ts
│   │   │   │   └── index.ts
│   │   │   ├── types.ts       # 全部类型定义
│   │   │   └── index.ts       # 统一导出
│   │   ├── tests/
│   │   └── package.json
│   ├── fortune-web/           # Web 应用（Next.js App Router）
│   │   ├── src/app/
│   │   │   ├── page.tsx           # 首页（客户端计算运势）
│   │   │   ├── api/fortune/       # JSON API 路由
│   │   │   └── layout.tsx
│   │   ├── src/components/        # FortuneCard、DateNav 等
│   │   ├── src/lib/               # i18n、分享卡片绘制
│   │   └── package.json
│   ├── fortune-cli/           # CLI 工具
│   │   ├── src/
│   │   │   ├── commands/          # 参数解析
│   │   │   ├── output/            # text/markdown/labels/宽度/颜色
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   └── fortune-vscode/        # VS Code 扩展
│       ├── src/
│       │   ├── extension.ts       # 入口（状态栏/命令/通知）
│       │   ├── sidebar.ts         # 侧边栏视图
│       │   ├── fortune-service.ts # 运势缓存与语言解析
│       │   ├── fortune-html.ts    # Webview 渲染（纯函数）
│       │   └── labels.ts          # UI 标签本地化
│       ├── tests/
│       └── package.json
├── docs/                      # 项目文档（design/adr/api/dev/domain/…）
├── .changeset/                # changesets 发布配置
├── turbo.json                 # Turborepo 配置
├── pnpm-workspace.yaml        # pnpm 工作区
└── package.json               # 根 package.json
```

## 核心设计原则

### 1. 核心引擎零依赖

`@devfortune/core` 不依赖任何第三方运行时包。所有计算（农历转换、节气计算、五行分析）均为纯 TypeScript 实现。这确保：

- 可在任何 JavaScript 运行时运行（浏览器、Node.js、Deno、Bun）
- 包体积最小化（目标 < 50KB gzipped）
- 无供应链安全风险
- 可作为独立 npm 包发布

### 2. 纯函数设计

核心引擎所有函数均为纯函数，无副作用：

```typescript
// ✅ 纯函数 — 相同输入永远产生相同输出
function getDailyFortune(date: Date, options?: FortuneOptions): Fortune

// ❌ 不会出现的设计 — 无网络请求、无文件读写、无随机数
function getDailyFortune(userId: string): Promise<Fortune>
```

### 3. 数据驱动映射

五行与编程概念的映射关系存储在 JSON 配置中，而非硬编码：

```json
{
  "金": {
    "languages": ["Rust", "C", "Go"],
    "activities": ["代码重构", "性能优化", "Code Review"],
    "tools": ["静态分析器", "Profiler", "Linter"]
  }
}
```

社区可通过 PR 贡献新映射，无需修改引擎代码。

### 4. 管线式处理

运势生成采用管线（Pipeline）模式，每个阶段职责单一：

```
Date Input
    │
    ▼
┌─────────────────┐
│ 1. GanZhi Calc  │ 日期 → 年柱/月柱/日柱/时柱
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 2. WuXing Analyze│ 干支 → 五行旺衰分析
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 3. YiJi Generate│ 五行 → 宜忌事项（编程相关）
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 4. Score        │ 综合评分 (0-100)
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 5. Template Match│ 评分+五行 → 匹配模板
└────────┬────────┘
         │
    ▼
┌─────────────────┐
│ 6. Render       │ 模板 → 最终运势文本
└─────────────────┘
```

## 数据流

### Web 应用数据流

```
用户访问页面
    │
    ▼
Next.js SSR / SSG
    │
    ▼
调用 @devfortune/core
    │
    ▼
getDailyFortune(today)
    │
    ▼
渲染运势卡片组件
    │
    ▼
返回 HTML（含 SEO meta）
```

- 运势按日期生成，同一天所有用户看到相同结果
- 支持 SSG 预生成未来 7 天的运势页面
- API Route 提供 JSON 格式供第三方调用

### CLI 数据流

```
用户执行 devfortune 命令
    │
    ▼
解析 CLI 参数/配置文件
    │
    ▼
调用 @devfortune/core
    │
    ▼
格式化输出（text/json/markdown）
    │
    ▼
输出到终端 / 管道
```

### VS Code Extension 数据流

```
VS Code 启动 / 定时刷新
    │
    ▼
Extension Host 调用 @devfortune/core
    │
    ▼
更新状态栏图标与文字
    │
    ▼
用户点击 → 显示侧边栏详情
```

## 构建与发布

### Turborepo 任务图

```json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"]
    },
    "lint": {},
    "typecheck": {
      "dependsOn": ["^build"]
    }
  }
}
```

构建顺序：`core` → `fortune-web` / `fortune-cli` / `fortune-vscode`（并行）

### 发布矩阵

| 包 | 发布目标 | 触发方式 |
|----|---------|---------|
| @devfortune/core | npm Registry | Git tag `core@x.y.z` |
| fortune-web | Vercel | Push to `main` |
| fortune-cli | npm Registry | Git tag `cli@x.y.z` |
| fortune-vscode | VS Code Marketplace | Git tag `vscode@x.y.z` |

## 性能预算

| 指标 | 目标 |
|------|------|
| Core 引擎单次运势计算 | < 10ms |
| Core 包体积 (gzipped) | < 50KB |
| Web 首屏加载 (LCP) | < 2.5s |
| Web JS Bundle | < 100KB |
| CLI 启动到输出 | < 200ms |
| VS Code Extension 激活 | < 100ms |

## 安全边界

- 核心引擎：无网络访问、无文件系统访问、无用户数据收集
- Web 应用：仅输出静态运势内容，无用户认证、无数据库
- CLI：仅读取本地配置文件（`~/.devfortunerc`），不上传数据
- VS Code Extension：最小权限声明，不访问用户代码内容

## 扩展点

1. **自定义模板**：社区通过 `templates/` 目录贡献运势模板
2. **映射扩展**：通过 JSON 配置添加新的五行-编程概念映射
3. **输出插件**：CLI 支持自定义 output formatter
4. **主题系统**：Web 应用支持社区贡献主题
5. **国际化**：模板系统内置多语言支持（中/英/日）

## 相关 ADR

- [ADR-001: Monorepo 架构选型](docs/adr/ADR-001-monorepo-architecture.md)
- [ADR-002: 核心引擎零依赖](docs/adr/ADR-002-core-zero-dependencies.md)
- [ADR-003: 立春作为年界](docs/adr/ADR-003-lichun-year-boundary.md)
- [ADR-004: 数据驱动映射](docs/adr/ADR-004-data-driven-mapping.md)
- [ADR-005: 模板 JSON Schema](docs/adr/ADR-005-template-json-schema.md)
- [ADR-006: Web 框架选型](docs/adr/ADR-006-web-framework-selection.md)
- [ADR-007: 运势更新策略](docs/adr/ADR-007-fortune-update-strategy.md)
- [ADR-008: 国际化策略](docs/adr/ADR-008-i18n-strategy.md)
