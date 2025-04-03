import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useCoins } from '@/contexts/CoinContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { formatCoins } from '@/utils/coinManager';
import { 
  Dice3, 
  ArrowDown, 
  ArrowUp, 
  RefreshCcw, 
  Coins,
  Calculator,
  Trophy,
  X,
  HelpCircle,
  Play
} from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';

const DiceGame = () => {
  const { coins, isGuest, removeCoins, addCoins } = useCoins();
  const [betAmount, setBetAmount] = useState(0);
  const [targetNumber, setTargetNumber] = useState(50);
  const [isRollOver, setIsRollOver] = useState(true);
  const [gameActive, setGameActive] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [win, setWin] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const rollCompletedRef = useRef(false);
  const navigate = useNavigate();
  
  // Calculate win chance and multiplier based on current settings
  const winChance = isRollOver 
    ? 100 - targetNumber 
    : targetNumber;
  
  const multiplier = parseFloat((100 / winChance).toFixed(2));
  
  // Calculate potential win
  const potentialWin = Math.floor(betAmount * multiplier);
  
  const handleSetTarget = (value: number[]) => {
    setTargetNumber(value[0]);
  };
  
  const formatNumber = (num: number): string => {
    return num.toFixed(2);
  };
  
  const handleBetChange = (value: string) => {
    const newBet = parseInt(value) || 0;
    if (isGuest && newBet > 0) {
      setBetAmount(0);
      toast({
        title: "Guest Mode",
        description: "Please sign up to place bets and win real coins!",
        variant: "default",
      });
      navigate("/login");
      return;
    }
    setBetAmount(newBet);
  };
  
  const placeBet = () => {
    if (betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        description: "Please enter a bet amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    
    if (betAmount > coins) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough coins for this bet",
        variant: "destructive",
      });
      return;
    }
    
    // Reset completion guard
    rollCompletedRef.current = false;
    
    // Deduct bet amount
    removeCoins(betAmount);
    
    // Set game as active and start rolling animation
    setGameActive(true);
    setIsRolling(true);
    setResult(null);
    setWin(false);
    
    // Simulate the roll with a delay for animation
    setTimeout(() => {
      // Guard against multiple completions
      if (rollCompletedRef.current) return;
      rollCompletedRef.current = true;

      // Generate a random number between 0 and 100
      const rollResult = parseFloat((Math.random() * 100).toFixed(2));
      setResult(rollResult);
      
      // Determine if player won based on roll and bet type
      const isWin = isRollOver 
        ? rollResult > targetNumber 
        : rollResult < targetNumber;
      
      setWin(isWin);
      
      // Award winnings if player won
      if (isWin) {
        const winAmount = potentialWin;
        addCoins(winAmount);
        
        toast({
          title: "You Win!",
          description: `You won ${winAmount} coins!`,
        });
      } else {
        toast({
          title: "You Lost",
          description: "Better luck next time!",
          variant: "destructive",
        });
      }
      
      setIsRolling(false);
    }, 1500);
  };
  
  const resetGame = () => {
    setGameActive(false);
    setResult(null);
  };
  
  // Predefined difficulty settings
  const setDifficulty = (level: 'easy' | 'medium' | 'hard') => {
    if (level === 'easy') {
      setTargetNumber(isRollOver ? 25 : 75);
    } else if (level === 'medium') {
      setTargetNumber(50);
    } else if (level === 'hard') {
      setTargetNumber(isRollOver ? 70 : 30);
    }
  };
  
  // Toggle between roll over and roll under
  const toggleRollMode = () => {
    setIsRollOver(!isRollOver);
  };
  
  const startGame = () => {
    // For guest mode, only allow playing with 0 bet
    if (isGuest && betAmount > 0) {
      setBetAmount(0);
      toast({
        title: "Guest Mode",
        description: "Please sign up to place bets and win real coins!",
        variant: "default",
      });
      navigate("/login");
      return;
    }

    // For non-guest mode, check bet amount
    if (!isGuest) {
      if (betAmount <= 0) {
        toast({
          title: "Invalid bet amount",
          description: "Please enter a bet amount greater than 0",
          variant: "destructive",
        });
        return;
      }
      
      if (betAmount > coins) {
        toast({
          title: "Insufficient funds",
          description: "You don't have enough coins for this bet",
          variant: "destructive",
        });
        return;
      }

      // Deduct bet amount only for non-guest users
      removeCoins(betAmount);
      
      // Show coin deduction message
      toast({
        title: "Bet Placed",
        description: `-${formatCoins(betAmount)} coins`,
        duration: 3000,
      });
    }
    
    // Reset completion guard
    rollCompletedRef.current = false;
    
    // Set game as active and start rolling animation
    setGameActive(true);
    setIsRolling(true);
    setResult(null);
    setWin(false);
    
    // Simulate the roll with a delay for animation
    setTimeout(() => {
      // Guard against multiple completions
      if (rollCompletedRef.current) return;
      rollCompletedRef.current = true;

      // Generate a random number between 0 and 100
      const rollResult = parseFloat((Math.random() * 100).toFixed(2));
      setResult(rollResult);
      
      // Determine if player won based on roll and bet type
      const isWin = isRollOver 
        ? rollResult > targetNumber 
        : rollResult < targetNumber;
      
      setWin(isWin);
      
      // Award winnings if player won and not in guest mode
      if (isWin && !isGuest) {
        const winAmount = potentialWin;
        addCoins(winAmount);
        
        toast({
          title: "You Win!",
          description: `You won ${winAmount} coins!`,
        });
      } else if (isWin) {
        toast({
          title: "You Win!",
          description: "Sign up to win real coins!",
        });
      } else {
        toast({
          title: "You Lost",
          description: "Better luck next time!",
          variant: "destructive",
        });
      }
      
      setIsRolling(false);
    }, 1500);
  };
  
  return (
    <MainLayout>
      <div className="game-layout">
        <h1 className="game-title">Dice</h1>
        
        <div className="game-interface-reverse">
          <div className="game-controls bg-casino-card rounded-xl p-4 md:p-6">
            <div className="space-y-4">
              <div>
                <p className="text-gray-400 text-sm mb-2">Bet Amount</p>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={betAmount}
                    onChange={(e) => handleBetChange(e.target.value)}
                    className="bg-casino-background border-casino-muted text-white"
                    disabled={gameActive && !isGameOver}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-white border-casino-muted bg-casino-background hover:bg-casino-accent/20"
                    onClick={() => setBetAmount(Math.max(0, Math.floor(betAmount / 2)))}
                    disabled={betAmount <= 0 || (gameActive && !isGameOver)}
                  >
                    ½
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-white border-casino-muted bg-casino-background hover:bg-casino-accent/20"
                    onClick={() => setBetAmount(Math.min(coins, betAmount * 2))}
                    disabled={betAmount * 2 > coins || (gameActive && !isGameOver)}
                  >
                    2×
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-gray-400 text-sm">Difficulty</p>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDifficulty('easy')}
                    className={`text-white border-casino-muted bg-casino-background hover:bg-green-800/50 ${
                      (isRollOver && targetNumber === 25) || (!isRollOver && targetNumber === 75) 
                        ? 'bg-green-800/50 border-green-500' 
                        : ''
                    }`}
                    disabled={gameActive && isRolling}
                  >
                    Easy
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDifficulty('medium')}
                    className={`text-white border-casino-muted bg-casino-background hover:bg-yellow-800/50 ${
                      targetNumber === 50 ? 'bg-yellow-800/50 border-yellow-500' : ''
                    }`}
                    disabled={gameActive && isRolling}
                  >
                    Medium
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDifficulty('hard')}
                    className={`text-white border-casino-muted bg-casino-background hover:bg-red-800/50 ${
                      (isRollOver && targetNumber === 70) || (!isRollOver && targetNumber === 30) 
                        ? 'bg-red-800/50 border-red-500' 
                        : ''
                    }`}
                    disabled={gameActive && isRolling}
                  >
                    Hard
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={isRollOver}
                    onCheckedChange={toggleRollMode}
                    disabled={gameActive && isRolling}
                  />
                  <Label className="text-white">Roll {isRollOver ? 'Over' : 'Under'}</Label>
                </div>
                <div className="text-sm text-gray-400">
                  Win Chance: {winChance}%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-casino-background p-2 rounded-lg">
                  <p className="text-xs text-gray-400">Multiplier</p>
                  <p className="text-lg font-bold text-blue-400">{multiplier}x</p>
                </div>
                <div className="bg-casino-background p-2 rounded-lg">
                  <p className="text-xs text-gray-400">Potential Win</p>
                  <p className="text-lg font-bold text-green-400">{potentialWin}</p>
                </div>
              </div>

              {!gameActive ? (
                <Button 
                  className="neon-button w-full" 
                  onClick={startGame}
                  disabled={isRolling || (!isGuest && (betAmount <= 0 || betAmount > coins))}
                >
                  <Play className="mr-2" size={16} />
                  Start Game
                </Button>
              ) : (
                <Button 
                  className="w-full" 
                  onClick={resetGame}
                  disabled={isRolling}
                >
                  <RefreshCcw className="mr-2 w-4 h-4" />
                  New Bet
                </Button>
              )}
            </div>
          </div>
          
          <div className="game-display bg-casino-card rounded-xl p-4 md:p-6 flex flex-col items-center justify-center min-h-[400px]">
            {/* Main slider container with border */}
            <div className="relative w-full h-[200px] flex items-center justify-center">
              {/* Outer border with gradient */}
              <div className="absolute inset-x-0 h-10 rounded-full bg-[#1a2028]/80">
                {/* Numbers on the border */}
                <div className="absolute -top-6 left-0 right-0 flex justify-between px-4 text-white/70 text-sm">
                  <span>0</span>
                  <span>25</span>
                  <span>50</span>
                  <span>75</span>
                  <span>100</span>
                </div>

                {/* Slider track */}
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-3 rounded-full overflow-hidden">
                  {isRollOver ? (
                    <div className="absolute inset-0 flex">
                      <div 
                        className="h-full bg-[#ff4444]"
                        style={{ width: `${targetNumber}%` }}
                      />
                      <div 
                        className="h-full bg-[#44ff44]"
                        style={{ width: `${100 - targetNumber}%` }}
                      />
                    </div>
                  ) : (
                    <div className="absolute inset-0 flex">
                      <div 
                        className="h-full bg-[#44ff44]"
                        style={{ width: `${targetNumber}%` }}
                      />
                      <div 
                        className="h-full bg-[#ff4444]"
                        style={{ width: `${100 - targetNumber}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Interactive slider area - place this before visual elements */}
                <div className="absolute inset-x-4 -top-3 -bottom-3 z-50">
                  <Slider
                    value={[targetNumber]}
                    min={1}
                    max={99}
                    step={1}
                    onValueChange={handleSetTarget}
                    disabled={gameActive && isRolling}
                    className="h-full [&_[role=slider]]:opacity-0 [&_[role=slider]]:w-full [&_[role=slider]]:h-full [&_[role=slider]]:cursor-grab [&_[role=slider]]:active:cursor-grabbing [&_.relative]:opacity-0 [&_[data-orientation=horizontal]]:opacity-0"
                  />
                </div>

                {/* Visual handle - purely decorative */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-10 h-10 transform -translate-x-1/2 z-40 pointer-events-none" 
                  style={{ left: `${targetNumber}%` }}
                >
                  <div className="w-full h-full bg-[#4488ff] flex items-center justify-center rounded-sm border-2 border-white/80">
                    <div className="w-5 h-5 flex flex-col justify-center items-center">
                      <div className="w-full border-t-2 border-white/50 mb-1"></div>
                      <div className="w-full border-t-2 border-white/50 mb-1"></div>
                      <div className="w-full border-t-2 border-white/50"></div>
                    </div>
                  </div>
                </div>

                {/* Result marker */}
                {result !== null && (
                  <div 
                    className="absolute -top-4 -translate-y-1/2 transform -translate-x-1/2 z-30"
                    style={{ left: `${result}%` }}
                  >
                    <div className="w-10 h-10 bg-white clip-hexagon flex items-center justify-center relative border-2 border-white">
                      <span className={`font-bold text-sm ${win ? 'text-green-500' : 'text-red-500'}`}>{formatNumber(result)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* How to Play Section - Below Game Board */}
        <div className="mt-8 bg-casino-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">How to Play</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Game Rules</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">1.</span>
                    Set your bet amount and choose a target number (1-99).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">2.</span>
                    Select Roll Over/Under to bet if the roll will be higher/lower than your target.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">3.</span>
                    Use preset difficulties (Easy, Medium, Hard) or set your own target.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400">4.</span>
                    The closer your target is to the edge, the higher the multiplier!
                  </li>
                </ul>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">Strategy Tips</h3>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-600"></span>
                    <span>Lower risk: Choose targets near 50</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-600"></span>
                    <span>Medium risk: Use preset difficulties</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-600"></span>
                    <span>High risk: Set targets near 1 or 99</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span>
                    <span>Use Auto mode for consistent strategy</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default DiceGame;
