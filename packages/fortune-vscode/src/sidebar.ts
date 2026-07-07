import * as vscode from 'vscode';
import type { Fortune } from '@devfortune/core';
import { getExtensionLabels } from './labels';
import { renderSidebarHtml } from './fortune-html';
import { getFortune, getLocale } from './fortune-service';

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
    const fortune: Fortune = getFortune(this._context);
    this._view.webview.html = renderSidebarHtml(fortune, getExtensionLabels(getLocale()));
  }
}
