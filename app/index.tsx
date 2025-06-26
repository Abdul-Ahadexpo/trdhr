import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Skull, RotateCcw, Trophy, User, Clock } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, remove } from 'firebase/database';

const { width, height } = Dimensions.get('window');

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDafFGXAPvJM25ukqNZSm4ra5S6ACCfbEs",
  authDomain: "money-4a855.firebaseapp.com",
  databaseURL: "https://money-4a855-default-rtdb.firebaseio.com",
  projectId: "money-4a855",
  storageBucket: "money-4a855.firebasestorage.app",
  messagingSenderId: "893595455729",
  appId: "1:893595455729:web:6ce038d127b3e2f3abd950",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Original story data - keeping it exactly as provided
const storyData = {
  "start": {
    "text": "You wake up in a dark hospital, a flickering light revealing bloodstained walls. A note on your chest reads: '3 hours before they come.' What do you do?",
    "choices": [
      { "text": "Check the door", "next": "door" },
      { "text": "Look under the bed", "next": "bed" },
      { "text": "Examine the note", "next": "note" }
    ]
  },
  "bed": {
    "text": "You peek under the bed... a pair of eyes blink at you, then vanish into the shadows.",
    "choices": [
      { "text": "Crawl under", "next": "mate" },
      { "text": "Get back up", "next": "door" }
    ]
  },
  "note": {
    "text": "The note says: 'Don't let them hear you breathe.' A chill runs through your asshole.",
    "choices": [
      { "text": "Check the door", "next": "door" },
      { "text": "Look under the bed", "next": "bed" }
    ]
  },
  "door": {
    "text": "The door's locked. You hear faint footsteps outside. The handle shakes slightly.",
    "choices": [
      { "text": "Knock", "next": "knock" },
      { "text": "Pick the lock", "next": "lockpick" }
    ]
  },
  "knock": {
    "text": "You knock. Something knocks back. What's on the other side? but then you hear some sounds, it's like clapping.. or someone is having S E X",
    "choices": [
      { "text": "Open it", "next": "hallway" },
      { "text": "Hide under the bed again", "next": "mate" }
    ]
  },
  "lockpick": {
    "text": "Your paperclip snaps. You hear breathing behind you.",
    "choices": [
      { "text": "Turn around", "next": "turn_around" },
      { "text": "Hide under the bed", "next": "mate" }
    ]
  },
  "turn_around": {
    "text": "You turn... a figure stands in the corner, watching you and masturbating.. But the lights go out.",
    "choices": [
      { "text": "Run for the hallway", "next": "hallway" },
      { "text": "Join that figure", "next": "mate_2" }
    ]
  },
  "hallway": {
    "text": "The hallway is dark. An exit sign flickers, but stairs lead deeper into the dark.",
    "choices": [
      { "text": "Go to the exit", "next": "exit" }
    ]
  },
  "exit": {
    "text": "You reach the exit. You found a key that unlocks the door. But something watches you from the shadows.",
    "choices": [
      { "text": "Run into the street", "next": "escape" },
      { "text": "Look back", "next": "look_back" }
    ]
  },
  "escape": {
    "text": "The street stretches forever. You can't escape.",
    "choices": [
      { "text": "Look around", "next": "look_back" },
      { "text": "Keep running", "next": "keep_running" }
    ]
  },
  "keep_running": {
    "text": "You saw a wild dog and...",
    "choices": [
      { "text": "I fuck it!!", "next": "mate3" },
      { "text": "Look around", "next": "look_back" }
    ]
  },
  "mate3": {
    "text": "You fucked the dog... now it's dead and you have Sexually transmitted diseases (STDs)",
    "choices": [
      { "text": "Look around", "next": "look_back" },
      { "text": "Shit", "next": "shit" }
    ]
  },
  "mate": {
    "text": "You see an old man with one hand ripped off and his whole body was filled with blood.. and then you have SEX with him..",
    "choices": [
      { "text": "Get back up", "next": "door" }
    ]
  },
  "mate_2": {
    "text": "You come close to that figure.. and see that it's a young girl/bitch and you guys make love...",
    "choices": [
      { "text": "Get back up", "next": "door" }
    ]
  },
  "look_back": {
    "text": "Figures emerge from the shadows, all smiling at you.",
    "choices": [
      { "text": "Face them", "next": "final_battle" },
      { "text": "Shit", "next": "shit" }
    ]
  },
  "shit": {
    "text": "You shit on the street and then eat it.. after that, you shit harder and fly to the moon to make love with it!!."
  },
  "final_battle": {
    "text": "The 2 figures close in, their faces twisting into distorted versions of your own. Then they say ~'You've always been part of the game'~ Begin to have 3 some until you cum 💀...."
  }
};

