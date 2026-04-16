# ADR-005: 运势文案模板采用 JSON Schema 定义

## 状态

已采纳

## 日期

2026-04-09

## 背景

DevFortune 的运势结果需要呈现结构化的文案内容，包括：今日运势概述、宜/忌事项、幸运编程语言、幸运工具、开运建议等字段。这些文案模板需要支持社区贡献——让更多人可以提交有趣的运势文案。

然而，如果对模板格式没有严格约束，社区提交的内容可能缺少必要字段、字段类型错误、文案长度失控，导致渲染异常或用户体验不一致。我们需要一种机制，既能让非开发者容易编写模板，又能自动化验证模板的结构正确性。

同时，模板数据的格式定义需要在 core 引擎、Web 前端、CLI 和 VS Code 扩展之间共享，不能各端各自定义。

## 决策

运势文案模板采用 JSON 格式编写，并通过 JSON Schema 进行结构验证。Schema 文件存放在 `packages/core/schemas/` 目录下，作为单一事实来源（Single Source of Truth）。

模板 Schema 定义示例：

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://devfortune.dev/schemas/fortune-template.schema.json",
  "type": "object",
  "required": ["version", "templates"],
  "properties": {
    "version": { "type": "string", "pattern": "^\\d+\\.\\d+\\.\\d+$" },
    "templates": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id", "sentiment", "overview", "do", "dont"],
        "properties": {
          "id": { "type": "string", "pattern": "^[a-z0-9-]+$" },
          "sentiment": { "enum": ["great", "good", "neutral", "bad", "terrible"] },
          "overview": { "type": "string", "minLength": 10, "maxLength": 200 },
          "do": { "type": "array", "items": { "type": "string" }, "minItems": 1, "maxItems": 5 },
          "dont": { "type": "array", "items": { "type": "string" }, "minItems": 1, "maxItems": 5 },
          "luckyLang": { "type": "string" },
          "luckyTool": { "type": "string" },
          "tip": { "type": "string", "maxLength": 100 }
        }
      }
    }
  }
}
```

验证集成到以下环节：

1. **CI 流水线**：PR 中修改了模板文件时，自动运行 JSON Schema 验证（使用 ajv-cli）。
2. **编辑器支持**：模板文件头部引用 `$schema`，VS Code 和其他编辑器可以提供实时校验和自动补全。
3. **运行时**：core 引擎加载模板时做一次轻量级结构校验，防御性编程。

从 JSON Schema 自动生成 TypeScript 类型定义（使用 json-schema-to-typescript），确保 Schema 与代码类型始终同步。

## 备选方案

### 方案 B：自由格式 Markdown

- **优点**：编写门槛最低，非技术用户也能轻松贡献。
- **缺点**：解析 Markdown 提取结构化字段需要自定义解析器；格式不统一时容易出错；无法自动化验证必填字段；渲染端需要处理各种非预期格式。

### 方案 C：YAML 格式（无 Schema 验证）

- **优点**：比 JSON 更易读，支持注释，对人类更友好。
- **缺点**：YAML 解析需要引入依赖（违反 ADR-002 的零依赖约束，需要在适配层处理）；YAML 的隐式类型转换是已知的坑（如 `no` 被解析为 `false`）；没有 Schema 验证则与自由格式一样缺乏约束。

### 方案 D：自定义 DSL

- **优点**：可以设计最符合领域需求的语法。
- **缺点**：需要实现词法分析器和语法分析器；学习成本高，社区贡献者需要学习新语法；缺乏现成的编辑器支持和工具生态。

## 后果

### 正面

- 社区贡献者在提交 PR 前就能通过编辑器得到实时反馈，知道自己的模板是否合规。
- CI 自动验证杜绝了格式错误的模板被合入主分支。
- JSON Schema 是工业标准，有丰富的工具生态（验证器、文档生成器、代码生成器）。
- TypeScript 类型自动生成，减少手动维护类型定义的负担，消除类型与实际数据结构不一致的风险。
- 各端共享同一份 Schema，保证数据契约一致性。

### 负面

- JSON 格式不支持注释，模板文件中无法内联说明意图（可用 `_comment` 字段变通）。
- Schema 本身有学习成本，维护者需要熟悉 JSON Schema 规范。
- Schema 演进需要考虑向后兼容，新增必填字段会破坏现有模板。

### 风险

- JSON Schema draft 版本较多（draft-04/06/07/2019-09/2020-12），需要统一选定一个版本并坚持使用，避免工具兼容性问题。本项目选定 draft-07 作为稳定且广泛支持的版本。
- 随着模板字段增多，Schema 文件本身可能变得复杂难维护，建议使用 `$ref` 拆分为多个子 Schema。

## 参考

- [JSON Schema 官方规范](https://json-schema.org/)
- [ajv - JSON Schema 验证器](https://ajv.js.org/)
- [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript)
- ADR-002：核心引擎零依赖约束
- ADR-004：五行映射数据驱动设计
