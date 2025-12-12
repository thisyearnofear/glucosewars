import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, Share } from 'react-native';
import { BodyMetrics, GameMode, MorningCondition, GameState } from '@/types/game';
import { HealthProfile } from '@/types/health';
import { MORNING_CONDITIONS } from '@/constants/gameConfig';
import { useScrollIntegration } from '@/hooks/useScrollIntegration';
import { ScrollIntegration } from './ScrollIntegration';
import { GameTier } from '@/constants/gameTiers';

// Fun glucose facts and tips
const GLUCOSE_FACTS = [
  { emoji: '🧠', fact: 'Your brain uses 20% of daily glucose!', tip: 'Complex carbs = brain fuel' },
  { emoji: '🏃', fact: 'Exercise lowers blood sugar for 24hrs!', tip: '15-min walk after meals helps' },
  { emoji: '🥦', fact: 'Fiber slows glucose absorption 50%!', tip: 'Eat veggies first, carbs last' },
  { emoji: '💤', fact: 'Poor sleep = 25% more insulin resistance!', tip: 'Aim for 7-9 hours nightly' },
  { emoji: '💧', fact: 'Dehydration spikes blood sugar!', tip: 'Drink water before meals' },
  { emoji: '🍳', fact: 'Protein breakfast = stable glucose!', tip: 'Start with eggs, not cereal' },
];

// Funny share messages based on performance
const getShareMessage = (score: number, accuracy: number, grade: string) => {
  const messages = {
    S: `🏆 ${score} pts in Glucose Wars! ${accuracy}% accuracy. My pancreas is PROUD!`,
    A: `⚔️ ${score} pts in Glucose Wars! ${accuracy}% accuracy. Glucose game STRONG 💪`,
    B: `🎮 ${score} pts in Glucose Wars! Vegetables ARE allies 🥦`,
    C: `🍩 ${score} pts in Glucose Wars! Donuts won some battles...`,
    D: `💀 ${score} pts in Glucose Wars. The sugar horde showed no mercy!`,
  };
  return messages[grade as keyof typeof messages] || messages.D;
};

interface ResultsScrollProps {
  result: 'victory' | 'defeat';
  score: number;
  glucoseLevel: number;
  correctSwipes?: number;
  incorrectSwipes?: number;
  timeInBalanced?: number;
  comboMax?: number;
  onPlayAgain: () => void;
  onMainMenu: () => void;
  gameMode?: GameMode;
  finalMetrics?: BodyMetrics;
  morningCondition?: MorningCondition;
  gameState?: GameState;
  healthProfile?: HealthProfile;
  tier?: GameTier;
  dexcomOption?: boolean;
}

