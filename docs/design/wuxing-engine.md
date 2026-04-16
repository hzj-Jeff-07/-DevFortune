# 五行分析引擎设计

## 概述

五行分析引擎（WuXing Engine）是 DevFortune 运势生成管线的核心环节。它接收天干地支计算结果，分析五行的旺衰、生克关系，输出五行分析报告，作为运势评分和宜忌生成的基础数据。

## 五行基础理论

### 五行属性

| 五行 | 英文 | 方位 | 季节 | 颜色 | 数字 |
|------|------|------|------|------|------|
| 木 | Wood | 东 | 春 | 青/绿 | 3, 8 |
| 火 | Fire | 南 | 夏 | 红 | 2, 7 |
| 土 | Earth | 中 | 长夏 | 黄 | 5, 0 |
| 金 | Metal | 西 | 秋 | 白 | 4, 9 |
| 水 | Water | 北 | 冬 | 黑/蓝 | 1, 6 |

### 五行生克关系

**相生关系（促进、滋养）**：
```
木 → 火 → 土 → 金 → 水 → 木
木生火：木燃烧产生火
火生土：火烧尽化为灰土
土生金：土中蕴藏金属矿
金生水：金属凝结水珠（金冷凝水）
水生木：水滋养树木生长
```

**相克关系（抑制、消耗）**：
```
木 → 土 → 水 → 火 → 金 → 木
木克土：树根破土而出
土克水：土筑堤挡水
水克火：水浇灭火
火克金：火熔化金属
金克木：金属砍伐树木
```

## TypeScript 接口设计

### 五行关系定义

```typescript
/** 五行关系类型 */
export enum WuXingRelation {
  /** 相生 — 我生 */
  Generates = 'generates',
  /** 相生 — 生我 */
  GeneratedBy = 'generated_by',
  /** 相克 — 我克 */
  Overcomes = 'overcomes',
  /** 相克 — 克我 */
  OvercomeBy = 'overcome_by',
  /** 同类 */
  Same = 'same',
}

/** 五行强度等级 */
export enum WuXingStrength {
  VeryWeak = 1,    // 极弱
  Weak = 2,        // 偏弱
  Balanced = 3,    // 平衡
  Strong = 4,      // 偏旺
  VeryStrong = 5,  // 极旺
}
```

### 分析结果接口

```typescript
/** 五行分析结果 */
export interface WuXingAnalysis {
  /** 当日主导五行（日柱天干的五行） */
  dominant: WuXing;

  /** 五行分布计数 */
  distribution: Record<WuXing, number>;

  /** 五行强度评估 */
  strength: Record<WuXing, WuXingStrength>;

  /** 当日五行关系（主导五行与其他四行的关系） */
  relations: WuXingRelationMap;

  /** 最旺的五行 */
  strongest: WuXing;

  /** 最弱的五行 */
  weakest: WuXing;

  /** 是否五行平衡 */
  isBalanced: boolean;

  /** 缺失的五行（计数为0） */
  missing: WuXing[];

  /** 当日幸运五行（最需要补充的） */
  luckyElement: WuXing;
}

/** 五行关系映射 */
export interface WuXingRelationMap {
  [key: string]: {
    element: WuXing;
    relation: WuXingRelation;
    /** 关系对运势的影响分值 (-2 到 +2) */
    impact: number;
  };
}
```

## 核心算法

### 1. 五行分布计算

从四柱（年月日时）的天干地支中统计各五行出现次数：

```typescript
/**
 * 统计四柱中五行的分布
 */
export function calculateDistribution(
  ganzhi: GanZhiResult
): Record<WuXing, number> {
  const count: Record<WuXing, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  };

  const pillars = [ganzhi.year, ganzhi.month, ganzhi.day];
  if (ganzhi.hour) pillars.push(ganzhi.hour);

  for (const pillar of pillars) {
    // 天干的五行
    count[pillar.tianGan.wuxing]++;
    // 地支的五行
    count[pillar.diZhi.wuxing]++;
    // 地支藏干的五行（权重较低，计为 0.5）
    for (const hidden of getHiddenStems(pillar.diZhi)) {
      count[hidden.wuxing] += 0.5;
    }
  }

  return count;
}
```

