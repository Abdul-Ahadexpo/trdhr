import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Skull, RotateCcw, Trophy, User, Clock } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, push, onValue, remove } from 'firebase/database';

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

function App() {
  const [gameState, setGameState] = useState<GameState>({
    currentScene: 'start',
    playerName: '',
    startTime: Date.now(),
    gameStarted: false,
    showLeaderboard: false,
    leaderboard: [],
    userId: '',
  });

  const [isShaking, setIsShaking] = useState(false);

  const promptForName = () => {
    const name = window.prompt('Enter Your Name', 'What should we call you?');
    if (name && name.trim()) {
      const userId = Date.now().toString();
      setGameState(prev => ({ 
        ...prev, 
        playerName: name.trim(),
        userId: userId
      }));
      
      // Save user data in Firebase
      set(ref(database, `users/${userId}`), {
        name: name.trim(),
        progress: {
          currentScene: 'start',
        },
      });
    }
  };

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

  const startGame = () => {
    if (!gameState.playerName.trim()) {
      promptForName();
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      startTime: Date.now(),
    }));
  };

  const makeChoice = (nextScene: string) => {
    // Shake animation for dramatic effect
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);

    setTimeout(() => {
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
    }, 300);
  };

  const restartGame = () => {
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
  };

  const currentStory = storyData[gameState.currentScene as keyof typeof storyData];
  const isGameEnded = !currentStory?.choices;

  if (!gameState.gameStarted) {
    return (
      <div className="min-h-screen horror-gradient flex items-center justify-center p-4">
        <motion.div 
          className="w-full max-w-md mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="glass-effect rounded-2xl p-8 text-center">
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="mb-6"
            >
              <Skull size={60} className="mx-auto text-red-500" />
            </motion.div>
            
            <motion.h1 
              className="font-creepster text-3xl sm:text-4xl text-red-500 mb-2 text-glow animate-glow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              THE THIRD HOUR
            </motion.h1>
            
            <motion.p 
              className="text-gray-300 mb-8 text-sm sm:text-base"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Abandoned Hospital
            </motion.p>
            
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <button
                onClick={promptForName}
                className="w-full glass-effect rounded-xl p-4 flex items-center justify-center space-x-3 hover:bg-white/10 transition-all duration-300"
              >
                <User size={20} className="text-gray-400" />
                <span className="text-gray-300">
                  {gameState.playerName || 'Tap to enter your name...'}
                </span>
              </button>
            </motion.div>
            
            <motion.button
              onClick={startGame}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold py-4 px-6 rounded-xl button-glow choice-button"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              BEGIN NIGHTMARE
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen horror-gradient">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={gameState.currentScene}
            initial={{ opacity: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              x: isShaking ? [-2, 2, -2, 2, 0] : 0
            }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6"
          >
            {/* Story Container */}
            <motion.div 
              className="glass-effect rounded-2xl p-6 sm:p-8"
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <motion.p 
                className="text-gray-100 text-base sm:text-lg leading-relaxed text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {currentStory?.text || 'The story continues...'}
              </motion.p>
            </motion.div>

            {/* Choices */}
            {currentStory?.choices && (
              <motion.div 
                className="space-y-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                {currentStory.choices.map((choice, index) => (
                  <motion.button
                    key={index}
                    onClick={() => makeChoice(choice.next)}
                    className="w-full glass-effect rounded-xl p-4 sm:p-5 text-gray-200 hover:bg-white/10 choice-button text-sm sm:text-base"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: 0.6 + (index * 0.1), 
                      duration: 0.4,
                      ease: "easeOut"
                    }}
                    whileHover={{ 
                      scale: 1.02,
                      backgroundColor: "rgba(255, 255, 255, 0.15)"
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {choice.text}
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Game End */}
            {isGameEnded && (
              <motion.div 
                className="text-center space-y-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <motion.h2 
                  className="font-nosifer text-2xl sm:text-3xl text-red-500 text-glow animate-glow"
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  {gameState.currentScene === 'shit' ? 'GAME OVER' : 'THE END'}
                </motion.h2>
                
                <motion.button
                  onClick={restartGame}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-6 rounded-xl button-glow choice-button flex items-center justify-center space-x-2 mx-auto"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw size={18} />
                  <span>RESTART</span>
                </motion.button>
              </motion.div>
            )}

            {/* Leaderboard */}
            {gameState.showLeaderboard && gameState.leaderboard.length > 0 && (
              <motion.div 
                className="glass-effect rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Trophy size={20} className="text-yellow-500" />
                  <h3 className="font-bold text-yellow-500 text-lg">LEADERBOARD</h3>
                </div>
                
                <div className="space-y-2">
                  {gameState.leaderboard.slice(0, 5).map((entry, index) => (
                    <motion.div 
                      key={index}
                      className="flex items-center justify-between bg-white/5 rounded-lg p-3 text-sm"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + (index * 0.1), duration: 0.4 }}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-yellow-500 w-6">#{index + 1}</span>
                        <span className="text-gray-200 font-medium">{entry.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Clock size={12} />
                          <span>{entry.time.toFixed(1)}s</span>
                        </div>
                        <span className="hidden sm:inline">{entry.ending}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;