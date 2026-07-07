import type { Fortune } from '@devfortune/core';
import type { Labels } from './labels.js';
import { LEVEL_COLORS } from './labels.js';

/** 侧边栏 Webview HTML（纯函数，便于测试） */
export function renderSidebarHtml(fortune: Fortune, L: Labels): string {
  const { ganzhi, wuxing, fortune: f } = fortune;
  const lc = LEVEL_COLORS[f.level] ?? '#a3a3a3';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-sideBar-background); padding: 12px; margin: 0; font-size: 13px; }
  .score-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .score { font-size: 24px; font-weight: 700; color: ${lc}; }
  .level { padding: 2px 8px; border-radius: 10px; font-size: 11px; background: ${lc}22; color: ${lc}; }
  .date { color: var(--vscode-descriptionForeground); font-size: 12px; margin-bottom: 4px; }
  .ganzhi { color: var(--vscode-descriptionForeground); font-size: 11px; margin-bottom: 12px; }
  .overview { line-height: 1.5; margin-bottom: 12px; }
  .badges { display: flex; gap: 6px; margin-bottom: 12px; }
  .badge { padding: 2px 8px; border-radius: 6px; font-size: 11px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
  h4 { margin: 8px 0 4px; font-size: 12px; }
  .yi-title { color: #4ade80; }
  .ji-title { color: #f87171; }
  ul { list-style: none; padding: 0; margin: 0 0 8px; }
  li { padding: 2px 0; }
  li::before { content: '·'; margin-right: 4px; }
  .lucky { color: var(--vscode-descriptionForeground); font-size: 12px; }
  .lucky span { color: var(--vscode-foreground); }
  .tip { margin-top: 10px; padding: 8px; border-radius: 6px; font-style: italic; background: var(--vscode-textBlockQuote-background); color: var(--vscode-descriptionForeground); font-size: 12px; }
</style>
</head>
<body>
  <div class="date">${fortune.date}</div>
  <div class="ganzhi">${ganzhi.year} · ${ganzhi.month} · ${ganzhi.day}</div>
  <div class="score-row">
    <div class="score">${f.score}</div>
    <div class="level">${L.levels[f.level] ?? f.level}</div>
  </div>
  <div class="overview">${f.overview}</div>
  <div class="badges">
    <span class="badge">${L.dominant} ${L.elements[wuxing.dominant] ?? wuxing.dominant}</span>
    <span class="badge">${L.luckyElement} ${L.elements[wuxing.luckyElement] ?? wuxing.luckyElement}</span>
  </div>
  <h4 class="yi-title">${L.yi}</h4>
  <ul>${f.yi.map(i => `<li>${i}</li>`).join('')}</ul>
  <h4 class="ji-title">${L.ji}</h4>
  <ul>${f.ji.map(i => `<li>${i}</li>`).join('')}</ul>
  <div class="lucky">
    ${L.luckyLang} <span>${f.luckyLang}</span> · ${L.luckyTool} <span>${f.luckyTool}</span>
  </div>
  ${f.tip ? `<div class="tip">${f.tip}</div>` : ''}
</body>
</html>`;
}

/** 详情面板 Webview HTML（纯函数，便于测试） */
export function renderPanelHtml(fortune: Fortune, L: Labels): string {
  const { ganzhi, wuxing, fortune: f } = fortune;
  const levelColor = LEVEL_COLORS[f.level] ?? '#a3a3a3';

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); background: var(--vscode-editor-background); padding: 20px; }
  .card { max-width: 400px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .date { font-size: 18px; font-weight: 600; }
  .ganzhi { font-size: 13px; color: var(--vscode-descriptionForeground); }
  .score { font-size: 28px; font-weight: 700; color: ${levelColor}; }
  .level { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; background: ${levelColor}22; color: ${levelColor}; }
  .overview { margin: 16px 0; line-height: 1.6; }
  .section-title { font-size: 13px; font-weight: 600; margin: 12px 0 6px; }
  .yi { color: #4ade80; }
  .ji { color: #f87171; }
  .list { list-style: none; padding: 0; margin: 0; }
  .list li { padding: 3px 0; font-size: 13px; }
  .list li::before { content: '·'; margin-right: 6px; }
  .lucky { display: flex; gap: 16px; margin-top: 16px; font-size: 13px; color: var(--vscode-descriptionForeground); }
  .lucky span { color: var(--vscode-foreground); }
  .wuxing-row { display: flex; gap: 8px; margin: 12px 0; }
  .wuxing-badge { padding: 4px 12px; border-radius: 8px; font-size: 12px; background: var(--vscode-badge-background); color: var(--vscode-badge-foreground); }
  .tip { margin-top: 16px; padding: 10px; border-radius: 8px; font-size: 13px; font-style: italic; background: var(--vscode-textBlockQuote-background); color: var(--vscode-descriptionForeground); }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div>
      <div class="date">${fortune.date}</div>
      <div class="ganzhi">${ganzhi.year} · ${ganzhi.month} · ${ganzhi.day}</div>
    </div>
    <div class="score">${f.score}</div>
  </div>
  <div class="level">${L.levels[f.level] ?? f.level}</div>
  <div class="overview">${f.overview}</div>
  <div class="wuxing-row">
    <div class="wuxing-badge">${L.dominant} ${L.elements[wuxing.dominant] ?? wuxing.dominant}</div>
    <div class="wuxing-badge">${L.luckyElement} ${L.elements[wuxing.luckyElement] ?? wuxing.luckyElement}</div>
  </div>
  <div class="section-title yi">${L.yi}</div>
  <ul class="list">${f.yi.map(i => `<li>${i}</li>`).join('')}</ul>
  <div class="section-title ji">${L.ji}</div>
  <ul class="list">${f.ji.map(i => `<li>${i}</li>`).join('')}</ul>
  <div class="lucky">
    <div>${L.luckyLang} <span>${f.luckyLang}</span></div>
    <div>${L.luckyTool} <span>${f.luckyTool}</span></div>
  </div>
  ${f.tip ? `<div class="tip">${f.tip}</div>` : ''}
</div>
</body>
</html>`;
}
