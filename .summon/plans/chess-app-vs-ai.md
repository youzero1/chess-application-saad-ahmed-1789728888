---
status: pending
title: Chess web app vs AI with classic wooden board
---

# Chess App Implementation Plan

## Key decisions (with justification)

1. **Rules engine: use the `chess.js` npm library (dependency), do NOT hand-roll chess logic.**
   Justification: full FIDE rule coverage (castling legality, en passant, promotion, check/checkmate, stalemate, insufficient material, threefold repetition, 50-move rule) is large and bug-prone; chess.js is battle-tested, tiny, typed, and exposes verbose legal-move generation which directly powers the legal-move dot highlighting.
2. **AI: custom minimax with alpha-beta pruning + piece-square tables, evaluated over chess.js move generation, running inside a Web Worker** (`new Worker(new URL(...), { type: 'module' })`, supported natively by Vite). Justification: keeps search off the main thread so the board never freezes; depth-based difficulty (easy = depth 1, medium = depth 2, hard = depth 3, with a small random jitter among near-equal moves on easy/medium) is simple, predictable, and testable.
3. **Pieces: inline SVG React components using the public-domain Cburnett chess piece shapes** (12 components or one map keyed by piece code). Justification: Cburnett is the standard classic look (used on Wikipedia/Lichess), scales crisply, renders identically on every platform (unlike unicode glyphs which vary by OS font), and accepts CSS drop-shadows for the traditional feel.
4. **State: one source-of-truth `useChessGame` hook** holding a mutable `Chess` instance in a ref plus React state snapshots (board array, turn, status, history, captured pieces). Board orientation flips when the player chooses black.

## Milestone 1 — Foundation, rules, and interactive board (2-player local, no AI yet)

1. Add dependency: `chess.js` (npm install). Expected outcome: importable `Chess` class and types.
2. Create `src/types/chess.ts`: shared types — `PieceCode`, `SquareName`, `BoardSnapshot` (8x8 array of piece-or-null), `GameStatus` (`playing | check | checkmate | stalemate | draw-repetition | draw-fifty | draw-material`), `PlayerColor`, `Difficulty`, `PendingPromotion`, `CapturedPieces`. Expected outcome: all later modules import from here; no `any`.
3. Create `src/lib/chess-utils.ts`: pure helpers — derive `BoardSnapshot` from a `Chess` instance, compute captured pieces per side by diffing current board against the initial piece counts, derive `GameStatus` from chess.js predicates (`isCheckmate`, `isStalemate`, `isThreefoldRepetition`, `isFiftyMoveRule`/`isDraw`, `isInsufficientMaterial`, `inCheck`), map a square name to row/col given orientation. Expected outcome: unit-testable logic isolated from React.
4. Create `src/hooks/useChessGame.ts`: the central hook. Holds the `Chess` instance in a ref; exposes `snapshot`, `status`, `turn`, `history` (SAN strings from chess.js history), `capturedPieces`, `selectedSquare` + `legalTargets`, `selectSquare(square)` (select own piece → compute verbose legal moves for that square; click a legal target → execute move; click elsewhere → deselect/reselect), `requestPromotionChoice(piece)`, `reset(playerColor)`, `makeEngineMove(move)`. Promotion flow: when a human pawn move reaches the last rank, set `pendingPromotion` instead of committing; the dialog's choice completes the move. Expected outcome: full local 2-player chess playable via hook alone.
5. Create `src/components/pieces/` with 12 Cburnett SVG React components (`WhiteKing` … `BlackPawn`) plus `src/components/pieces/index.ts` exporting a `Record<PieceCode, ComponentType>` map. Keep SVGs un-styled internally; sizing via `w-full h-full`, subtle drop-shadow via parent class. Expected outcome: any piece renders at any size.
6. Create `src/components/ChessBoard.tsx` and `src/components/Square.tsx`: render the 8x8 snapshot (row order flipped when player is black), coordinate labels (a–h, 1–8) on edges, click handling routed to `selectSquare`, legal-move indicators (small dot on empty target squares, ring on capture target squares), highlight for selected square, last-move from/to tint, and red tint on the checked king's square. Expected outcome: click-to-select, click-to-move works with all standard rules enforced by chess.js; illegal clicks are ignored.
7. Wire into `src/routes/index.tsx`: render `ChessBoard` driven by `useChessGame` on a neutral placeholder layout. Expected outcome: playable local game in the browser (milestone checkpoint).

## Milestone 2 — Game chrome: status, history, captures, promotion, game over, restart

