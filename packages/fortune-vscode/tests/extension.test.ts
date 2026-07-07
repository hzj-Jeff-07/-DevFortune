import { describe, it, expect } from 'vitest';
import { getDailyFortune } from '@devfortune/core';
import { getExtensionLabels, resolveExtensionLocale } from '../src/labels';
import { renderSidebarHtml, renderPanelHtml } from '../src/fortune-html';

const fortuneZh = getDailyFortune(new Date(2024, 2, 15));
const fortuneEn = getDailyFortune(new Date(2024, 2, 15), { locale: 'en-US' });

describe('resolveExtensionLocale', () => {
  it('explicit config wins over the VS Code language', () => {
    expect(resolveExtensionLocale('zh-CN', 'en')).toBe('zh-CN');
    expect(resolveExtensionLocale('en-US', 'zh-cn')).toBe('en-US');
  });

  it('auto follows the VS Code display language', () => {
    expect(resolveExtensionLocale('auto', 'en')).toBe('en-US');
    expect(resolveExtensionLocale('auto', 'en-US')).toBe('en-US');
    expect(resolveExtensionLocale('auto', 'zh-cn')).toBe('zh-CN');
    expect(resolveExtensionLocale(undefined, 'ja')).toBe('zh-CN');
  });
});

describe('renderSidebarHtml', () => {
  it('renders Chinese labels and fortune content', () => {
    const html = renderSidebarHtml(fortuneZh, getExtensionLabels('zh-CN'));
    expect(html).toContain('2024-03-15');
    expect(html).toContain('宜');
    expect(html).toContain(fortuneZh.fortune.overview);
    expect(html).toContain(fortuneZh.fortune.luckyLang);
  });

  it('renders English labels with English fortune', () => {
    const html = renderSidebarHtml(fortuneEn, getExtensionLabels('en-US'));
    expect(html).toContain('Do');
    expect(html).toContain('Avoid');
    expect(html).toContain(fortuneEn.fortune.overview);
    expect(html).not.toContain('宜');
  });
});

describe('renderPanelHtml', () => {
  it('renders a full panel with all sections', () => {
    const html = renderPanelHtml(fortuneZh, getExtensionLabels('zh-CN'));
    expect(html).toContain(fortuneZh.date);
    expect(html).toContain(String(fortuneZh.fortune.score));
    for (const item of fortuneZh.fortune.yi) {
      expect(html).toContain(item);
    }
  });
});
