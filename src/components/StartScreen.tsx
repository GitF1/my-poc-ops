import { useState } from 'react';

interface StartScreenProps {
  onStart: (name: string) => void;
  initialName: string;
  winsCount: number;
}

export function StartScreen({ onStart, initialName, winsCount }: StartScreenProps) {
  const [name, setName] = useState(initialName);

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 bg-gray-50">
      <div className="text-center max-w-sm w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Soc Ops</h1>
        <p className="text-lg text-gray-600 mb-8">Social Bingo</p>

        {winsCount > 0 && (
          <div className="flex items-center justify-center gap-2 mb-4 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg py-2 px-4">
            <span className="text-lg">🏆</span>
            <span className="text-sm font-semibold">{winsCount} {winsCount === 1 ? 'win' : 'wins'} so far!</span>
          </div>
        )}
        
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">How to play</h2>
          <ul className="text-left text-gray-600 text-sm space-y-2">
            <li>• Find people who match the questions</li>
            <li>• Tap a square when you find a match</li>
            <li>• Get 5 in a row to win!</li>
          </ul>
        </div>

        <div className="mb-6">
          <label htmlFor="player-name" className="block text-sm font-medium text-gray-700 mb-1 text-left">
            Your name (optional)
          </label>
          <input
            id="player-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onStart(name)}
            placeholder="Enter your name…"
            maxLength={30}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          />
        </div>

        <button
          onClick={() => onStart(name)}
          className="w-full bg-accent text-white font-semibold py-4 px-8 rounded-lg text-lg active:bg-accent-light transition-colors"
        >
          Start Game
        </button>
      </div>
    </div>
  );
}
