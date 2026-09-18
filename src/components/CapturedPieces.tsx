import { materialDelta, toPieceCode } from '@/lib/chess-utils';
import type { PieceSymbol } from 'chess.js';
import type { CapturedPieces as Captured, PlayerColor } from '@/types/chess';
import { PIECE_COMPONENTS } from '@/components/pieces';

interface CapturedPiecesProps {
  captured: Captured;
  playerColor: PlayerColor;
}

function Row({
  label,
  pieces,
  pieceColor,
  delta,
}: {
  label: string;
  pieces: PieceSymbol[];
  /** Color the captured pieces are rendered in (the side that lost them). */
  pieceColor: PlayerColor;
  delta?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-xs uppercase tracking-wider text-cream-dim">
        {label}
      </span>
      <span className="flex min-h-7 flex-1 flex-wrap items-center">
        {pieces.length === 0 && <span className="text-xs text-cream-dim/60">—</span>}
        {pieces.map((type, i) => {
          const Icon = PIECE_COMPONENTS[toPieceCode(pieceColor, type)];
          return (
            <span key={i} className="-mr-1.5 inline-block h-7 w-7">
              <Icon />
            </span>
          );
        })}
      </span>
      {delta !== undefined && delta > 0 && (
        <span className="shrink-0 text-sm font-semibold text-gold">+{delta}</span>
      )}
    </div>
  );
}

export function CapturedPieces({ captured, playerColor }: CapturedPiecesProps) {
  const opponent: PlayerColor = playerColor === 'w' ? 'b' : 'w';
  const mine = playerColor === 'w' ? captured.byWhite : captured.byBlack;
  const theirs = playerColor === 'w' ? captured.byBlack : captured.byWhite;
  const delta = materialDelta(captured, playerColor);

  return (
    <div className="space-y-1.5 rounded-lg border border-gold/25 bg-felt-light/70 px-4 py-3">
      <Row label="You captured" pieces={mine} pieceColor={opponent} delta={delta} />
      <Row label="You lost" pieces={theirs} pieceColor={playerColor} delta={-delta} />
    </div>
  );
}
