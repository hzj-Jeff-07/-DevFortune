import { describe, it, expect } from 'vitest';
import { displayWidth } from '../src/output/width.js';
import { formatText } from '../src/output/text.js';
import { getDailyFortune } from '@devfortune/core';

describe('displayWidth', () => {
  it('counts ASCII as 1 column', () => {
    expect(displayWidth('abc123')).toBe(6);
  });

  it('counts CJK as 2 columns', () => {
    expect(displayWidth('五行')).toBe(4);
    expect(displayWidth('丙午年 乙未月')).toBe(13); // 6 个汉字 + 1 空格
  });

  it('counts fullwidth punctuation as 2 columns', () => {
    expect(displayWidth('宜：')).toBe(4);
  });

  it('counts emoji as 2 columns', () => {
    expect(displayWidth('💡')).toBe(2);
  });

  it('mixed text', () => {
    expect(displayWidth('五行：水  幸运元素：金')).toBe(22);
  });
});

describe('bordered output alignment', () => {
  it('every line has identical display width (right border aligned)', () => {
    for (const locale of ['zh-CN', 'en-US'] as const) {
      const fortune = getDailyFortune(new Date(2026, 6, 7), { locale });
      const output = formatText(fortune, { noColor: true, locale });
      const lines = output.split('\n');
      const widths = new Set(lines.map(displayWidth));
      expect(widths.size).toBe(1);
    }
  });

  it('detail section renders and stays aligned', () => {
    const fortune = getDailyFortune(new Date(2026, 6, 7));
    const detail = {
      distribution: { wood: 1.5, fire: 3, earth: 2, metal: 0.5, water: 1 },
      strength: { wood: 2, fire: 4, earth: 3, metal: 1, water: 2 },
      missing: [],
    };
    const output = formatText(fortune, { noColor: true, detail });
    expect(output).toContain('五行分析');
    expect(output).toContain('极弱');
    expect(output).toContain('无');
    const widths = new Set(output.split('\n').map(displayWidth));
    expect(widths.size).toBe(1);
  });
});
