import type { Locale } from '@devfortune/core';

export type { Locale };

/** 扩展 UI 标签（与 CLI/Web 的文案体系保持一致） */
export interface Labels {
  statusBar: string;
  refreshed: string;
  showDetail: string;
  dominant: string;
  luckyElement: string;
  yi: string;
  ji: string;
  luckyLang: string;
  luckyTool: string;
  elements: Record<string, string>;
  levels: Record<string, string>;
}

const ZH: Labels = {
  statusBar: '运势',
  refreshed: 'DevFortune: 运势已刷新',
  showDetail: '查看详情',
  dominant: '日主',
  luckyElement: '幸运',
  yi: '宜',
  ji: '忌',
  luckyLang: '幸运语言',
  luckyTool: '幸运工具',
  elements: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
  levels: { great: '大吉', good: '小吉', neutral: '平', bad: '小凶', terrible: '大凶' },
};

const EN: Labels = {
  statusBar: 'Fortune',
  refreshed: 'DevFortune: fortune refreshed',
  showDetail: 'Details',
  dominant: 'Day master',
  luckyElement: 'Lucky',
  yi: 'Do',
  ji: 'Avoid',
  luckyLang: 'Lucky language',
  luckyTool: 'Lucky tool',
  elements: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
  levels: { great: 'Excellent', good: 'Good', neutral: 'Neutral', bad: 'Rough', terrible: 'Dreadful' },
};

export function getExtensionLabels(locale: Locale): Labels {
  return locale === 'en-US' ? EN : ZH;
}

/**
 * 解析扩展语言：配置显式指定优先，'auto' 时跟随 VS Code 界面语言，回退中文。
 * @param configValue devfortune.language 配置值
 * @param vscodeLanguage vscode.env.language（如 'en'、'zh-cn'）
 */
export function resolveExtensionLocale(
  configValue: string | undefined,
  vscodeLanguage: string
): Locale {
  if (configValue === 'zh-CN' || configValue === 'en-US') return configValue;
  return vscodeLanguage.toLowerCase().startsWith('en') ? 'en-US' : 'zh-CN';
}

export const LEVEL_COLORS: Record<string, string> = {
  great: '#facc15',
  good: '#4ade80',
  neutral: '#a3a3a3',
  bad: '#fb923c',
  terrible: '#f87171',
};
