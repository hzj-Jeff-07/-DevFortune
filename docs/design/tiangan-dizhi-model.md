# 天干地支数据模型设计

## 概述

天干地支（简称"干支"）是中国传统历法的核心计算体系。DevFortune 将其建模为类型安全的 TypeScript 数据结构，用于推导每日的五行属性和运势基础数据。

## 基础概念

### 十天干

天干共十个，循环使用，每个天干对应一个五行属性和阴阳极性：

| 序号 | 天干 | 拼音 | 五行 | 阴阳 |
|------|------|------|------|------|
| 0 | 甲 | jiǎ | 木 | 阳 |
| 1 | 乙 | yǐ | 木 | 阴 |
| 2 | 丙 | bǐng | 火 | 阳 |
| 3 | 丁 | dīng | 火 | 阴 |
| 4 | 戊 | wù | 土 | 阳 |
| 5 | 己 | jǐ | 土 | 阴 |
| 6 | 庚 | gēng | 金 | 阳 |
| 7 | 辛 | xīn | 金 | 阴 |
| 8 | 壬 | rén | 水 | 阳 |
| 9 | 癸 | guǐ | 水 | 阴 |

### 十二地支

地支共十二个，循环使用，每个地支对应五行、阴阳以及生肖：

| 序号 | 地支 | 拼音 | 五行 | 阴阳 | 生肖 | 时辰 |
|------|------|------|------|------|------|------|
| 0 | 子 | zǐ | 水 | 阳 | 鼠 | 23:00-01:00 |
| 1 | 丑 | chǒu | 土 | 阴 | 牛 | 01:00-03:00 |
| 2 | 寅 | yín | 木 | 阳 | 虎 | 03:00-05:00 |
| 3 | 卯 | mǎo | 木 | 阴 | 兔 | 05:00-07:00 |
| 4 | 辰 | chén | 土 | 阳 | 龙 | 07:00-09:00 |
| 5 | 巳 | sì | 火 | 阴 | 蛇 | 09:00-11:00 |
| 6 | 午 | wǔ | 火 | 阳 | 马 | 11:00-13:00 |
| 7 | 未 | wèi | 土 | 阴 | 羊 | 13:00-15:00 |
| 8 | 申 | shēn | 金 | 阳 | 猴 | 15:00-17:00 |
| 9 | 酉 | yǒu | 金 | 阴 | 鸡 | 17:00-19:00 |
| 10 | 戌 | xū | 土 | 阳 | 狗 | 19:00-21:00 |
| 11 | 亥 | hài | 水 | 阴 | 猪 | 21:00-23:00 |

## TypeScript 数据模型

### 枚举定义

```typescript
/** 十天干 */
export enum TianGan {
  Jia = 0,   // 甲
  Yi = 1,    // 乙
  Bing = 2,  // 丙
  Ding = 3,  // 丁
  Wu = 4,    // 戊
  Ji = 5,    // 己
  Geng = 6,  // 庚
  Xin = 7,   // 辛
  Ren = 8,   // 壬
  Gui = 9,   // 癸
}

/** 十二地支 */
export enum DiZhi {
  Zi = 0,    // 子
  Chou = 1,  // 丑
  Yin = 2,   // 寅
  Mao = 3,   // 卯
  Chen = 4,  // 辰
  Si = 5,    // 巳
  Wu = 6,    // 午
  Wei = 7,   // 未
  Shen = 8,  // 申
  You = 9,   // 酉
  Xu = 10,   // 戌
  Hai = 11,  // 亥
}

/** 五行 */
export enum WuXing {
  Mu = 'wood',    // 木
  Huo = 'fire',   // 火
  Tu = 'earth',   // 土
  Jin = 'metal',  // 金
  Shui = 'water', // 水
}

/** 阴阳 */
export enum YinYang {
  Yang = 'yang', // 阳
  Yin = 'yin',   // 阴
}
```

### 核心接口

```typescript
/** 天干信息 */
export interface TianGanInfo {
  index: number;
  name: string;        // 中文名："甲"
  pinyin: string;      // 拼音："jiǎ"
  wuxing: WuXing;      // 五行属性
  yinyang: YinYang;    // 阴阳极性
}

/** 地支信息 */
export interface DiZhiInfo {
  index: number;
  name: string;        // 中文名："子"
  pinyin: string;      // 拼音："zǐ"
  wuxing: WuXing;      // 五行属性
  yinyang: YinYang;    // 阴阳极性
  shengxiao: string;   // 生肖："鼠"
  shichen: string;     // 时辰范围："23:00-01:00"
}

/** 干支柱（一个天干+一个地支的组合） */
export interface GanZhiPillar {
  tianGan: TianGanInfo;
  diZhi: DiZhiInfo;
  /** 六十甲子序号 (0-59) */
  index: number;
  /** 显示文本，如 "甲子" */
  display: string;
  /** 纳音五行 */
  nayin: string;
}

/** 完整干支结果（四柱） */
export interface GanZhiResult {
  /** 年柱 */
  year: GanZhiPillar;
  /** 月柱 */
  month: GanZhiPillar;
  /** 日柱 */
  day: GanZhiPillar;
  /** 时柱（可选，默认取当前时辰） */
  hour?: GanZhiPillar;
  /** 公历日期 */
  solarDate: Date;
  /** 节气信息 */
  jieqi?: JieQiInfo;
}
```

### 节气模型

节气（Solar Terms）决定了月柱的分界。DevFortune 采用立春为年界（参见 [ADR-003](../adr/ADR-003-lichun-year-boundary.md)）：

