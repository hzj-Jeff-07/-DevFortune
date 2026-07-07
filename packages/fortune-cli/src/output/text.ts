import type { Fortune } from '@devfortune/core';
import { getLabels } from './labels.js';
import type { CliLocale } from './labels.js';
import { displayWidth } from './width.js';

/** --detail 附加的五行分析数据（由 CLI 入口从 core 计算后传入） */
export interface WuXingDetail {
  distribution: Record<string, number>;
  strength: Record<string, number>;
  missing: string[];
}

interface TextOptions {
  noColor?: boolean;
  raw?: boolean;
  locale?: CliLocale;
  detail?: WuXingDetail;
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

const ELEMENT_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];

/** 按终端显示宽度折行：英文按词、CJK 按字符 */
function wrapToWidth(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = '';
  for (const word of text.split(/(\s+)/)) {
    if (displayWidth(current + word) <= maxWidth) {
      current += word;
      continue;
    }
    if (current.trim()) lines.push(current.trimEnd());
    if (displayWidth(word) <= maxWidth) {
      current = word.trimStart();
      continue;
    }
    current = '';
    for (const ch of word) {
      if (displayWidth(current + ch) > maxWidth && current) {
        lines.push(current);
        current = '';
      }
      current += ch;
    }
  }
  if (current.trim()) lines.push(current.trimEnd());
  return lines.length > 0 ? lines : [''];
}

function formatDetailLines(
  detail: WuXingDetail,
  L: ReturnType<typeof getLabels>
): string[] {
  const dist = ELEMENT_ORDER.map(
    e => `${L.elements[e]} ${Number((detail.distribution[e] ?? 0).toFixed(1))}`
  ).join(' · ');
  const strength = ELEMENT_ORDER.map(
    e => `${L.elements[e]} ${L.strengthNames[detail.strength[e]] ?? detail.strength[e]}`
  ).join(' · ');
  const missing =
    detail.missing.length > 0
      ? detail.missing.map(e => L.elements[e] ?? e).join(' · ')
      : L.none;

  return [
    `${L.distribution}${L.colon}${dist}`,
    `${L.strengthLabel}${L.colon}${strength}`,
    `${L.missing}${L.colon}${missing}`,
  ];
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
  const detailLines = opts.detail ? formatDetailLines(opts.detail, L) : [];

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
    if (detailLines.length > 0) lines.push(``, `${L.detailTitle}${L.colon}`, ...detailLines);
    if (fortune.fortune.tip) lines.push(``, `💡 ${fortune.fortune.tip}`);
    return lines.join('\n');
  }

  // Bordered text output
  const width = 50;
  const hr = '─'.repeat(width);
  const lines: string[] = [];

  /** 一行带边框的内容，按终端显示宽度补齐右边框 */
  const rawRow = (content: string, color = '') => {
    const pad = ' '.repeat(Math.max(0, width - displayWidth(content) - 1));
    const reset = color ? c.reset : '';
    return `${c.dim}│${c.reset} ${color}${content}${reset}${pad}${c.dim}│${c.reset}`;
  };
  /** 超宽内容自动折行后逐行输出 */
  const row = (content: string, color = '') => {
    for (const line of wrapToWidth(content, width - 2)) {
      lines.push(rawRow(line, color));
    }
  };
  const blank = () => lines.push(`${c.dim}│${c.reset}${' '.repeat(width)}${c.dim}│${c.reset}`);
  const divider = () => lines.push(`${c.dim}├${hr}┤${c.reset}`);

  lines.push(`${c.dim}╭${hr}╮${c.reset}`);
  row(dateStr, c.bold);
  row(ganzhi, c.cyan);
  blank();

  row(`${L.wuxing}${L.colon}${dominant}  ${L.luckyElement}${L.colon}${lucky}`, c.magenta);
  row(`${stars}  ${level}  (${fortune.fortune.score}/100)`, sColor);

  blank();
  divider();

  row(fortune.fortune.overview, c.bold);
  blank();

  row(`${L.yi}${L.colon}`, c.green);
  for (const item of fortune.fortune.yi) {
    row(`  · ${item}`, c.green);
  }

  blank();

  row(`${L.ji}${L.colon}`, c.red);
  for (const item of fortune.fortune.ji) {
    row(`  · ${item}`, c.red);
  }

  blank();
  divider();

  row(`${L.luckyLang}${L.colon}${fortune.fortune.luckyLang}`, c.yellow);
  row(`${L.luckyTool}${L.colon}${fortune.fortune.luckyTool}`, c.yellow);

  if (detailLines.length > 0) {
    blank();
    row(`${L.detailTitle}${L.colon}`, c.cyan);
    for (const line of detailLines) {
      row(`  ${line}`, c.dim);
    }
  }

  if (fortune.fortune.tip) {
    blank();
    row(`💡 ${fortune.fortune.tip}`);
  }

  lines.push(`${c.dim}╰${hr}╯${c.reset}`);

  return lines.join('\n');
}
