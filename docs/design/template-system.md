# 模板系统设计

> Template System — 运势文案模板的格式定义、验证机制与社区贡献流程。本文档是 [ADR-005](../adr/ADR-005-template-json-schema.md) 的配套实施文档。

## 概述

模板系统负责管理 DevFortune 的运势文案内容。核心引擎仅提供计算能力和管线骨架，而用户最终看到的文案（「今日木气生发，万物萌动，代码如春笋破土」）全部来源于模板。

模板系统的设计目标：
1. **社区可贡献** — 非开发者也能编写运势文案
2. **格式可验证** — JSON Schema 保证结构正确
3. **类型安全** — TypeScript 类型从 Schema 自动生成
4. **匹配可预测** — 同一天同一套模板必定产出相同结果

## 模板格式

### Schema 定义

模板文件遵循 JSON Schema（draft-07），Schema 文件位于 `packages/core/schemas/fortune-template.schema.json`。

### 模板文件结构

```json
{
  "$schema": "../schemas/fortune-template.schema.json",
  "version": "1.0.0",
  "templates": [
    {
      "id": "wood-prosperous-001",
      "sentiment": "great",
      "overview": "今日木气生发，万物萌动，代码如春笋破土。正是创建新项目的绝佳时机！",
      "do": [
        "创建新项目",
        "搭建架构脚手架",
        "学习新框架",
        "写技术方案"
      ],
      "dont": [
        "删除大量代码",
        "砍掉功能模块",
        "做减法优化"
      ],
      "luckyLang": "JavaScript",
      "luckyTool": "Vite",
      "tip": "打开 IDE，创建那个你心心念念的新项目吧"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 约束 | 说明 |
|------|------|------|------|------|
| `id` | string | ✅ | 匹配 `^[a-z0-9-]+$` | 模板唯一标识 |
| `sentiment` | enum | ✅ | great/good/neutral/bad/terrible | 运势等级 |
| `overview` | string | ✅ | 10-200 字符 | 运势概述（用户看到的第一句话） |
| `do` | string[] | ✅ | 1-5 条 | 今日宜 |
| `dont` | string[] | ✅ | 1-5 条 | 今日忌 |
| `luckyLang` | string | ❌ | — | 幸运编程语言 |
| `luckyTool` | string | ❌ | — | 幸运开发工具 |
| `tip` | string | ❌ | ≤100 字符 | 开运建议 |

### 扩展字段（CONTRIBUTING.md 格式）

CONTRIBUTING.md 中定义了面向社区贡献者的扩展格式，包含额外的元数据字段：

```json
{
  "id": "wood-prosperous-001",
  "trigger": {
    "wuxing": "wood",
    "state": "prosperous"
  },
  "category": "coding",
  "fortune": {
    "summary": "今日木气生发，万物萌动",
    "detail": "甲木参天，生机勃发...",
    "yi": ["创建新项目", "搭建架构脚手架"],
    "ji": ["删除大量代码", "砍掉功能模块"]
  },
  "tone": "encouraging",
  "tags": ["frontend", "backend", "fullstack"],
  "author": "github-username"
}
```

`trigger` 字段用于精确匹配五行状态，`tone` 控制文案风格，`tags` 标记适用领域。贡献者提交此格式，CI 流水线自动转换为 Schema 格式入库。

## 模板生命周期

```
                  ┌────────────────────────────────────────────┐
                  │             模板生命周期                     │
                  │                                            │
  社区贡献者       │  PR 提交 → Schema 验证 → Review → 合入      │
  ─────────── ──→ │     ↓          ↓          ↓       ↓        │
                  │  编写 JSON   CI 自动校验  人工审核  发布      │
                  │                                            │
  运行时          │  加载 → 验证 → 索引 → 匹配 → 渲染            │
  ─────────── ──→ │                                            │
                  └────────────────────────────────────────────┘
```

### 1. 编写阶段

贡献者在 `templates/` 目录下创建 JSON 文件。推荐使用支持 JSON Schema 的编辑器（VS Code），可获得实时校验和自动补全。

### 2. 验证阶段（CI）

PR 触发 CI 流水线，使用 ajv-cli 验证模板文件：

```bash
# CI 中执行
npx ajv validate \
  -s packages/core/schemas/fortune-template.schema.json \
  -d "templates/**/*.json"
