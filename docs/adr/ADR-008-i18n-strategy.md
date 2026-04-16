# ADR-008: 国际化策略 — 核心引擎语言无关 + 展示层本地化

## 状态

已采纳

## 日期

2026-04-09

## 背景

DevFortune 的内容根植于中国传统文化（天干地支、五行），但项目面向全球程序员社区。需要支持至少两种语言：

1. **中文**：天干地支和五行的原生语境，中文用户能获得最地道的体验。
2. **英文**：面向国际开发者社区，扩大项目影响力，也是开源项目的基础语言需求。

国际化涉及多个层面的问题：

- **数据层**：核心引擎返回的天干地支和五行数据用什么格式表示？如果直接返回 `"甲"` `"木"` 这样的中文字符串，展示层就需要做反向映射才能翻译为其他语言。
- **文案层**：运势模板中的宜/忌事项、开运建议等文案内容，如何支持多语言版本？
- **UI 层**：各端（Web、CLI、VS Code）的界面文案（按钮标签、菜单项、错误提示）如何实现本地化？

三个层面需要一个统一且可扩展的国际化策略，避免各端各自为战导致翻译不一致。

## 决策

采用**核心引擎语言无关 + 展示层本地化**的分层策略。

### 第一层：核心引擎 — 语言无关

`@devfortune/core` 返回的所有数据使用枚举值（enum）或标识符（identifier），不使用任何自然语言字符串：

```typescript
// packages/core/src/types.ts
export enum TianGan {
  Jia = 'jia',   // 甲
  Yi = 'yi',     // 乙
  Bing = 'bing', // 丙
  // ...
}

export enum WuXing {
  Wood = 'wood',   // 木
  Fire = 'fire',   // 火
  Earth = 'earth', // 土
  Metal = 'metal', // 金
  Water = 'water', // 水
}

export interface FortuneResult {
  date: { year: number; month: number; day: number };
  tianGan: TianGan;
  diZhi: DiZhi;
  wuXing: WuXing;
  sentiment: Sentiment;
  templateId: string;
  // 无任何自然语言字段
}
```

核心引擎只负责推算和匹配逻辑，不包含任何展示文案。这确保了引擎是一个纯粹的计算模块，与语言无关。

### 第二层：运势模板 — 多语言版本

运势文案模板按语言分文件存储：

```
packages/core/data/templates/
  zh-CN/
    fortune-templates.json  # 中文模板
  en/
    fortune-templates.json  # 英文模板
```

各语言版本的模板使用相同的 `id` 体系和 JSON Schema 结构（见 ADR-005），仅文案内容不同：

```json
// zh-CN/fortune-templates.json
{
  "templates": [{
    "id": "wood-great-001",
    "overview": "今日木气旺盛，适合开启新项目！",
    "do": ["尝试新框架", "头脑风暴"],
    "dont": ["删除旧代码"]
  }]
}

// en/fortune-templates.json
{
  "templates": [{
    "id": "wood-great-001",
    "overview": "Wood energy is strong today — great for starting new projects!",
    "do": ["Try a new framework", "Brainstorm ideas"],
    "dont": ["Delete legacy code"]
  }]
}
```

### 第三层：UI 文案 — 各端本地化方案

各端使用各自生态中最成熟的 i18n 库：

| 端 | i18n 方案 | 原因 |
|---|---|---|
| Web (Next.js) | `next-intl` | 与 App Router 深度集成，支持 Server Components 中的翻译；类型安全 |
| CLI | 自定义轻量方案 | CLI 的 UI 文案极少（数十条），不值得引入完整 i18n 库；通过简单的 key-value JSON 查表即可 |
| VS Code 扩展 | `vscode.l10n` | VS Code 官方推荐的扩展本地化方案，支持 `l10n` bundle 格式，与 Marketplace 的语言包机制集成 |

### 语言检测优先级

1. 用户显式设置（配置文件 / UI 切换）
2. 运行环境语言（`navigator.language` / `process.env.LANG` / `vscode.env.language`）
3. 回退到中文（`zh-CN`）作为默认语言

## 备选方案

### 方案 B：核心引擎直接返回本地化字符串

- **优点**：调用方直接拿到可展示的文案，无需再做翻译查找；实现简单，一步到位。
- **缺点**：核心引擎需要感知 locale 参数，纯函数的签名变复杂；引擎内部需要加载翻译文件，违反零依赖和纯计算的设计原则（ADR-002）；新增语言需要修改核心引擎，而非仅添加翻译文件；无法在不同端使用不同的翻译粒度。

### 方案 C：使用统一的 i18n 库（如 i18next）跨所有端

- **优点**：所有端共享一套翻译资源和 API；翻译 key 体系统一，不会出现各端命名不一致的问题。
- **缺点**：i18next 等库在 VS Code 扩展环境中可能存在兼容性问题；各端的 i18n 需求差异大（Web 需要路由级别的 locale 切换，CLI 只需要启动时确定一次），用统一库反而增加了不必要的抽象层；增加了核心包的依赖。

### 方案 D：仅支持中文，不做国际化

- **优点**：开发工作量最小；天干地支和五行本就是中文概念，英文翻译可能失去韵味。
- **缺点**：限制了项目在国际开源社区的传播；无法吸引非中文用户贡献；与开源项目的包容性价值观不符。

## 后果

### 正面

- 核心引擎完全不关心语言，保持了纯计算模块的简洁性，也与 ADR-002 的零依赖原则一致。
- 新增语言只需添加模板翻译文件和 UI 翻译文件，不需要修改任何 TypeScript 代码。
- 各端使用各自生态最成熟的 i18n 方案，开发效率和用户体验都有保障。
- 模板的多语言版本使用相同的 `id` 体系，便于质量检查（自动化检测某个 id 是否在所有语言版本中都有对应翻译）。
- 回退策略确保即使翻译缺失，用户仍能看到中文版本，不会出现空白或报错。

### 负面

- 翻译工作量随支持语言数量线性增长。每个运势模板都需要人工翻译（天干地支运势的创意文案难以机器翻译），维护成本不可忽视。
- 各端使用不同的 i18n 库，UI 翻译 key 的命名约定需要人为协调，存在不一致风险。建议在 `CONTRIBUTING.md` 中定义翻译 key 的命名规范。
- 英文用户可能对天干地支、五行等概念完全陌生，仅翻译文案不够——还需要提供概念解释页面。

### 风险

- 翻译质量难以保证。天干地支运势文案兼具专业性和趣味性，直接翻译可能丢失中文语境下的双关和幽默。建议邀请既懂中国文化又精通英文的贡献者参与翻译审校。
- 语言文件数量膨胀后管理困难。建议引入翻译管理平台（如 Crowdin）或至少编写自动化脚本检测翻译覆盖率（如 `check-i18n-coverage.ts`）。
- VS Code 扩展的 `l10n` 方案要求翻译文件遵循特定格式（`bundle.l10n.*.json`），与其他端的翻译文件格式不同，需要注意维护。

## 参考

- [next-intl 文档](https://next-intl-docs.vercel.app/)
- [VS Code 扩展本地化指南](https://code.visualstudio.com/api/references/vscode-api#l10n)
- [Crowdin — 翻译管理平台](https://crowdin.com/)
- ADR-002：核心引擎零依赖约束
- ADR-004：五行映射数据驱动设计（模板结构）
- ADR-005：JSON Schema 验证（模板格式）
