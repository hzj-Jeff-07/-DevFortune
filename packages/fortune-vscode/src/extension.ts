import * as vscode from 'vscode';
import { getDailyFortune } from '@devfortune/core';
import type { Fortune } from '@devfortune/core';
import { SidebarProvider } from './sidebar';

const CACHE_KEY = 'devfortune.lastFortune';
const CACHE_DATE_KEY = 'devfortune.lastDate';

let statusBarItem: vscode.StatusBarItem;

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getFortune(context: vscode.ExtensionContext): Fortune {
  const today = todayStr();
  const cached = context.globalState.get<string>(CACHE_DATE_KEY);

  if (cached === today) {
    const fortune = context.globalState.get<Fortune>(CACHE_KEY);
    if (fortune) return fortune;
  }

  const fortune = getDailyFortune(new Date());
  context.globalState.update(CACHE_KEY, fortune);
  context.globalState.update(CACHE_DATE_KEY, today);
  return fortune;
}

const LEVEL_ICONS: Record<string, string> = {
  great: '$(star-full)',
  good: '$(star-half)',
  neutral: '$(circle)',
  bad: '$(warning)',
  terrible: '$(error)',
};

function updateStatusBar(fortune: Fortune) {
  const icon = LEVEL_ICONS[fortune.fortune.level] ?? '$(circle)';
  statusBarItem.text = `${icon} 运势 ${fortune.fortune.score}`;
  statusBarItem.tooltip = fortune.fortune.overview;
  statusBarItem.command = 'devfortune.showFortune';
}

export function activate(context: vscode.ExtensionContext) {
  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);

  const fortune = getFortune(context);
  updateStatusBar(fortune);
  statusBarItem.show();

  // Sidebar
  const sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('devfortune.sidebar', sidebarProvider)
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devfortune.showFortune', () => {
      const f = getFortune(context);
      const panel = vscode.window.createWebviewPanel(
        'devfortune',
        `DevFortune - ${f.date}`,
        vscode.ViewColumn.One,
        {}
      );
      panel.webview.html = getFortuneHtml(f);
    }),

    vscode.commands.registerCommand('devfortune.refresh', () => {
      context.globalState.update(CACHE_DATE_KEY, '');
      const f = getFortune(context);
      updateStatusBar(f);
      sidebarProvider.refresh();
      vscode.window.showInformationMessage('DevFortune: 运势已刷新');
    })
  );
}

export function deactivate() {}

function getFortuneHtml(fortune: Fortune): string {
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

  const levelColor = LEVEL_COLORS[f.level] ?? '#a3a3a3';

  return `<!DOCTYPE html>
<html lang="zh-CN">
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
  <div class="level">${LEVEL_LABELS[f.level] ?? f.level}</div>
  <div class="overview">${f.overview}</div>
  <div class="wuxing-row">
    <div class="wuxing-badge">日主 ${ELEMENT_NAMES[wuxing.dominant] ?? wuxing.dominant}</div>
    <div class="wuxing-badge">幸运五行 ${ELEMENT_NAMES[wuxing.luckyElement] ?? wuxing.luckyElement}</div>
  </div>
  <div class="section-title yi">宜</div>
  <ul class="list">${f.yi.map(i => `<li>${i}</li>`).join('')}</ul>
  <div class="section-title ji">忌</div>
  <ul class="list">${f.ji.map(i => `<li>${i}</li>`).join('')}</ul>
  <div class="lucky">
    <div>幸运语言 <span>${f.luckyLang}</span></div>
    <div>幸运工具 <span>${f.luckyTool}</span></div>
  </div>
  ${f.tip ? `<div class="tip">${f.tip}</div>` : ''}
</div>
</body>
</html>`;
}
