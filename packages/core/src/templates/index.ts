import type { FortuneTemplate, WuXingMapping } from '../types.js';
import { DEFAULT_TEMPLATES } from './defaults.js';
import { DEFAULT_TEMPLATES_EN } from './defaults.en.js';
import { DEFAULT_MAPPING } from './mapping.js';
import { DEFAULT_MAPPING_EN } from './mapping.en.js';

export { DEFAULT_MAPPING } from './mapping.js';
export { DEFAULT_MAPPING_EN } from './mapping.en.js';
export { DEFAULT_TEMPLATES } from './defaults.js';
export { DEFAULT_TEMPLATES_EN } from './defaults.en.js';

export type Locale = 'zh-CN' | 'en-US';

/** 按语言返回默认模板集（未知/缺省回退 zh-CN，见 ADR-008） */
export function getDefaultTemplates(locale?: Locale): FortuneTemplate[] {
  return locale === 'en-US' ? DEFAULT_TEMPLATES_EN : DEFAULT_TEMPLATES;
}

/** 按语言返回默认五行映射（未知/缺省回退 zh-CN） */
export function getDefaultMapping(locale?: Locale): WuXingMapping {
  return locale === 'en-US' ? DEFAULT_MAPPING_EN : DEFAULT_MAPPING;
}
