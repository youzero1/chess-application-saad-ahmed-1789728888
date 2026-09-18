import type { Move, Square as SquareName } from 'chess.js';
import { coordsToSquare, squareToCoords } from '@/lib/chess-utils';
import type { BoardSnapshot, PlayerColor } from '@/types/chess';
import type { LastMove } from '@/hooks/useChessGame';
import { Square } from '@/components/Square';

interface ChessBoardProps {
  snapshot: BoardSnapshot;
  orientation: PlayerColor;
  selectedSquare: SquareName | null;
  legalTargets: Move[];
  lastMove: LastMove | null;
  checkedKingSquare: SquareName | null;
  interactive: boolean;
  onSquareClick: (square: SquareName) => void;
}

export function ChessBoard({
  snapshot,
  orientation,
  selectedSquare,
  legalTargets,
  lastMove,
  checkedKingSquare,
  interactive,
  onSquareClick,
}: ChessBoardProps) {
  const cells = [];
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const name = coordsToSquare(row, col, orientation);
      // Snapshot is stored white-oriented (row 0 = rank 8).
      const { row: sRow, col: sCol } = squareToCoords(name, 'w');
      const piece = snapshot[sRow][sCol];
      const isLight = (sRow + sCol) % 2 === 0;
      const target = legalTargets.find((m) => m.to === name);
      const isCapture = !!target && target.isCapture();

      cells.push(
        <Square
          key={name}
          name={name}
          piece={piece}
          isLight={isLight}
          isSelected={selectedSquare === name}
          isLegalMove={!!target && !isCapture}
          isCapture={isCapture}
          isLastMove={lastMove !== null && (lastMove.from === name || lastMove.to === name)}
          isCheck={checkedKingSquare === name}
          rankLabel={col === 0 ? name[1] : undefined}
          fileLabel={row === 7 ? name[0] : undefined}
          interactive={interactive}
          onClick={onSquareClick}
        />,
      );
    }
  }

  return (
    <div className="w-full rounded-lg bg-[linear-gradient(135deg,#2e1065_0%,#5b21b6_50%,#3b0764_100%)] p-[3.2%] shadow-[0_18px_50px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(233,221,245,0.22),inset_0_-3px_6px_rgba(0,0,0,0.5)]">
      <div className="grid aspect-square w-full grid-cols-8 overflow-hidden rounded-[2px] shadow-[inset_0_0_14px_rgba(0,0,0,0.55)]">
        {cells}
      </div>
    </div>
  );
}
