# 运势生成引擎设计

> Fortune Engine — 从日期到运势文案的完整管线设计。本文档描述 `packages/core/src/fortune/` 模块的内部架构。

## 概述

运势生成引擎是 DevFortune 核心管线的后半段。它接收天干地支和五行分析结果，经过宜忌生成、综合评分、模板匹配和渲染四个阶段，输出最终的运势文案。

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│  GanZhi   │ ──→ │  WuXing   │ ──→ │  Fortune  │
│  Engine   │     │  Engine   │     │  Engine   │
│ (日期→干支) │     │ (干支→五行) │     │ (五行→运势) │
└───────────┘     └───────────┘     └───────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                    ┌──────────┐   ┌──────────┐   ┌──────────┐
                    │ YiJi Gen │   │  Scorer  │   │ Template │
                    │ (宜忌生成) │   │  (评分)   │   │ (模板渲染) │
                    └──────────┘   └──────────┘   └──────────┘
```

## 管线阶段详解

### 阶段 1-2：GanZhi 计算 & WuXing 分析

由前置模块完成，参见：
- [天干地支数据模型](tiangan-dizhi-model.md)
- [五行分析引擎](wuxing-engine.md)

输入到 Fortune Engine 的数据结构：

```typescript
interface FortuneInput {
  /** 日期 */
  date: Date;
  /** 天干地支四柱 */
  ganzhi: GanZhiResult;
  /** 五行分析结果 */
  wuxing: WuXingAnalysis;
  /** 五行映射配置（可选，默认使用内置映射） */
  mapping?: WuXingMapping;
}
```

### 阶段 3：宜忌生成（YiJi Generator）

**职责**：根据五行旺衰状态，从映射配置中提取今日适宜和忌讳的编程活动。

**文件**：`packages/core/src/fortune/yiji.ts`

```typescript
interface YiJiResult {
  /** 宜 — 今日适合的编程活动（3-5 条） */
  yi: string[];
  /** 忌 — 今日应避免的编程活动（2-3 条） */
  ji: string[];
  /** 幸运编程语言 */
  luckyLanguage: string;
  /** 幸运工具 */
  luckyTool: string;
}

function generateYiJi(
  wuxing: WuXingAnalysis,
  mapping: WuXingMapping
): YiJiResult;
```

**生成算法**：

```
1. 找出最旺的五行元素（dominant element）
2. 从映射配置中取出该元素的 themes 和 lucky 信息
3. 宜：取 dominant 元素的 themes（顺势而为）
       + 被 dominant 元素「相生」元素的 themes 取 1 条（顺生）
4. 忌：取被 dominant 元素「相克」元素的 unlucky
       + dominant 元素自身的 unlucky（过犹不及）
5. luckyLanguage / luckyTool：取 dominant 元素的 lucky 字段
```

**示例**：日主五行木旺

```
dominant = Wood
Wood.themes = ["新功能开发", "架构搭建", "原型设计", "创意实验"]
Wood 生 Fire → 取 Fire.themes[0] = "性能优化"

宜 = ["新功能开发", "架构搭建", "原型设计", "性能优化"]

Wood 克 Earth → Earth.unlucky = "激进迁移"
Wood.unlucky = "大规模删除代码"

忌 = ["激进迁移", "大规模删除代码"]

luckyLanguage = "JavaScript"
luckyTool = "Vite"
```

### 阶段 4：综合评分（Scorer）

**职责**：基于五行旺衰和生克关系，计算 0-100 的运势分数。

**文件**：`packages/core/src/fortune/scorer.ts`

```typescript
interface ScoreResult {
  /** 综合分数 0-100 */
  score: number;
  /** 分数等级 */
  level: ScoreLevel;
  /** 各维度分数明细 */
  breakdown: ScoreBreakdown;
}

type ScoreLevel = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

interface ScoreBreakdown {
  /** 五行平衡度 (0-40) — 越平衡越高 */
  balance: number;
  /** 日主强度 (0-30) — 适中最高，过旺过弱偏低 */
  dayMasterStrength: number;
  /** 生克和谐度 (0-30) — 相生多得分高，相克多得分低 */
  harmony: number;
}
```

**评分算法**：

```typescript
function calculateScore(wuxing: WuXingAnalysis): ScoreResult {
  // 1. 五行平衡度 (0-40)
  //    计算五行分布的标准差，标准差越小越平衡
  //    balance = 40 * (1 - normalize(stddev))
  const balance = calculateBalance(wuxing.distribution);

  // 2. 日主强度 (0-30)
  //    日主五行在适中范围内得分最高
  //    过旺(>50%)或过弱(<10%)得分递减
  const dayMasterStrength = evaluateDayMaster(wuxing);

  // 3. 生克和谐度 (0-30)
  //    统计四柱干支之间的生克关系
  //    相生关系每个 +5，相克关系每个 -3
  //    再 clamp 到 0-30
  const harmony = evaluateHarmony(wuxing);

  const score = balance + dayMasterStrength + harmony;
  const level = scoreToLevel(score);

  return { score, level, breakdown: { balance, dayMasterStrength, harmony } };
}

