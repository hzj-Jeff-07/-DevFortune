import { describe, it, expect, afterEach } from 'vitest';
import { resolveLocale, getLabels } from '../src/output/labels.js';

const ORIGINAL_ENV = { ...process.env };

afterEach(() => {
  process.env.LC_ALL = ORIGINAL_ENV.LC_ALL;
  process.env.LC_MESSAGES = ORIGINAL_ENV.LC_MESSAGES;
  process.env.LANG = ORIGINAL_ENV.LANG;
});

describe('resolveLocale', () => {
  it('explicit flag wins over environment', () => {
    process.env.LANG = 'en_US.UTF-8';
    expect(resolveLocale('zh')).toBe('zh-CN');
    expect(resolveLocale('en')).toBe('en-US');
    expect(resolveLocale('en-US')).toBe('en-US');
    expect(resolveLocale('zh-CN')).toBe('zh-CN');
  });

  it('falls back to environment language', () => {
    delete process.env.LC_ALL;
    delete process.env.LC_MESSAGES;
    process.env.LANG = 'en_US.UTF-8';
    expect(resolveLocale(undefined)).toBe('en-US');
  });

  it('defaults to zh-CN', () => {
    delete process.env.LC_ALL;
    delete process.env.LC_MESSAGES;
    process.env.LANG = 'zh_CN.UTF-8';
    expect(resolveLocale(undefined)).toBe('zh-CN');
    delete process.env.LANG;
    expect(resolveLocale(undefined)).toBe('zh-CN');
  });
});

describe('getLabels', () => {
  it('returns English labels for en-US', () => {
    const L = getLabels('en-US');
    expect(L.yi).toBe('Do');
    expect(L.ji).toBe('Avoid');
    expect(L.elements.wood).toBe('Wood');
  });

  it('returns Chinese labels by default', () => {
    const L = getLabels();
    expect(L.yi).toBe('宜');
    expect(L.ji).toBe('忌');
    expect(L.elements.wood).toBe('木');
  });
});
