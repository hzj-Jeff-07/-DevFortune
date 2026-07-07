import type { Fortune } from '@devfortune/core';
import type { Locale } from './i18n';
import { STRINGS, LEVEL_LABELS, ELEMENT_NAMES } from './i18n';

const LEVEL_COLORS: Record<string, string> = {
  great: '#facc15',
  good: '#4ade80',
  neutral: '#a3a3a3',
  bad: '#fb923c',
  terrible: '#f87171',
};

/** 按像素宽度折行（中英文通用，逐字符测量） */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  let current = '';
  // 英文按词折行，中文按字符折行：统一先按空格分段，超宽的段再按字符拆
  for (const word of text.split(/(\s+)/)) {
    if (ctx.measureText(current + word).width <= maxWidth) {
      current += word;
      continue;
    }
    if (current.trim()) lines.push(current.trimEnd());
    if (ctx.measureText(word).width <= maxWidth) {
      current = word.trimStart();
      continue;
    }
    current = '';
    for (const ch of word) {
      if (ctx.measureText(current + ch).width > maxWidth && current) {
        lines.push(current);
        current = '';
      }
      current += ch;
    }
  }
  if (current.trim()) lines.push(current.trimEnd());
  return lines;
}

/** 生成运势分享卡片 PNG 并触发下载 */
export async function downloadShareCard(fortune: Fortune, locale: Locale): Promise<void> {
  const S = STRINGS[locale];
  const scale = 2;
  const W = 640;
  const PAD = 48;
  const contentWidth = W - PAD * 2;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const font = (size: number, weight = 400) =>
    `${weight} ${size}px -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif`;

  // 先测量 overview 折行数，动态确定画布高度
  ctx.font = font(22);
  const measureCtx = ctx;
  measureCtx.font = font(22);
  const overviewLines = wrapText(measureCtx, fortune.fortune.overview, contentWidth);

  const yiJiLines = fortune.fortune.yi.length + fortune.fortune.ji.length;
  const H = 460 + overviewLines.length * 34 + yiJiLines * 32 + (fortune.fortune.tip ? 80 : 0);

  canvas.width = W * scale;
  canvas.height = H * scale;
  ctx.scale(scale, scale);

  // 背景
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, W, H);
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, '#171717');
  gradient.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = gradient;
  ctx.fillRect(8, 8, W - 16, H - 16);
  ctx.strokeStyle = '#262626';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 8, W - 16, H - 16);

  let y = PAD + 28;

  // 标题
  ctx.fillStyle = '#fafafa';
  ctx.font = font(30, 700);
  ctx.fillText('Dev', PAD, y);
  const devWidth = ctx.measureText('Dev').width;
  ctx.fillStyle = '#60a5fa';
  ctx.fillText('Fortune', PAD + devWidth, y);

  // 日期 + 干支
  y += 48;
  ctx.fillStyle = '#fafafa';
  ctx.font = font(24, 600);
  ctx.fillText(fortune.date, PAD, y);
  y += 30;
  ctx.fillStyle = '#a3a3a3';
  ctx.font = font(17);
  const g = fortune.ganzhi;
  ctx.fillText(`${g.year} · ${g.month} · ${g.day}${g.hour ? ` · ${g.hour}` : ''}`, PAD, y);

  // 分数
  const levelColor = LEVEL_COLORS[fortune.fortune.level] ?? '#a3a3a3';
  ctx.fillStyle = levelColor;
  ctx.font = font(56, 700);
  const scoreText = String(fortune.fortune.score);
  const scoreWidth = ctx.measureText(scoreText).width;
  ctx.fillText(scoreText, W - PAD - scoreWidth, PAD + 60);
  ctx.font = font(16);
  const levelText = LEVEL_LABELS[locale][fortune.fortune.level] ?? fortune.fortune.level;
  const levelWidth = ctx.measureText(levelText).width;
  ctx.fillText(levelText, W - PAD - levelWidth, PAD + 88);

  // 五行徽章
  y += 44;
  ctx.font = font(16);
  const dominantText = `${S.dominant} ${ELEMENT_NAMES[locale][fortune.wuxing.dominant] ?? fortune.wuxing.dominant}`;
  const luckyText = `${S.luckyElement} ${ELEMENT_NAMES[locale][fortune.wuxing.luckyElement] ?? fortune.wuxing.luckyElement}`;
  ctx.fillStyle = '#262626';
  const badge1Width = ctx.measureText(dominantText).width + 28;
  const badge2Width = ctx.measureText(luckyText).width + 28;
  ctx.fillRect(PAD, y - 22, badge1Width, 34);
  ctx.fillRect(PAD + badge1Width + 12, y - 22, badge2Width, 34);
  ctx.fillStyle = '#d4d4d4';
  ctx.fillText(dominantText, PAD + 14, y);
  ctx.fillText(luckyText, PAD + badge1Width + 26, y);

  // 总览
  y += 52;
  ctx.fillStyle = '#e5e5e5';
  ctx.font = font(22);
  for (const line of overviewLines) {
    ctx.fillText(line, PAD, y);
    y += 34;
  }

  // 宜
  y += 16;
  ctx.fillStyle = '#4ade80';
  ctx.font = font(18, 600);
  ctx.fillText(S.yi, PAD, y);
  y += 32;
  ctx.font = font(17);
  ctx.fillStyle = '#d4d4d4';
  for (const item of fortune.fortune.yi) {
    ctx.fillText(`· ${item}`, PAD + 8, y);
    y += 32;
  }

  // 忌
  y += 8;
  ctx.fillStyle = '#f87171';
  ctx.font = font(18, 600);
  ctx.fillText(S.ji, PAD, y);
  y += 32;
  ctx.font = font(17);
  ctx.fillStyle = '#d4d4d4';
  for (const item of fortune.fortune.ji) {
    ctx.fillText(`· ${item}`, PAD + 8, y);
    y += 32;
  }

  // 幸运语言 / 工具
  y += 16;
  ctx.fillStyle = '#a3a3a3';
  ctx.font = font(16);
  ctx.fillText(
    `${S.luckyLang}: ${fortune.fortune.luckyLang}    ${S.luckyTool}: ${fortune.fortune.luckyTool}`,
    PAD,
    y
  );

  // 提示
  if (fortune.fortune.tip) {
    y += 40;
    ctx.fillStyle = '#737373';
    ctx.font = `italic ${font(16)}`;
    for (const line of wrapText(ctx, `💡 ${fortune.fortune.tip}`, contentWidth)) {
      ctx.fillText(line, PAD, y);
      y += 26;
    }
  }

  // 页脚
  ctx.fillStyle = '#525252';
  ctx.font = font(14);
  ctx.fillText('devfortune.dev', PAD, H - 32);

  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Failed to render share card');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `devfortune-${fortune.date}.png`;
  a.click();
  URL.revokeObjectURL(url);
}
