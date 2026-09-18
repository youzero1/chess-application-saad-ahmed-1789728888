import { findBestMoves } from './engine';
import type { ScoredMove } from './engine';

export interface EngineRequest {
  id: number;
  fen: string;
  depth: number;
}

export interface EngineResponse {
  id: number;
  moves: ScoredMove[];
}

const ctx = self as unknown as {
  onmessage: ((e: MessageEvent<EngineRequest>) => void) | null;
  postMessage: (message: EngineResponse) => void;
};

ctx.onmessage = (e: MessageEvent<EngineRequest>) => {
  const { id, fen, depth } = e.data;
  const moves = findBestMoves(fen, depth);
  ctx.postMessage({ id, moves });
};
