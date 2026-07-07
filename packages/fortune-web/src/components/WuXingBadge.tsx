const ELEMENT_COLORS: Record<string, string> = {
  wood: 'text-green-400 bg-green-400/10 border-green-400/30',
  fire: 'text-red-400 bg-red-400/10 border-red-400/30',
  earth: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
  metal: 'text-neutral-300 bg-neutral-300/10 border-neutral-300/30',
  water: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
};

export function WuXingBadge({
  label,
  element,
  name,
}: {
  label: string;
  element: string;
  /** 本地化后的五行名称（木 / Wood…） */
  name: string;
}) {
  const color = ELEMENT_COLORS[element] ?? 'text-neutral-400 bg-neutral-400/10 border-neutral-400/30';

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${color}`}>
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium">{name}</span>
    </div>
  );
}
