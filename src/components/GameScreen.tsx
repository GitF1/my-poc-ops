import type { BingoSquareData } from '../types';
import { BingoBoard } from './BingoBoard';

/** Total non-free squares on a 5×5 bingo board */
const TOTAL_SQUARES = 24;

interface GameScreenProps {
  board: BingoSquareData[];
  winningSquareIds: Set<number>;
  hasBingo: boolean;
  playerName: string;
  markedCount: number;
  onSquareClick: (squareId: number) => void;
  onReset: () => void;
  onNewCard: () => void;
}

export function GameScreen({
  board,
  winningSquareIds,
  hasBingo,
  playerName,
  markedCount,
  onSquareClick,
  onReset,
  onNewCard,
}: GameScreenProps) {
  return (
    <div className="flex flex-col min-h-full bg-gray-50">
      {/* Header */}
      <header className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
        <button
          onClick={onReset}
          className="text-gray-500 text-sm px-3 py-1.5 rounded active:bg-gray-100"
        >
          ← Back
        </button>
        <div className="text-center">
          <h1 className="font-bold text-gray-900 leading-tight">Soc Ops</h1>
          {playerName && (
            <p className="text-xs text-gray-500 leading-tight">{playerName}</p>
          )}
        </div>
        <button
          onClick={onNewCard}
          className="text-accent text-sm px-3 py-1.5 rounded active:bg-blue-50 font-medium"
        >
          New Card
        </button>
      </header>

      {/* Instructions + progress */}
      <div className="flex items-center justify-between px-4 py-2">
        <p className="text-gray-500 text-sm">
          Tap a square when you find someone who matches it.
        </p>
        <span className="text-xs font-semibold text-gray-500 shrink-0 ml-2">
          {markedCount}/{TOTAL_SQUARES}
        </span>
      </div>

      {/* Bingo indicator */}
      {hasBingo && (
        <div className="bg-amber-100 text-amber-800 text-center py-2 font-semibold text-sm">
          🎉 BINGO! You got a line!
        </div>
      )}

      {/* Board */}
      <div className="flex-1 flex items-center justify-center p-3">
        <BingoBoard
          board={board}
          winningSquareIds={winningSquareIds}
          onSquareClick={onSquareClick}
        />
      </div>
    </div>
  );
}
