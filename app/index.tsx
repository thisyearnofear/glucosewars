import React, { useState, useEffect, useRef } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MainMenu } from '@/components/game/MainMenu';
import { BattleScreen } from '@/components/game/BattleScreen';
import { ResultsScroll } from '@/components/game/ResultsScroll';
import { Onboarding } from '@/components/game/Onboarding';
import { useBattleGame } from '@/hooks/useBattleGame';
import { ControlMode, GameMode } from '@/types/game';

type GameScreen = 'menu' | 'onboarding' | 'battle' | 'results';

export default function HomeScreen() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');
  const [controlMode, setControlMode] = useState<ControlMode>('swipe');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const hasTransitionedToResults = useRef(false);
  
  const {
    gameState,
    startGame,
    handleSwipe,
    useExercise,
    useRations,
    pauseGame,
    resumeGame,
    restartGame,
    consumeSavedFood,
  } = useBattleGame();

  const handleOnboardingComplete = (mode: ControlMode) => {
    setControlMode(mode);
    setHasSeenOnboarding(true);
    setCurrentScreen('battle');
    startGame(gameMode);
  };

  const handleSkipOnboarding = (mode: ControlMode) => {
    setControlMode(mode);
    setHasSeenOnboarding(true);
    setCurrentScreen('battle');
    startGame(gameMode);
  };

  const handleStartBattle = (mode: ControlMode, selectedGameMode: GameMode) => {
    setControlMode(mode);
    setGameMode(selectedGameMode);
    // Show onboarding if first time, otherwise go straight to battle
    if (!hasSeenOnboarding) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('battle');
      startGame(selectedGameMode);
    }
  };

  const handleRestart = () => {
    setCurrentScreen('battle');
    startGame(gameMode);
  };

  const handleMainMenu = () => {
    setCurrentScreen('menu');
  };

  // Check if game ended and we need to show results - use useEffect to avoid infinite re-renders
  useEffect(() => {
    if (currentScreen === 'battle' && !gameState.isGameActive && gameState.gameResult && !hasTransitionedToResults.current) {
      hasTransitionedToResults.current = true;
      const timer = setTimeout(() => {
        setCurrentScreen('results');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentScreen, gameState.isGameActive, gameState.gameResult]);

  // Reset transition flag when starting a new game
  useEffect(() => {
    if (currentScreen === 'battle' && gameState.isGameActive) {
      hasTransitionedToResults.current = false;
    }
  }, [currentScreen, gameState.isGameActive]);

  // Show main menu
  if (currentScreen === 'menu') {
    return (
      <View className="flex-1">
        <MainMenu onStartBattle={handleStartBattle} />
      </View>
    );
  }

  // Show onboarding (after pressing start, before first game)
  if (currentScreen === 'onboarding') {
    return (
      <View className="flex-1">
        <Onboarding 
          onComplete={handleOnboardingComplete}
          onSkip={handleSkipOnboarding}
          defaultControlMode={controlMode}
          gameMode={gameMode}
        />
      </View>
    );
  }

  // Show results screen
  if (currentScreen === 'results') {
    return (
      <ResultsScroll
        result={gameState.gameResult || 'defeat'}
        score={gameState.score}
        glucoseLevel={gameState.stability}
        correctSwipes={gameState.correctSwipes}
        incorrectSwipes={gameState.incorrectSwipes}
        timeInBalanced={gameState.timeInBalanced}
        comboMax={gameState.comboCount}
        onPlayAgain={handleRestart}
        onMainMenu={handleMainMenu}
        gameMode={gameState.gameMode}
        finalMetrics={gameState.metrics}
        morningCondition={gameState.morningCondition}
      />
    );
  }

  // Handle exit to main menu
  const handleExit = () => {
    setCurrentScreen('menu');
  };

  // Show battle screen
  return (
    <View style={{ flex: 1, backgroundColor: '#0a0a12' }}>
      <BattleScreen
        gameState={gameState}
        onSwipe={handleSwipe}
        onExercise={useExercise}
        onRations={useRations}
        controlMode={controlMode}
        onPause={pauseGame}
        onResume={resumeGame}
        onRestart={() => restartGame(gameMode)}
        onConsumeSaved={consumeSavedFood}
        onExit={handleExit}
      />
    </View>
  );
}
