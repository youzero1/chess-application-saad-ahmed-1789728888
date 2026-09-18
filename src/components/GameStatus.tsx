import type { GameStatus, PlayerColor } from '@/types/chess';

interface GameStatusProps {
  status: GameStatus;
  turn: PlayerColor;
  playerColor: PlayerColor;
  aiThinking: boolean;
}

export function statusText(
  status: GameStatus,
  turn: PlayerColor,
  playerColor: PlayerColor,
): { title: string; detail?: string } {
  const sideName = (c: PlayerColor) => (c === 'w' ? 'White' : 'Black');
  switch (status) {
    case 'playing':
      return { title: `${sideName(turn)} to move` };
    case 'check':
      return { title: `Check — ${sideName(turn)} to move` };
    case 'checkmate': {
      const winner = turn === 'w' ? 'b' : 'w';
      return {
        title: `Checkmate — ${sideName(winner)} wins`,
        detail: winner === playerColor ? 'You win!' : 'The computer wins.',
      };
    }
    case 'stalemate':
      return { title: 'Stalemate — draw' };
    case 'draw-repetition':
      return { title: 'Draw by threefold repetition' };
    case 'draw-fifty':
      return { title: 'Draw by the fifty-move rule' };
    case 'draw-material':
      return { title: 'Draw — insufficient material' };
  }
}

export function GameStatus({ status, turn, playerColor, aiThinking }: GameStatusProps) {
  const { title, detail } = statusText(status, turn, playerColor);
  const isAlert = status === 'check' || status === 'checkmate';

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        isAlert
          ? 'border-red-500/50 bg-red-950/40'
          : 'border-gold/25 bg-felt-light/70'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p
          className={`font-display text-lg font-semibold ${
            isAlert ? 'text-red-300' : 'text-cream'
          }`}
        >
          {title}
        </p>
        {aiThinking && (
          <span className="flex items-center gap-2 text-sm text-cream-dim">
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-gold/40 border-t-gold" />
            Thinking…
          </span>
        )}
      </div>
      {detail && <p className="mt-1 text-sm text-cream-dim">{detail}</p>}
    </div>
  );
}