```

验证内容：
- 必填字段完整性
- 字段类型正确性
- 字符串长度约束
- `id` 格式合规
- `sentiment` 值在枚举范围内
- `do` / `dont` 数组长度在 1-5 之间

### 3. 审核阶段

通过自动验证后，维护者人工审核：

**审核清单**：
- [ ] 文案风格：幽默但不低俗
- [ ] 文化底蕴：融入五行意象，不过于晦涩
- [ ] 贴近开发者：使用程序员熟悉的术语和场景
- [ ] 无敏感内容：不涉及政治、宗教、性别歧视等
- [ ] `id` 命名规范：`{wuxing}-{state}-{序号}`

### 4. 运行时加载

```typescript
// packages/core/src/templates/loader.ts

interface TemplateLoader {
  /** 加载所有模板 */
  loadAll(): FortuneTemplate[];

  /** 按条件查询模板 */
  query(criteria: TemplateMatchCriteria): FortuneTemplate[];
}
```

**加载策略**（按平台不同）：

| 平台 | 加载方式 | 说明 |
|------|---------|------|
| Core（通用） | 依赖注入 | 调用方传入模板数组，引擎不关心来源 |
| Web | 构建时内联 | Next.js 构建时将 JSON 打包进 bundle |
| CLI | 运行时读取 | 从 node_modules 中读取 JSON 文件 |
| VS Code | 扩展打包 | 模板文件随扩展一起打包 |

### 5. 索引与匹配

加载后，模板引擎建立内存索引：

```typescript
// 索引结构
type TemplateIndex = Map<string, FortuneTemplate[]>;

// 索引键格式: "sentiment:wuxing:state" 或 "sentiment:wuxing" 或 "sentiment"
function buildIndex(templates: FortuneTemplate[]): TemplateIndex;
```

匹配优先级：精确匹配 > 模糊匹配 > 等级匹配 > 兜底模板

详见 [运势生成引擎设计](fortune-engine.md) 的模板匹配章节。

## TypeScript 类型生成

从 JSON Schema 自动生成 TypeScript 类型，确保类型定义与 Schema 始终同步：

```bash
# 生成类型定义
npx json2ts \
  -i packages/core/schemas/fortune-template.schema.json \
  -o packages/core/src/types/template.d.ts
```

生成结果示例：

```typescript
// packages/core/src/types/template.d.ts（自动生成，勿手动修改）

export interface FortuneTemplateFile {
  version: string;
  templates: FortuneTemplate[];
}

export interface FortuneTemplate {
  id: string;
  sentiment: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  overview: string;
  do: string[];
  dont: string[];
  luckyLang?: string;
  luckyTool?: string;
  tip?: string;
}
```

## 模板数量规划

| sentiment | 目标模板数 | 说明 |
|-----------|-----------|------|
| great | ≥ 25 | 5 种五行 × 5 个变体 |
| good | ≥ 25 | 同上 |
| neutral | ≥ 25 | 同上 |
| bad | ≥ 25 | 同上 |
| terrible | ≥ 25 | 同上 |
| **总计** | **≥ 125** | 确保足够的文案多样性 |

每种五行 + sentiment 组合至少 5 个模板，避免用户连续几天看到相同文案。

## 文案风格指南

### 风格要求

1. **幽默但不低俗** — 让程序员会心一笑，而不是尬笑
2. **有文化底蕴** — 融入天干地支、五行的文化意象，但不要过于晦涩
3. **贴近开发者日常** — 使用程序员熟悉的术语和场景
4. **积极向上** — 即使是「大凶」也应该带有调侃和幽默感，不能让人真的焦虑

### 各等级文案基调

| sentiment | 基调 | 示例 |
|-----------|------|------|
| great | 春风得意 | 「五行大和，今日提交必过 Review，PR 秒合」 |
| good | 稳中向好 | 「小有吉兆，适合攻克那个拖了三天的 Bug」 |
| neutral | 平稳无波 | 「不功不过，按部就班写 CRUD 就好」 |
| bad | 小心谨慎 | 「今日宜摸鱼，不宜 git push --force」 |
| terrible | 自嘲摸鱼 | 「五行缺运，建议今天只看不写，摸鱼保平安」 |

## 社区贡献流程

```
1. Fork 仓库
2. 在 templates/ 目录创建或编辑 JSON 文件
3. 确保文件头部有 $schema 引用
4. 本地验证：npx ajv validate -s schemas/fortune-template.schema.json -d your-file.json
5. 提交 PR，标题格式：feat(templates): add {wuxing}-{sentiment} templates
6. CI 自动验证通过
7. 维护者 Review 文案质量
8. 合入 main
```

## 相关文档

- [ADR-005: 模板 JSON Schema](../adr/ADR-005-template-json-schema.md) — 架构决策
- [运势生成引擎设计](fortune-engine.md) — 模板匹配与渲染逻辑
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — 贡献指南（含模板贡献章节）
- [五行编程映射手册](../domain/ganzhi-programming-mapping.md) — 五行与编程概念的对应关系
