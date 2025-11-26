
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GRID_SIZE, INITIAL_SPEED, KEY_CODES, MIN_SPEED, SPEED_DECREMENT } from './constants';
import { Coordinate, Direction, GameStatus } from './types';
import { BikeIcon, PizzaIcon, BoxIcon } from './components/Icons';
import { getGameOverCommentary } from './services/geminiService';

// Helper to generate random coordinates ensuring no collision with snake
const generateFood = (snake: Coordinate[]): Coordinate => {
  let newFood: Coordinate;
  let isCollision;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    // eslint-disable-next-line no-loop-func
    isCollision = snake.some((segment) => segment.x === newFood.x && segment.y === newFood.y);
  } while (isCollision);
  return newFood;
};

const INITIAL_SNAKE: Coordinate[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

export default function App() {
  // Game State
  const [snake, setSnake] = useState<Coordinate[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Coordinate>({ x: 5, y: 5 }); // Initial food pos
  const [direction, setDirection] = useState<Direction>(Direction.UP);
  const [status, setStatus] = useState<GameStatus>(GameStatus.IDLE);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [aiCommentary, setAiCommentary] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Refs for mutable state in interval/callbacks to avoid stale closures
  const directionRef = useRef<Direction>(Direction.UP);
  const speedRef = useRef<number>(INITIAL_SPEED);
  const lastProcessedDirectionRef = useRef<Direction>(Direction.UP);
  
  // Initialize food on mount
  useEffect(() => {
    setFood(generateFood(INITIAL_SNAKE));
    const savedHigh = localStorage.getItem('pizza-dash-high-score');
    if (savedHigh) setHighScore(parseInt(savedHigh, 10));
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Handle IDLE and GAME_OVER
    if (status === GameStatus.IDLE || status === GameStatus.GAME_OVER) {
      if (e.key === KEY_CODES.SPACE || e.key === 'Enter') {
         if (status === GameStatus.GAME_OVER) resetGame();
         else startGame();
      }
      return;
    }

    const currentDir = lastProcessedDirectionRef.current;

    switch (e.key) {
      case KEY_CODES.ARROW_UP:
      case KEY_CODES.W:
        if (currentDir !== Direction.DOWN) directionRef.current = Direction.UP;
        break;
      case KEY_CODES.ARROW_DOWN:
      case KEY_CODES.S:
        if (currentDir !== Direction.UP) directionRef.current = Direction.DOWN;
        break;
      case KEY_CODES.ARROW_LEFT:
      case KEY_CODES.A:
        if (currentDir !== Direction.RIGHT) directionRef.current = Direction.LEFT;
        break;
      case KEY_CODES.ARROW_RIGHT:
      case KEY_CODES.D:
        if (currentDir !== Direction.LEFT) directionRef.current = Direction.RIGHT;
        break;
      case KEY_CODES.SPACE:
        setStatus((prev) => (prev === GameStatus.PLAYING ? GameStatus.PAUSED : GameStatus.PLAYING));
        break;
    }
  }, [status]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const gameOver = useCallback(async () => {
    setStatus(GameStatus.GAME_OVER);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('pizza-dash-high-score', score.toString());
    }
    
    // Trigger "AI" Commentary (Now local mock)
    setIsAiLoading(true);
    const comment = await getGameOverCommentary(score);
    setAiCommentary(comment);
    setIsAiLoading(false);
  }, [score, highScore]);

  const moveSnake = useCallback(() => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const currentDir = directionRef.current;
      lastProcessedDirectionRef.current = currentDir;
      setDirection(currentDir); // Sync state for UI

      const newHead = { ...head };

      if (currentDir === Direction.UP) newHead.y -= 1;
      if (currentDir === Direction.DOWN) newHead.y += 1;
      if (currentDir === Direction.LEFT) newHead.x -= 1;
      if (currentDir === Direction.RIGHT) newHead.x += 1;

      // Wall Collision
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        gameOver();
        return prevSnake;
      }

      // Self Collision
      if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
        gameOver();
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Eat Food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((s) => {
           const newScore = s + 1;
           speedRef.current = Math.max(MIN_SPEED, INITIAL_SPEED - (newScore * SPEED_DECREMENT));
           return newScore;
        });
        setFood(generateFood(newSnake));
        // Don't pop the tail, so it grows
      } else {
        newSnake.pop(); // Remove tail
      }

      return newSnake;
    });
  }, [food, gameOver]);

  // Game Loop
  useEffect(() => {
    if (status !== GameStatus.PLAYING) return;

    const gameInterval = setInterval(moveSnake, speedRef.current);
    return () => clearInterval(gameInterval);
  }, [status, moveSnake]); // Re-create interval when speed changes conceptually (though speedRef handles calculation, effect dep on moveSnake works)

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setScore(0);
    setDirection(Direction.UP);
    directionRef.current = Direction.UP;
    lastProcessedDirectionRef.current = Direction.UP;
    speedRef.current = INITIAL_SPEED;
    setFood(generateFood(INITIAL_SNAKE));
    setStatus(GameStatus.PLAYING);
    setAiCommentary("");
  };

  const resetGame = () => {
    startGame();
  };

  // Mobile Controls
  const handleMobileControl = (dir: Direction) => {
    const currentDir = lastProcessedDirectionRef.current;
    if (dir === Direction.UP && currentDir !== Direction.DOWN) directionRef.current = Direction.UP;
    if (dir === Direction.DOWN && currentDir !== Direction.UP) directionRef.current = Direction.DOWN;
    if (dir === Direction.LEFT && currentDir !== Direction.RIGHT) directionRef.current = Direction.LEFT;
    if (dir === Direction.RIGHT && currentDir !== Direction.LEFT) directionRef.current = Direction.RIGHT;
  };

  // Render Grid
  const renderGrid = () => {
    const cells = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        let isSnake = false;
        let isHead = false;
        let isFood = false;
        let snakeIndex = -1;

        if (food.x === x && food.y === y) {
          isFood = true;
        }

        const foundIndex = snake.findIndex((s) => s.x === x && s.y === y);
        if (foundIndex !== -1) {
          isSnake = true;
          isHead = foundIndex === 0;
          snakeIndex = foundIndex;
        }

        cells.push(
          <div
            key={`${x}-${y}`}
            className={`
              w-full h-full border-[0.5px] border-gray-800/30 relative
              ${isSnake ? 'z-10' : 'z-0'}
            `}
          >
            {isFood && (
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <PizzaIcon className="w-[85%] h-[85%] text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.8)]" />
              </div>
            )}
            {isSnake && isHead && (
              <div 
                className="absolute inset-0 flex items-center justify-center z-20"
                style={{ 
                    transform: `rotate(${direction === Direction.RIGHT ? 90 : direction === Direction.LEFT ? -90 : direction === Direction.DOWN ? 180 : 0}deg)`,
                    transition: 'transform 0.1s'
                }}
              >
                <BikeIcon className="w-full h-full text-yellow-400 drop-shadow-md" />
              </div>
            )}
            {isSnake && !isHead && (
               <div className="absolute inset-0 flex items-center justify-center p-[2px]">
                 <BoxIcon className="w-full h-full text-orange-300" variant={snakeIndex} />
               </div>
            )}
          </div>
        );
      }
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center font-sans relative overflow-hidden">
      
      {/* Background Skyline Pattern */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/3 opacity-20 pointer-events-none select-none"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 320'%3E%3Cpath fill='%23ffffff' d='M0,320L0,220L40,220L40,160L90,160L90,260L120,260L120,120L180,120L180,320M180,320L180,200L230,200L230,280L270,280L270,140L340,140L340,320M340,320L340,240L390,240L390,180L440,180L440,320M440,320L440,100L500,100L500,320M500,320L500,220L550,220L550,320M550,320L550,150L620,150L620,320M620,320L620,260L680,260L680,320M680,320L680,80L740,80L740,320M740,320L740,200L800,200L800,320M800,320L800,160L860,160L860,320M860,320L860,240L920,240L920,320M920,320L920,120L980,120L980,320M980,320L980,200L1040,200L1040,320M1040,320L1040,140L1100,140L1100,320M1100,320L1100,250L1150,250L1150,320'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'bottom center',
            backgroundSize: '1200px auto'
        }}
      />

      {/* Header */}
      <div className="w-full max-w-md px-4 py-4 flex justify-between items-end relative z-10">
        <div>
          <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 tracking-tighter">
            PIZZA DASH
          </h1>
          <p className="text-gray-400 text-xs">DELIVERY SIMULATOR</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">HIGH SCORE</div>
          <div className="text-2xl font-bold text-white">{highScore}</div>
        </div>
      </div>

      {/* Game Board Wrapper */}
      <div className="relative p-1 bg-gray-800/80 rounded-lg shadow-2xl border border-gray-700/50 backdrop-blur-sm z-10">
        
        {/* The Grid */}
        <div
          className="grid bg-gray-900/90 rounded-md overflow-hidden"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
            width: 'min(90vw, 400px)',
            height: 'min(90vw, 400px)',
          }}
        >
          {renderGrid()}
        </div>

        {/* Overlays */}
        {status === GameStatus.IDLE && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-6 z-30 backdrop-blur-sm rounded-md">
            <BikeIcon className="w-20 h-20 text-yellow-400 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2">Ready to Deliver?</h2>
            <p className="text-gray-300 mb-6 text-sm">Use Arrow Keys or Buttons to navigate. Collect pizzas to fill your cargo!</p>
            <button
              onClick={startGame}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all transform duration-200"
            >
              START SHIFT
            </button>
          </div>
        )}

        {status === GameStatus.GAME_OVER && (
          <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center text-center p-6 z-30 backdrop-blur-sm rounded-md">
            <h2 className="text-3xl font-black text-white mb-2 uppercase italic transform -rotate-2">CRASHED!</h2>
            <div className="text-6xl font-bold text-yellow-400 mb-2">{score}</div>
            <p className="text-white font-medium mb-4">Pizzas Delivered</p>
            
            {/* AI Commentary Section */}
            <div className="bg-black/40 p-4 rounded-lg mb-6 w-full max-w-[280px]">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Pizza Boss Says:</p>
                {isAiLoading ? (
                    <div className="flex justify-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                ) : (
                    <p className="text-sm italic text-yellow-100">"{aiCommentary || "You're fired!"}"</p>
                )}
            </div>

            <button
              onClick={resetGame}
              className="px-6 py-2 bg-white text-red-900 font-bold rounded-full hover:bg-gray-100 transition shadow-lg"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {status === GameStatus.PAUSED && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-30 backdrop-blur-sm rounded-md">
            <h2 className="text-2xl font-bold text-white mb-4">BREAK TIME</h2>
            <button
              onClick={() => setStatus(GameStatus.PLAYING)}
              className="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-500 transition"
            >
              RESUME
            </button>
          </div>
        )}
      </div>

      {/* Score and Controls */}
      <div className="w-full max-w-md px-4 mt-6 z-10">
        <div className="flex justify-between items-center bg-gray-800/80 p-3 rounded-xl border border-gray-700/50 mb-6 backdrop-blur-sm">
           <div className="flex items-center space-x-2">
             <PizzaIcon className="w-5 h-5 text-orange-500" />
             <span className="text-xl font-bold text-white">{score}</span>
           </div>
           <div className="text-xs text-gray-400 font-mono">
             SPEED: {Math.round(1000/speedRef.current)} PPS
           </div>
        </div>

        {/* D-Pad for Mobile */}
        <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto md:hidden">
          <div />
          <button 
            className="h-14 bg-gray-700/80 backdrop-blur-sm rounded-lg active:bg-gray-600 flex items-center justify-center shadow-lg border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
            onPointerDown={(e) => { e.preventDefault(); handleMobileControl(Direction.UP); }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
          </button>
          <div />
          <button 
            className="h-14 bg-gray-700/80 backdrop-blur-sm rounded-lg active:bg-gray-600 flex items-center justify-center shadow-lg border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
            onPointerDown={(e) => { e.preventDefault(); handleMobileControl(Direction.LEFT); }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            className="h-14 bg-gray-700/80 backdrop-blur-sm rounded-lg active:bg-gray-600 flex items-center justify-center shadow-lg border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
            onPointerDown={(e) => { e.preventDefault(); handleMobileControl(Direction.DOWN); }}
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          <button 
            className="h-14 bg-gray-700/80 backdrop-blur-sm rounded-lg active:bg-gray-600 flex items-center justify-center shadow-lg border-b-4 border-gray-900 active:border-b-0 active:translate-y-1 transition-all"
            onPointerDown={(e) => { e.preventDefault(); handleMobileControl(Direction.RIGHT); }}
          >
             <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>
        
        <p className="hidden md:block text-center text-gray-500 text-sm mt-4">
          Use WASD or Arrow Keys to Drive
        </p>
      </div>
    </div>
  );
}
