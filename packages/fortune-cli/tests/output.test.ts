import { describe, it, expect } from 'vitest';
import { formatMarkdown } from '../src/output/markdown.js';
import { formatText } from '../src/output/text.js';
import { getDailyFortune } from '@devfortune/core';

const fortune = getDailyFortune(new Date(2024, 2, 15));

describe('formatText', () => {
  it('returns string output', () => {
    const result = formatText(fortune);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains date and ganzhi info', () => {
    const result = formatText(fortune, { noColor: true });
    expect(result).toContain('2024-03-15');
  });

  it('contains yi and ji items', () => {
    const result = formatText(fortune, { noColor: true });
    for (const item of fortune.fortune.yi) {
      expect(result).toContain(item);
    }
    for (const item of fortune.fortune.ji) {
      expect(result).toContain(item);
    }
  });

  it('raw mode removes box borders', () => {
    const result = formatText(fortune, { raw: true });
    expect(result).not.toContain('╭');
    expect(result).not.toContain('╰');
    expect(result).toContain('2024-03-15');
  });

  it('noColor mode removes ANSI codes', () => {
    const result = formatText(fortune, { noColor: true });
    expect(result).not.toContain('\x1b[');
  });
});

describe('hour pillar rendering', () => {
  const withHour = {
    ...fortune,
    ganzhi: { ...fortune.ganzhi, hour: '庚午' },
  };

  it('formatText shows hour pillar when present', () => {
    expect(formatText(withHour, { noColor: true })).toContain('庚午时');
    expect(formatText(fortune, { noColor: true })).not.toContain('庚午时');
  });

  it('formatMarkdown shows hour pillar when present', () => {
    expect(formatMarkdown(withHour)).toContain('庚午时');
  });
});

describe('formatMarkdown', () => {
  it('returns valid markdown', () => {
    const result = formatMarkdown(fortune);
    expect(result).toContain('## 2024-03-15');
    expect(result).toContain('**干支：**');
    expect(result).toContain('**运势：**');
  });

  it('contains yi list as markdown bullets', () => {
    const result = formatMarkdown(fortune);
    for (const item of fortune.fortune.yi) {
      expect(result).toContain(`- ${item}`);
    }
  });

  it('contains ji list as markdown bullets', () => {
    const result = formatMarkdown(fortune);
    for (const item of fortune.fortune.ji) {
      expect(result).toContain(`- ${item}`);
    }
  });

  it('contains lucky items', () => {
    const result = formatMarkdown(fortune);
    expect(result).toContain(fortune.fortune.luckyLang);
    expect(result).toContain(fortune.fortune.luckyTool);
  });
});
