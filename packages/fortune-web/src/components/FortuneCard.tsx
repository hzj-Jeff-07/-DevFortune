import type { Fortune } from '@devfortune/core';
import { ScoreBadge } from './ScoreBadge';
import { WuXingBadge } from './WuXingBadge';
import { YiJiList } from './YiJiList';

const LEVEL_LABELS: Record<string, string> = {
  great: '大吉',
  good: '小吉',
  neutral: '平',
  bad: '小凶',
  terrible: '大凶',
};

export function FortuneCard({ fortune }: { fortune: Fortune }) {
  const { date, ganzhi, wuxing, fortune: f } = fortune;

  return (
    <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 backdrop-blur">
      {/* Date & GanZhi */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold">{date}</p>
          <p className="text-sm text-neutral-400">
            {ganzhi.year} · {ganzhi.month} · {ganzhi.day}
          </p>
        </div>
        <ScoreBadge score={f.score} level={f.level} />
      </div>

      {/* Level label */}
      <div className="mb-4">
        <span className="rounded-full bg-neutral-800 px-3 py-1 text-sm">
          {LEVEL_LABELS[f.level] ?? f.level}
        </span>
      </div>

      {/* Overview */}
      <p className="mb-6 text-base leading-relaxed">{f.overview}</p>

      {/* WuXing */}
      <div className="mb-6 flex gap-3">
        <WuXingBadge label="日主" element={wuxing.dominant} />
        <WuXingBadge label="幸运五行" element={wuxing.luckyElement} />
      </div>

      {/* Yi Ji */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <YiJiList title="宜" items={f.yi} variant="yi" />
        <YiJiList title="忌" items={f.ji} variant="ji" />
      </div>

      {/* Lucky items */}
      <div className="flex gap-4 text-sm text-neutral-400">
        <div>
          <span className="text-neutral-500">幸运语言</span>{' '}
          <span className="text-neutral-200">{f.luckyLang}</span>
        </div>
        <div>
          <span className="text-neutral-500">幸运工具</span>{' '}
          <span className="text-neutral-200">{f.luckyTool}</span>
        </div>
      </div>

      {/* Tip */}
      {f.tip && (
        <p className="mt-4 rounded-lg bg-neutral-800/50 p-3 text-sm text-neutral-400 italic">
          {f.tip}
        </p>
      )}
    </div>
  );
}
