'use client';

import type { UiStrings } from '@/lib/i18n';

const MIN_DATE = '1900-01-01';
const MAX_DATE = '2100-12-31';

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function DateNav({
  value,
  todayStr,
  strings,
  onChange,
}: {
  value: string;
  todayStr: string;
  strings: UiStrings;
  onChange: (date: string) => void;
}) {
  const setClamped = (next: string) => {
    if (next >= MIN_DATE && next <= MAX_DATE) onChange(next);
  };

  const buttonClass =
    'rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:text-neutral-100';

  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
      <button
        type="button"
        className={buttonClass}
        aria-label={strings.prevDay}
        onClick={() => setClamped(shiftDate(value, -1))}
      >
        ◀
      </button>
      <input
        type="date"
        value={value}
        min={MIN_DATE}
        max={MAX_DATE}
        onChange={e => e.target.value && setClamped(e.target.value)}
        className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 [color-scheme:dark]"
      />
      <button
        type="button"
        className={buttonClass}
        aria-label={strings.nextDay}
        onClick={() => setClamped(shiftDate(value, 1))}
      >
        ▶
      </button>
      {value !== todayStr && (
        <button type="button" className={buttonClass} onClick={() => onChange(todayStr)}>
          {strings.today}
        </button>
      )}
    </div>
  );
}
