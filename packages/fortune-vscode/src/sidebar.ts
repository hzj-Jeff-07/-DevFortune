import * as vscode from 'vscode';
import { getDailyFortune } from '@devfortune/core';
import type { Fortune } from '@devfortune/core';

export class SidebarProvider implements vscode.WebviewViewProvider {
  private _view?: vscode.WebviewView;

  constructor(private readonly _context: vscode.ExtensionContext) {}

  resolveWebviewView(view: vscode.WebviewView) {
    this._view = view;
    view.webview.options = { enableScripts: false };
    this._render();
  }

  refresh() {
    this._render();
  }

  private _render() {
    if (!this._view) return;
    const fortune = getDailyFortune(new Date());
    this._view.webview.html = this._getHtml(fortune);
  }

  private _getHtml(fortune: Fortune): string {
    const { ganzhi, wuxing, fortune: f } = fortune;

    const ELEMENT_NAMES: Record<string, string> = {
      wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
    };
    const LEVEL_LABELS: Record<string, string> = {
      great: '大吉', good: '小吉', neutral: '平', bad: '小凶', terrible: '大凶',
    };
    const LEVEL_COLORS: Record<string, string> = {
      great: '#facc15', good: '#4ade80', neutral: '#a3a3a3', bad: '#fb923c', terrible: '#f87171',
    };
    const lc = LEVEL_COLORS[f.level] ?? '#a3a3a3';

    return `<!DOCTYPE html>
<html lang="zh-CN">
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
    <div class="level">${LEVEL_LABELS[f.level] ?? f.level}</div>
  </div>
  <div class="overview">${f.overview}</div>
  <div class="badges">
    <span class="badge">日主 ${ELEMENT_NAMES[wuxing.dominant] ?? wuxing.dominant}</span>
    <span class="badge">幸运 ${ELEMENT_NAMES[wuxing.luckyElement] ?? wuxing.luckyElement}</span>
  </div>
  <h4 class="yi-title">宜</h4>
  <ul>${f.yi.map(i => `<li>${i}</li>`).join('')}</ul>
  <h4 class="ji-title">忌</h4>
  <ul>${f.ji.map(i => `<li>${i}</li>`).join('')}</ul>
  <div class="lucky">
    幸运语言 <span>${f.luckyLang}</span> · 幸运工具 <span>${f.luckyTool}</span>
  </div>
  ${f.tip ? `<div class="tip">${f.tip}</div>` : ''}
</body>
</html>`;
  }
}
