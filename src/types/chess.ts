import type { Square, PieceSymbol, Color } from 'chess.js';

export type { Square, PieceSymbol };

/** 'w' (white) or 'b' (black) — matches chess.js Color. */
export type PlayerColor = Color;

/** Uppercase piece letter prefixed by color, e.g. 'wP' (white pawn), 'bK' (black king). */
export type PieceCode =
  | 'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK'
  | 'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK';

export interface BoardPiece {
  type: PieceSymbol;
  color: PlayerColor;
  code: PieceCode;
}

/** 8x8 board, row 0 = rank 8, row 7 = rank 1 (white-at-bottom orientation). */
export type BoardSnapshot = (BoardPiece | null)[][];

export type GameStatus =
  | 'playing'
  | 'check'
  | 'checkmate'
  | 'stalemate'
  | 'draw-repetition'
  | 'draw-fifty'
  | 'draw-material';

export type Difficulty = 'easy' | 'medium' | 'hard';

/** A human pawn move awaiting the player's promotion piece choice. */
export interface PendingPromotion {
  from: Square;
  to: Square;
}

export type PromotionChoice = 'q' | 'r' | 'b' | 'n';

/** Opponent pieces each side has captured, e.g. byWhite holds black piece symbols. */
export interface CapturedPieces {
  byWhite: PieceSymbol[];
  byBlack: PieceSymbol[];
}

/** Minimal move shape shared by human moves and engine replies. */
export interface MoveInput {
  from: Square;
  to: Square;
  promotion?: PromotionChoice;
}
