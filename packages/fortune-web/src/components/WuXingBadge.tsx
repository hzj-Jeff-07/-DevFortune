const ELEMENT_CONFIG: Record<string, { label: string; color: string }> = {
  wood: { label: '木', color: 'text-green-400 bg-green-400/10 border-green-400/30' },
  fire: { label: '火', color: 'text-red-400 bg-red-400/10 border-red-400/30' },
  earth: { label: '土', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30' },
  metal: { label: '金', color: 'text-neutral-300 bg-neutral-300/10 border-neutral-300/30' },
  water: { label: '水', color: 'text-blue-400 bg-blue-400/10 border-blue-400/30' },
};

export function WuXingBadge({ label, element }: { label: string; element: string }) {
  const config = ELEMENT_CONFIG[element] ?? { label: element, color: 'text-neutral-400 bg-neutral-400/10 border-neutral-400/30' };

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm ${config.color}`}>
      <span className="text-neutral-500">{label}</span>
      <span className="font-medium">{config.label}</span>
    </div>
  );
}
