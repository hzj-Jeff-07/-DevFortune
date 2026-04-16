# Core Engine API 参考文档

> `@devfortune/core` — 天干地支推算、五行分析与运势生成的核心运算库

## 概述

Core Engine 是 DevFortune 的核心运算库，采用**纯函数、零依赖、平台无关**的设计原则。它是 Web 应用、CLI 工具和 VS Code 扩展的共享计算引擎。

**设计约束：**
- 零运行时依赖（`dependencies: {}`）
- 纯函数设计，无副作用
- 平台无关，可在 Browser / Node.js / VS Code Extension Host 中运行
- TypeScript 严格模式

---

## 安装

```bash
# 作为 monorepo 内部包引用
pnpm add @devfortune/core --workspace

# 作为独立包安装（发布后）
npm install @devfortune/core
```

---

## 主入口 API

### `getDailyFortune(date, options?)`

获取指定日期的完整运势信息。这是最常用的顶层 API。

```typescript
function getDailyFortune(date: Date, options?: FortuneOptions): Fortune;
```

**参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `date` | `Date` | 是 | 要查询的日期 |
| `options` | `FortuneOptions` | 否 | 可选配置 |

**FortuneOptions：**

```typescript
interface FortuneOptions {
  /** 语言设置，默认 'zh-CN' */
  locale?: 'zh-CN' | 'en-US';
  
  /** 是否包含详细五行分析，默认 false */
  includeDetail?: boolean;
  
  /** 是否包含时辰运势，默认 false */
  includeHourly?: boolean;
  
  /** 个人八字（可选，用于个性化运势） */
  personalBazi?: PersonalBazi;
  
  /** 自定义模板集合 ID */
  templateSetId?: string;
}
```

**返回值：**

```typescript
interface Fortune {
  /** 日期信息 */
  date: DateInfo;
  
  /** 四柱干支 */
  ganZhi: GanZhiResult;
  
  /** 五行分析 */
  wuXing: WuXingAnalysis;
  
  /** 运势评分 (1-5) */
  score: 1 | 2 | 3 | 4 | 5;
  
  /** 运势摘要（一句话） */
  summary: string;
  
  /** 运势详情 */
  detail: string;
  
  /** 宜做事项 */
  yi: FortuneItem[];
  
  /** 忌做事项 */
  ji: FortuneItem[];
  
  /** 幸运元素 */
  lucky: LuckyElements;
}

interface FortuneItem {
  /** 事项名称 */
  name: string;
  
  /** 事项说明 */
  description: string;
  
  /** 相关编程活动标签 */
  tags: string[];
}

interface LuckyElements {
  /** 幸运编程语言 */
  language: string;
  
  /** 幸运颜色（IDE 主题） */
  color: string;
  
  /** 幸运数字 */
  number: number;
  
  /** 幸运方位 */
  direction: string;
}

interface DateInfo {
  /** 公历日期 */
  gregorian: Date;
  
  /** 农历日期描述 */
  lunar: string;
  
  /** 节气信息（如果当天是节气） */
  solarTerm?: string;
}
```

**使用示例：**

```typescript
import { getDailyFortune } from '@devfortune/core';

const fortune = getDailyFortune(new Date('2026-04-09'));

console.log(fortune.summary);
// => "今日木气生发，万物萌动，代码如春笋破土"

console.log(fortune.score);
// => 4

console.log(fortune.yi);
// => [{ name: "创建新项目", description: "...", tags: ["all"] }, ...]

console.log(fortune.ji);
// => [{ name: "删除大量代码", description: "...", tags: ["all"] }, ...]
```

---

## 干支推算 API

### `getGanZhi(date)`

获取指定日期的四柱干支信息。

```typescript
function getGanZhi(date: Date): GanZhiResult;
```

**返回值：**

```typescript
interface GanZhiResult {
  /** 年柱 */
  year: GanZhiPillar;
  
  /** 月柱 */
  month: GanZhiPillar;
  
  /** 日柱 */
  day: GanZhiPillar;
  
  /** 时柱（基于当前时间，如果传入的 Date 包含时间信息） */
  hour?: GanZhiPillar;
  
  /** 六十甲子序号 (0-59) */
  sexagenaryCycle: number;
  
  /** 生肖 */
  zodiac: Zodiac;
}

interface GanZhiPillar {
  /** 天干 */
  gan: TianGan;
  
  /** 地支 */
  zhi: DiZhi;
  
  /** 干支组合名称，如 "甲子" */
  name: string;
  
  /** 纳音五行 */
  naYin: string;
}
```

**使用示例：**

```typescript
import { getGanZhi } from '@devfortune/core';

const ganZhi = getGanZhi(new Date('2026-04-09'));

console.log(ganZhi.year.name);   // => "丙午"
console.log(ganZhi.month.name);  // => "壬辰"
console.log(ganZhi.day.name);    // => "甲子"
console.log(ganZhi.zodiac);      // => "马"
```

---

## 五行分析 API

### `analyzeWuXing(ganZhi)`

基于四柱干支结果，分析五行旺衰状态。

```typescript
function analyzeWuXing(ganZhi: GanZhiResult): WuXingAnalysis;
```

**返回值：**

