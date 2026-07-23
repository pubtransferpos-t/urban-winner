/**
 * Chess board — chess.com visual style.
 * Colors: light #f0d9b5 / dark #b58863
 * Highlights: last-move, selected, legal-move dots.
 */

import { Chess, Move, Square, Color } from 'chess.js';
import { GambitState } from '@/hooks/gambit-engine';
import { ChessPiece } from './chess-pieces';

const SQ_LIGHT = '#f0d9b5';
const SQ_DARK  = '#b58863';

interface ChessBoardProps {
  chess: Chess;
  state: GambitState;
  selectedSquare: Square | null;
  legalMoves: Move[];
  lastMove: { from: Square; to: Square } | null;
  onSquareClick: (sq: Square) => void;
  /** null = both sides playable. Otherwise board is oriented for this color. */
  playerColor: Color | null;
  effectTargeting: { effect: string; by: Color; step: number; selected: Square[] } | null;
}

export default function ChessBoard({
  chess,
  state,
  selectedSquare,
  legalMoves,
  lastMove,
  onSquareClick,
  playerColor,
  effectTargeting,
}: ChessBoardProps) {
  const board = chess.board();
  const isFlipped = playerColor === 'b';

  const legalTargets = new Set(legalMoves.map(m => m.to));
  const legalCaptures = new Set(
    legalMoves.filter(m => m.flags.includes('c') || m.flags.includes('e')).map(m => m.to),
  );

  const frozenSquares = new Set(
    [...state.activeEffects.w, ...state.activeEffects.b]
      .filter(e => e.type === 'freeze_piece')
      .flatMap(e => e.targetSquares),
  );
  const shieldedSquares = new Set(
    [...state.activeEffects.w, ...state.activeEffects.b]
      .filter(e => e.type === 'shield_piece')
      .flatMap(e => e.targetSquares),
  );
  const targetingSelected = new Set(effectTargeting?.selected ?? []);

  const files = isFlipped
    ? ['h','g','f','e','d','c','b','a']
    : ['a','b','c','d','e','f','g','h'];
  const ranks = isFlipped
    ? ['1','2','3','4','5','6','7','8']
    : ['8','7','6','5','4','3','2','1'];

  const rows = isFlipped ? [...board].reverse() : board;

  return (
    <div className="inline-block select-none" style={{ lineHeight: 0 }}>
      {/* Board + rank labels */}
      <div className="flex">
        {/* Rank labels */}
        <div
          className="flex flex-col justify-around pr-1"
          style={{ width: 16, flexShrink: 0 }}
        >
          {ranks.map(r => (
            <span
              key={r}
              className="text-[10px] font-semibold text-gray-400 leading-none"
              style={{ height: 0, display: 'flex', alignItems: 'center' }}
            >
              {r}
            </span>
          ))}
        </div>

        {/* The 8×8 grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            width: 'min(80vw, 520px)',
            height: 'min(80vw, 520px)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {rows.map((row, ri) => {
            const rank = ranks[ri];
            const displayRow = isFlipped ? [...row].reverse() : row;

            return displayRow.map((cell, fi) => {
              const file = files[fi];
              const sq = `${file}${rank}` as Square;

              /* base square colour */
              const isLight = (ri + fi) % 2 === 0;
              const baseBg = isLight ? SQ_LIGHT : SQ_DARK;

              /* highlight overlays */
              const isLastMove =
                lastMove && (sq === lastMove.from || sq === lastMove.to);
              const isSelected =
                sq === selectedSquare || targetingSelected.has(sq);
              const isLegalTarget = legalTargets.has(sq);
              const isFrozen = frozenSquares.has(sq);
              const isShielded = shieldedSquares.has(sq);

              return (
                <div
                  key={sq}
                  onClick={() => onSquareClick(sq)}
                  className="relative cursor-pointer"
                  style={{ backgroundColor: baseBg, aspectRatio: '1' }}
                >
                  {/* Last-move tint */}
                  {isLastMove && !isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundColor: 'rgba(155,199,0,0.41)' }}
                    />
                  )}

                  {/* Selected tint */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ backgroundColor: 'rgba(20,85,30,0.5)' }}
                    />
                  )}

                  {/* Legal move indicator */}
                  {isLegalTarget && !cell && (
                    <div
                      className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    >
                      <div
                        style={{
                          width: '33%',
                          height: '33%',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.20)',
                        }}
                      />
                    </div>
                  )}
                  {isLegalTarget && cell && (
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        borderRadius: '50%',
                        boxShadow: 'inset 0 0 0 4px rgba(0,0,0,0.20)',
                      }}
                    />
                  )}

                  {/* Effect badges */}
                  {(isFrozen || isShielded) && (
                    <div className="absolute top-0.5 right-0.5 z-10 text-[8px] leading-none pointer-events-none">
                      {isFrozen && '❄'}
                      {isShielded && '🛡'}
                    </div>
                  )}

                  {/* Piece */}
                  {cell && (
                    <div className="absolute inset-0 p-[5%]">
                      <ChessPiece piece={cell} />
                    </div>
                  )}
                </div>
              );
            });
          })}
        </div>
      </div>

      {/* File labels */}
      <div
        className="flex pl-4 pt-1"
        style={{ width: 'calc(min(80vw, 520px) + 16px)' }}
      >
        {files.map(f => (
          <div
            key={f}
            className="text-[10px] font-semibold text-gray-400 text-center"
            style={{ flex: 1 }}
          >
            {f}
          </div>
        ))}
      </div>
    </div>
  );
}
