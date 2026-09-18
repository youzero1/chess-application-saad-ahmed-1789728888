import type { ComponentType } from 'react';
import type { PieceCode } from '@/types/chess';
import { WhiteKing } from './WhiteKing';
import { WhiteQueen } from './WhiteQueen';
import { WhiteRook } from './WhiteRook';
import { WhiteBishop } from './WhiteBishop';
import { WhiteKnight } from './WhiteKnight';
import { WhitePawn } from './WhitePawn';
import { BlackKing } from './BlackKing';
import { BlackQueen } from './BlackQueen';
import { BlackRook } from './BlackRook';
import { BlackBishop } from './BlackBishop';
import { BlackKnight } from './BlackKnight';
import { BlackPawn } from './BlackPawn';

export const PIECE_COMPONENTS: Record<PieceCode, ComponentType> = {
  wK: WhiteKing,
  wQ: WhiteQueen,
  wR: WhiteRook,
  wB: WhiteBishop,
  wN: WhiteKnight,
  wP: WhitePawn,
  bK: BlackKing,
  bQ: BlackQueen,
  bR: BlackRook,
  bB: BlackBishop,
  bN: BlackKnight,
  bP: BlackPawn,
};
