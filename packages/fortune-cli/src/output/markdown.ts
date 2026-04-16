import type { Fortune } from '@devfortune/core';

const WUXING_NAMES: Record<string, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

const LEVEL_NAMES: Record<string, string> = {
  great: '大吉', good: '吉', neutral: '平', bad: '凶', terrible: '大凶',
};

function scoreToStars(score: number): string {
  if (score >= 85) return '★★★★★';
  if (score >= 70) return '★★★★☆';
  if (score >= 45) return '★★★☆☆';
  if (score >= 25) return '★★☆☆☆';
  return '★☆☆☆☆';
}

export function formatMarkdown(fortune: Fortune): string {
  const dateStr = fortune.date;
  const ganzhi = `${fortune.ganzhi.year}年 ${fortune.ganzhi.month}月 ${fortune.ganzhi.day}日`;
  const dominant = WUXING_NAMES[fortune.wuxing.dominant] ?? fortune.wuxing.dominant;
  const stars = scoreToStars(fortune.fortune.score);
  const level = LEVEL_NAMES[fortune.fortune.level] ?? fortune.fortune.level;

  const lines: string[] = [];
  lines.push(`## ${dateStr} 程序员运势`);
  lines.push('');
  lines.push(`**干支：** ${ganzhi}`);
  lines.push(`**五行：** ${dominant}`);
  lines.push(`**运势：** ${stars} (${level})`);
  lines.push('');

  lines.push(`> ${fortune.fortune.overview}`);
  lines.push('');

  lines.push('### 宜');
  for (const item of fortune.fortune.yi) {
    lines.push(`- ${item}`);
  }
  lines.push('');

  lines.push('### 忌');
  for (const item of fortune.fortune.ji) {
    lines.push(`- ${item}`);
  }
  lines.push('');

  lines.push(`**幸运编程语言：** ${fortune.fortune.luckyLang}`);
  lines.push(`**幸运开发工具：** ${fortune.fortune.luckyTool}`);

  if (fortune.fortune.tip) {
    lines.push('');
    lines.push(`> 💡 ${fortune.fortune.tip}`);
  }

  return lines.join('\n');
}
