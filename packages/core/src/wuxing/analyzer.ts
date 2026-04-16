import { WuXing, WuXingRelation, WuXingStrength } from '../types.js';
import type { GanZhiResult, WuXingAnalysis } from '../types.js';
import { getHiddenStems } from '../ganzhi/data.js';

/** 五行相生关系表：key 生 value */
export const SHENG_MAP: Record<WuXing, WuXing> = {
  [WuXing.Mu]:   WuXing.Huo,  // 木生火
  [WuXing.Huo]:  WuXing.Tu,   // 火生土
  [WuXing.Tu]:   WuXing.Jin,  // 土生金
  [WuXing.Jin]:  WuXing.Shui, // 金生水
  [WuXing.Shui]: WuXing.Mu,   // 水生木
};

/** 五行相克关系表：key 克 value */
export const KE_MAP: Record<WuXing, WuXing> = {
  [WuXing.Mu]:   WuXing.Tu,   // 木克土
  [WuXing.Tu]:   WuXing.Shui, // 土克水
  [WuXing.Shui]: WuXing.Huo,  // 水克火
  [WuXing.Huo]:  WuXing.Jin,  // 火克金
  [WuXing.Jin]:  WuXing.Mu,   // 金克木
};

const ALL_ELEMENTS: WuXing[] = [WuXing.Mu, WuXing.Huo, WuXing.Tu, WuXing.Jin, WuXing.Shui];

/** 获取两个五行之间的关系 */
export function getRelation(from: WuXing, to: WuXing): WuXingRelation {
  if (from === to) return WuXingRelation.Same;
  if (SHENG_MAP[from] === to) return WuXingRelation.Generates;
  if (SHENG_MAP[to] === from) return WuXingRelation.GeneratedBy;
  if (KE_MAP[from] === to) return WuXingRelation.Overcomes;
  return WuXingRelation.OvercomeBy;
}

/** 季节对应五行 */
function getSeasonElement(date: Date): WuXing {
  const month = date.getMonth(); // 0-11
  // 春(2,3,4)=木, 夏(5,6,7)=火, 秋(8,9,10)=金, 冬(11,0,1)=水
  // 长夏(辰戌丑未月)=土 — 简化为每季末月为土
  if (month >= 2 && month <= 4) return WuXing.Mu;
  if (month >= 5 && month <= 7) return WuXing.Huo;
  if (month >= 8 && month <= 10) return WuXing.Jin;
  return WuXing.Shui;
}

function emptyDistribution(): Record<WuXing, number> {
  return {
    [WuXing.Mu]: 0,
    [WuXing.Huo]: 0,
    [WuXing.Tu]: 0,
    [WuXing.Jin]: 0,
    [WuXing.Shui]: 0,
  };
}

/** 统计四柱中五行的分布 */
export function calculateDistribution(ganzhi: GanZhiResult): Record<WuXing, number> {
  const count = emptyDistribution();

  const pillars = [ganzhi.year, ganzhi.month, ganzhi.day];
  if (ganzhi.hour) pillars.push(ganzhi.hour);

  for (const pillar of pillars) {
    count[pillar.tianGan.wuxing]++;
    count[pillar.diZhi.wuxing]++;
    for (const hidden of getHiddenStems(pillar.diZhi)) {
      count[hidden.wuxing] += 0.5;
    }
  }

  return count;
}

function mapToStrength(score: number): WuXingStrength {
  if (score <= 0) return WuXingStrength.VeryWeak;
  if (score <= 2) return WuXingStrength.Weak;
  if (score <= 4) return WuXingStrength.Balanced;
  if (score <= 6) return WuXingStrength.Strong;
  return WuXingStrength.VeryStrong;
}

/** 评估五行强度 */
export function evaluateStrength(
  distribution: Record<WuXing, number>,
  date: Date
): Record<WuXing, WuXingStrength> {
  const seasonElement = getSeasonElement(date);
  const result = {} as Record<WuXing, WuXingStrength>;

  for (const element of ALL_ELEMENTS) {
    let score = distribution[element] * 1.5;

    if (element === seasonElement) {
      score += 2;
    } else if (getRelation(seasonElement, element) === WuXingRelation.Generates) {
      score += 1;
    } else if (getRelation(seasonElement, element) === WuXingRelation.Overcomes) {
      score -= 1;
    }

    result[element] = mapToStrength(score);
  }

  return result;
}

/** 推算幸运五行 */
export function getLuckyElement(
  dominant: WuXing,
  distribution: Record<WuXing, number>,
  strength: Record<WuXing, WuXingStrength>
): WuXing {
  // 1. 检查缺失
  const missing = ALL_ELEMENTS.filter(e => distribution[e] === 0);

  if (missing.length > 0) {
    // 优先补充生日主的缺失五行
    const generatesMe = ALL_ELEMENTS.find(e => SHENG_MAP[e] === dominant);
    if (generatesMe && missing.includes(generatesMe)) return generatesMe;
    return missing[0];
  }

  // 2. 日主偏弱 → 生我
  const dominantStrength = strength[dominant];
  if (dominantStrength <= WuXingStrength.Weak) {
    return ALL_ELEMENTS.find(e => SHENG_MAP[e] === dominant)!;
  }

  // 3. 日主偏旺 → 我生（泄气）
  if (dominantStrength >= WuXingStrength.Strong) {
    return SHENG_MAP[dominant];
  }

  // 4. 平衡 → 同类
  return dominant;
}

/** 完整五行分析 */
export function analyzeWuXing(ganzhi: GanZhiResult): WuXingAnalysis {
  const dominant = ganzhi.day.tianGan.wuxing;
  const distribution = calculateDistribution(ganzhi);
  const strength = evaluateStrength(distribution, ganzhi.solarDate);

  let strongest: WuXing = ALL_ELEMENTS[0];
  let weakest: WuXing = ALL_ELEMENTS[0];
  let maxCount = -1;
  let minCount = Infinity;

  for (const element of ALL_ELEMENTS) {
    if (distribution[element] > maxCount) {
      maxCount = distribution[element];
      strongest = element;
    }
    if (distribution[element] < minCount) {
      minCount = distribution[element];
      weakest = element;
    }
  }

  const missing = ALL_ELEMENTS.filter(e => distribution[e] === 0);

  const values = ALL_ELEMENTS.map(e => distribution[e]);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stddev = Math.sqrt(variance);
  const isBalanced = stddev < 1.5;

  const luckyElement = getLuckyElement(dominant, distribution, strength);

  return {
    dominant,
    distribution,
    strength,
    strongest,
    weakest,
    isBalanced,
    missing,
    luckyElement,
  };
}
