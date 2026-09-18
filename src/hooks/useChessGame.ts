import { useCallback, useMemo, useRef, useState } from 'react';
import { Chess, Move } from 'chess.js';
import type { Square } from 'chess.js';
import {
  findKingSquare,
  getBoardSnapshot,
  getCapturedPieces,
  getGameStatus,
  isGameOverStatus,
} from '@/lib/chess-utils';
import type {
  BoardSnapshot,
  CapturedPieces,
  GameStatus,
  MoveInput,
  PendingPromotion,
  PlayerColor,
  PromotionChoice,
} from '@/types/chess';

export interface LastMove {
  from: Square;
  to: Square;
}

export interface ChessGame {
  snapshot: BoardSnapshot;
  status: GameStatus;
  turn: PlayerColor;
  history: string[];
  captured: CapturedPieces;
  selectedSquare: Square | null;
  legalTargets: Move[];
  pendingPromotion: PendingPromotion | null;
  lastMove: LastMove | null;
  checkedKingSquare: Square | null;
  isGameOver: boolean;
  fen: string;
  /** Incremented on every reset so the AI layer can discard stale worker replies. */
  gameId: number;
  selectSquare: (square: Square) => void;
  requestPromotionChoice: (piece: PromotionChoice) => void;
  makeEngineMove: (move: MoveInput) => void;
  reset: () => void;
}

export function useChessGame(): ChessGame {
  const gameRef = useRef<Chess>(new Chess());
  const [fen, setFen] = useState<string>(gameRef.current.fen());
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [gameId, setGameId] = useState(0);

  const game = gameRef.current;

  const snapshot = useMemo(() => getBoardSnapshot(game), [fen, game]);
  const status = useMemo(() => getGameStatus(game), [fen, game]);
  const captured = useMemo(() => getCapturedPieces(game), [fen, game]);
  const history = useMemo(() => game.history(), [fen, game]);
  const checkedKingSquare = useMemo(
    () => (game.isCheck() ? findKingSquare(game, game.turn()) : null),
    [fen, game],
  );

  const legalTargets = useMemo<Move[]>(() => {
    if (!selectedSquare) return [];
    return game.moves({ square: selectedSquare, verbose: true });
  }, [selectedSquare, fen, game]);

  const commitMove = useCallback((move: MoveInput): boolean => {
    try {
      const applied = gameRef.current.move({
        from: move.from,
        to: move.to,
        promotion: move.promotion,
      });
      setLastMove({ from: applied.from, to: applied.to });
      setFen(gameRef.current.fen());
      setSelectedSquare(null);
      setPendingPromotion(null);
      return true;
    } catch {
      return false;
    }
  }, []);

  const selectSquare = useCallback(
    (square: Square) => {
      const g = gameRef.current;
      if (pendingPromotion) return; // promotion dialog owns the flow
      if (isGameOverStatus(getGameStatus(g))) return;

      // Clicking a legal target of the current selection executes the move.
      if (selectedSquare) {
        const targets = g.moves({ square: selectedSquare, verbose: true });
        const chosen = targets.find((m) => m.to === square);
        if (chosen) {
          if (chosen.isPromotion()) {
            setPendingPromotion({ from: selectedSquare, to: square });
            setSelectedSquare(null);
          } else {
            commitMove({ from: selectedSquare, to: square });
          }
          return;
        }
      }

      // Otherwise (re)select if it's one of the side-to-move's own pieces.
      const piece = g.get(square);
      if (piece && piece.color === g.turn()) {
        setSelectedSquare(square === selectedSquare ? null : square);
      } else {
        setSelectedSquare(null);
      }
    },
    [selectedSquare, pendingPromotion, commitMove],
  );

  const requestPromotionChoice = useCallback(
    (piece: PromotionChoice) => {
      setPendingPromotion((pending) => {
        if (!pending) return null;
        commitMove({ from: pending.from, to: pending.to, promotion: piece });
        return null;
      });
    },
    [commitMove],
  );

  const makeEngineMove = useCallback(
    (move: MoveInput) => {
      commitMove(move);
    },
    [commitMove],
  );

  const reset = useCallback(() => {
    gameRef.current = new Chess();
    setFen(gameRef.current.fen());
    setSelectedSquare(null);
    setPendingPromotion(null);
    setLastMove(null);
    setGameId((id) => id + 1);
  }, []);

  return {
    snapshot,
    status,
    turn: game.turn(),
    history,
    captured,
    selectedSquare,
    legalTargets,
    pendingPromotion,
    lastMove,
    checkedKingSquare,
    isGameOver: isGameOverStatus(status),
    fen,
    gameId,
    selectSquare,
    requestPromotionChoice,
    makeEngineMove,
    reset,
  };
}
