import type { Locale } from '@devfortune/core';

export type { Locale };

export interface UiStrings {
  subtitle: string;
  footer: string;
  loading: string;
  today: string;
  share: string;
  sharing: string;
  yi: string;
  ji: string;
  dominant: string;
  luckyElement: string;
  luckyLang: string;
  luckyTool: string;
  prevDay: string;
  nextDay: string;
}

export const STRINGS: Record<Locale, UiStrings> = {
  'zh-CN': {
    subtitle: '程序员每日运势 · 基于天干地支与五行',
    footer: '仅供娱乐参考，代码质量还是靠实力 💻',
    loading: '推算中…',
    today: '今天',
    share: '保存分享卡片',
    sharing: '生成中…',
    yi: '宜',
    ji: '忌',
    dominant: '日主',
    luckyElement: '幸运五行',
    luckyLang: '幸运语言',
    luckyTool: '幸运工具',
    prevDay: '前一天',
    nextDay: '后一天',
  },
  'en-US': {
    subtitle: 'Daily developer fortune · powered by GanZhi & the Five Elements',
    footer: 'For entertainment only — code quality still comes from skill 💻',
    loading: 'Consulting the elements…',
    today: 'Today',
    share: 'Save share card',
    sharing: 'Rendering…',
    yi: 'Do',
    ji: 'Avoid',
    dominant: 'Day master',
    luckyElement: 'Lucky element',
    luckyLang: 'Lucky language',
    luckyTool: 'Lucky tool',
    prevDay: 'Previous day',
    nextDay: 'Next day',
  },
};

export const LEVEL_LABELS: Record<Locale, Record<string, string>> = {
  'zh-CN': { great: '大吉', good: '小吉', neutral: '平', bad: '小凶', terrible: '大凶' },
  'en-US': { great: 'Excellent', good: 'Good', neutral: 'Neutral', bad: 'Rough', terrible: 'Dreadful' },
};

export const ELEMENT_NAMES: Record<Locale, Record<string, string>> = {
  'zh-CN': { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
  'en-US': { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
};

const LOCALE_STORAGE_KEY = 'devfortune.locale';

export function loadLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved === 'zh-CN' || saved === 'en-US') return saved;
  } catch {
    // localStorage 不可用（隐私模式等）时忽略
  }
  if (typeof navigator !== 'undefined' && navigator.language.toLowerCase().startsWith('en')) {
    return 'en-US';
  }
  return 'zh-CN';
}

export function saveLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // 忽略写入失败
  }
}