export const ResultsScroll: React.FC<ResultsScrollProps> = ({
  result,
  score,
  glucoseLevel,
  correctSwipes = 0,
  incorrectSwipes = 0,
  timeInBalanced = 0,
  comboMax = 0,
  onPlayAgain,
  onMainMenu,
  gameMode = 'classic',
  finalMetrics,
  morningCondition,
  gameState,
  healthProfile,
  tier,
  dexcomOption,
}) => {
  const isVictory = result === 'victory';
  const scrollAnim = useRef(new Animated.Value(-500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [showTipsCard, setShowTipsCard] = useState(false);
  const [showScrollPanel, setShowScrollPanel] = useState(false);
  const [randomFact] = useState(() => GLUCOSE_FACTS[Math.floor(Math.random() * GLUCOSE_FACTS.length)]);
  const { evaluateAchievements, mintAchievements } = useScrollIntegration();

  // Evaluate achievements when game ends
  useEffect(() => {
    if (gameState && isVictory) {
      const unlockedIds = evaluateAchievements(gameState);
      if (unlockedIds.length > 0) {
        setShowScrollPanel(true);
      }
    }
  }, [gameState, isVictory, evaluateAchievements]);

  useEffect(() => {
    // Scroll unfurl animation
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scrollAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
        }),
      ]),
    ]).start();
  }, []);

  const accuracy = correctSwipes + incorrectSwipes > 0 
    ? Math.round((correctSwipes / (correctSwipes + incorrectSwipes)) * 100) 
    : 0;

  const getGrade = () => {
    if (score >= 500 && accuracy >= 90) return { grade: 'S', color: '#fbbf24', title: 'LEGENDARY!' };
    if (score >= 400 && accuracy >= 80) return { grade: 'A', color: '#22c55e', title: 'EXCELLENT!' };
    if (score >= 300 && accuracy >= 70) return { grade: 'B', color: '#3b82f6', title: 'GREAT!' };
    if (score >= 200 && accuracy >= 60) return { grade: 'C', color: '#a855f7', title: 'GOOD' };
    return { grade: 'D', color: '#ef4444', title: 'KEEP TRYING' };
  };

  const gradeInfo = getGrade();
  
  // Share functionality
  const handleShare = async () => {
    const message = getShareMessage(score, accuracy, gradeInfo.grade);
    const url = 'https://748aff3b-fb26-4f04-8101-7fe9e9b19d93.canvases.tempo.build';
    
    try {
      await Share.share({
        message: `${message}\n\n🎮 Play: ${url}`,
        title: 'Glucose Wars',
      });
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  // Tips card content
  const TipsCard = () => (
    <View style={{ 
      backgroundColor: 'rgba(0,0,0,0.9)',
      padding: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: '#3b82f6',
    }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#60a5fa' }}>💡 DID YOU KNOW?</Text>
        <TouchableOpacity onPress={() => setShowTipsCard(false)}>
          <Text style={{ color: '#6b7280', fontSize: 20 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Glucose Fact */}
      <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: 12, borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ fontSize: 24, textAlign: 'center', marginBottom: 6 }}>{randomFact.emoji}</Text>
        <Text style={{ color: '#93c5fd', fontSize: 13, textAlign: 'center', fontWeight: 'bold' }}>{randomFact.fact}</Text>
        <Text style={{ color: '#60a5fa', fontSize: 11, textAlign: 'center', marginTop: 4 }}>💡 {randomFact.tip}</Text>
      </View>

      {/* Fun message */}
      <View style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', padding: 10, borderRadius: 10, marginBottom: 10 }}>
        <Text style={{ color: '#fde68a', fontSize: 11, textAlign: 'center' }}>
          {gradeInfo.grade === 'S' && '🏆 Your pancreas is sending a thank-you card!'}
          {gradeInfo.grade === 'A' && '⭐ Blood sugar more stable than WiFi!'}
          {gradeInfo.grade === 'B' && '💪 Glucose game getting stronger!'}
          {gradeInfo.grade === 'C' && '🍩 Those donuts put up a fight!'}
          {gradeInfo.grade === 'D' && '😅 Sugar horde won... revenge awaits!'}
        </Text>
      </View>

      {/* Awareness */}
      <Text style={{ color: '#9ca3af', fontSize: 10, textAlign: 'center', marginBottom: 12 }}>
        🎗️ 1 in 10 people have diabetes. Spread awareness!
      </Text>

      {/* Share button */}
      <TouchableOpacity
        onPress={handleShare}
        style={{
          backgroundColor: '#22c55e',
          paddingVertical: 12,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: '#4ade80',
        }}
        activeOpacity={0.8}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 6 }}>📤</Text>
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>SHARE SCORE</Text>
        </View>
      </TouchableOpacity>
      
      <Text style={{ color: '#6b7280', fontSize: 10, textAlign: 'center', marginTop: 8 }}>
        Challenge friends to beat {score} pts! 🎮
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#0f0f1a', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      {/* Background */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: isVictory ? 'rgba(217, 119, 6, 0.1)' : 'rgba(239, 68, 68, 0.1)' }} />

      {/* Scroll Integration Panel (Victory only) */}
      {isVictory && (
        <View style={{ position: 'absolute', top: 40, left: 16, right: 16 }}>
          <ScrollIntegration 
            visible={showScrollPanel}
            onDismiss={() => setShowScrollPanel(false)}
          />
        </View>
      )}

      <Animated.View 
        style={{
          transform: [
            { translateY: scrollAnim },
            { scale: scaleAnim },
          ],
          opacity: fadeAnim,
          width: '100%',
          maxWidth: 340,
          marginTop: showScrollPanel ? 240 : 0,
        }}
      >
        {showTipsCard ? (
          <TipsCard />
        ) : (
          /* Stats Card */
          <View style={{ 
            backgroundColor: 'rgba(0,0,0,0.9)',
            padding: 16,
            borderRadius: 16,
            borderWidth: 2,
            borderColor: isVictory ? '#fbbf24' : '#ef4444',
          }}>
            {/* Result header */}
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <Text style={{ fontSize: 36, marginBottom: 2 }}>{isVictory ? '👑' : '💀'}</Text>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: isVictory ? '#fbbf24' : '#ef4444' }}>
                {isVictory ? 'VICTORY!' : 'DEFEAT'}
              </Text>
            </View>

            {/* Grade */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
              <View style={{ 
                width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center',
                borderWidth: 2, borderColor: gradeInfo.color, backgroundColor: gradeInfo.color + '20', marginRight: 8,
              }}>
                <Text style={{ fontSize: 22, fontWeight: 'bold', color: gradeInfo.color }}>{gradeInfo.grade}</Text>
              </View>
              <Text style={{ fontSize: 14, fontWeight: 'bold', color: gradeInfo.color }}>{gradeInfo.title}</Text>
            </View>

            {/* Stats */}
            <View style={{ marginBottom: 10 }}>
              {/* Score */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.5)', marginBottom: 5 }}>
                <Text style={{ color: '#fde68a', fontWeight: 'bold', fontSize: 13 }}>⚔️ Score</Text>
                <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>{score.toLocaleString()}</Text>
              </View>

              {/* Life Mode metrics */}
              {gameMode === 'life' && finalMetrics && (
                <View style={{ backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(147, 51, 234, 0.5)', marginBottom: 5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 14 }}>⚡</Text>
                      <Text style={{ color: '#facc15', fontWeight: 'bold', fontSize: 11 }}>{Math.round(finalMetrics.energy)}%</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 14 }}>💧</Text>
                      <Text style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: 11 }}>{Math.round(finalMetrics.hydration)}%</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 14 }}>🥗</Text>
                      <Text style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 11 }}>{Math.round(finalMetrics.nutrition)}%</Text>
                    </View>
                    <View style={{ alignItems: 'center', flex: 1 }}>
                      <Text style={{ fontSize: 14 }}>💓</Text>
                      <Text style={{ color: '#f472b6', fontWeight: 'bold', fontSize: 11 }}>{Math.round(finalMetrics.stability)}%</Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Classic mode stability */}
              {gameMode === 'classic' && (
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.5)', marginBottom: 5 }}>
                  <Text style={{ color: '#fde68a', fontWeight: 'bold', fontSize: 13 }}>⚖️ Stability</Text>
                  <Text style={{ fontSize: 16, fontWeight: 'bold', color: glucoseLevel >= 40 && glucoseLevel <= 60 ? '#10b981' : '#ef4444' }}>
                    {Math.round(glucoseLevel)}%
                  </Text>
                </View>
              )}

              {/* Health Profile Summary */}
              {healthProfile && (
                <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(59, 130, 246, 0.5)', marginBottom: 5 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={{ color: '#93c5fd', fontWeight: 'bold', fontSize: 11 }}>💉 HEALTH PROFILE</Text>
                    <Text style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: 12 }}>{healthProfile.currentGlucose} mg/dL</Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4 }}>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ color: '#9ca3af', fontSize: 10, marginBottom: 2 }}>Diagnosis</Text>
                      <Text style={{ color: '#d1d5db', fontWeight: '600', fontSize: 10, textAlign: 'center', textTransform: 'capitalize' }}>
                        {healthProfile.diabetesType.replace('_', ' ')}
                      </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ color: '#9ca3af', fontSize: 10, marginBottom: 2 }}>Insulin</Text>
                      <Text style={{ color: '#d1d5db', fontWeight: '600', fontSize: 10, textAlign: 'center', textTransform: 'capitalize' }}>
                        {healthProfile.insulinType === 'none' ? 'None' : healthProfile.insulinType}
                      </Text>
                    </View>
                    <View style={{ flex: 1, alignItems: 'center' }}>
                      <Text style={{ color: '#9ca3af', fontSize: 10, marginBottom: 2 }}>Sleep</Text>
                      <Text style={{ color: '#d1d5db', fontWeight: '600', fontSize: 10, textAlign: 'center' }}>
                        {Math.round(healthProfile.sleepHours)}h
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {/* Accuracy & Swipes row */}
              <View style={{ flexDirection: 'row', gap: 5 }}>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.5)' }}>
                  <Text style={{ color: '#fde68a', fontWeight: 'bold', fontSize: 11, textAlign: 'center' }}>🎯 Accuracy</Text>
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold', textAlign: 'center' }}>{accuracy}%</Text>
                </View>
                <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(217, 119, 6, 0.5)' }}>
                  <Text style={{ color: '#fde68a', fontWeight: 'bold', fontSize: 11, textAlign: 'center' }}>✓ / ✗</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 14 }}>{correctSwipes}</Text>
                    <Text style={{ color: '#9ca3af', marginHorizontal: 2, fontSize: 14 }}>/</Text>
                    <Text style={{ color: '#f87171', fontWeight: 'bold', fontSize: 14 }}>{incorrectSwipes}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Tier-specific content */}
            {tier && tier === 'tier1' && gameState && (
              <View style={{ marginVertical: 16, padding: 12, backgroundColor: 'rgba(79, 70, 229, 0.2)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(79, 70, 229, 0.4)' }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' }}>
                  🎯 Warm-Up Complete!
                </Text>
                <Text style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginBottom: 8 }}>
                  Score: {gameState.score} • Accuracy: {Math.round((gameState.correctSwipes / (gameState.correctSwipes + gameState.incorrectSwipes)) * 100 || 0)}%
                </Text>
                <Text style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginBottom: 8 }}>
                  {healthProfile ? `Glucose: ${Math.round(healthProfile.currentGlucose)} mg/dL` : 'No glucose data'}
                </Text>
                <Text style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center' }}>
                  💡 Tip: In Challenge 1, you'll manage real glucose levels!
                </Text>
              </View>
            )}

            {tier && tier === 'tier2' && dexcomOption && (
              <View style={{ marginVertical: 16, padding: 12, backgroundColor: 'rgba(124, 58, 237, 0.2)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(124, 58, 237, 0.4)' }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' }}>
                  🔮 Dexcom Showcase
                </Text>
                <Text style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center', marginBottom: 8 }}>
                  Want to use REAL data? In Challenge 2, connect your Dexcom to see how your actual glucose compares to this simulated game.
                </Text>
                <Text style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', fontStyle: 'italic' }}>
                  Learn your patterns. Master your health.
                </Text>
              </View>
            )}

            {tier && tier === 'tier3' && (
              <View style={{ marginVertical: 16, padding: 12, backgroundColor: 'rgba(16, 185, 129, 0.2)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 8, textAlign: 'center' }}>
                  Challenge 2 Complete! 🏆
                </Text>
                <Text style={{ fontSize: 12, color: '#cbd5e1', textAlign: 'center' }}>
                  You've mastered all the mechanics! Ready to mint your achievement NFT?
                </Text>
              </View>
            )}

            {/* Buttons */}
            <View>
              <TouchableOpacity
                onPress={onPlayAgain}
                style={{
                  backgroundColor: '#d97706',
                  paddingVertical: 11,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#fbbf24',
                  marginBottom: 6,
                }}
                activeOpacity={0.8}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, marginRight: 6 }}>⚔️</Text>
                  <Text style={{ color: 'white', fontSize: 15, fontWeight: 'bold' }}>
                    {tier === 'tier1' ? 'NEXT CHALLENGE' : 'PLAY AGAIN'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={onMainMenu}
                  style={{
                    flex: 1,
                    backgroundColor: '#1f2937',
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#4b5563',
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, marginRight: 4 }}>🏰</Text>
                    <Text style={{ color: '#e5e7eb', fontSize: 13, fontWeight: 'bold' }}>MENU</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowTipsCard(true)}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(59, 130, 246, 0.3)',
                    paddingVertical: 10,
                    borderRadius: 10,
                    borderWidth: 2,
                    borderColor: '#3b82f6',
                  }}
                  activeOpacity={0.8}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 14, marginRight: 4 }}>💡</Text>
                    <Text style={{ color: '#93c5fd', fontSize: 13, fontWeight: 'bold' }}>TIPS</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </View>
  );
};
