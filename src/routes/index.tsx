import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import type { Square } from 'chess.js';
import { useChessGame } from '@/hooks/useChessGame';
import { useChessAI } from '@/hooks/useChessAI';
import { ChessBoard } from '@/components/ChessBoard';
import { GameStatus } from '@/components/GameStatus';
import { CapturedPieces } from '@/components/CapturedPieces';
import { MoveHistory } from '@/components/MoveHistory';
import { GameControls } from '@/components/GameControls';
import { PromotionDialog } from '@/components/PromotionDialog';
import { GameOverDialog } from '@/components/GameOverDialog';
import type { Difficulty, PlayerColor } from '@/types/chess';

export const Route = createFileRoute('/')({
  component: HomePage,
});

function HomePage() {
  const game = useChessGame();
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const { aiThinking } = useChessAI(game, playerColor, difficulty);

  const handleNewGame = (color: PlayerColor) => {
    setPlayerColor(color);
    game.reset();
  };

  // Human input is inert while the AI is thinking, on the AI's turn,
  // after game over, and while the promotion dialog is open.
  const inputLocked =
    aiThinking || game.turn !== playerColor || game.isGameOver || game.pendingPromotion !== null;

  const handleSquareClick = (square: Square) => {
    if (!inputLocked) game.selectSquare(square);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row lg:items-start">
      <div className="mx-auto w-full max-w-xl lg:flex-1 lg:max-w-none">
        <ChessBoard
          snapshot={game.snapshot}
          orientation={playerColor}
          selectedSquare={game.selectedSquare}
          legalTargets={game.legalTargets}
          lastMove={game.lastMove}
          checkedKingSquare={game.checkedKingSquare}
          interactive={!inputLocked}
          onSquareClick={handleSquareClick}
        />
      </div>

      <aside className="mx-auto flex w-full max-w-xl flex-col gap-4 lg:w-80 lg:shrink-0">
        <GameStatus
          status={game.status}
          turn={game.turn}
          playerColor={playerColor}
          aiThinking={aiThinking}
        />
        <CapturedPieces captured={game.captured} playerColor={playerColor} />
        <MoveHistory history={game.history} />
        <GameControls
          playerColor={playerColor}
          difficulty={difficulty}
          onNewGame={handleNewGame}
          onDifficultyChange={setDifficulty}
        />
      </aside>

      {game.pendingPromotion && (
        <PromotionDialog
          pending={game.pendingPromotion}
          color={playerColor}
          onChoose={game.requestPromotionChoice}
        />
      )}
      {game.isGameOver && (
        <GameOverDialog
          status={game.status}
          turn={game.turn}
          playerColor={playerColor}
          onPlayAgain={() => game.reset()}
        />
      )}
    </div>
  );
}
