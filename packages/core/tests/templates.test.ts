import { describe, it, expect } from 'vitest';
import {
  DEFAULT_TEMPLATES,
  DEFAULT_TEMPLATES_EN,
  getDefaultTemplates,
  getDefaultMapping,
} from '../src/templates/index.js';
import { getDailyFortune } from '../src/fortune/pipeline.js';

const CJK = /[一-鿿]/;

describe('templates/i18n', () => {
  it('en template set mirrors the zh id scheme (ADR-008 parity)', () => {
    const zhIds = new Map(DEFAULT_TEMPLATES.map(t => [t.id, t.sentiment]));
    const enIds = new Map(DEFAULT_TEMPLATES_EN.map(t => [t.id, t.sentiment]));

    expect(enIds.size).toBe(zhIds.size);
    for (const [id, sentiment] of zhIds) {
      expect(enIds.get(id)).toBe(sentiment);
    }
  });

  it('getDefaultTemplates/getDefaultMapping select by locale and fall back to zh-CN', () => {
    expect(getDefaultTemplates('en-US')).toBe(DEFAULT_TEMPLATES_EN);
    expect(getDefaultTemplates('zh-CN')).toBe(DEFAULT_TEMPLATES);
    expect(getDefaultTemplates()).toBe(DEFAULT_TEMPLATES);
    expect(getDefaultMapping('en-US').id).toBe('default-en');
    expect(getDefaultMapping().id).toBe('default');
  });

  it('en templates contain no CJK text', () => {
    for (const t of DEFAULT_TEMPLATES_EN) {
      expect(CJK.test(t.overview)).toBe(false);
      for (const item of [...t.do, ...t.dont]) {
        expect(CJK.test(item)).toBe(false);
      }
      if (t.tip) expect(CJK.test(t.tip)).toBe(false);
    }
  });

  it('getDailyFortune with en-US locale produces English content', () => {
    const f = getDailyFortune(new Date(2024, 2, 15), { locale: 'en-US' });
    expect(CJK.test(f.fortune.overview)).toBe(false);
    for (const item of [...f.fortune.yi, ...f.fortune.ji]) {
      expect(CJK.test(item)).toBe(false);
    }
  });

  it('locale does not change the score, only the wording', () => {
    const d = new Date(2024, 5, 15);
    const zh = getDailyFortune(d);
    const en = getDailyFortune(d, { locale: 'en-US' });
    expect(en.fortune.score).toBe(zh.fortune.score);
    expect(en.fortune.level).toBe(zh.fortune.level);
    expect(en.ganzhi).toEqual(zh.ganzhi);
  });
});
