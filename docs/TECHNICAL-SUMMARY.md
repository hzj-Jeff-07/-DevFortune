# DevFortune 技术方案汇总

> 本文档汇总了 DevFortune 项目的全部技术文档，方便一览全局。

---

## 一、项目定位

DevFortune 是一个基于天干地支和五行生克理论，为程序员生成每日运势的工具。采用 Monorepo 架构，核心引擎共享，支持 **Web（Next.js）、CLI（Node.js）、VS Code Extension** 三种交付形态。

---

## 二、架构设计

### 技术栈

| 层级 | 技术选型 | 决策依据 |
|------|----------|----------|
| 工程管理 | pnpm + Turborepo | Monorepo，共享核心引擎（ADR-001） |
| 核心引擎 | Pure TypeScript，零依赖 | 跨平台复用，最小包体积（ADR-002） |
| Web 应用 | Next.js (App Router) | SSR/SSG + ISR 更新策略（ADR-006, ADR-007） |
| CLI | Node.js | 直接调用 core，无缓存 |
| VS Code | Extension API | globalState 缓存（ADR-007） |
| 数据格式 | JSON + JSON Schema (draft-07) | 数据驱动，社区可贡献（ADR-004, ADR-005） |
| 国际化 | 内容层 i18n | 模板按语言组织（ADR-008） |

### 核心管线

```
Date → GanZhi计算 → WuXing分析 → YiJi生成 → 评分 → 模板匹配 → 渲染
```

所有阶段均为纯函数，总耗时 < 10ms。

### 性能预算

| 指标 | 目标 |
|------|------|
| Core 单次计算 | < 10ms |
| Core 包体积 | < 50KB gzip |
| Web LCP | < 2.5s |
| CLI 启动到输出 | < 200ms |
| VS Code 激活 | < 100ms |

---

## 三、领域模型

### 天干地支数据模型
- 十天干（甲-癸）× 十二地支（子-亥）= 六十甲子
- 年柱以立春为界（ADR-003）
- 日柱以 2000-01-07 甲子日为基准
- 支持日期范围：1900-2100
- 24 节气精确计算

**详见**: [docs/design/tiangan-dizhi-model.md](docs/design/tiangan-dizhi-model.md)

### 五行分析引擎
- 五行属性：木/火/土/金/水
- 生克关系：相生（木→火→土→金→水→木）、相克（木→土→水→火→金→木）
- 地支藏干：每个地支包含 1-3 个藏干
- 计算五行分布、旺衰、日主强度

**详见**: [docs/design/wuxing-engine.md](docs/design/wuxing-engine.md)

### 五行编程映射
- 木 → 新功能开发（生发、创造）
- 火 → 性能优化、Code Review（光明、传播）
- 土 → 基础设施、运维（承载、稳定）
- 金 → 代码重构、精简（收敛、精炼）
- 水 → 学习研究、文档（智慧、流动）

映射以 JSON 配置存储，支持社区自定义。

**详见**: [docs/domain/ganzhi-programming-mapping.md](docs/domain/ganzhi-programming-mapping.md)

---

## 四、运势引擎

### 评分机制 (0-100)
| 维度 | 权重 | 说明 |
|------|------|------|
| 五行平衡度 | 0-40 | 五行分布越平衡分越高 |
| 日主强度 | 0-30 | 适中最高，过旺过弱递减 |
| 生克和谐度 | 0-30 | 相生多加分，相克多减分 |

### 分数等级
| 等级 | 分数 | 概率 | 含义 |
|------|------|------|------|
| great | 85-100 | ~10% | 大吉 |
| good | 70-84 | ~25% | 小吉 |
| neutral | 45-69 | ~35% | 平 |
| bad | 25-44 | ~20% | 小凶 |
| terrible | 0-24 | ~10% | 大凶 |

### 宜忌生成
- 宜：取主导五行的 themes + 被生元素的 themes
- 忌：取被克元素的 unlucky + 主导元素自身的 unlucky

