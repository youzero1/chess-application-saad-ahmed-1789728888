import type { Difficulty, PlayerColor } from '@/types/chess';

interface GameControlsProps {
  playerColor: PlayerColor;
  difficulty: Difficulty;
  onNewGame: (color: PlayerColor) => void;
  onDifficultyChange: (difficulty: Difficulty) => void;
}

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const COLORS: { value: PlayerColor; label: string }[] = [
  { value: 'w', label: 'White' },
  { value: 'b', label: 'Black' },
];

export function GameControls({
  playerColor,
  difficulty,
  onNewGame,
  onDifficultyChange,
}: GameControlsProps) {
  return (
    <div className="space-y-4 rounded-lg border border-gold/25 bg-felt-light/70 px-4 py-4">
      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-cream-dim">Difficulty</p>
        <div className="flex overflow-hidden rounded-md border border-gold/30">
          {DIFFICULTIES.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => onDifficultyChange(d.value)}
              className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
                difficulty === d.value
                  ? 'bg-gold text-felt'
                  : 'bg-transparent text-cream hover:bg-gold/15'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wider text-cream-dim">Play as</p>
        <div className="flex gap-2">
          {COLORS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => onNewGame(c.value)}
              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                playerColor === c.value
                  ? 'border-gold bg-gold/20 text-gold'
                  : 'border-cream-dim/30 text-cream hover:border-gold/50 hover:bg-gold/10'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <p className="mt-1.5 text-xs text-cream-dim/80">
          Switching sides starts a new game.
        </p>
      </div>

      <button
        type="button"
        onClick={() => onNewGame(playerColor)}
        className="w-full rounded-md bg-gold px-4 py-2.5 font-display text-base font-semibold text-felt shadow transition-colors hover:bg-[#e3c153]"
      >
        New game
      </button>
    </div>
  );
}
