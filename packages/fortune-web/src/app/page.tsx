import { getDailyFortune } from '@devfortune/core';
import type { Fortune } from '@devfortune/core';
import { FortuneCard } from '@/components/FortuneCard';

export const revalidate = 86400; // ISR: 24h

function getTodayFortune(): Fortune {
  const today = new Date();
  return getDailyFortune(today);
}

export default function Home() {
  const fortune = getTodayFortune();

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

      <FortuneCard fortune={fortune} />

      <footer className="mt-16 text-center text-xs text-neutral-600">
        <p>仅供娱乐参考，代码质量还是靠实力 💻</p>
      </footer>
    </main>
  );
}