**详见**: [docs/design/fortune-engine.md](docs/design/fortune-engine.md)

---

## 五、模板系统

### 格式
- JSON 格式，JSON Schema (draft-07) 验证
- 必填：id, sentiment, overview, do[], dont[]
- 选填：luckyLang, luckyTool, tip

### 匹配策略
精确匹配 (sentiment+wuxing+state) > 模糊匹配 > 等级匹配 > 兜底模板

### 确定性
同一天 + 同一套模板 = 相同结果（基于日期的伪随机选择）

### 模板规划
5 个等级 × 5 种五行 × 5 个变体 = 125+ 模板目标

### TypeScript 类型
从 Schema 自动生成（json-schema-to-typescript），确保类型与数据契约同步。

**详见**: [docs/design/template-system.md](docs/design/template-system.md)

---

## 六、API 设计

核心包 `@devfortune/core` 对外暴露以下主要接口：

| 函数 | 说明 |
|------|------|
| `getDailyFortune(date)` | 一站式获取今日运势 |
| `getGanZhi(date)` | 获取天干地支四柱 |
| `analyzeWuXing(ganzhi)` | 五行分析 |
| `getSolarTerm(date)` | 获取节气 |
| `formatFortune(fortune)` | 格式化运势输出 |

**详见**: [docs/api/core-api.md](docs/api/core-api.md)

---

## 七、各端交付

### Web (fortune-web)
- Next.js App Router, ISR (revalidate=86400)
- SSG 预生成未来 7 天运势
- SEO 优化（meta tags, Open Graph）

### CLI (fortune-cli)
- 支持 text/json/markdown 输出格式
- Shell 集成（.bashrc/.zshrc 每日运势）
- 无缓存，直接计算

### VS Code (fortune-vscode)
- 状态栏显示今日运势评分
- 侧边栏显示详情
- globalState 缓存，按日更新

**详见**: [docs/cli-usage.md](docs/cli-usage.md) / [docs/vscode-extension.md](docs/vscode-extension.md)

---

## 八、架构决策记录 (ADR)

| ADR | 标题 | 要点 |
|-----|------|------|
| ADR-001 | Monorepo 架构 | pnpm + Turborepo |
| ADR-002 | 核心引擎零依赖 | 纯 TS，无第三方运行时依赖 |
| ADR-003 | 立春作为年界 | 传统历法决策 |
| ADR-004 | 数据驱动映射 | 五行映射以 JSON 配置存储 |
| ADR-005 | 模板 JSON Schema | draft-07, 自动生成 TS 类型 |
| ADR-006 | Web 框架选型 | Next.js (App Router) |
| ADR-007 | 运势更新策略 | Web ISR / CLI 直算 / VSCode globalState |
| ADR-008 | 国际化策略 | 内容层 i18n |

---

## 九、工程化

### 开发环境
- Node.js >= 18, pnpm >= 8
- ESLint + Prettier 代码风格
- Vitest 单元测试，核心引擎 100% 分支覆盖率目标
- Conventional Commits 提交规范

**详见**: [docs/dev/setup.md](docs/dev/setup.md)

### CI/CD
- PR 触发：lint + typecheck + test + schema validate
- 构建顺序：core → web/cli/vscode (并行)
- 发布：Git tag 触发，各端独立发版

### 监控
- Web: Vercel Analytics + 自定义性能指标
- 核心引擎: 基准测试回归检测

**详见**: [docs/ops/monitoring.md](docs/ops/monitoring.md)

---

## 十、文档清单

