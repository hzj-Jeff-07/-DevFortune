export function YiJiList({
  title,
  items,
  variant,
}: {
  title: string;
  items: string[];
  variant: 'yi' | 'ji';
}) {
  const dotColor = variant === 'yi' ? 'bg-green-400' : 'bg-red-400';
  const titleColor = variant === 'yi' ? 'text-green-400' : 'text-red-400';

  return (
    <div>
      <h3 className={`mb-2 text-sm font-medium ${titleColor}`}>{title}</h3>
      <ul className="space-y-1">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-neutral-300">
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
