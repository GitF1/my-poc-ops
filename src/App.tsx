import { useBingoGame } from './hooks/useBingoGame';
import { StartScreen } from './components/StartScreen';
import { GameScreen } from './components/GameScreen';
import { BingoModal } from './components/BingoModal';

function App() {
  const {
    gameState,
    board,
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
  } = useBingoGame();

  if (gameState === 'start') {
    return <StartScreen onStart={startGame} initialName={playerName} winsCount={winsCount} />;
  }

  return (
    <>
      <GameScreen
        board={board}
        winningSquareIds={winningSquareIds}
        hasBingo={gameState === 'bingo'}
        playerName={playerName}
        markedCount={markedCount}
        onSquareClick={handleSquareClick}
        onReset={resetGame}
        onNewCard={newCard}
      />
      {showBingoModal && (
        <BingoModal onDismiss={dismissModal} playerName={playerName} />
      )}
    </>
  );
}

export default App;