### 2. 五行强度评估

综合考虑季节旺衰、五行分布、生克关系，评估每个五行的强度：

```typescript
/**
 * 评估五行强度
 * 
 * 旺衰规则：
 * - 当令（当季对应五行）：+2
 * - 相生当令：+1
 * - 被克当令：-1
 * - 分布数量：每多1个 +1
 */
export function evaluateStrength(
  distribution: Record<WuXing, number>,
  season: Season
): Record<WuXing, WuXingStrength> {
  const strength: Record<WuXing, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  };

  const seasonElement = getSeasonElement(season);

  for (const element of Object.values(WuXing)) {
    let score = 0;

    // 基础分：分布数量
    score += distribution[element] * 1.5;

    // 季节加成
    if (element === seasonElement) {
      score += 2; // 当令
    } else if (getRelation(seasonElement, element) === WuXingRelation.Generates) {
      score += 1; // 受当令五行相生
    } else if (getRelation(seasonElement, element) === WuXingRelation.Overcomes) {
      score -= 1; // 被当令五行相克
    }

    // 映射到强度等级
    strength[element] = mapToStrength(score);
  }

  return strength as Record<WuXing, WuXingStrength>;
}

function mapToStrength(score: number): WuXingStrength {
  if (score <= 0) return WuXingStrength.VeryWeak;
  if (score <= 2) return WuXingStrength.Weak;
  if (score <= 4) return WuXingStrength.Balanced;
  if (score <= 6) return WuXingStrength.Strong;
  return WuXingStrength.VeryStrong;
}
```

### 3. 五行关系分析

分析日主（日柱天干五行）与其他四行的关系：

```typescript
/** 五行相生关系表 */
const SHENG_MAP: Record<WuXing, WuXing> = {
  wood: 'fire',    // 木生火
  fire: 'earth',   // 火生土
  earth: 'metal',  // 土生金
  metal: 'water',  // 金生水
  water: 'wood',   // 水生木
};

/** 五行相克关系表 */
const KE_MAP: Record<WuXing, WuXing> = {
  wood: 'earth',   // 木克土
  earth: 'water',  // 土克水
  water: 'fire',   // 水克火
  fire: 'metal',   // 火克金
  metal: 'wood',   // 金克木
};

/**
 * 获取两个五行之间的关系
 */
export function getRelation(from: WuXing, to: WuXing): WuXingRelation {
  if (from === to) return WuXingRelation.Same;
  if (SHENG_MAP[from] === to) return WuXingRelation.Generates;
  if (SHENG_MAP[to] === from) return WuXingRelation.GeneratedBy;
  if (KE_MAP[from] === to) return WuXingRelation.Overcomes;
  if (KE_MAP[to] === from) return WuXingRelation.OvercomeBy;
  throw new Error(`Unexpected relation: ${from} -> ${to}`);
}
```

### 4. 幸运五行推算

幸运五行 = 最需要补充的五行（用于生成"今日幸运"建议）：

```typescript
/**
 * 推算幸运五行
 * 
 * 策略：
 * 1. 如果有缺失五行 → 最需要的缺失五行
 * 2. 如果日主偏弱 → 生日主的五行
 * 3. 如果日主偏旺 → 克日主的五行（泄旺气）
 * 4. 如果平衡 → 与日主同类
 */
export function getLuckyElement(
  dominant: WuXing,
  distribution: Record<WuXing, number>,
  strength: Record<WuXing, WuXingStrength>
): WuXing {
  // 1. 检查缺失
  const missing = Object.entries(distribution)
    .filter(([_, count]) => count === 0)
    .map(([element]) => element as WuXing);

  if (missing.length > 0) {
    // 优先补充生日主的缺失五行
    const generatesMe = Object.entries(SHENG_MAP)
      .find(([_, target]) => target === dominant)?.[0] as WuXing;
    if (missing.includes(generatesMe)) return generatesMe;
    return missing[0];
  }

  // 2. 日主偏弱 → 生我
  const dominantStrength = strength[dominant];
  if (dominantStrength <= WuXingStrength.Weak) {
    return Object.entries(SHENG_MAP)
      .find(([_, target]) => target === dominant)![0] as WuXing;
  }

  // 3. 日主偏旺 → 克我（泄气）
  if (dominantStrength >= WuXingStrength.Strong) {
    return SHENG_MAP[dominant]; // 我生 → 泄气
  }

  // 4. 平衡 → 同类
  return dominant;
}
```

