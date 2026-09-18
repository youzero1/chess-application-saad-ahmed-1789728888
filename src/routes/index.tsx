import { createFileRoute } from '@tanstack/react-router';
import { useChessGame } from '@/hooks/useChessGame';
import { ChessBoard } from '@/components/ChessBoard';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const game = useChessGame();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-6">
      <ChessBoard
        snapshot={game.snapshot}
        orientation="w"
        selectedSquare={game.selectedSquare}
        legalTargets={game.legalTargets}
        lastMove={game.lastMove}
        checkedKingSquare={game.checkedKingSquare}
        interactive={!game.isGameOver}
        onSquareClick={game.selectSquare}
      />
    </div>
  );
}
