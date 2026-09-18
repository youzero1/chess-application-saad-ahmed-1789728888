import { useEffect, useRef } from 'react';
import { statusText } from '@/components/GameStatus';
import type { GameStatus, PlayerColor } from '@/types/chess';

interface GameOverDialogProps {
  status: GameStatus;
  turn: PlayerColor;
  playerColor: PlayerColor;
  onPlayAgain: () => void;
}

export function GameOverDialog({ status, turn, playerColor, onPlayAgain }: GameOverDialogProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { title } = statusText(status, turn, playerColor);

  useEffect(() => {
    buttonRef.current?.focus();
  }, []);

  const result =
    status === 'checkmate'
      ? (turn === 'w' ? 'b' : 'w') === playerColor
        ? 'Victory'
        : 'Defeat'
      : 'Draw';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Game over"
    >
      <div className="w-full max-w-sm rounded-xl border border-gold/40 bg-felt-light p-6 text-center shadow-2xl">
        <p
          className={`font-display text-3xl font-bold ${
            result === 'Victory'
              ? 'text-gold'
              : result === 'Defeat'
                ? 'text-red-300'
                : 'text-cream'
          }`}
        >
          {result}
        </p>
        <p className="mt-2 text-cream-dim">{title}</p>
        <button
          ref={buttonRef}
          type="button"
          onClick={onPlayAgain}
          className="mt-6 w-full rounded-md bg-gold px-4 py-2.5 font-display text-base font-semibold text-felt shadow transition-colors hover:bg-[#e3c153]"
        >
          Play again
        </button>
      </div>
    </div>
  );
}