## 地支藏干

每个地支中"藏"有 1-3 个天干，影响五行分布的精确计算：

```typescript
/** 地支藏干表 */
const HIDDEN_STEMS: Record<DiZhi, TianGan[]> = {
  [DiZhi.Zi]:   [TianGan.Gui],                         // 子藏癸
  [DiZhi.Chou]: [TianGan.Ji, TianGan.Gui, TianGan.Xin],// 丑藏己癸辛
  [DiZhi.Yin]:  [TianGan.Jia, TianGan.Bing, TianGan.Wu],// 寅藏甲丙戊
  [DiZhi.Mao]:  [TianGan.Yi],                           // 卯藏乙
  [DiZhi.Chen]: [TianGan.Wu, TianGan.Yi, TianGan.Gui],  // 辰藏戊乙癸
  [DiZhi.Si]:   [TianGan.Bing, TianGan.Wu, TianGan.Geng],// 巳藏丙戊庚
  [DiZhi.Wu]:   [TianGan.Ding, TianGan.Ji],             // 午藏丁己
  [DiZhi.Wei]:  [TianGan.Ji, TianGan.Ding, TianGan.Yi], // 未藏己丁乙
  [DiZhi.Shen]: [TianGan.Geng, TianGan.Ren, TianGan.Wu],// 申藏庚壬戊
  [DiZhi.You]:  [TianGan.Xin],                           // 酉藏辛
  [DiZhi.Xu]:   [TianGan.Wu, TianGan.Xin, TianGan.Ding],// 戌藏戊辛丁
  [DiZhi.Hai]:  [TianGan.Ren, TianGan.Jia],             // 亥藏壬甲
};
```

## 五行与编程映射的衔接

五行分析结果直接驱动编程建议的生成。分析引擎输出 `WuXingAnalysis` 后，由 Fortune Engine 将其映射到具体的编程活动建议：

```
WuXing Analysis                    Programming Mapping
┌────────────────┐                ┌────────────────────┐
│ dominant: 木    │──► 映射表 ──► │ 适合：前端开发、UI设计  │
│ strongest: 火   │                │ 幸运语言：TypeScript   │
│ weakest: 金     │                │ 避免：底层优化          │
│ lucky: 金       │                │ 幸运工具：Linter       │
└────────────────┘                └────────────────────┘
```

映射关系存储在 `wuxing-mapping.json` 中，详见 [干支编程映射手册](../domain/ganzhi-programming-mapping.md)。

## 性能考虑

- 五行关系查表操作为 O(1)
- 单次五行分析（含藏干）计算量 < 100 次基本运算
- 无递归、无循环依赖，内存占用恒定
- 所有查表数据在模块加载时初始化，运行时零分配

## 测试策略

```typescript
describe('WuXingEngine', () => {
  test('相生关系正确', () => {
    expect(getRelation('wood', 'fire')).toBe('generates');
    expect(getRelation('fire', 'wood')).toBe('generated_by');
  });

  test('相克关系正确', () => {
    expect(getRelation('wood', 'earth')).toBe('overcomes');
    expect(getRelation('earth', 'wood')).toBe('overcome_by');
  });

  test('五行分布计算', () => {
    // 甲子年 丙寅月 戊辰日
    const result = calculateDistribution(mockGanZhi);
    expect(result.wood).toBeGreaterThan(0);
    expect(result.earth).toBeGreaterThan(0);
  });

  test('缺失五行检测', () => {
    const analysis = analyzeWuXing(mockGanZhi);
    expect(analysis.missing).toBeDefined();
  });

  test('幸运五行推算', () => {
    const analysis = analyzeWuXing(mockGanZhi);
    expect(Object.values(WuXing)).toContain(analysis.luckyElement);
  });
});
```