```typescript
interface WuXingAnalysis {
  /** 日主五行（日柱天干的五行属性） */
  dayMaster: WuXing;
  
  /** 日主五行的旺衰状态 */
  dayMasterState: WuXingState;
  
  /** 五行分布 */
  distribution: WuXingDistribution;
  
  /** 五行生克关系分析 */
  interactions: WuXingInteraction[];
  
  /** 当季旺相休囚死 */
  seasonalStates: Record<WuXing, WuXingState>;
  
  /** 综合五行强度评分 */
  strength: Record<WuXing, number>;
}

/** 五行枚举 */
enum WuXing {
  Metal = 'metal',   // 金
  Wood = 'wood',     // 木
  Water = 'water',   // 水
  Fire = 'fire',     // 火
  Earth = 'earth',   // 土
}

/** 五行旺衰状态 */
enum WuXingState {
  Prosperous = 'prosperous',   // 旺
  Supporting = 'supporting',   // 相
  Resting = 'resting',         // 休
  Imprisoned = 'imprisoned',   // 囚
  Dead = 'dead',               // 死
}

interface WuXingDistribution {
  metal: number;   // 金的数量
  wood: number;    // 木的数量
  water: number;   // 水的数量
  fire: number;    // 火的数量
  earth: number;   // 土的数量
}

interface WuXingInteraction {
  /** 关系类型 */
  type: 'generation' | 'restriction';
  
  /** 主动方 */
  source: WuXing;
  
  /** 被动方 */
  target: WuXing;
  
  /** 强度 (0-1) */
  intensity: number;
  
  /** 对运势的影响描述 */
  effect: string;
}
```

**使用示例：**

```typescript
import { getGanZhi, analyzeWuXing } from '@devfortune/core';

const ganZhi = getGanZhi(new Date('2026-04-09'));
const analysis = analyzeWuXing(ganZhi);

console.log(analysis.dayMaster);
// => WuXing.Wood

console.log(analysis.dayMasterState);
// => WuXingState.Supporting

console.log(analysis.distribution);
// => { metal: 0, wood: 2, water: 2, fire: 2, earth: 2 }
```

---

## 辅助 API

### `getTianGan(index)`

根据索引获取天干信息。

```typescript
function getTianGan(index: number): TianGan;
```

```typescript
interface TianGan {
  index: number;       // 0-9
  name: string;        // 甲、乙、丙...
  pinyin: string;      // jiǎ、yǐ、bǐng...
  wuXing: WuXing;      // 对应五行
  yinYang: YinYang;    // 阴阳属性
}
```

### `getDiZhi(index)`

根据索引获取地支信息。

```typescript
function getDiZhi(index: number): DiZhi;
```

```typescript
interface DiZhi {
  index: number;       // 0-11
  name: string;        // 子、丑、寅...
  pinyin: string;      // zǐ、chǒu、yín...
  wuXing: WuXing;      // 对应五行
  yinYang: YinYang;    // 阴阳属性
  animal: string;      // 生肖
  timeRange: string;   // 对应时辰 "23:00-01:00"
}
```

### `getWuXingRelation(a, b)`

获取两个五行之间的关系。

```typescript
function getWuXingRelation(a: WuXing, b: WuXing): WuXingRelation;
```

```typescript
interface WuXingRelation {
  type: 'generation' | 'restriction' | 'same' | 'none';
  direction: 'source' | 'target' | 'mutual';
  description: string;
}
```

### `getSolarTerm(date)`

获取指定日期的节气信息。

```typescript
function getSolarTerm(date: Date): SolarTerm | null;
```

```typescript
interface SolarTerm {
  name: string;        // 节气名称
  pinyin: string;      // 拼音
  date: Date;          // 精确日期时间
  description: string; // 说明
}
```

### `formatFortune(fortune, format?)`

将运势对象格式化为字符串输出。

```typescript
function formatFortune(
  fortune: Fortune, 
  format?: 'text' | 'json' | 'markdown'
): string;
```

---

## 类型枚举速查

### YinYang 阴阳

```typescript
enum YinYang {
  Yang = 'yang',  // 阳
  Yin = 'yin',    // 阴
}
```

### Zodiac 生肖

```typescript
type Zodiac = '鼠' | '牛' | '虎' | '兔' | '龙' | '蛇' | 
              '马' | '羊' | '猴' | '鸡' | '狗' | '猪';
```

---

## 错误处理

Core Engine 定义了以下错误类型：

```typescript
/** 日期超出支持范围 */
class DateOutOfRangeError extends Error {
  readonly supportedRange: { min: Date; max: Date };
}

/** 干支推算错误 */
class GanZhiCalculationError extends Error {
  readonly date: Date;
  readonly step: 'year' | 'month' | 'day' | 'hour';
}

/** 模板未找到 */
class TemplateNotFoundError extends Error {
  readonly wuXingState: WuXingState;
  readonly wuXing: WuXing;
}
```

**支持的日期范围：** 1900-01-01 至 2100-12-31

超出此范围的日期将抛出 `DateOutOfRangeError`。

---

## 版本兼容性

Core Engine 遵循[语义化版本](https://semver.org/lang/zh-CN/)规范：

- **主版本号 (Major)**：不兼容的 API 变更
- **次版本号 (Minor)**：向下兼容的新功能
- **修订号 (Patch)**：向下兼容的问题修复

**稳定性承诺：**
- 本文档中列出的所有公开 API 在同一主版本内保持向下兼容
- 内部实现（以 `_` 开头的函数或未在文档中列出的函数）不受此承诺约束
- 废弃的 API 会在下一个主版本中移除，并提前一个次版本标记 `@deprecated`
