import * as vscode from 'vscode';
import type { Fortune } from '@devfortune/core';
import { SidebarProvider } from './sidebar';
import { getExtensionLabels } from './labels';
import { renderPanelHtml } from './fortune-html';
import { getFortune, getLocale, todayStr, CACHE_DATE_KEY } from './fortune-service';

const NOTIFIED_KEY = 'devfortune.lastNotified';

let statusBarItem: vscode.StatusBarItem;

const LEVEL_ICONS: Record<string, string> = {
  great: '$(star-full)',
  good: '$(star-half)',
  neutral: '$(circle)',
  bad: '$(warning)',
  terrible: '$(error)',
};

function updateStatusBar(fortune: Fortune) {
  const config = vscode.workspace.getConfiguration('devfortune');
  if (!config.get<boolean>('showStatusBar', true)) {
    statusBarItem.hide();
    return;
  }
  const L = getExtensionLabels(getLocale());
  const icon = LEVEL_ICONS[fortune.fortune.level] ?? '$(circle)';
  statusBarItem.text = `${icon} ${L.statusBar} ${fortune.fortune.score}`;
  statusBarItem.tooltip = fortune.fortune.overview;
  statusBarItem.command = 'devfortune.showFortune';
  statusBarItem.show();
}

function openFortunePanel(context: vscode.ExtensionContext) {
  const f = getFortune(context);
  const panel = vscode.window.createWebviewPanel(
    'devfortune',
    `DevFortune - ${f.date}`,
    vscode.ViewColumn.One,
    {}
  );
  panel.webview.html = renderPanelHtml(f, getExtensionLabels(getLocale()));
}

/** 每日通知：开启配置后每天首次激活时提醒一次 */
function maybeNotify(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration('devfortune');
  if (!config.get<boolean>('dailyNotification', false)) return;
  const today = todayStr();
  if (context.globalState.get<string>(NOTIFIED_KEY) === today) return;

  context.globalState.update(NOTIFIED_KEY, today);
  const f = getFortune(context);
  const L = getExtensionLabels(getLocale());
  const stars = '★'.repeat(Math.max(1, Math.round(f.fortune.score / 20)));
  vscode.window
    .showInformationMessage(`DevFortune ${stars} ${f.fortune.overview}`, L.showDetail)
    .then(action => {
      if (action === L.showDetail) openFortunePanel(context);
    });
}

export function activate(context: vscode.ExtensionContext) {
  // Status bar
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  context.subscriptions.push(statusBarItem);

  updateStatusBar(getFortune(context));

  // Sidebar
  const sidebarProvider = new SidebarProvider(context);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('devfortune.sidebar', sidebarProvider)
  );

  const refreshAll = () => {
    updateStatusBar(getFortune(context));
    sidebarProvider.refresh();
  };

  // 跨天后自动刷新（VS Code 常驻多日时状态栏不能停留在昨天的运势）
  let lastDay = todayStr();
  const rolloverTimer = setInterval(() => {
    const now = todayStr();
    if (now !== lastDay) {
      lastDay = now;
      refreshAll();
    }
  }, 60_000);
  context.subscriptions.push({ dispose: () => clearInterval(rolloverTimer) });

  // 配置变化即时生效（语言、状态栏开关）
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('devfortune')) refreshAll();
    })
  );

  // Commands
  context.subscriptions.push(
    vscode.commands.registerCommand('devfortune.showFortune', () => openFortunePanel(context)),

    vscode.commands.registerCommand('devfortune.refresh', () => {
      context.globalState.update(CACHE_DATE_KEY, '');
      refreshAll();
      vscode.window.showInformationMessage(getExtensionLabels(getLocale()).refreshed);
    })
  );

  maybeNotify(context);
}

export function deactivate() {}
