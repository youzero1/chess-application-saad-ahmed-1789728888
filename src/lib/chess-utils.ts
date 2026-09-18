import { Chess } from 'chess.js';
import type { Square, PieceSymbol } from 'chess.js';
import type {
  BoardPiece,
  BoardSnapshot,
  CapturedPieces,
  GameStatus,
  PieceCode,
  PlayerColor,
} from '@/types/chess';

export const FILES = 'abcdefgh' as const;

export const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 1,
  n: 3,
  b: 3,
  r: 5,
  q: 9,
  k: 0,
};

const INITIAL_COUNTS: Record<PieceSymbol, number> = {
  p: 8,
  n: 2,
  b: 2,
  r: 2,
  q: 1,
  k: 1,
};

export function toPieceCode(color: PlayerColor, type: PieceSymbol): PieceCode {
  return `${color}${type.toUpperCase()}` as PieceCode;
}

/** Snapshot of the live board; row 0 is rank 8, col 0 is file a. */
export function getBoardSnapshot(chess: Chess): BoardSnapshot {
  return chess.board().map((row) =>
    row.map((cell): BoardPiece | null =>
      cell ? { type: cell.type, color: cell.color, code: toPieceCode(cell.color, cell.type) } : null,
    ),
  );
}

/**
 * Captured pieces per side, derived by diffing the current board against the
 * initial piece counts. Promotions are accounted for: promoted pieces count as
 * their original pawn, so a promoted queen does not appear as "extra".
 */
export function getCapturedPieces(chess: Chess): CapturedPieces {
  const board = chess.board();
  const current: Record<PlayerColor, Record<PieceSymbol, number>> = {
    w: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
    b: { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 },
  };
  for (const row of board) {
    for (const cell of row) {
      if (cell) current[cell.color][cell.type] += 1;
    }
  }

  // Promotion-aware diffing: pawns absorb surpluses of promoted piece types.
  const capturedBy = (from: PlayerColor): PieceSymbol[] => {
    const them: PlayerColor = from === 'w' ? 'b' : 'w';
    const counts = { ...current[them] };
    // Fold promoted pieces back into pawns before diffing.
    for (const type of ['q', 'r', 'b', 'n'] as PieceSymbol[]) {
      const surplus = counts[type] - INITIAL_COUNTS[type];
      if (surplus > 0) {
        counts[type] -= surplus;
        counts.p += surplus;
      }
    }
    const out: PieceSymbol[] = [];
    for (const type of ['q', 'r', 'b', 'n', 'p'] as PieceSymbol[]) {
      const missing = Math.max(0, INITIAL_COUNTS[type] - counts[type]);
      for (let i = 0; i < missing; i++) out.push(type);
    }
    return out.sort((a, b) => PIECE_VALUES[b] - PIECE_VALUES[a]);
  };

  return { byWhite: capturedBy('w'), byBlack: capturedBy('b') };
}

/** Material advantage in pawn units from `color`'s perspective, from captured lists. */
export function materialDelta(captured: CapturedPieces, color: PlayerColor): number {
  const sum = (list: PieceSymbol[]) => list.reduce((acc, t) => acc + PIECE_VALUES[t], 0);
  const mine = color === 'w' ? captured.byWhite : captured.byBlack;
  const theirs = color === 'w' ? captured.byBlack : captured.byWhite;
  return sum(mine) - sum(theirs);
}

export function getGameStatus(chess: Chess): GameStatus {
  if (chess.isCheckmate()) return 'checkmate';
  if (chess.isStalemate()) return 'stalemate';
  if (chess.isThreefoldRepetition()) return 'draw-repetition';
  if (chess.isDrawByFiftyMoves()) return 'draw-fifty';
  if (chess.isInsufficientMaterial()) return 'draw-material';
  if (chess.isCheck()) return 'check';
  return 'playing';
}

export function isGameOverStatus(status: GameStatus): boolean {
  return status !== 'playing' && status !== 'check';
}

/**
 * Display coordinates for a square given the board orientation.
 * Row 0 / col 0 is the top-left square as rendered.
 */
export function squareToCoords(
  square: Square,
  orientation: PlayerColor,
): { row: number; col: number } {
  const file = FILES.indexOf(square[0] as (typeof FILES)[number]);
  const rank = Number(square[1]); // 1..8
  if (orientation === 'w') {
    return { row: 8 - rank, col: file };
  }
  return { row: rank - 1, col: 7 - file };
}

export function coordsToSquare(row: number, col: number, orientation: PlayerColor): Square {
  const file = orientation === 'w' ? col : 7 - col;
  const rank = orientation === 'w' ? 8 - row : row + 1;
  return `${FILES[file]}${rank}` as Square;
}

/** Locate the king of `color` — used for the check highlight. */
export function findKingSquare(chess: Chess, color: PlayerColor): Square | null {
  for (const row of chess.board()) {
    for (const cell of row) {
      if (cell && cell.type === 'k' && cell.color === color) return cell.square;
    }
  }
  return null;
}
