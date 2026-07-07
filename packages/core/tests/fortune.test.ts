import { describe, it, expect } from 'vitest';
import { getDailyFortune } from '../src/fortune/pipeline.js';
import { calculateScore, scoreToLevel, evaluateDayMaster } from '../src/fortune/scorer.js';
import { WuXing } from '../src/types.js';
import type { WuXingAnalysis } from '../src/types.js';
import { generateYiJi, deterministicSelect } from '../src/fortune/yiji.js';
import { getGanZhi } from '../src/ganzhi/calculator.js';
import { analyzeWuXing } from '../src/wuxing/analyzer.js';

describe('fortune/scorer', () => {
  it('scoreToLevel maps score ranges correctly', () => {
    expect(scoreToLevel(90)).toBe('great');
    expect(scoreToLevel(85)).toBe('great');
    expect(scoreToLevel(75)).toBe('good');
    expect(scoreToLevel(70)).toBe('good');
    expect(scoreToLevel(50)).toBe('neutral');
    expect(scoreToLevel(45)).toBe('neutral');
    expect(scoreToLevel(30)).toBe('bad');
    expect(scoreToLevel(25)).toBe('bad');
    expect(scoreToLevel(10)).toBe('terrible');
    expect(scoreToLevel(0)).toBe('terrible');
  });

  it('calculateScore returns score 0-100 and valid level', () => {
    const ganzhi = getGanZhi(new Date(2024, 2, 15));
    const wuxing = analyzeWuXing(ganzhi);
    const result = calculateScore(wuxing);

    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(['great', 'good', 'neutral', 'bad', 'terrible']).toContain(result.level);
    expect(result.breakdown.balance).toBeGreaterThanOrEqual(0);
    expect(result.breakdown.dayMasterStrength).toBeGreaterThanOrEqual(0);
    expect(result.breakdown.harmony).toBeGreaterThanOrEqual(0);
  });
});

describe('fortune/evaluateDayMaster', () => {
  function withRatio(ratio: number): WuXingAnalysis {
    const dom = ratio * 10;
    const rest = (10 - dom) / 4;
    return {
      dominant: WuXing.Mu,
      distribution: {
        [WuXing.Mu]: dom,
        [WuXing.Huo]: rest,
        [WuXing.Tu]: rest,
        [WuXing.Jin]: rest,
        [WuXing.Shui]: rest,
      },
    } as WuXingAnalysis;
  }

  it('scores 30 in the ideal 15%-35% range', () => {
    expect(evaluateDayMaster(withRatio(0.15))).toBe(30);
    expect(evaluateDayMaster(withRatio(0.25))).toBe(30);
    expect(evaluateDayMaster(withRatio(0.35))).toBe(30);
  });

  it('is monotonically non-decreasing below the ideal range', () => {
    let prev = -1;
    for (let r = 0; r <= 0.15; r += 0.01) {
      const score = evaluateDayMaster(withRatio(r));
      expect(score).toBeGreaterThanOrEqual(prev);
      prev = score;
    }
  });

  it('is monotonically non-increasing above the ideal range (no jump at 0.5)', () => {
    let prev = 31;
    for (let r = 0.35; r <= 1.0; r += 0.01) {
      const score = evaluateDayMaster(withRatio(r));
      expect(score).toBeLessThanOrEqual(prev);
      prev = score;
    }
    expect(evaluateDayMaster(withRatio(1))).toBe(0);
  });
});

describe('fortune/yiji', () => {
  it('deterministicSelect returns same item for same date', () => {
    const items = ['a', 'b', 'c', 'd'];
    const d = new Date(2024, 2, 15);
    const r1 = deterministicSelect(items, d);
    const r2 = deterministicSelect(items, d);
    expect(r1).toBe(r2);
  });

  it('deterministicSelect returns different items for different dates', () => {
    const items = ['a', 'b', 'c', 'd', 'e', 'f', 'g'];
    const results = new Set<string>();
    for (let i = 1; i <= 30; i++) {
      results.add(deterministicSelect(items, new Date(2024, 2, i)));
    }
    // Should have some variety
    expect(results.size).toBeGreaterThan(1);
  });

  it('generateYiJi returns valid result', () => {
    const ganzhi = getGanZhi(new Date(2024, 2, 15));
    const wuxing = analyzeWuXing(ganzhi);
    const result = generateYiJi(wuxing, new Date(2024, 2, 15));

    expect(result.yi.length).toBeGreaterThan(0);
    expect(result.yi.length).toBeLessThanOrEqual(5);
    expect(result.ji.length).toBeGreaterThan(0);
    expect(result.ji.length).toBeLessThanOrEqual(3);
    expect(typeof result.luckyLanguage).toBe('string');
    expect(typeof result.luckyTool).toBe('string');
  });
});

describe('fortune/pipeline', () => {
  it('getDailyFortune returns complete Fortune object', () => {
    const fortune = getDailyFortune(new Date(2024, 2, 15));

    expect(fortune.date).toBe('2024-03-15');
    expect(fortune.ganzhi.year).toBeDefined();
    expect(fortune.ganzhi.month).toBeDefined();
    expect(fortune.ganzhi.day).toBeDefined();
    expect(fortune.wuxing.dominant).toBeDefined();
    expect(fortune.wuxing.luckyElement).toBeDefined();
    expect(fortune.fortune.score).toBeGreaterThanOrEqual(0);
    expect(fortune.fortune.score).toBeLessThanOrEqual(100);
    expect(fortune.fortune.overview).toBeTruthy();
    expect(fortune.fortune.yi.length).toBeGreaterThan(0);
    expect(fortune.fortune.ji.length).toBeGreaterThan(0);
    expect(fortune.fortune.luckyLang).toBeTruthy();
    expect(fortune.fortune.luckyTool).toBeTruthy();
  });

  it('same date produces same fortune (deterministic)', () => {
    const d = new Date(2024, 5, 15);
    const f1 = getDailyFortune(d);
    const f2 = getDailyFortune(d);
    expect(f1).toEqual(f2);
  });

  it('different dates can produce different results', () => {
    const f1 = getDailyFortune(new Date(2024, 0, 1));
    const f2 = getDailyFortune(new Date(2024, 6, 1));
    // At minimum, the date string should differ
    expect(f1.date).not.toBe(f2.date);
  });
});
