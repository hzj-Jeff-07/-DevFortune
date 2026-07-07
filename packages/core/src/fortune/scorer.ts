import type { WuXingAnalysis, ScoreResult } from '../types.js';
import { WuXing } from '../types.js';
import type { ScoreLevel } from '../types.js';
import { getRelation } from '../wuxing/analyzer.js';
import { WuXingRelation } from '../types.js';

const ALL_ELEMENTS: WuXing[] = [WuXing.Mu, WuXing.Huo, WuXing.Tu, WuXing.Jin, WuXing.Shui];

/** 五行平衡度 (0-40) */
function calculateBalance(distribution: Record<WuXing, number>): number {
  const values = ALL_ELEMENTS.map(e => distribution[e]);
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  const stddev = Math.sqrt(variance);

  // stddev 范围大约 0-5，归一化到 0-1
  const normalized = Math.min(stddev / 5, 1);
  return Math.round(40 * (1 - normalized));
}

/**
 * 日主强度 (0-30)。
 *
 * 理想区间 15%-35% 得满分，两侧线性衰减至 0，全程单调无跳变
 * （旧实现在占比 0.1 和 0.5 处不连续，且 0.5 之后分数反而回升）。
 */
export function evaluateDayMaster(wuxing: WuXingAnalysis): number {
  const total = ALL_ELEMENTS.reduce((sum, e) => sum + wuxing.distribution[e], 0);
  if (total === 0) return 15;

  const ratio = wuxing.distribution[wuxing.dominant] / total;

  if (ratio >= 0.15 && ratio <= 0.35) return 30;
  if (ratio < 0.15) return Math.round(30 * (ratio / 0.15));
  return Math.round(30 * (1 - (ratio - 0.35) / 0.65));
}

/** 生克和谐度 (0-30) */
function evaluateHarmony(wuxing: WuXingAnalysis): number {
  let score = 15; // 基础分

  // 检查各五行之间的生克关系（按分布权重）
  for (const a of ALL_ELEMENTS) {
    for (const b of ALL_ELEMENTS) {
      if (a === b) continue;
      const countA = wuxing.distribution[a];
      const countB = wuxing.distribution[b];
      if (countA === 0 || countB === 0) continue;

      const relation = getRelation(a, b);
      if (relation === WuXingRelation.Generates) {
        score += 2;
      } else if (relation === WuXingRelation.Overcomes) {
        score -= 1.5;
      }
    }
  }

  return Math.max(0, Math.min(30, Math.round(score)));
}

export function scoreToLevel(score: number): ScoreLevel {
  if (score >= 85) return 'great';
  if (score >= 70) return 'good';
  if (score >= 45) return 'neutral';
  if (score >= 25) return 'bad';
  return 'terrible';
}

/** 计算综合评分 */
export function calculateScore(wuxing: WuXingAnalysis): ScoreResult {
  const balance = calculateBalance(wuxing.distribution);
  const dayMasterStrength = evaluateDayMaster(wuxing);
  const harmony = evaluateHarmony(wuxing);

  const score = Math.max(0, Math.min(100, balance + dayMasterStrength + harmony));
  const level = scoreToLevel(score);

  return {
    score,
    level,
    breakdown: { balance, dayMasterStrength, harmony },
  };
}