8. Create `src/components/PromotionDialog.tsx`: modal shown when `pendingPromotion` is set; offers queen, rook, bishop, knight rendered with the same SVG piece set in the player's color; choice calls `requestPromotionChoice`. Expected outcome: promotion always explicit; no auto-queen.
9. Create `src/components/GameStatus.tsx`: banner showing side to move, "Check!", and end states ("Checkmate — White wins", "Stalemate — draw", "Draw by repetition", etc.). Expected outcome: status always visible and unambiguous.
10. Create `src/components/MoveHistory.tsx`: scrollable two-column list (move number, white SAN, black SAN) from the hook's history; auto-scrolls to latest move. Expected outcome: full SAN record alongside the board.
11. Create `src/components/CapturedPieces.tsx`: two rows (pieces White captured, pieces Black captured) using small SVG pieces, plus a material-score delta (pawn=1 … queen=9). Expected outcome: captures visible for both sides.
12. Create `src/components/GameOverDialog.tsx`: modal on terminal status with result text and a "Play again" button calling `reset` with the same color choice. Expected outcome: clear end-of-game flow.
13. Create `src/components/GameControls.tsx`: "New game" button, color picker (play as White / Black), and difficulty picker (Easy / Medium / Hard) — difficulty state lives in the page for Milestone 3. Expected outcome: restart and side selection work; choosing Black flips board orientation.

## Milestone 3 — AI opponent (worker-based minimax)

14. Create `src/lib/engine.ts` (runs inside the worker): material values, piece-square tables (pawns/knights/bishops/rooks/queen/king, midgame king table; mirrored for black), `evaluate(chess)` returning centipawn score from White's perspective, `orderMoves` (captures first via MVV-LVA for better pruning), and `search(chess, depth, alpha, beta)` negamax with alpha-beta; expose `findBestMove(fen, depth)` returning the best move in chess.js move format. Terminal handling: checkmate scored as ±large minus ply (prefer faster mates), stalemate/draw scored 0. Expected outcome: deterministic engine; depth 3 answers in well under ~2s from the opening.
15. Create `src/lib/ai.worker.ts`: message handler accepting `{ fen, depth }`, calling `findBestMove`, posting back `{ move }` (or `{ move: null }` when no legal moves). Expected outcome: engine runs off the main thread.
16. Create `src/hooks/useChessAI.ts`: instantiates the worker once (cleanup on unmount), watches game state — whenever it is the AI's turn and status is `playing`/`check`, posts `{ fen, depth }` (depth from selected difficulty: 1/2/3; easy picks randomly among top moves within a small evaluation window to feel human) and applies the returned move via `makeEngineMove`. Guards: ignore stale responses after `reset`; if the player chose Black, trigger the AI's opening move immediately after reset. Expected outcome: human plays White or Black; AI always responds; UI stays responsive with a subtle "thinking" indicator while awaiting the worker.
17. Integrate in `src/routes/index.tsx`: compose `useChessGame` + `useChessAI` + all components into the final layout — board left/center, sidebar right (status, captured pieces, move history, controls), dialogs overlaid. Human input disabled while the AI is thinking. Expected outcome: complete human-vs-computer game loop (milestone checkpoint).

## Milestone 4 — Classic wooden design, polish, edge cases

18. Update `src/styles/global.css` (must keep `@import "tailwindcss";` as the first line): define Tailwind v4 `@theme` tokens — wood palette (light square warm maple, dark square deep walnut, frame dark mahogany), accent gold, and a serif display font stack (e.g. Playfair Display via Google Fonts import with serif fallbacks). Expected outcome: theme consumable as `bg-wood-light`, `text-gold`, `font-display`, etc.
19. Build the wooden board look in `src/components/ChessBoard.tsx`: thick frame with layered gradient (simulated wood grain via repeating linear gradients — no image assets), inset board shadow, rich brown square tones, soft piece drop-shadows, rounded outer corners, felt-like page background (deep warm neutral). Expected outcome: convincing classic wooden set; fully responsive (board sizes via `min(90vw, …)` square aspect).
20. Polish interactions in `src/components/`: smooth piece movement via CSS transition on square contents or a brief scale/fade on arrival, hover cursor affordances, last-move and check highlights from step 6 confirmed visually distinct against wood tones, small sound-free "thinking" spinner for the AI. Expected outcome: traditional feel without clutter.
21. Update `src/routes/__root.tsx` shell: serif title header ("Chess"), warm page background token, centered max-width layout. Expected outcome: cohesive app frame.
22. Edge-case hardening pass across `src/hooks/useChessGame.ts` and `src/hooks/useChessAI.ts`: verify en passant capture availability and execution, castling through/out of check correctly rejected by chess.js, promotion while giving check, checkmate by promotion, stalemate vs checkmate disambiguation, threefold repetition and 50-move draws surfaced distinctly, insufficient-material draw, reset during AI thinking cancels the pending worker result, and rapid re-clicking during AI turn is inert. Expected outcome: every listed edge case behaves per standard rules.
23. Final sweep: TypeScript strict pass clean, no unused files, board readable on mobile widths, `MoveHistory` scrolls, dialogs trap focus reasonably. Expected outcome: shippable app.

## Notes for the builder

- Never edit `src/routeTree.gen.ts`; the router plugin regenerates it.
- Single route (`src/routes/index.tsx`) is sufficient; no additional routes needed.
- If the worker proves problematic, fallback: run the same `src/lib/engine.ts` search on the main thread chunked via `setTimeout` slices — keep `useChessAI`'s interface unchanged either way.
