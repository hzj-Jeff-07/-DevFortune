import type { FortuneTemplate } from '../types.js';
import { DEFAULT_TEMPLATES } from './defaults.js';

export { DEFAULT_MAPPING } from './mapping.js';
export { DEFAULT_TEMPLATES } from './defaults.js';

export function getDefaultTemplates(): FortuneTemplate[] {
  return DEFAULT_TEMPLATES;
}