function scoreToLevel(score: number): ScoreLevel {
  if (score >= 85) return 'great';
  if (score >= 70) return 'good';
  if (score >= 45) return 'neutral';
  if (score >= 25) return 'bad';
  return 'terrible';
}
```

**分数分布设计目标**：

| 等级 | 分数范围 | 出现概率 | 含义 |
|------|---------|---------|------|
| great | 85-100 | ~10% | 大吉 — 今天写什么都顺 |
| good | 70-84 | ~25% | 小吉 — 适合正常开发 |
| neutral | 45-69 | ~35% | 平 — 中规中矩 |
| bad | 25-44 | ~20% | 小凶 — 注意避坑 |
| terrible | 0-24 | ~10% | 大凶 — 今天摸鱼为上 |

### 阶段 5：模板匹配（Template Matcher）

**职责**：根据评分等级和五行状态，从模板库中选择最合适的运势文案模板。

```typescript
interface TemplateMatchCriteria {
  /** 评分等级 */
  sentiment: ScoreLevel;
  /** 主导五行 */
  dominantElement: WuXing;
  /** 五行状态 */
  elementState: 'prosperous' | 'moderate' | 'weak';
}

function matchTemplate(
  criteria: TemplateMatchCriteria,
  templates: FortuneTemplate[]
): FortuneTemplate;
```

**匹配策略**：

```
1. 精确匹配：sentiment + wuxing + state 全部匹配
2. 模糊匹配：sentiment + wuxing 匹配，忽略 state
3. 等级匹配：仅 sentiment 匹配
4. 兜底模板：每个 sentiment 等级有一个通用兜底模板

优先级：精确 > 模糊 > 等级 > 兜底
同优先级有多个模板时，使用基于日期的伪随机选择（同一天始终选中同一个）
```

**伪随机选择**：

```typescript
// 确保同一天的运势结果确定性
function deterministicSelect<T>(items: T[], date: Date): T {
  const seed = dateToSeed(date); // YYYYMMDD → number
  const index = seed % items.length;
  return items[index];
}
```

### 阶段 6：渲染（Renderer）

**职责**：将模板与计算结果合并，输出最终的运势对象。

```typescript
interface Fortune {
  /** 日期 */
  date: string;
  /** 天干地支（展示用） */
  ganzhi: {
    year: string;   // "丙午年"
    month: string;  // "庚寅月"
    day: string;    // "甲子日"
  };
  /** 五行概要 */
  wuxing: {
    dominant: string;   // "木"
    luckyElement: string; // "火"
  };
  /** 运势内容 */
  fortune: {
    score: number;       // 78
    level: string;       // "good"
    overview: string;    // 模板中的 overview
    yi: string[];        // 宜
    ji: string[];        // 忌
    luckyLang: string;   // 幸运语言
    luckyTool: string;   // 幸运工具
    tip?: string;        // 开运建议
  };
}

function renderFortune(
  ganzhi: GanZhiResult,
  wuxing: WuXingAnalysis,
  yiji: YiJiResult,
  score: ScoreResult,
  template: FortuneTemplate
): Fortune;
```

## 完整管线流程

```typescript
// packages/core/src/fortune/pipeline.ts

export function getDailyFortune(
  date: Date,
  options?: FortuneOptions
): Fortune {
  // 1. 天干地支计算
  const ganzhi = getGanZhi(date);

  // 2. 五行分析
  const wuxing = analyzeWuXing(ganzhi);

  // 3. 加载映射配置
  const mapping = options?.mapping ?? defaultMapping;

  // 4. 生成宜忌
  const yiji = generateYiJi(wuxing, mapping);

  // 5. 综合评分
  const score = calculateScore(wuxing);

  // 6. 模板匹配
  const criteria = buildMatchCriteria(score, wuxing);
  const templates = options?.templates ?? defaultTemplates;
  const template = matchTemplate(criteria, templates);

  // 7. 渲染
  return renderFortune(ganzhi, wuxing, yiji, score, template);
}
```

## 性能预算

| 阶段 | 目标耗时 | 说明 |
|------|---------|------|
| GanZhi 计算 | < 1ms | 纯算术运算 |
| WuXing 分析 | < 1ms | 查表 + 简单逻辑 |
| YiJi 生成 | < 1ms | 配置查找 |
| 评分 | < 1ms | 数值计算 |
| 模板匹配 | < 2ms | 数组过滤 + 排序 |
| 渲染 | < 1ms | 对象组装 |
| **总计** | **< 10ms** | 远低于用户感知阈值 |

## 错误处理

```typescript
// 管线中的错误策略：优雅降级，不抛异常

// 1. 模板匹配失败 → 使用兜底模板
// 2. 映射配置缺失字段 → 使用默认值
// 3. 日期超出支持范围 (1900-2100) → 抛出 RangeError（唯一抛错场景）
```

## 可测试性设计

每个阶段都是独立的纯函数，可单独测试：

```typescript
// 单独测试评分
test('balanced wuxing gets higher score', () => {
  const balanced = mockWuXing({ wood: 20, fire: 20, earth: 20, metal: 20, water: 20 });
  const imbalanced = mockWuXing({ wood: 80, fire: 5, earth: 5, metal: 5, water: 5 });

  expect(calculateScore(balanced).score).toBeGreaterThan(
    calculateScore(imbalanced).score
  );
});

// 单独测试宜忌生成
test('dominant wood generates wood-themed yi', () => {
  const wuxing = mockWuXing({ dominant: 'wood' });
  const result = generateYiJi(wuxing, defaultMapping);

  expect(result.yi).toContain('新功能开发');
  expect(result.luckyLanguage).toBe('JavaScript');
});
```

## 相关文档

- [天干地支数据模型](tiangan-dizhi-model.md) — 管线阶段 1
- [五行分析引擎](wuxing-engine.md) — 管线阶段 2
- [模板系统设计](template-system.md) — 模板格式与生命周期
- [核心 API 参考](../api/core-api.md) — 对外暴露的公开接口
- [ADR-007: 运势更新策略](../adr/ADR-007-fortune-update-strategy.md) — 各端缓存策略
