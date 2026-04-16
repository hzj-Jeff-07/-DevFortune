// ============================================================
// Core type definitions for DevFortune
// ============================================================

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
  Yang = 'yang',
  Yin = 'yin',
}

/** 五行关系类型 */
export enum WuXingRelation {
  Generates = 'generates',
  GeneratedBy = 'generated_by',
  Overcomes = 'overcomes',
  OvercomeBy = 'overcome_by',
  Same = 'same',
}

/** 五行强度等级 */
export enum WuXingStrength {
  VeryWeak = 1,
  Weak = 2,
  Balanced = 3,
  Strong = 4,
  VeryStrong = 5,
}

/** 运势等级 */
export type ScoreLevel = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

/** 天干信息 */
export interface TianGanInfo {
  index: number;
  name: string;
  pinyin: string;
  wuxing: WuXing;
  yinyang: YinYang;
}

/** 地支信息 */
export interface DiZhiInfo {
  index: number;
  name: string;
  pinyin: string;
  wuxing: WuXing;
  yinyang: YinYang;
  shengxiao: string;
  shichen: string;
}

/** 干支柱 */
export interface GanZhiPillar {
  tianGan: TianGanInfo;
  diZhi: DiZhiInfo;
  index: number;
  display: string;
  nayin: string;
}

/** 完整干支结果 */
export interface GanZhiResult {
  year: GanZhiPillar;
  month: GanZhiPillar;
  day: GanZhiPillar;
  hour?: GanZhiPillar;
  solarDate: Date;
}

/** 五行分析结果 */
export interface WuXingAnalysis {
  dominant: WuXing;
  distribution: Record<WuXing, number>;
  strength: Record<WuXing, WuXingStrength>;
  strongest: WuXing;
  weakest: WuXing;
  isBalanced: boolean;
  missing: WuXing[];
  luckyElement: WuXing;
}

/** 宜忌结果 */
export interface YiJiResult {
  yi: string[];
  ji: string[];
  luckyLanguage: string;
  luckyTool: string;
}

/** 评分分解 */
export interface ScoreBreakdown {
  balance: number;
  dayMasterStrength: number;
  harmony: number;
}

/** 评分结果 */
export interface ScoreResult {
  score: number;
  level: ScoreLevel;
  breakdown: ScoreBreakdown;
}

/** 运势模板 */
export interface FortuneTemplate {
  id: string;
  sentiment: ScoreLevel;
  overview: string;
  do: string[];
  dont: string[];
  luckyLang?: string;
  luckyTool?: string;
  tip?: string;
}

/** 模板文件 */
export interface FortuneTemplateFile {
  version: string;
  templates: FortuneTemplate[];
}

/** 最终运势输出 */
export interface Fortune {
  date: string;
  ganzhi: {
    year: string;
    month: string;
    day: string;
  };
  wuxing: {
    dominant: string;
    luckyElement: string;
  };
  fortune: {
    score: number;
    level: string;
    overview: string;
    yi: string[];
    ji: string[];
    luckyLang: string;
    luckyTool: string;
    tip?: string;
  };
}

/** 五行映射配置 */
export interface WuXingMappingElement {
  element: string;
  themes: string[];
  lucky: {
    language: string;
    tool: string;
    activity: string;
  };
  unlucky: {
    activity: string;
  };
}

export interface WuXingMapping {
  version: string;
  id: string;
  name: string;
  description: string;
  mappings: Record<string, WuXingMappingElement>;
}

/** 运势生成选项 */
export interface FortuneOptions {
  locale?: 'zh-CN' | 'en-US';
  includeDetail?: boolean;
  mapping?: WuXingMapping;
  templates?: FortuneTemplate[];
}

// Error classes
export class DateOutOfRangeError extends Error {
  readonly supportedRange = {
    min: new Date(1900, 0, 1),
    max: new Date(2100, 11, 31),
  };

  constructor(date: Date) {
    super(`Date ${date.toISOString()} is out of supported range (1900-01-01 to 2100-12-31)`);
    this.name = 'DateOutOfRangeError';
  }
}

export class GanZhiCalculationError extends Error {
  constructor(
    readonly date: Date,
    readonly step: 'year' | 'month' | 'day' | 'hour'
  ) {
    super(`GanZhi calculation error at step "${step}" for date ${date.toISOString()}`);
    this.name = 'GanZhiCalculationError';
  }
}

export class TemplateNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TemplateNotFoundError';
  }
}
