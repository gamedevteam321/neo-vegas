import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeNavBar } from '@/components/layout/HomeNavBar';
import { 
  ArrowUpRight, 
  Layers, // Dragon Tower icon
  Bomb, // Mines icon
  Circle, // Wheel icon
  Play, // Hi-Lo icon
  Dice6, // Dice icon
} from 'lucide-react';
import { Squares2X2Icon } from '@heroicons/react/24/outline';

export const HomePage: React.FC = () => {
  const { user, isGuest } = useAuth();

  const games = [
    {
      title: 'Satte Pe Satta',
      description: 'Play the classic Indian card game with friends in real-time!',
      path: '/satte-pe-satta',
      icon: Squares2X2Icon,
      iconColor: 'text-[#3B82F6]',
    },
    {
      title: 'Dragon Tower',
      description: 'Climb the tower for higher multipliers. Watch out for dragons!',
      path: '/dragon-tower',
      icon: Layers,
      iconColor: 'text-[#3B82F6]',
    },
    {
      title: 'Mines',
      description: 'Uncover gems and avoid the mines to win big rewards.',
      path: '/mines',
      icon: Bomb,
      iconColor: 'text-[#3B82F6]',
    },
    {
      title: 'Hi-Lo',
      description: 'Guess if the next card will be higher or lower to win.',
      path: '/hi-lo',
      icon: Play,
      iconColor: 'text-[#3B82F6]',
    },
    {
      title: 'Wheel',
      description: 'Spin the wheel and win multipliers based on where it lands.',
      path: '/wheel',
      icon: Circle,
      iconColor: 'text-[#3B82F6]',
    },
    {
      title: 'Dice',
      description: 'Predict if the dice will roll over or under your number.',
      path: '/dice',
      icon: Dice6,
      iconColor: 'text-[#3B82F6]',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0E1114]">
      <HomeNavBar />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
            <span className="text-[#3B82F6]">Welcome to</span>
            <span className="text-white ml-2">NeoVegas</span>
          </h1>
          <p className="text-[#94A3B8] text-sm sm:text-base max-w-2xl mx-auto">
            Enjoy the thrill of casino games. Play responsibly and have fun!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {games.map((game) => (
            <Link key={game.path} to={game.path}>
              <div className="group relative bg-[#1E2328] rounded-lg p-4 sm:p-6 hover:bg-[#282D34] transition-all duration-200">
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                    <game.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${game.iconColor}`} />
                  </div>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-white text-base sm:text-lg font-semibold mb-1.5 sm:mb-2">{game.title}</h3>
                <p className="text-[#94A3B8] text-xs sm:text-sm">{game.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {isGuest && (
          <div className="text-center mt-8 sm:mt-12">
            <p className="text-[#94A3B8] text-sm sm:text-base mb-3 sm:mb-4">
              Want to save your progress and play with real coins?
            </p>
            <Link to="/signup">
              <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white px-6 py-2 text-sm sm:text-base">
                Create an Account
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}; 