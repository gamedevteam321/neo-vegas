import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';

interface GameBoardProps {
  players: Player[];
  currentTurn: string | null;
  gameState: 'dealing' | 'playing' | 'finished';
  onPlayCard: (cardIndex: number) => void;
  onDealCards: () => void;
  isCreator: boolean;
  roomCode: string;
  currentPlayer: Player | null;
  playedCards: string[];
}

interface Player {
  user_id: string;
  username: string;
  coins: number;
  cards?: string[];
  score?: number;
}

const TURN_TIMER = 30; // seconds
const DEAL_TIMER = 10; // seconds

export const GameBoard: React.FC<GameBoardProps> = ({
  players,
  currentTurn,
  gameState,
  onPlayCard,
  onDealCards,
  isCreator,
  roomCode,
  currentPlayer,
  playedCards,
}) => {
  const [turnTimeLeft, setTurnTimeLeft] = useState(TURN_TIMER);
  const [dealTimeLeft, setDealTimeLeft] = useState(DEAL_TIMER);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'playing' && currentTurn) {
      timer = setInterval(() => {
        setTurnTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            toast({
              title: "Turn Time's Up!",
              description: "Moving to next player...",
              variant: "destructive",
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, currentTurn]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === 'dealing' && isCreator) {
      timer = setInterval(() => {
        setDealTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            onDealCards();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, isCreator, onDealCards]);

  const cardVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: { scale: 1, rotate: 0 },
    played: { scale: 1.2, y: -20 },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Game Status */}
      <div className="bg-casino-card p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-2">Game Status</h3>
        <div className="space-y-2">
          <p className="text-white">Room Code: {roomCode}</p>
          <p className="text-white">State: {gameState}</p>
          <p className="text-white">Is Creator: {isCreator ? 'Yes' : 'No'}</p>
          {gameState === 'playing' && (
            <div>
              <p className="text-white mb-1">Turn Timer:</p>
              <Progress value={(turnTimeLeft / TURN_TIMER) * 100} className="h-2" />
              <p className="text-white text-sm mt-1">{turnTimeLeft}s</p>
            </div>
          )}
          {gameState === 'dealing' && (
            <>
              <div>
                <p className="text-white mb-1">Dealing Timer:</p>
                <Progress value={(dealTimeLeft / DEAL_TIMER) * 100} className="h-2" />
                <p className="text-white text-sm mt-1">{dealTimeLeft}s</p>
              </div>
              {isCreator && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  onClick={onDealCards}
                >
                  Deal Cards
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Played Cards Area */}
      <div className="bg-casino-card p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-2">Played Cards</h3>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {playedCards.map((card, index) => (
              <motion.div
                key={index}
                initial="hidden"
                animate="played"
                exit="hidden"
                variants={cardVariants}
                className="w-16 h-24 bg-white rounded-lg flex items-center justify-center shadow-lg"
              >
                <span className={`text-xl ${
                  card.includes('♥') || card.includes('♦') ? 'text-red-500' : 'text-black'
                }`}>
                  {card}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Player Cards */}
      <div className="bg-casino-card p-4 rounded-lg md:col-span-2">
        <h3 className="text-white font-semibold mb-2">Your Cards</h3>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {currentPlayer?.cards?.map((card, index) => (
            <motion.div
              key={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                className={`w-full aspect-[2/3] p-2 ${
                  currentTurn === currentPlayer.user_id ? 'hover:bg-yellow-600' : 'opacity-50'
                }`}
                onClick={() => onPlayCard(index)}
                disabled={currentTurn !== currentPlayer.user_id}
              >
                <span className={`text-lg ${
                  card.includes('♥') || card.includes('♦') ? 'text-red-500' : 'text-white'
                }`}>
                  {card}
                </span>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Players List */}
      <div className="bg-casino-card p-4 rounded-lg md:col-span-2">
        <h3 className="text-white font-semibold mb-2">Players</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {players.map((player) => (
            <Card
              key={player.user_id}
              className={`p-2 ${
                currentTurn === player.user_id ? 'border-yellow-500' : ''
              }`}
            >
              <p className="text-white">{player.username}</p>
              <p className="text-sm text-gray-400">
                Cards: {player.cards?.length || 0}
              </p>
              <p className="text-sm text-gray-400">
                Score: {player.score || 0}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}; 