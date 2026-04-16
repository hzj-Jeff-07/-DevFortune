const LEVEL_COLORS: Record<string, string> = {
  great: 'text-yellow-400 bg-yellow-400/10',
  good: 'text-green-400 bg-green-400/10',
  neutral: 'text-neutral-400 bg-neutral-400/10',
  bad: 'text-orange-400 bg-orange-400/10',
  terrible: 'text-red-400 bg-red-400/10',
};

export function ScoreBadge({ score, level }: { score: number; level: string }) {
  const colorClass = LEVEL_COLORS[level] ?? LEVEL_COLORS.neutral;

  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${colorClass}`}>
      <span className="text-2xl font-bold">{score}</span>
      <span className="text-xs">/100</span>
    </div>
  );
}
