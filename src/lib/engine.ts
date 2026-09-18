import { Chess } from 'chess.js';
import type { Move, PieceSymbol, Square } from 'chess.js';
import type { MoveInput, PromotionChoice } from '../types/chess';

const MATE = 100_000;
const INF = 1_000_000;

const VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 0,
};

// Piece-square tables, written rank 8 → rank 1, file a → h (white's view).
// Black pieces use the vertically mirrored index.
const PST_PAWN = [
  0, 0, 0, 0, 0, 0, 0, 0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5, 5, 10, 25, 25, 10, 5, 5,
  0, 0, 0, 20, 20, 0, 0, 0,
  5, -5, -10, 0, 0, -10, -5, 5,
  5, 10, 10, -20, -20, 10, 10, 5,
  0, 0, 0, 0, 0, 0, 0, 0,
];

const PST_KNIGHT = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20, 0, 0, 0, 0, -20, -40,
  -30, 0, 10, 15, 15, 10, 0, -30,
  -30, 5, 15, 20, 20, 15, 5, -30,
  -30, 0, 15, 20, 20, 15, 0, -30,
  -30, 5, 10, 15, 15, 10, 5, -30,
  -40, -20, 0, 5, 5, 0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50,
];

const PST_BISHOP = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 10, 10, 5, 0, -10,
  -10, 5, 5, 10, 10, 5, 5, -10,
  -10, 0, 10, 10, 10, 10, 0, -10,
  -10, 10, 10, 10, 10, 10, 10, -10,
  -10, 5, 0, 0, 0, 0, 5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20,
];

const PST_ROOK = [
  0, 0, 0, 0, 0, 0, 0, 0,
  5, 10, 10, 10, 10, 10, 10, 5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  -5, 0, 0, 0, 0, 0, 0, -5,
  0, 0, 0, 5, 5, 0, 0, 0,
];

const PST_QUEEN = [
  -20, -10, -10, -5, -5, -10, -10, -20,
  -10, 0, 0, 0, 0, 0, 0, -10,
  -10, 0, 5, 5, 5, 5, 0, -10,
  -5, 0, 5, 5, 5, 5, 0, -5,
  0, 0, 5, 5, 5, 5, 0, -5,
  -10, 5, 5, 5, 5, 5, 0, -10,
  -10, 0, 5, 0, 0, 0, 0, -10,
  -20, -10, -10, -5, -5, -10, -10, -20,
];

const PST_KING_MID = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
  20, 20, 0, 0, 0, 0, 20, 20,
  20, 30, 10, 0, 0, 10, 30, 20,
];

const PST: Record<PieceSymbol, number[]> = {
  p: PST_PAWN,
  n: PST_KNIGHT,
  b: PST_BISHOP,
  r: PST_ROOK,
  q: PST_QUEEN,
  k: PST_KING_MID,
};

/** Table index for a square: white uses rank8-first rows, black mirrors vertically. */
function pstIndex(square: Square, color: 'w' | 'b'): number {
  const file = square.charCodeAt(0) - 97; // a=0
  const rank = square.charCodeAt(1) - 49; // '1'=0
  const row = color === 'w' ? 8 - (rank + 1) : rank;
  return row * 8 + file;
}

/** Centipawn evaluation from White's perspective. */
export function evaluate(chess: Chess): number {
  let score = 0;
  for (const row of chess.board()) {
    for (const cell of row) {
      if (!cell) continue;
      const value = VALUES[cell.type] + PST[cell.type][pstIndex(cell.square, cell.color)];
      score += cell.color === 'w' ? value : -value;
    }
  }
  return score;
}

/** MVV-LVA ordering (captures first, promotion bonus) for better alpha-beta pruning. */
function orderMoves(moves: Move[]): Move[] {
  return moves
    .map((m) => {
      let score = 0;
      if (m.captured) score = 10 * VALUES[m.captured] - VALUES[m.piece];
      if (m.promotion) score += VALUES[m.promotion];
      return { m, score };
    })
    .sort((a, b) => b.score - a.score)
    .map(({ m }) => m);
}

function terminalScore(chess: Chess, ply: number): number | null {
  if (chess.isCheckmate()) return -MATE + ply; // side to move is mated; prefer faster mates
  if (chess.isStalemate() || chess.isDraw()) return 0;
  return null;
}

/** Negamax with alpha-beta. Score is from the side-to-move's perspective. */
function search(chess: Chess, depth: number, alpha: number, beta: number, ply: number): number {
  const terminal = terminalScore(chess, ply);
  if (terminal !== null) return terminal;
  if (depth === 0) {
    const evalScore = evaluate(chess);
    return chess.turn() === 'w' ? evalScore : -evalScore;
  }

  let best = -INF;
  for (const move of orderMoves(chess.moves({ verbose: true }))) {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = -search(chess, depth - 1, -beta, -alpha, ply + 1);
    chess.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

export interface ScoredMove {
  move: MoveInput;
  /** Centipawns from the side-to-move's perspective, higher is better. */
  score: number;
}

/**
 * All legal moves with their search scores, sorted best-first for the side to move.
 * Empty when the position is terminal.
 */
export function findBestMoves(fen: string, depth: number): ScoredMove[] {
  const chess = new Chess(fen);
  if (terminalScore(chess, 0) !== null) return [];

  const scored: ScoredMove[] = orderMoves(chess.moves({ verbose: true })).map((move) => {
    chess.move({ from: move.from, to: move.to, promotion: move.promotion });
    const score = -search(chess, depth - 1, -INF, INF, 1);
    chess.undo();
    return {
      move: {
        from: move.from,
        to: move.to,
        promotion: move.promotion as PromotionChoice | undefined,
      },
      score,
    };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

export function findBestMove(fen: string, depth: number): MoveInput | null {
  const moves = findBestMoves(fen, depth);
  return moves.length > 0 ? moves[0].move : null;
}
