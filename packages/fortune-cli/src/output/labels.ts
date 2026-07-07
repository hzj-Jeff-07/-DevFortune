import type { Fortune } from '@devfortune/core';

export type CliLocale = 'zh-CN' | 'en-US';

export interface LabelSet {
  /** 键值分隔符：中文全角"："，英文半角": " */
  colon: string;
  wuxing: string;
  luckyElement: string;
  yi: string;
  ji: string;
  luckyLang: string;
  luckyTool: string;
  fortune: string;
  score: string;
  mdTitle: string;
  mdGanzhi: string;
  mdWuxing: string;
  mdFortune: string;
  detailTitle: string;
  distribution: string;
  strengthLabel: string;
  missing: string;
  none: string;
  elements: Record<string, string>;
  levels: Record<string, string>;
  /** 五行强度 1-5 级的名称 */
  strengthNames: Record<number, string>;
  ganzhiLine: (ganzhi: Fortune['ganzhi']) => string;
}

const ZH: LabelSet = {
  colon: '：',
  wuxing: '五行',
  luckyElement: '幸运元素',
  yi: '宜',
  ji: '忌',
  luckyLang: '幸运编程语言',
  luckyTool: '幸运开发工具',
  fortune: '运势',
  score: '评分',
  mdTitle: '程序员运势',
  mdGanzhi: '干支',
  mdWuxing: '五行',
  mdFortune: '运势',
  detailTitle: '五行分析',
  distribution: '分布',
  strengthLabel: '强度',
  missing: '缺',
  none: '无',
  elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
  levels: { great: '大吉', good: '吉', neutral: '平', bad: '凶', terrible: '大凶' },
  strengthNames: { 1: '极弱', 2: '弱', 3: '平衡', 4: '旺', 5: '极旺' },
  ganzhiLine: g => `${g.year}年 ${g.month}月 ${g.day}日${g.hour ? ` ${g.hour}时` : ''}`,
};

const EN: LabelSet = {
  colon: ': ',
  wuxing: 'Element',
  luckyElement: 'Lucky element',
  yi: 'Do',
  ji: 'Avoid',
  luckyLang: 'Lucky language',
  luckyTool: 'Lucky tool',
  fortune: 'Fortune',
  score: 'Score',
  mdTitle: 'Developer Fortune',
  mdGanzhi: 'GanZhi',
  mdWuxing: 'Element',
  mdFortune: 'Fortune',
  detailTitle: 'Element analysis',
  distribution: 'Distribution',
  strengthLabel: 'Strength',
  missing: 'Missing',
  none: 'none',
  elements: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
  levels: { great: 'Excellent', good: 'Good', neutral: 'Neutral', bad: 'Rough', terrible: 'Dreadful' },
  strengthNames: { 1: 'Very weak', 2: 'Weak', 3: 'Balanced', 4: 'Strong', 5: 'Very strong' },
  ganzhiLine: g =>
    `Year ${g.year} · Month ${g.month} · Day ${g.day}${g.hour ? ` · Hour ${g.hour}` : ''}`,
};

export function getLabels(locale?: CliLocale): LabelSet {
  return locale === 'en-US' ? EN : ZH;
}

/** 解析 CLI 语言：显式参数 > 环境变量 > zh-CN（见 ADR-008 优先级） */
export function resolveLocale(lang?: string): CliLocale {
  if (lang === 'en' || lang === 'en-US') return 'en-US';
  if (lang === 'zh' || lang === 'zh-CN') return 'zh-CN';
  const env = process.env.LC_ALL || process.env.LC_MESSAGES || process.env.LANG || '';
  if (env.toLowerCase().startsWith('en')) return 'en-US';
  return 'zh-CN';
}
