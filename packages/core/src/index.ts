// @devfortune/core — Public API

// Main entry
export { getDailyFortune } from './fortune/index.js';
export { calculateScore, scoreToLevel } from './fortune/scorer.js';
export { generateYiJi, deterministicSelect } from './fortune/yiji.js';

// GanZhi
export { getGanZhi, getHourPillar, getJieDay, getLiChunDay } from './ganzhi/index.js';
export type { GanZhiOptions } from './ganzhi/index.js';
export {
  getTianGanInfo,
  getDiZhiInfo,
  getNayin,
  getJiaZiIndex,
  getHiddenStems,
} from './ganzhi/data.js';

// WuXing
export { analyzeWuXing, getRelation } from './wuxing/index.js';

// Templates
export {
  getDefaultTemplates,
  getDefaultMapping,
  DEFAULT_MAPPING,
  DEFAULT_MAPPING_EN,
  DEFAULT_TEMPLATES,
  DEFAULT_TEMPLATES_EN,
} from './templates/index.js';
export type { Locale } from './templates/index.js';

// Types (re-export as types)
export {
  TianGan,
  DiZhi,
  WuXing,
  YinYang,
  WuXingRelation,
  WuXingStrength,
} from './types.js';

export type {
  ScoreLevel,
  TianGanInfo,
  DiZhiInfo,
  GanZhiPillar,
  GanZhiResult,
  WuXingAnalysis,
  YiJiResult,
  ScoreBreakdown,
  ScoreResult,
  FortuneTemplate,
  FortuneTemplateFile,
  Fortune,
  WuXingMappingElement,
  WuXingMapping,
  FortuneOptions,
} from './types.js';

// Error classes
export {
  DateOutOfRangeError,
  GanZhiCalculationError,
  TemplateNotFoundError,
} from './types.js';
