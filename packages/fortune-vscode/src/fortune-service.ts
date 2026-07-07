import * as vscode from 'vscode';
import { getDailyFortune } from '@devfortune/core';
import type { Fortune } from '@devfortune/core';
import { resolveExtensionLocale } from './labels';
import type { Locale } from './labels';

const CACHE_KEY = 'devfortune.lastFortune';
export const CACHE_DATE_KEY = 'devfortune.lastDate';

export function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getLocale(): Locale {
  const config = vscode.workspace.getConfiguration('devfortune');
  return resolveExtensionLocale(config.get<string>('language'), vscode.env.language);
}

/** 当日运势（按日期+语言缓存，语言切换后立即重算） */
export function getFortune(context: vscode.ExtensionContext): Fortune {
  const locale = getLocale();
  const cacheStamp = `${todayStr()}:${locale}`;
  const cached = context.globalState.get<string>(CACHE_DATE_KEY);

  if (cached === cacheStamp) {
    const fortune = context.globalState.get<Fortune>(CACHE_KEY);
    if (fortune) return fortune;
  }

  const fortune = getDailyFortune(new Date(), { locale });
  context.globalState.update(CACHE_KEY, fortune);
  context.globalState.update(CACHE_DATE_KEY, cacheStamp);
  return fortune;
}
