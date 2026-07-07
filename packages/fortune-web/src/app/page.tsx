'use client';

import { useEffect, useState } from 'react';
import { getDailyFortune } from '@devfortune/core';
import type { Fortune } from '@devfortune/core';
import { FortuneCard } from '@/components/FortuneCard';

export default function Home() {
  // 运势取决于访问者本地的"今天"，必须在浏览器端计算：
  // 服务端渲染会把日期固化在构建/再验证时刻，且用的是服务器时区
  const [fortune, setFortune] = useState<Fortune | null>(null);

  useEffect(() => {
    setFortune(getDailyFortune(new Date()));
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-12">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          Dev<span className="text-blue-400">Fortune</span>
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          程序员每日运势 · 基于天干地支与五行
        </p>
      </header>

      {fortune ? (
        <FortuneCard fortune={fortune} />
      ) : (
        <div
          className="h-[32rem] w-full max-w-md animate-pulse rounded-2xl border border-neutral-800 bg-neutral-900/50"
          aria-label="加载中"
        />
      )}

      <footer className="mt-16 text-center text-xs text-neutral-600">
        <p>仅供娱乐参考，代码质量还是靠实力 💻</p>
      </footer>
    </main>
  );
}
