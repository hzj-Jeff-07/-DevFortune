import type { GanZhiPillar, GanZhiResult } from '../types.js';
import { DateOutOfRangeError } from '../types.js';
import {
  getTianGanInfo,
  getDiZhiInfo,
  getNayin,
  getJiaZiIndex,
} from './data.js';
import { getJieDay, getLiChunDay } from './jieqi.js';

const MIN_DATE = new Date(1900, 0, 1);
const MAX_DATE = new Date(2100, 11, 31);

// 基准日：2000-01-07 为甲子日 (index = 0)
const BASE_DATE = new Date(2000, 0, 7);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** 立春日期（天文精确计算，按东八区取日） */
function getLiChunDate(year: number): Date {
  return new Date(year, 1, getLiChunDay(year));
}

function validateDate(date: Date): void {
  if (date < MIN_DATE || date > MAX_DATE) {
    throw new DateOutOfRangeError(date);
  }
}

function buildPillar(tianGanIndex: number, diZhiIndex: number, jiaziIndex: number): GanZhiPillar {
  const tg = getTianGanInfo(tianGanIndex);
  const dz = getDiZhiInfo(diZhiIndex);
  return {
    tianGan: tg,
    diZhi: dz,
    index: jiaziIndex,
    display: `${tg.name}${dz.name}`,
    nayin: getNayin(jiaziIndex),
  };
}

/** 计算日柱 */
export function getDayPillar(date: Date): GanZhiPillar {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const base = new Date(BASE_DATE.getFullYear(), BASE_DATE.getMonth(), BASE_DATE.getDate());
  const diffDays = Math.round((d.getTime() - base.getTime()) / MS_PER_DAY);

  const jiaziIndex = ((diffDays % 60) + 60) % 60;
  const tianGanIndex = jiaziIndex % 10;
  const diZhiIndex = jiaziIndex % 12;

  return buildPillar(tianGanIndex, diZhiIndex, jiaziIndex);
}

/** 计算年柱（以立春为界） */
export function getYearPillar(date: Date): GanZhiPillar {
  const year = date.getFullYear();
  const lichun = getLiChunDate(year);

  const ganzhiYear = date < lichun ? year - 1 : year;

  const tianGanIndex = ((ganzhiYear - 4) % 10 + 10) % 10;
  const diZhiIndex = ((ganzhiYear - 4) % 12 + 12) % 12;

  const jiaziIndex = getJiaZiIndex(tianGanIndex, diZhiIndex);
  return buildPillar(tianGanIndex, diZhiIndex, jiaziIndex);
}

/** 月柱五虎遁月法：根据年干确定正月天干 */
function getMonthTianGanBase(yearTianGanIndex: number): number {
  // 甲己之年丙作首 → 正月天干为丙(2)
  // 乙庚之年戊为头 → 正月天干为戊(4)
  // 丙辛之年庚开始 → 正月天干为庚(6)
  // 丁壬壬位顺行流 → 正月天干为壬(8)
  // 戊癸之年甲开始 → 正月天干为甲(0)
  const bases = [2, 4, 6, 8, 0]; // 甲己、乙庚、丙辛、丁壬、戊癸
  return bases[yearTianGanIndex % 5];
}

/** 计算月柱 */
export function getMonthPillar(date: Date, yearPillar: GanZhiPillar): GanZhiPillar {
  // 月支：正月=寅(2)，二月=卯(3)，...，十二月=丑(1)
  const month = date.getMonth(); // 0-11 (Jan=0)
  const day = date.getDate();

  // 月柱分界节气日（天文精确计算，按东八区取日）
  const jieDay = getJieDay(date.getFullYear(), month + 1);

  // 当月节气前属于上一个月柱
  let monthIndex: number;
  if (day >= jieDay) {
    monthIndex = month; // 当月
  } else {
    monthIndex = month - 1; // 上个月
    if (monthIndex < 0) monthIndex = 11;
  }

  // 地支：正月=寅(2)，二月=卯(3)，...，十二月=丑(1)
  // monthIndex: 0=Jan节后(十二月,丑=1), 1=Feb节后(正月,寅=2), ..., 11=Dec节后(十一月,子=0)
  const diZhiIndex = (monthIndex + 1) % 12;

  const base = getMonthTianGanBase(yearPillar.tianGan.index);
  // 正月天干=base, 二月=base+1, ...
  // 正月对应 monthIndex=1 (Feb)
  // 所以 offset = (monthIndex + 12 - 1) % 12 when monthIndex=1 => offset=0
  const offset = (monthIndex + 11) % 12; // Jan=10(十一月), Feb=0(正月), Mar=1(二月)
  const tianGanIndex = (base + offset) % 10;

  const jiaziIndex = getJiaZiIndex(tianGanIndex, diZhiIndex);
  return buildPillar(tianGanIndex, diZhiIndex, jiaziIndex);
}

/** 获取完整四柱干支 */
export function getGanZhi(date: Date): GanZhiResult {
  validateDate(date);

  const yearPillar = getYearPillar(date);
  const monthPillar = getMonthPillar(date, yearPillar);
  const dayPillar = getDayPillar(date);

  return {
    year: yearPillar,
    month: monthPillar,
    day: dayPillar,
    solarDate: date,
  };
}