interface GameState {
  currentScene: string;
  playerName: string;
  startTime: number;
  gameStarted: boolean;
  showLeaderboard: boolean;
  leaderboard: Array<{
    name: string;
    time: number;
    ending: string;
  }>;
  userId: string;
}

export default function HorrorGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentScene: 'start',
    playerName: '',
    startTime: Date.now(),
    gameStarted: false,
    showLeaderboard: false,
    leaderboard: [],
    userId: '',
  });

  // Animation values
  const fadeAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(0.8);
  const slideAnim = useSharedValue(height);
  const pulseAnim = useSharedValue(1);
  const shakeAnim = useSharedValue(0);

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const promptForName = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter Your Name', 'What should we call you?');
      if (name) {
        const userId = Date.now().toString();
        setGameState(prev => ({ 
          ...prev, 
          playerName: name,
          userId: userId
        }));
        
        // Save user data in Firebase
        set(ref(database, `users/${userId}`), {
          name: name,
          progress: {
            currentScene: 'start',
          },
        });
      }
    } else {
      // For native platforms, we'll use a simple text input approach
      // since Alert.prompt might not be available
      const name = 'Player'; // Default name for now
      const userId = Date.now().toString();
      setGameState(prev => ({ 
        ...prev, 
        playerName: name,
        userId: userId
      }));
    }
  };

  useEffect(() => {
    if (gameState.gameStarted) {
      // Entrance animation
      fadeAnim.value = withTiming(1, { duration: 800 });
      scaleAnim.value = withSpring(1, { damping: 8 });
      slideAnim.value = withTiming(0, { duration: 600 });
    }
  }, [gameState.gameStarted]);

  useEffect(() => {
    // Pulse animation for horror effect
    pulseAnim.value = withSequence(
      withTiming(1.05, { duration: 2000 }),
      withTiming(1, { duration: 2000 })
    );
    
    const interval = setInterval(() => {
      pulseAnim.value = withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      );
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Load leaderboard from Firebase
  useEffect(() => {
    const leaderboardRef = ref(database, 'leaderboard');
    onValue(leaderboardRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const leaderboardArray = Object.values(data).sort((a: any, b: any) => a.time - b.time);
        setGameState(prev => ({ ...prev, leaderboard: leaderboardArray.slice(0, 10) }));
      }
    });
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: fadeAnim.value,
    transform: [
      { scale: scaleAnim.value },
      { translateY: slideAnim.value },
    ],
  }));

  const animatedPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const animatedShakeStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shakeAnim.value,
          [0, 0.25, 0.5, 0.75, 1],
          [0, -10, 10, -10, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));

  const startGame = () => {
    if (!gameState.playerName.trim()) {
      promptForName();
      return;
    }
    
    triggerHaptic();
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      startTime: Date.now(),
    }));
  };

  const makeChoice = (nextScene: string) => {
    triggerHaptic();
    
    // Shake animation for dramatic effect
    shakeAnim.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Scene transition animation
    fadeAnim.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(() => {
        setGameState(prev => ({ ...prev, currentScene: nextScene }));
        
        // Save progress to Firebase
        if (gameState.userId) {
          set(ref(database, `users/${gameState.userId}/progress`), {
            currentScene: nextScene,
          });
        }
        
        // Check if game ended
        if (nextScene === 'shit' || nextScene === 'final_battle') {
          const endTime = Date.now();
          const timeTaken = (endTime - gameState.startTime) / 1000;
          const newEntry = {
            name: gameState.playerName,
            time: timeTaken,
            ending: nextScene === 'shit' ? 'Gave Up' : 'Faced the Horror',
          };
          
          // Save to Firebase leaderboard
          push(ref(database, 'leaderboard'), newEntry);
          
          setGameState(prev => ({
            ...prev,
            showLeaderboard: true,
          }));
        }
      })();
    });
    
    fadeAnim.value = withTiming(1, { duration: 500 });
  };

  const restartGame = () => {
    triggerHaptic();
    setGameState(prev => ({
      ...prev,
      currentScene: 'start',
      startTime: Date.now(),
      showLeaderboard: false,
    }));
    
    // Clear Firebase progress
    if (gameState.userId) {
      remove(ref(database, `users/${gameState.userId}/progress`));
    }
    
    // Reset animations
    fadeAnim.value = withTiming(1, { duration: 500 });
    scaleAnim.value = withSpring(1);
  };

  const currentStory = storyData[gameState.currentScene as keyof typeof storyData];
  const isGameEnded = !currentStory?.choices;

  if (!gameState.gameStarted) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#0f0f23', '#1a0a2e', '#16213e']}
          style={styles.container}
        >
          <Animated.View style={[styles.welcomeContainer, animatedPulseStyle]}>
            <Skull size={60} color="#ff6b6b" strokeWidth={2} />
            <Text style={styles.titleText}>THE THIRD HOUR</Text>
            <Text style={styles.subtitleText}>Abandoned Hospital</Text>
            
            <TouchableOpacity style={styles.inputContainer} onPress={promptForName}>
              <User size={20} color="#666" />
              <Text style={styles.input}>
                {gameState.playerName || 'Tap to enter your name...'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.startButton}
              onPress={startGame}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#ff6b6b', '#ee5a52']}
                style={styles.buttonGradient}
              >
                <Text style={styles.startButtonText}>BEGIN NIGHTMARE</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#0f0f23', '#1a0a2e', '#16213e']}
        style={styles.container}
      >
        <Animated.View style={[styles.gameContainer, animatedContainerStyle]}>
          <ScrollView 
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.storyContainer, animatedShakeStyle]}>
              <Text style={styles.storyText}>
                {currentStory?.text || 'The story continues...'}
              </Text>
            </Animated.View>

            {currentStory?.choices && (
              <View style={styles.choicesContainer}>
                {currentStory.choices.map((choice, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.choiceButton}
                    onPress={() => makeChoice(choice.next)}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={['#2d3748', '#4a5568']}
                      style={styles.choiceGradient}
                    >
                      <Text style={styles.choiceText}>{choice.text}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {isGameEnded && (
              <View style={styles.endGameContainer}>
                <Text style={styles.gameOverText}>
                  {gameState.currentScene === 'shit' ? 'GAME OVER' : 'THE END'}
                </Text>
                
                <TouchableOpacity
                  style={styles.restartButton}
                  onPress={restartGame}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#48bb78', '#38a169']}
                    style={styles.buttonGradient}
                  >
                    <RotateCcw size={18} color="white" />
                    <Text style={styles.restartButtonText}>RESTART</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {gameState.showLeaderboard && gameState.leaderboard.length > 0 && (
              <View style={styles.leaderboardContainer}>
                <View style={styles.leaderboardHeader}>
                  <Trophy size={20} color="#ffd700" />
                  <Text style={styles.leaderboardTitle}>LEADERBOARD</Text>
                </View>
                
                {gameState.leaderboard.slice(0, 5).map((entry, index) => (
                  <View key={index} style={styles.leaderboardEntry}>
                    <Text style={styles.leaderboardRank}>#{index + 1}</Text>
                    <Text style={styles.leaderboardName}>{entry.name}</Text>
                    <View style={styles.leaderboardStats}>
                      <Clock size={14} color="#666" />
                      <Text style={styles.leaderboardTime}>{entry.time.toFixed(1)}s</Text>
                    </View>
                    <Text style={styles.leaderboardEnding}>{entry.ending}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    width: '100%',
    maxWidth: 400,
  },
  titleText: {
    fontFamily: 'Creepster-Regular',
    fontSize: Math.min(width * 0.08, 32),
    color: '#ff6b6b',
    textAlign: 'center',
    marginTop: 20,
    textShadowColor: 'rgba(255, 107, 107, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitleText: {
    fontFamily: 'Inter-Regular',
    fontSize: Math.min(width * 0.04, 16),
    color: '#a0aec0',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minHeight: 50,
  },
  input: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#e2e8f0',
    marginLeft: 10,
    flex: 1,
  },
  startButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 50,
  },
  startButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: 'white',
    letterSpacing: 1,
  },
  gameContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  storyContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.3)',
    width: '100%',
  },
  storyText: {
    fontFamily: 'Inter-Regular',
    fontSize: Math.min(width * 0.04, 16),
    color: '#e2e8f0',
    lineHeight: 24,
    textAlign: 'center',
  },
  choicesContainer: {
    marginBottom: 20,
    width: '100%',
  },
  choiceButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    marginBottom: 12,
    width: '100%',
  },
  choiceGradient: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minHeight: 50,
    justifyContent: 'center',
  },
  choiceText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: Math.min(width * 0.035, 14),
    color: '#e2e8f0',
    textAlign: 'center',
    lineHeight: 20,
  },
  endGameContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
    width: '100%',
  },
  gameOverText: {
    fontFamily: 'Nosifer-Regular',
    fontSize: Math.min(width * 0.06, 24),
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 25,
    textShadowColor: 'rgba(255, 107, 107, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  restartButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#48bb78',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '100%',
    maxWidth: 200,
  },
  restartButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  leaderboardContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    width: '100%',
  },
  leaderboardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  leaderboardTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#ffd700',
    marginLeft: 8,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    marginBottom: 6,
  },
  leaderboardRank: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#ffd700',
    width: 25,
  },
  leaderboardName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 12,
    color: '#e2e8f0',
    flex: 1,
    marginLeft: 8,
  },
  leaderboardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  leaderboardTime: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: '#a0aec0',
    marginLeft: 3,
  },
  leaderboardEnding: {
    fontFamily: 'Inter-Regular',
    fontSize: 9,
    color: '#718096',
    width: 60,
    textAlign: 'right',
  },
});