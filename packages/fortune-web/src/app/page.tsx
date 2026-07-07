'use client';

import { useEffect, useMemo, useState } from 'react';
import { getDailyFortune } from '@devfortune/core';
import type { Locale } from '@/lib/i18n';
import { STRINGS, loadLocale, saveLocale } from '@/lib/i18n';
import { downloadShareCard } from '@/lib/share-card';
import { FortuneCard } from '@/components/FortuneCard';
import { DateNav } from '@/components/DateNav';

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function Home() {
  // 运势取决于访问者本地的"今天"，必须在浏览器端计算：
  // 服务端渲染会把日期固化在构建/再验证时刻，且用的是服务器时区
  const [dateStr, setDateStr] = useState<string | null>(null);
  const [locale, setLocale] = useState<Locale>('zh-CN');
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    setLocale(loadLocale());
    setDateStr(toDateStr(new Date()));
  }, []);

  const todayStr = useMemo(() => toDateStr(new Date()), []);

  const fortune = useMemo(() => {
    if (!dateStr) return null;
    return getDailyFortune(new Date(dateStr + 'T00:00:00'), { locale });
  }, [dateStr, locale]);

  const S = STRINGS[locale];

  const toggleLocale = () => {
    const next: Locale = locale === 'zh-CN' ? 'en-US' : 'zh-CN';
    setLocale(next);
    saveLocale(next);
  };

  const handleShare = async () => {
    if (!fortune || sharing) return;
    setSharing(true);
    try {
      await downloadShareCard(fortune, locale);
    } finally {
      setSharing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12">
      <header className="relative mb-8 w-full max-w-md text-center">
        <button
          type="button"
          onClick={toggleLocale}
          className="absolute right-0 top-0 rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1 text-xs text-neutral-400 transition-colors hover:border-neutral-600 hover:text-neutral-100"
          aria-label="Switch language"
        >
          {locale === 'zh-CN' ? 'EN' : '中'}
        </button>
        <h1 className="text-4xl font-bold tracking-tight">
          Dev<span className="text-blue-400">Fortune</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-400">{S.subtitle}</p>
      </header>

      {dateStr && (
        <DateNav value={dateStr} todayStr={todayStr} strings={S} onChange={setDateStr} />
      )}

      {fortune ? (
        <>
          <FortuneCard fortune={fortune} locale={locale} />
          <button
            type="button"
            onClick={handleShare}
            disabled={sharing}
            className="mt-6 rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm text-neutral-200 transition-colors hover:border-neutral-500 disabled:opacity-50"
          >
            {sharing ? S.sharing : `📤 ${S.share}`}
          </button>
        </>
      ) : (
        <div
          className="h-[32rem] w-full max-w-md animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900/50"
          aria-label={S.loading}
        />
      )}

      <footer className="mt-16 text-center text-xs text-neutral-600">
        <p>{S.footer}</p>
      </footer>
    </main>
  );
}
