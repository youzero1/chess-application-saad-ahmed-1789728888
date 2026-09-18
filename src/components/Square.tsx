import type { Square as SquareName } from 'chess.js';
import type { BoardPiece } from '@/types/chess';
import { PIECE_COMPONENTS } from '@/components/pieces';

interface SquareProps {
  name: SquareName;
  piece: BoardPiece | null;
  isLight: boolean;
  isSelected: boolean;
  /** Legal target on an empty square → dot indicator. */
  isLegalMove: boolean;
  /** Legal target that captures (incl. en passant) → ring indicator. */
  isCapture: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  rankLabel?: string;
  fileLabel?: string;
  interactive: boolean;
  onClick: (square: SquareName) => void;
}

export function Square({
  name,
  piece,
  isLight,
  isSelected,
  isLegalMove,
  isCapture,
  isLastMove,
  isCheck,
  rankLabel,
  fileLabel,
  interactive,
  onClick,
}: SquareProps) {
  const PieceIcon = piece ? PIECE_COMPONENTS[piece.code] : null;
  const labelColor = isLight ? 'text-wood-dark' : 'text-wood-light';

  return (
    <button
      type="button"
      aria-label={name}
      onClick={() => onClick(name)}
      className={[
        'relative aspect-square select-none focus:outline-none',
        isLight ? 'bg-wood-light' : 'bg-wood-dark',
        interactive ? 'cursor-pointer' : 'cursor-default',
      ].join(' ')}
    >
      {/* Last-move tint */}
      {isLastMove && <span className="absolute inset-0 bg-yellow-300/30" />}
      {/* Selected tint */}
      {isSelected && <span className="absolute inset-0 bg-yellow-400/45" />}
      {/* Checked king glow */}
      {isCheck && (
        <span className="absolute inset-0 bg-[radial-gradient(circle,rgba(214,48,38,0.75)_10%,rgba(214,48,38,0.35)_55%,transparent_78%)]" />
      )}

      {/* Legal-move dot (empty target) */}
      {isLegalMove && (
        <span className="absolute left-1/2 top-1/2 h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/25" />
      )}
      {/* Capture ring */}
      {isCapture && (
        <span className="absolute inset-[5%] rounded-full border-[min(0.45vw,4px)] border-black/30" />
      )}

      {/* Piece */}
      {PieceIcon && (
        <span
          key={`${name}-${piece!.code}`}
          className="animate-piece-in absolute inset-[4%] block drop-shadow-[0_2px_2px_rgba(0,0,0,0.45)]"
        >
          <PieceIcon />
        </span>
      )}

      {/* Coordinate labels */}
      {rankLabel && (
        <span
          className={`absolute left-[4%] top-[2%] text-[min(1.6vw,0.7rem)] font-semibold leading-none ${labelColor}`}
        >
          {rankLabel}
        </span>
      )}
      {fileLabel && (
        <span
          className={`absolute bottom-[2%] right-[4%] text-[min(1.6vw,0.7rem)] font-semibold leading-none ${labelColor}`}
        >
          {fileLabel}
        </span>
      )}
    </button>
  );
}
