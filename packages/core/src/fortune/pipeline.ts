import type {
  Fortune,
  FortuneOptions,
  FortuneTemplate,
  GanZhiResult,
  WuXingAnalysis,
  YiJiResult,
  ScoreResult,
} from '../types.js';
import type { ScoreLevel } from '../types.js';
import { WuXing, WuXingStrength } from '../types.js';
import { getGanZhi } from '../ganzhi/index.js';
import { analyzeWuXing } from '../wuxing/index.js';
import { generateYiJi, deterministicSelect } from './yiji.js';
import { calculateScore } from './scorer.js';
import { getDefaultTemplates, getDefaultMapping } from '../templates/index.js';

/** 构建匹配键 */
function getElementState(wuxing: WuXingAnalysis): 'prosperous' | 'moderate' | 'weak' {
  const str = wuxing.strength[wuxing.dominant];
  if (str >= WuXingStrength.Strong) return 'prosperous';
  if (str <= WuXingStrength.Weak) return 'weak';
  return 'moderate';
}

/** 模板匹配 */
function matchTemplate(
  sentiment: ScoreLevel,
  _dominant: WuXing,
  _state: 'prosperous' | 'moderate' | 'weak',
  templates: FortuneTemplate[],
  date: Date
): FortuneTemplate {
  // 按 sentiment 过滤
  const bySentiment = templates.filter(t => t.sentiment === sentiment);

  if (bySentiment.length === 0) {
    // 兜底
    return templates.length > 0
      ? deterministicSelect(templates, date)
      : {
          id: 'fallback',
          sentiment,
          overview: '今日运势平平，稳扎稳打为上。',
          do: ['写代码', '读文档'],
          dont: ['删库'],
        };
  }

  // 只有一个候选就直接用
  if (bySentiment.length === 1) return bySentiment[0];

  return deterministicSelect(bySentiment, date);
}

/** 渲染最终运势 */
function renderFortune(
  date: Date,
  ganzhi: GanZhiResult,
  wuxing: WuXingAnalysis,
  yiji: YiJiResult,
  score: ScoreResult,
  template: FortuneTemplate
): Fortune {
  const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  return {
    date: dateStr,
    ganzhi: {
      year: ganzhi.year.display,
      month: ganzhi.month.display,
      day: ganzhi.day.display,
    },
    wuxing: {
      dominant: wuxing.dominant,
      luckyElement: wuxing.luckyElement,
    },
    fortune: {
      score: score.score,
      level: score.level,
      overview: template.overview,
      yi: yiji.yi,
      ji: yiji.ji,
      luckyLang: yiji.luckyLanguage,
      luckyTool: yiji.luckyTool,
      tip: template.tip,
    },
  };
}

/** 获取每日运势 — 主入口 */
export function getDailyFortune(date: Date, options?: FortuneOptions): Fortune {
  const ganzhi = getGanZhi(date);
  const wuxing = analyzeWuXing(ganzhi);
  const yiji = generateYiJi(wuxing, date, options?.mapping ?? getDefaultMapping(options?.locale));
  const score = calculateScore(wuxing);

  const elState = getElementState(wuxing);
  const templates = options?.templates ?? getDefaultTemplates(options?.locale);
  const template = matchTemplate(score.level, wuxing.dominant, elState, templates, date);

  return renderFortune(date, ganzhi, wuxing, yiji, score, template);
}
