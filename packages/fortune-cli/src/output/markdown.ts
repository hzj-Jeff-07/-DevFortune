import type { Fortune } from '@devfortune/core';
import { getLabels } from './labels.js';
import type { CliLocale } from './labels.js';

function scoreToStars(score: number): string {
  if (score >= 85) return '★★★★★';
  if (score >= 70) return '★★★★☆';
  if (score >= 45) return '★★★☆☆';
  if (score >= 25) return '★★☆☆☆';
  return '★☆☆☆☆';
}

export function formatMarkdown(fortune: Fortune, locale?: CliLocale): string {
  const L = getLabels(locale);

  const dateStr = fortune.date;
  const ganzhi = L.ganzhiLine(fortune.ganzhi);
  const dominant = L.elements[fortune.wuxing.dominant] ?? fortune.wuxing.dominant;
  const stars = scoreToStars(fortune.fortune.score);
  const level = L.levels[fortune.fortune.level] ?? fortune.fortune.level;

  const colon = L.colon.trim();
  const lines: string[] = [];
  lines.push(`## ${dateStr} ${L.mdTitle}`);
  lines.push('');
  lines.push(`**${L.mdGanzhi}${colon}** ${ganzhi}`);
  lines.push(`**${L.mdWuxing}${colon}** ${dominant}`);
  lines.push(`**${L.mdFortune}${colon}** ${stars} (${level})`);
  lines.push('');

  lines.push(`> ${fortune.fortune.overview}`);
  lines.push('');

  lines.push(`### ${L.yi}`);
  for (const item of fortune.fortune.yi) {
    lines.push(`- ${item}`);
  }
  lines.push('');

  lines.push(`### ${L.ji}`);
  for (const item of fortune.fortune.ji) {
    lines.push(`- ${item}`);
  }
  lines.push('');

  lines.push(`**${L.luckyLang}${colon}** ${fortune.fortune.luckyLang}`);
  lines.push(`**${L.luckyTool}${colon}** ${fortune.fortune.luckyTool}`);

  if (fortune.fortune.tip) {
    lines.push('');
    lines.push(`> 💡 ${fortune.fortune.tip}`);
  }

  return lines.join('\n');
}