```typescript
/** 二十四节气 */
export enum JieQi {
  LiChun = 'lichun',       // 立春 — 年界
  YuShui = 'yushui',       // 雨水
  JingZhe = 'jingzhe',     // 惊蛰
  ChunFen = 'chunfen',     // 春分
  QingMing = 'qingming',   // 清明
  GuYu = 'guyu',           // 谷雨
  LiXia = 'lixia',         // 立夏
  XiaoMan = 'xiaoman',     // 小满
  MangZhong = 'mangzhong', // 芒种
  XiaZhi = 'xiazhi',       // 夏至
  XiaoShu = 'xiaoshu',     // 小暑
  DaShu = 'dashu',         // 大暑
  LiQiu = 'liqiu',         // 立秋
  ChuShu = 'chushu',       // 处暑
  BaiLu = 'bailu',         // 白露
  QiuFen = 'qiufen',       // 秋分
  HanLu = 'hanlu',         // 寒露
  ShuangJiang = 'shuangjing', // 霜降
  LiDong = 'lidong',       // 立冬
  XiaoXue = 'xiaoxue',     // 小雪
  DaXue = 'daxue',         // 大雪
  DongZhi = 'dongzhi',     // 冬至
  XiaoHan = 'xiaohan',     // 小寒
  DaHan = 'dahan',         // 大寒
}

/** 节气信息 */
export interface JieQiInfo {
  name: JieQi;
  displayName: string;     // "立春"
  date: Date;              // 精确到分钟
  isJie: boolean;          // 是否为"节"（月界）
}
```

## 六十甲子表

天干地支两两组合（阳配阳、阴配阴），共 60 组，称为"六十甲子"：

```typescript
/**
 * 计算六十甲子序号
 * 天干 index (0-9) 与地支 index (0-11) 配对
 * 序号 = (tianGan.index, diZhi.index) 在六十甲子中的位置
 */
export function getJiaZiIndex(tg: number, dz: number): number {
  // 天干地支必须同为奇或同为偶
  if (tg % 2 !== dz % 2) {
    throw new Error('Invalid TianGan-DiZhi combination');
  }
  // 使用公式计算：(6 * tg - 5 * dz) mod 60
  return ((6 * tg - 5 * dz) % 60 + 60) % 60;
}
```

## JSON 数据文件格式

### tiangan.json

```json
[
  {
    "index": 0,
    "name": "甲",
    "pinyin": "jiǎ",
    "wuxing": "wood",
    "yinyang": "yang"
  },
  ...
]
```

### dizhi.json

```json
[
  {
    "index": 0,
    "name": "子",
    "pinyin": "zǐ",
    "wuxing": "water",
    "yinyang": "yang",
    "shengxiao": "鼠",
    "shichen": "23:00-01:00"
  },
  ...
]
```

### nayin.json（纳音五行，六十甲子对应）

```json
{
  "甲子": "海中金",
  "乙丑": "海中金",
  "丙寅": "炉中火",
  "丁卯": "炉中火",
  ...
}
```

## 日柱计算算法

日柱是运势计算的基础。采用经典的干支纪日公式：

```typescript
/**
 * 计算指定日期的日柱
 * 基于已知基准日推算
 */
export function getDayPillar(date: Date): GanZhiPillar {
  // 基准日：2000-01-07 为甲子日 (index = 0)
  const BASE_DATE = new Date(2000, 0, 7); // 2000年1月7日
  const BASE_JIAZI = 0;

  const diffDays = Math.floor(
    (date.getTime() - BASE_DATE.getTime()) / (24 * 60 * 60 * 1000)
  );

  const jiaziIndex = ((diffDays % 60) + 60) % 60;
  const tianGanIndex = jiaziIndex % 10;
  const diZhiIndex = jiaziIndex % 12;

  return buildPillar(tianGanIndex, diZhiIndex, jiaziIndex);
}
```

## 年柱计算（以立春为界）

```typescript
/**
 * 计算指定日期的年柱
 * 注意：以立春为年界，非农历正月初一
 */
export function getYearPillar(date: Date): GanZhiPillar {
  const year = date.getFullYear();
  const lichun = getLiChunDate(year); // 获取当年立春精确时间

  // 立春前属于上一年
  const ganzhiYear = date < lichun ? year - 1 : year;

  // 天干：(年份 - 4) % 10 → 甲=0
  const tianGanIndex = (ganzhiYear - 4) % 10;
  // 地支：(年份 - 4) % 12 → 子=0
  const diZhiIndex = (ganzhiYear - 4) % 12;

  const jiaziIndex = getJiaZiIndex(tianGanIndex, diZhiIndex);
  return buildPillar(tianGanIndex, diZhiIndex, jiaziIndex);
}
```

## 数据校验

所有数据文件通过 JSON Schema 校验，确保：

1. **天干索引范围**：0-9
2. **地支索引范围**：0-11
3. **五行值约束**：必须为 `wood | fire | earth | metal | water`
4. **阴阳值约束**：必须为 `yang | yin`
5. **天干地支配对规则**：阳干配阳支，阴干配阴支

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "index": { "type": "integer", "minimum": 0, "maximum": 9 },
    "name": { "type": "string", "minLength": 1, "maxLength": 1 },
    "wuxing": { "enum": ["wood", "fire", "earth", "metal", "water"] },
    "yinyang": { "enum": ["yang", "yin"] }
  },
  "required": ["index", "name", "wuxing", "yinyang"]
}
```

## 与其他模块的关系

```
tiangan-dizhi-model
        │
        ├──► wuxing-engine（提供干支的五行属性作为分析输入）
        │
        ├──► fortune-algorithm（提供日柱/年柱作为运势计算基础）
        │
        └──► ganzhi-programming-mapping（干支属性映射到编程概念）
```
