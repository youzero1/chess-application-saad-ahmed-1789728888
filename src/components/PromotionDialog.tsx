import { useEffect, useRef } from 'react';
import { toPieceCode } from '@/lib/chess-utils';
import type { PendingPromotion, PlayerColor, PromotionChoice } from '@/types/chess';
import { PIECE_COMPONENTS } from '@/components/pieces';

interface PromotionDialogProps {
  pending: PendingPromotion;
  color: PlayerColor;
  onChoose: (piece: PromotionChoice) => void;
}

const CHOICES: { value: PromotionChoice; label: string }[] = [
  { value: 'q', label: 'Queen' },
  { value: 'r', label: 'Rook' },
  { value: 'b', label: 'Bishop' },
  { value: 'n', label: 'Knight' },
];

export function PromotionDialog({ pending, color, onChoose }: PromotionDialogProps) {
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    firstButtonRef.current?.focus();
  }, [pending]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Choose promotion piece"
    >
      <div className="w-full max-w-xs rounded-xl border border-violet/50 bg-plum-light p-5 shadow-2xl">
        <h2 className="mb-4 text-center font-display text-xl font-semibold text-mint">
          Promote pawn to
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {CHOICES.map((choice, i) => {
            const Icon = PIECE_COMPONENTS[toPieceCode(color, choice.value)];
            return (
              <button
                key={choice.value}
                ref={i === 0 ? firstButtonRef : undefined}
                type="button"
                title={choice.label}
                aria-label={choice.label}
                onClick={() => onChoose(choice.value)}
                className="rounded-lg border border-lavender-dim/30 bg-plum p-1.5 transition-colors hover:border-mint hover:bg-mint/15 focus:border-mint focus:outline-none"
              >
                <Icon />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
