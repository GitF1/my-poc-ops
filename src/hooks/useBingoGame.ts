import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { BingoSquareData, BingoLine, GameState } from '../types';
import {
  generateBoard,
  toggleSquare,
  checkBingo,
  getWinningSquareIds,
} from '../utils/bingoLogic';

export interface BingoGameState {
  gameState: GameState;
  board: BingoSquareData[];
  winningLine: BingoLine | null;
  winningSquareIds: Set<number>;
  showBingoModal: boolean;
  playerName: string;
  winsCount: number;
  markedCount: number;
}

export interface BingoGameActions {
  startGame: (name: string) => void;
  handleSquareClick: (squareId: number) => void;
  resetGame: () => void;
  dismissModal: () => void;
  newCard: () => void;
}

const STORAGE_KEY = 'bingo-game-state';
const STORAGE_KEY_PLAYER = 'bingo-player-name';
const STORAGE_KEY_WINS = 'bingo-wins-count';
const STORAGE_VERSION = 1;

interface StoredGameData {
  version: number;
  gameState: GameState;
  board: BingoSquareData[];
  winningLine: BingoLine | null;
}

function validateStoredData(data: unknown): data is StoredGameData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const obj = data as Record<string, unknown>;
  
  if (obj.version !== STORAGE_VERSION) {
    return false;
  }
  
  if (typeof obj.gameState !== 'string' || !['start', 'playing', 'bingo'].includes(obj.gameState)) {
    return false;
  }
  
  if (!Array.isArray(obj.board) || (obj.board.length !== 0 && obj.board.length !== 25)) {
    return false;
  }
  
  const validSquares = obj.board.every((sq: unknown) => {
    if (!sq || typeof sq !== 'object') return false;
    const square = sq as Record<string, unknown>;
    return (
      typeof square.id === 'number' &&
      typeof square.text === 'string' &&
      typeof square.isMarked === 'boolean' &&
      typeof square.isFreeSpace === 'boolean'
    );
  });
  
  if (!validSquares) {
    return false;
  }
  
  if (obj.winningLine !== null) {
    if (typeof obj.winningLine !== 'object') {
      return false;
    }
    const line = obj.winningLine as Record<string, unknown>;
    if (
      typeof line.type !== 'string' ||
      !['row', 'column', 'diagonal'].includes(line.type) ||
      typeof line.index !== 'number' ||
      !Array.isArray(line.squares)
    ) {
      return false;
    }
  }
  
  return true;
}

function loadGameState(): Pick<BingoGameState, 'gameState' | 'board' | 'winningLine'> | null {
  // SSR guard
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return null;
    }

    const parsed = JSON.parse(saved);
    
    if (validateStoredData(parsed)) {
      return {
        gameState: parsed.gameState,
        board: parsed.board,
        winningLine: parsed.winningLine,
      };
    } else {
      console.warn('Invalid game state data in localStorage, clearing...');
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch (error) {
    console.warn('Failed to load game state:', error);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  return null;
}

function saveGameState(gameState: GameState, board: BingoSquareData[], winningLine: BingoLine | null): void {
  // SSR guard
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const data: StoredGameData = {
      version: STORAGE_VERSION,
      gameState,
      board,
      winningLine,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('Failed to save game state:', error);
  }
}

function loadPlayerName(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY_PLAYER) ?? '';
  } catch {
    return '';
  }
}

function savePlayerName(name: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_PLAYER, name);
  } catch {
    // ignore
  }
}

function loadWinsCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WINS);
    const parsed = raw !== null ? parseInt(raw, 10) : 0;
    return isNaN(parsed) ? 0 : parsed;
  } catch {
    return 0;
  }
}

function saveWinsCount(count: number): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_WINS, String(count));
  } catch {
    // ignore
  }
}

export function useBingoGame(): BingoGameState & BingoGameActions {
  const loadedState = useMemo(() => loadGameState(), []);

  const [gameState, setGameState] = useState<GameState>(
    () => loadedState?.gameState || 'start'
  );
  const [board, setBoard] = useState<BingoSquareData[]>(
    () => loadedState?.board || []
  );
  const [winningLine, setWinningLine] = useState<BingoLine | null>(
    () => loadedState?.winningLine || null
  );
  const [showBingoModal, setShowBingoModal] = useState(false);
  const [playerName, setPlayerName] = useState<string>(() => loadPlayerName());
  const [winsCount, setWinsCount] = useState<number>(() => loadWinsCount());

  // Refs to coordinate bingo side-effects outside of the setBoard updater
  const bingoPendingRef = useRef<BingoLine | null>(null);
  const winsIncrementPendingRef = useRef(false);

  const winningSquareIds = useMemo(
    () => getWinningSquareIds(winningLine),
    [winningLine]
  );

  const markedCount = useMemo(
    () => board.filter((sq) => sq.isMarked && !sq.isFreeSpace).length,
    [board]
  );

  // Save game state to localStorage whenever it changes
  useEffect(() => {
    saveGameState(gameState, board, winningLine);
  }, [gameState, board, winningLine]);

  const startGame = useCallback((name: string) => {
    const trimmed = name.trim();
    setPlayerName(trimmed);
    savePlayerName(trimmed);
    setBoard(generateBoard());
    setWinningLine(null);
    setGameState('playing');
  }, []);

  const newCard = useCallback(() => {
    setBoard(generateBoard());
    setWinningLine(null);
    setGameState('playing');
    setShowBingoModal(false);
    // Clear any pending bingo side-effects when starting a new card
    bingoPendingRef.current = null;
    winsIncrementPendingRef.current = false;
  }, []);

  const handleSquareClick = useCallback(
    (squareId: number) => {
      setBoard((currentBoard) => {
        const newBoard = toggleSquare(currentBoard, squareId);

        // Check for bingo after toggling
        const bingo = checkBingo(newBoard);
        if (bingo && !winningLine && !winsIncrementPendingRef.current) {
          // Record bingo; actual side-effects will run after setBoard returns
          bingoPendingRef.current = bingo;
          winsIncrementPendingRef.current = true;
        }

        return newBoard;
      });

      // Run bingo side-effects outside of the setBoard updater
      if (winsIncrementPendingRef.current && bingoPendingRef.current) {
        const bingo = bingoPendingRef.current;
        // Clear refs before performing side-effects to avoid re-entry issues
        bingoPendingRef.current = null;
        winsIncrementPendingRef.current = false;

        setWinningLine(bingo);
        setGameState('bingo');
        setShowBingoModal(true);
        setWinsCount((prev) => {
          const next = prev + 1;
          saveWinsCount(next);
          return next;
        });
      }
    },
    [winningLine]
  );

  const resetGame = useCallback(() => {
    setGameState('start');
    setBoard([]);
    setWinningLine(null);
    setShowBingoModal(false);
    // Clear any pending bingo side-effects when resetting the game
    bingoPendingRef.current = null;
    winsIncrementPendingRef.current = false;
  }, []);

  const dismissModal = useCallback(() => {
    setShowBingoModal(false);
  }, []);

  return {
    gameState,
    board,
    winningLine,
    winningSquareIds,
    showBingoModal,
    playerName,
    winsCount,
    markedCount,
    startGame,
    handleSquareClick,
    resetGame,
    dismissModal,
    newCard,
  };
}
