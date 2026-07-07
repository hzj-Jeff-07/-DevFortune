import type { WuXingAnalysis, WuXingMapping, YiJiResult } from '../types.js';
import { SHENG_MAP, KE_MAP } from '../wuxing/analyzer.js';
import { DEFAULT_MAPPING } from '../templates/mapping.js';

/** 日期种子（确保同一天结果一致） */
function dateToSeed(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return y * 10000 + m * 100 + d;
}

/** 32 位整数混淆，让相邻日期的选择不呈顺序轮转 */
function mix(n: number): number {
  let h = n | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h ^= h >>> 16;
  return h >>> 0;
}

/** 确定性选择；salt 用于同一天内多处选择互不相关 */
export function deterministicSelect<T>(items: T[], date: Date, salt = 0): T {
  const seed = mix(dateToSeed(date) ^ Math.imul(salt, 0x9e3779b9));
  const index = seed % items.length;
  return items[index];
}

/** 生成宜忌 */
export function generateYiJi(
  wuxing: WuXingAnalysis,
  date: Date,
  mapping?: WuXingMapping
): YiJiResult {
  const map = mapping ?? DEFAULT_MAPPING;
  const dominantKey = wuxing.dominant;
  const dominantMapping = map.mappings[dominantKey];

  if (!dominantMapping) {
    return {
      yi: ['写代码', '读文档', '喝咖啡'],
      ji: ['删库', '加班'],
      luckyLanguage: 'TypeScript',
      luckyTool: 'VS Code',
    };
  }

  // 宜：dominant 元素的 themes + 被 dominant 相生元素的 themes 取 1 条
  const yi: string[] = [...dominantMapping.themes];
  const generatedElement = SHENG_MAP[dominantKey];
  const generatedMapping = map.mappings[generatedElement];
  if (generatedMapping && generatedMapping.themes.length > 0) {
    yi.push(deterministicSelect(generatedMapping.themes, date, 1));
  }

  // 忌：被 dominant 相克元素的 unlucky + dominant 自身的 unlucky
  const ji: string[] = [];
  const overcomeElement = KE_MAP[dominantKey];
  const overcomeMapping = map.mappings[overcomeElement];
  if (overcomeMapping) {
    ji.push(overcomeMapping.unlucky.activity);
  }
  ji.push(dominantMapping.unlucky.activity);

  return {
    yi: yi.slice(0, 5),
    ji: ji.slice(0, 3),
    luckyLanguage: dominantMapping.lucky.language,
    luckyTool: dominantMapping.lucky.tool,
  };
}
