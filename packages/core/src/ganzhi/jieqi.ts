/**
 * 节气日期计算 — 基于太阳视黄经的天文算法。
 *
 * 使用 Meeus《Astronomical Algorithms》低精度太阳位置公式 + 牛顿迭代求解
 * 太阳到达指定黄经的时刻，精度约几分钟，对"日"级别的干支推算绰绰有余。
 *
 * 节气日期按中国标准时间（UTC+8）取日，与万年历惯例一致。
 * 适用范围：1900-2100 年。
 */

const DEG = Math.PI / 180;
const MS_PER_HOUR = 3600 * 1000;

/**
 * 各公历月对应的"节"（月首节气）的太阳黄经（度）。
 * 一月小寒 285°、二月立春 315°、三月惊蛰 345°、四月清明 15°、
 * 五月立夏 45°、六月芒种 75°、七月小暑 105°、八月立秋 135°、
 * 九月白露 165°、十月寒露 195°、十一月立冬 225°、十二月大雪 255°。
 */
const JIE_LONGITUDE = [285, 315, 345, 15, 45, 75, 105, 135, 165, 195, 225, 255];

/** 太阳视黄经（度，0-360），jde 为儒略历书时 */
function solarLongitude(jde: number): number {
  const T = (jde - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) * DEG;
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * M) +
    0.000289 * Math.sin(3 * M);
  const omega = (125.04 - 1934.136 * T) * DEG;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(omega);
  return ((lambda % 360) + 360) % 360;
}

/** ΔT（历书时与世界时之差，秒）的长期抛物线近似，误差 <1 分钟 */
function deltaTSeconds(year: number): number {
  const u = (year - 1820) / 100;
  return -20 + 32 * u * u;
}

/** 求太阳到达 targetDeg 黄经的时刻（UTC 毫秒），在指定年月附近搜索 */
function findSolarTermMs(year: number, month: number, targetDeg: number): number {
  // 初始猜测：当月 4 日；节气均落在每月 3-9 日之间，迭代必然收敛到当月节气
  let ms = Date.UTC(year, month - 1, 4);
  for (let i = 0; i < 6; i++) {
    const jdUT = ms / 86400000 + 2440587.5;
    const jde = jdUT + deltaTSeconds(year) / 86400;
    const lambda = solarLongitude(jde);
    const diff = ((targetDeg - lambda + 540) % 360) - 180;
    if (Math.abs(diff) < 1e-7) break;
    ms += diff * (365.2422 / 360) * 86400000;
  }
  return ms;
}

const jieDayCache = new Map<number, number>();

/**
 * 返回某年某公历月的"节"（月柱分界节气）在东八区的日期（当月几号）。
 * @param year 公历年（1900-2100）
 * @param month 公历月（1-12）
 */
export function getJieDay(year: number, month: number): number {
  const key = year * 100 + month;
  const cached = jieDayCache.get(key);
  if (cached !== undefined) return cached;

  const ms = findSolarTermMs(year, month, JIE_LONGITUDE[month - 1]);
  const day = new Date(ms + 8 * MS_PER_HOUR).getUTCDate();
  jieDayCache.set(key, day);
  return day;
}

/** 返回某年立春在东八区的日期（2 月几号） */
export function getLiChunDay(year: number): number {
  return getJieDay(year, 2);
}
