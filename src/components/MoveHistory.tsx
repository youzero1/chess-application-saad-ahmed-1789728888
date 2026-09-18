import { useEffect, useRef } from 'react';

interface MoveHistoryProps {
  history: string[];
}

export function MoveHistory({ history }: MoveHistoryProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [history.length]);

  const rows: { num: number; white: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    rows.push({ num: i / 2 + 1, white: history[i], black: history[i + 1] });
  }

  return (
    <div className="rounded-lg border border-gold/25 bg-felt-light/70">
      <h2 className="border-b border-gold/15 px-4 py-2 font-display text-sm font-semibold uppercase tracking-widest text-cream-dim">
        Moves
      </h2>
      <div className="h-56 overflow-y-auto px-2 py-1">
        {rows.length === 0 ? (
          <p className="px-2 py-3 text-sm italic text-cream-dim/70">No moves yet.</p>
        ) : (
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row) => (
                <tr key={row.num} className="odd:bg-white/[0.03]">
                  <td className="w-10 px-2 py-1 text-right font-mono text-xs text-cream-dim">
                    {row.num}.
                  </td>
                  <td className="px-2 py-1 font-medium text-cream">{row.white}</td>
                  <td className="px-2 py-1 font-medium text-cream">{row.black ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div ref={endRef} />
      </div>
    </div>
  );
}
