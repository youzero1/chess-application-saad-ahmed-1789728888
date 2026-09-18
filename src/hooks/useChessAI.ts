import { useEffect, useRef, useState } from 'react';
import type { ChessGame } from '@/hooks/useChessGame';
import type { EngineRequest, EngineResponse } from '@/lib/ai.worker';
import type { ScoredMove } from '@/lib/engine';
import type { Difficulty, PlayerColor } from '@/types/chess';

const DEPTHS: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
};

/**
 * Evaluation window (centipawns) within which moves are picked at random,
 * to make lower difficulties feel less mechanical.
 */
const JITTER: Record<Difficulty, number> = {
  easy: 60,
  medium: 25,
  hard: 0,
};

/** Brief pause so instant replies still read as a deliberate move. */
const MIN_THINK_MS = 250;

function pickMove(moves: ScoredMove[], difficulty: Difficulty): ScoredMove | null {
  if (moves.length === 0) return null;
  const window = JITTER[difficulty];
  if (window === 0) return moves[0];
  const best = moves[0].score;
  const candidates = moves.filter((m) => m.score >= best - window);
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function useChessAI(
  game: ChessGame,
  playerColor: PlayerColor,
  difficulty: Difficulty,
): { aiThinking: boolean } {
  const workerRef = useRef<Worker | null>(null);
  const requestRef = useRef<{ id: number; gameId: number } | null>(null);
  const [aiThinking, setAiThinking] = useState(false);

  // Worker lifecycle: created once, terminated on unmount.
  useEffect(() => {
    const worker = new Worker(new URL('../lib/ai.worker.ts', import.meta.url), {
      type: 'module',
    });
    workerRef.current = worker;

    worker.onmessage = (e: MessageEvent<EngineResponse>) => {
      const pending = requestRef.current;
      // Ignore stale replies (e.g. a game reset happened while thinking).
      if (!pending || e.data.id !== pending.id) return;
      const chosen = pickMove(e.data.moves, difficultyRef.current);
      window.setTimeout(() => {
        // Re-check staleness after the minimum-think pause.
        if (requestRef.current?.id !== pending.id) return;
        requestRef.current = null;
        setAiThinking(false);
        if (chosen) gameRef.current.makeEngineMove(chosen.move);
      }, MIN_THINK_MS);
    };

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  // Refs so the worker callback and the trigger effect always see fresh values.
  const gameRef = useRef(game);
  gameRef.current = game;
  const difficultyRef = useRef(difficulty);
  difficultyRef.current = difficulty;

  // Reset invalidates any in-flight request.
  const gameId = game.gameId;
  useEffect(() => {
    if (requestRef.current && requestRef.current.gameId !== gameId) {
      requestRef.current = null;
      setAiThinking(false);
    }
  }, [gameId]);

  // Trigger the engine whenever it is the AI's turn.
  const aiTurn =
    game.turn !== playerColor && !game.isGameOver && game.pendingPromotion === null;
  useEffect(() => {
    if (!aiTurn || requestRef.current) return;
    const id = Date.now() + Math.random();
    requestRef.current = { id, gameId };
    setAiThinking(true);
    const request: EngineRequest = { id, fen: game.fen, depth: DEPTHS[difficulty] };
    workerRef.current?.postMessage(request);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aiTurn, game.fen, difficulty, gameId]);

  return { aiThinking };
}
