import { describe, it, expect } from 'vitest';
import { getGanZhi, getDayPillar, getYearPillar } from '../src/ganzhi/calculator.js';
import { getTianGanInfo, getDiZhiInfo, getNayin, getJiaZiIndex, getHiddenStems } from '../src/ganzhi/data.js';
import { WuXing } from '../src/types.js';

describe('ganzhi/data', () => {
  it('getTianGanInfo returns correct data', () => {
    const jia = getTianGanInfo(0);
    expect(jia.name).toBe('甲');
    expect(jia.wuxing).toBe(WuXing.Mu);

    const gui = getTianGanInfo(9);
    expect(gui.name).toBe('癸');
    expect(gui.wuxing).toBe(WuXing.Shui);
  });

  it('getDiZhiInfo returns correct data', () => {
    const zi = getDiZhiInfo(0);
    expect(zi.name).toBe('子');
    expect(zi.wuxing).toBe(WuXing.Shui);
    expect(zi.shengxiao).toBe('鼠');

    const hai = getDiZhiInfo(11);
    expect(hai.name).toBe('亥');
    expect(hai.shengxiao).toBe('猪');
  });

  it('getNayin returns correct nayin', () => {
    expect(getNayin(0)).toBe('海中金'); // 甲子
    expect(getNayin(1)).toBe('海中金'); // 乙丑
  });

  it('getJiaZiIndex computes correct index', () => {
    // 甲子 = 0
    expect(getJiaZiIndex(0, 0)).toBe(0);
    // 乙丑 = 1
    expect(getJiaZiIndex(1, 1)).toBe(1);
  });

  it('getHiddenStems returns hidden stems for each branch', () => {
    const ziHidden = getHiddenStems(getDiZhiInfo(0)); // 子
    expect(ziHidden.length).toBeGreaterThan(0);
    // 子中藏干：癸
    expect(ziHidden.some(h => h.name === '癸')).toBe(true);
  });
});

describe('ganzhi/calculator', () => {
  it('getDayPillar: 2000-01-07 should be 甲子', () => {
    const pillar = getDayPillar(new Date(2000, 0, 7));
    expect(pillar.display).toBe('甲子');
    expect(pillar.index).toBe(0);
  });

  it('getDayPillar: 2000-01-08 should be 乙丑', () => {
    const pillar = getDayPillar(new Date(2000, 0, 8));
    expect(pillar.display).toBe('乙丑');
    expect(pillar.index).toBe(1);
  });

  it('getYearPillar: 2024 should be 甲辰', () => {
    // After lichun (Feb 4), so 2024 year
    const pillar = getYearPillar(new Date(2024, 2, 15)); // Mar 15, 2024
    expect(pillar.tianGan.name).toBe('甲');
    expect(pillar.diZhi.name).toBe('辰');
    expect(pillar.display).toBe('甲辰');
  });

  it('getYearPillar: before lichun uses previous year', () => {
    // Jan 15, 2024 is before lichun, so should use 2023 year = 癸卯
    const pillar = getYearPillar(new Date(2024, 0, 15));
    expect(pillar.display).toBe('癸卯');
  });

  it('getGanZhi returns full result with 3 pillars', () => {
    const result = getGanZhi(new Date(2024, 2, 15));
    expect(result.year).toBeDefined();
    expect(result.month).toBeDefined();
    expect(result.day).toBeDefined();
    expect(result.solarDate).toBeInstanceOf(Date);
  });

  it('getGanZhi throws for out-of-range dates', () => {
    expect(() => getGanZhi(new Date(1800, 0, 1))).toThrow();
    expect(() => getGanZhi(new Date(2200, 0, 1))).toThrow();
  });

  it('same date always produces same result (deterministic)', () => {
    const d = new Date(2026, 3, 10);
    const r1 = getGanZhi(d);
    const r2 = getGanZhi(d);
    expect(r1.day.display).toBe(r2.day.display);
    expect(r1.year.display).toBe(r2.year.display);
    expect(r1.month.display).toBe(r2.month.display);
  });
});
