import type { Fortune } from '@devfortune/core';
import { getLabels } from './labels.js';
import type { CliLocale } from './labels.js';

interface TextOptions {
  detail?: boolean;
  noColor?: boolean;
  raw?: boolean;
  locale?: CliLocale;
}

// ANSI color codes
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

function nc(noColor: boolean) {
  if (noColor) {
    return Object.fromEntries(Object.keys(C).map(k => [k, ''])) as typeof C;
  }
  return C;
}

function scoreToStars(score: number): string {
  if (score >= 85) return '★★★★★';
  if (score >= 70) return '★★★★☆';
  if (score >= 45) return '★★★☆☆';
  if (score >= 25) return '★★☆☆☆';
  return '★☆☆☆☆';
}

function scoreColor(score: number, c: typeof C): string {
  if (score >= 70) return c.green;
  if (score >= 45) return c.yellow;
  return c.red;
}

export function formatText(fortune: Fortune, opts: TextOptions = {}): string {
  const c = nc(opts.noColor ?? false);
  const raw = opts.raw ?? false;
  const L = getLabels(opts.locale);

  const dateStr = fortune.date;
  const ganzhi = L.ganzhiLine(fortune.ganzhi);
  const dominant = L.elements[fortune.wuxing.dominant] ?? fortune.wuxing.dominant;
  const lucky = L.elements[fortune.wuxing.luckyElement] ?? fortune.wuxing.luckyElement;
  const stars = scoreToStars(fortune.fortune.score);
  const level = L.levels[fortune.fortune.level] ?? fortune.fortune.level;
  const sColor = scoreColor(fortune.fortune.score, c);

  const yi = fortune.fortune.yi.join(' | ');
  const ji = fortune.fortune.ji.join(' | ');

  if (raw) {
    const lines = [
      `${dateStr}`,
      `${ganzhi}`,
      `${L.wuxing}${L.colon}${dominant}  ${L.luckyElement}${L.colon}${lucky}`,
      `${L.fortune}${L.colon}${stars} (${level}) ${L.score}${L.colon}${fortune.fortune.score}`,
      ``,
      fortune.fortune.overview,
      ``,
      `${L.yi}${L.colon}${yi}`,
      `${L.ji}${L.colon}${ji}`,
      ``,
      `${L.luckyLang}${L.colon}${fortune.fortune.luckyLang}`,
      `${L.luckyTool}${L.colon}${fortune.fortune.luckyTool}`,
    ];
    if (fortune.fortune.tip) lines.push(``, `💡 ${fortune.fortune.tip}`);
    return lines.join('\n');
  }

  // Bordered text output
  const width = 50;
  const hr = '─'.repeat(width);
  const lines: string[] = [];
  lines.push(`${c.dim}╭${hr}╮${c.reset}`);
  lines.push(`${c.dim}│${c.reset} ${c.bold}${dateStr}${c.reset}${' '.repeat(Math.max(0, width - dateStr.length - 1))}${c.dim}│${c.reset}`);
  lines.push(`${c.dim}│${c.reset} ${c.cyan}${ganzhi}${c.reset}${' '.repeat(Math.max(0, width - ganzhi.length - 1))}${c.dim}│${c.reset}`);
  lines.push(`${c.dim}│${c.reset}${' '.repeat(width)}${c.dim}│${c.reset}`);

  const wuxingLine = `${L.wuxing}${L.colon}${dominant}  ${L.luckyElement}${L.colon}${lucky}`;
  lines.push(`${c.dim}│${c.reset} ${c.magenta}${wuxingLine}${c.reset}${' '.repeat(Math.max(0, width - wuxingLine.length - 1))}${c.dim}│${c.reset}`);

  const starLine = `${stars}  ${level}  (${fortune.fortune.score}/100)`;
  lines.push(`${c.dim}│${c.reset} ${sColor}${starLine}${c.reset}${' '.repeat(Math.max(0, width - starLine.length - 1))}${c.dim}│${c.reset}`);

  lines.push(`${c.dim}│${c.reset}${' '.repeat(width)}${c.dim}│${c.reset}`);
  lines.push(`${c.dim}├${hr}┤${c.reset}`);

  // Overview
  const overview = fortune.fortune.overview;
  lines.push(`${c.dim}│${c.reset} ${c.bold}${overview}${c.reset}${' '.repeat(Math.max(0, width - overview.length - 1))}${c.dim}│${c.reset}`);

  lines.push(`${c.dim}│${c.reset}${' '.repeat(width)}${c.dim}│${c.reset}`);

  // Yi
  const yiHeader = `${L.yi}${L.colon}`;
  lines.push(`${c.dim}│${c.reset} ${c.green}${yiHeader}${c.reset}${' '.repeat(Math.max(0, width - yiHeader.length - 1))}${c.dim}│${c.reset}`);
  for (const item of fortune.fortune.yi) {
    const itemLine = `  · ${item}`;
    lines.push(`${c.dim}│${c.reset} ${c.green}${itemLine}${c.reset}${' '.repeat(Math.max(0, width - itemLine.length - 1))}${c.dim}│${c.reset}`);
  }

  lines.push(`${c.dim}│${c.reset}${' '.repeat(width)}${c.dim}│${c.reset}`);

  // Ji
  const jiHeader = `${L.ji}${L.colon}`;
  lines.push(`${c.dim}│${c.reset} ${c.red}${jiHeader}${c.reset}${' '.repeat(Math.max(0, width - jiHeader.length - 1))}${c.dim}│${c.reset}`);
  for (const item of fortune.fortune.ji) {
    const itemLine = `  · ${item}`;
    lines.push(`${c.dim}│${c.reset} ${c.red}${itemLine}${c.reset}${' '.repeat(Math.max(0, width - itemLine.length - 1))}${c.dim}│${c.reset}`);
  }

  lines.push(`${c.dim}│${c.reset}${' '.repeat(width)}${c.dim}│${c.reset}`);
  lines.push(`${c.dim}├${hr}┤${c.reset}`);

  // Lucky
  const langLine = `${L.luckyLang}${L.colon}${fortune.fortune.luckyLang}`;
  const toolLine = `${L.luckyTool}${L.colon}${fortune.fortune.luckyTool}`;
  lines.push(`${c.dim}│${c.reset} ${c.yellow}${langLine}${c.reset}${' '.repeat(Math.max(0, width - langLine.length - 1))}${c.dim}│${c.reset}`);
  lines.push(`${c.dim}│${c.reset} ${c.yellow}${toolLine}${c.reset}${' '.repeat(Math.max(0, width - toolLine.length - 1))}${c.dim}│${c.reset}`);

  if (fortune.fortune.tip) {
    lines.push(`${c.dim}│${c.reset}${' '.repeat(width)}${c.dim}│${c.reset}`);
    const tipLine = `💡 ${fortune.fortune.tip}`;
    lines.push(`${c.dim}│${c.reset} ${tipLine}${' '.repeat(Math.max(0, width - tipLine.length - 1))}${c.dim}│${c.reset}`);
  }

  lines.push(`${c.dim}╰${hr}╯${c.reset}`);

  return lines.join('\n');
}
