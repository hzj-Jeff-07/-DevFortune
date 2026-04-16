# ADR-002: Core Engine 采用纯 TypeScript 且零运行时依赖

## 状态

已采纳

## 日期

2026-04-09

## 背景

`@devfortune/core` 是整个项目的核心引擎，负责天干地支推算、五行生克计算以及运势生成。这个包需要在三个截然不同的运行时环境中工作：

1. **浏览器**（Web 应用，可能需要打包为尽可能小的 bundle）
2. **Node.js**（CLI 工具）
3. **VS Code 扩展宿主**（本质是 Electron，但有沙箱限制）

如果 core 引入了运行时依赖，会带来多重问题：bundle 体积膨胀、跨平台兼容性风险、供应链安全隐患（left-pad 事件的教训），以及依赖升级带来的维护负担。

天干地支推算本质上是纯数学计算和日历转换，完全可以用纯函数实现，不需要外部库。

## 决策

`packages/core` 的 `package.json` 中 `dependencies` 字段必须为空对象 `{}`。所有逻辑使用纯 TypeScript 实现，仅依赖语言内置能力。`devDependencies` 不受此限制（测试框架、类型定义等可自由使用）。

同时在 CI 流水线中添加自动化守护：

```yaml
# .github/workflows/ci.yml 中的检查步骤
- name: 确保 core 零运行时依赖
  run: |
    DEPS=$(node -e "const p=require('./packages/core/package.json'); console.log(Object.keys(p.dependencies || {}).length)")
    if [ "$DEPS" != "0" ]; then
      echo "错误：packages/core 不允许有运行时依赖！当前有 $DEPS 个依赖。"
      exit 1
    fi
```

核心包的所有函数应设计为纯函数（pure functions）：给定相同输入，始终返回相同输出，无副作用。日期输入统一接收 `{ year: number; month: number; day: number }` 普通对象，而非 `Date` 实例，以避免时区问题。

## 备选方案

### 方案 B：使用 moment.js / dayjs 处理日期

- **优点**：成熟的日期处理能力；时区支持完善。
- **缺点**：moment.js 体积约 300KB（gzip 后约 70KB），对 Web 端不可接受；dayjs 较轻但仍是外部依赖；天干地支推算需要的是农历转换，这些库并不直接支持。

### 方案 C：使用现有农历/万年历库（如 lunar-javascript）

- **优点**：不用从头实现农历算法，节省开发时间。
- **缺点**：大多数农历库体积较大（包含大量查表数据）；部分库质量参差不齐，维护不稳定；关键业务逻辑依赖第三方库增加了不可控风险；且本项目只需要天干地支部分，不需要完整万年历功能。

## 后果

### 正面

- 核心包打包后体积极小（预计 < 20KB gzip），对 Web 端友好。
- 没有供应链攻击面，安全审计简单。
- 在任何 JavaScript 运行时中都能直接使用，无兼容性问题。
- 纯函数设计使得单元测试简单且确定性高。
- CI 守护确保这一约束不会被无意打破。

### 负面

- 需要自行实现农历转换和节气计算算法，初期开发投入较大。
- 没有外部库的"安全网"，算法正确性完全依赖自己的测试覆盖。
- 未来如需复杂日期处理能力，需在各端的适配层（adapter）中引入，不能在 core 中直接使用。

### 风险

- 农历算法实现可能存在边界 case（如闰月处理），需要用历史数据做大量回归测试，建议覆盖至少 1900-2100 年的天干地支对照表。

## 参考

- [left-pad 事件回顾](https://blog.npmjs.org/post/141577284765/kik-left-pad-and-npm)
- 陈垣《二十史朔闰表》——农历算法的权威参考
- [Pure Functions 概念](https://en.wikipedia.org/wiki/Pure_function)
