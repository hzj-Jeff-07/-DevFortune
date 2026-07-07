import { describe, it, expect } from 'vitest';
import { getGanZhi, getDayPillar, getYearPillar, getHourPillar } from '../src/ganzhi/calculator.js';
import { getJieDay, getLiChunDay } from '../src/ganzhi/jieqi.js';
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

describe('ganzhi/hourPillar', () => {
  it('甲日子时为甲子时（甲己还加甲）', () => {
    // 2000-01-07 为甲子日
    const pillar = getHourPillar(new Date(2000, 0, 7, 0, 30));
    expect(pillar.display).toBe('甲子');
  });

  it('甲日午时为庚午时', () => {
    const pillar = getHourPillar(new Date(2000, 0, 7, 12, 0));
    expect(pillar.display).toBe('庚午');
  });

  it('丙日巳时为癸巳时（丙辛从戊起）', () => {
    // 2000-01-09 为丙寅日
    expect(getDayPillar(new Date(2000, 0, 9)).display).toBe('丙寅');
    const pillar = getHourPillar(new Date(2000, 0, 9, 9, 30));
    expect(pillar.display).toBe('癸巳');
  });

  it('23 时属次日子时，时干按次日日干推算', () => {
    // 2000-01-07 甲子日 23:30 → 次日乙丑日的子时 → 丙子（乙庚丙作初）
    const pillar = getHourPillar(new Date(2000, 0, 7, 23, 30));
    expect(pillar.display).toBe('丙子');
  });

  it('getGanZhi 默认不含时柱，includeHour 时附加', () => {
    const d = new Date(2000, 0, 7, 12, 0);
    expect(getGanZhi(d).hour).toBeUndefined();
    const withHour = getGanZhi(d, { includeHour: true });
    expect(withHour.hour?.display).toBe('庚午');
  });
});

describe('ganzhi/jieqi', () => {
  it('computes exact lichun days (varies between Feb 3-5)', () => {
    expect(getLiChunDay(2021)).toBe(3);
    expect(getLiChunDay(2024)).toBe(4);
    expect(getLiChunDay(2025)).toBe(3);
    expect(getLiChunDay(2026)).toBe(4);
    expect(getLiChunDay(1900)).toBe(4);
    expect(getLiChunDay(2000)).toBe(4);
  });

  it('computes exact jie days for other months', () => {
    expect(getJieDay(2025, 1)).toBe(5); // 小寒 2025-01-05
    expect(getJieDay(2024, 3)).toBe(5); // 惊蛰 2024-03-05
    expect(getJieDay(2024, 4)).toBe(4); // 清明 2024-04-04
    expect(getJieDay(2024, 6)).toBe(5); // 芒种 2024-06-05
    expect(getJieDay(2024, 11)).toBe(7); // 立冬 2024-11-07
  });

  it('jie days stay within the expected 3-9 window across the full range', () => {
    for (let year = 1900; year <= 2100; year += 10) {
      for (let month = 1; month <= 12; month++) {
        const day = getJieDay(year, month);
        expect(day).toBeGreaterThanOrEqual(3);
        expect(day).toBeLessThanOrEqual(9);
      }
    }
  });

  it('year pillar switches exactly on lichun day', () => {
    // 2025 立春为 2 月 3 日：2 月 2 日仍属甲辰年，2 月 3 日起为乙巳年
    expect(getYearPillar(new Date(2025, 1, 2)).display).toBe('甲辰');
    expect(getYearPillar(new Date(2025, 1, 3)).display).toBe('乙巳');
    // 2024 立春为 2 月 4 日：固定近似表在 2 月 3 日会算错的年份
    expect(getYearPillar(new Date(2024, 1, 3)).display).toBe('癸卯');
    expect(getYearPillar(new Date(2024, 1, 4)).display).toBe('甲辰');
  });
});