| 文档 | 路径 | 说明 |
|------|------|------|
| 项目介绍 | README.md | 项目概览与快速开始 |
| 架构文档 | ARCHITECTURE.md | 系统架构与设计原则 |
| 贡献指南 | CONTRIBUTING.md | PR 规范与模板贡献 |
| 安全策略 | SECURITY.md | 安全边界与报告流程 |
| 行为准则 | CODE_OF_CONDUCT.md | 社区行为规范 |
| 更新日志 | CHANGELOG.md | 版本变更记录 |
| 天干地支模型 | docs/design/tiangan-dizhi-model.md | 数据模型与算法 |
| 五行引擎 | docs/design/wuxing-engine.md | 五行分析算法 |
| 运势引擎 | docs/design/fortune-engine.md | 管线与评分 |
| 模板系统 | docs/design/template-system.md | 模板格式与验证 |
| 五行映射手册 | docs/domain/ganzhi-programming-mapping.md | 五行编程对应 |
| API 参考 | docs/api/core-api.md | 核心 API 文档 |
| CLI 使用 | docs/cli-usage.md | CLI 命令与配置 |
| VS Code 扩展 | docs/vscode-extension.md | 扩展功能与设置 |
| 开发者指南 | docs/dev/setup.md | 环境搭建与开发流程 |
| 监控方案 | docs/ops/monitoring.md | 监控与告警 |
| 营销计划 | docs/business/marketing-plan.md | 推广策略 |
| ADR-001~008 | docs/adr/ | 8 项架构决策 |

---

## 十一、编码实施建议

### 推荐开窗方案：4 个窗口

按依赖关系分 **两个阶段**，先打地基再盖楼：

#### 阶段一：核心引擎（1 个窗口，串行）

这是所有端的依赖基础，必须先完成。

| 窗口 | 任务 | 产出 | 预估工作量 |
|------|------|------|-----------|
| **窗口 1** | `packages/core` 核心引擎 | 天干地支计算、五行分析、运势管线、模板系统 | 最重 |

**窗口 1 内部顺序**：
```
1. 项目脚手架 (pnpm workspace + turbo + tsconfig)
2. packages/core/src/ganzhi/   → 天干地支计算（纯算术，可独立测试）
3. packages/core/src/wuxing/   → 五行分析（依赖 ganzhi）
4. packages/core/src/fortune/  → 运势管线（依赖 wuxing）
5. packages/core/src/templates/ → 模板加载渲染（依赖 fortune 接口）
6. packages/core/data/         → JSON 数据文件 + Schema
7. packages/core/index.ts      → 统一导出 + 集成测试
```

#### 阶段二：三端并行（3 个窗口，并行）

核心引擎完成后，三端互不依赖，可同时开工：

| 窗口 | 任务 | 关键点 |
|------|------|--------|
| **窗口 2** | `packages/fortune-web` | Next.js App Router, ISR, SEO, 运势卡片组件 |
| **窗口 3** | `packages/fortune-cli` | 命令解析, 多格式输出 (text/json/md), shell 集成 |
| **窗口 4** | `packages/fortune-vscode` | Extension API, 状态栏, 侧边栏, globalState 缓存 |

```
时间线：

窗口1 ████████████████░░░░░░░░░░░░  core 完成
窗口2                 ████████████  web 并行
窗口3                 ████████████  cli 并行
窗口4                 ████████████  vscode 并行
```

### 如果只能开 2 个窗口

| 窗口 | 任务 |
|------|------|
| **窗口 A** | core → cli（串行，CLI 最轻量，适合紧跟 core 后验证） |
| **窗口 B** | web → vscode（串行，两个都是 UI 类，技能栈接近） |

### 各窗口要带的文档

| 窗口 | 必读文档 |
|------|----------|
| Core | tiangan-dizhi-model.md, wuxing-engine.md, fortune-engine.md, template-system.md, ganzhi-programming-mapping.md, ADR-001~005 |
| Web | core-api.md, ADR-006, ADR-007 |
| CLI | core-api.md, cli-usage.md |
| VS Code | core-api.md, vscode-extension.md, ADR-007 |

---

## 十二、当前状态

- **文档完成度**：~100%（全部技术文档已补齐）
- **代码状态**：尚未开始（`packages/` 目录不存在）
- **下一步**：根据本技术方案启动编码实现
