import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCoins } from '@/contexts/CoinContext';
import { Button } from '@/components/ui/button';
import { Coins, User, RefreshCcw } from 'lucide-react';
import { formatCoins } from '@/utils/coinManager';

export const HomeNavBar: React.FC = () => {
  const { user, isGuest, signOut } = useAuth();
  const { coins, resetCoins } = useCoins();

  return (
    <nav className="bg-[#0E1114] border-b border-[#1E2328]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link to="/" className="flex items-center text-2xl font-bold">
            <span className="text-[#3B82F6]">Neo</span>
            <span className="text-white ml-2">Vegas</span>
          </Link>

          {/* Right side content */}
          <div className="flex items-center gap-4">
            {user || isGuest ? (
              <>
                {/* Coins display */}
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-[#FFB800]" />
                  <span className="font-bold text-[#FFB800]">{formatCoins(coins)}</span>
                </div>

                {/* Reset Coins button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-[#1E2328] bg-[#1E2328] hover:bg-[#282D34]"
                  onClick={resetCoins}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Reset Coins
                </Button>

                {/* Profile dropdown or signup button */}
                {user ? (
                  <div className="relative group">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-white border-[#1E2328] bg-[#1E2328] hover:bg-[#282D34]"
                    >
                      <User className="w-4 h-4 mr-2" />
                      {user.username}
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-[#1E2328] border border-[#282D34] rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="py-1">
                        <button
                          onClick={signOut}
                          className="w-full text-left px-4 py-2 text-sm text-white hover:bg-[#282D34]"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link to="/login">
                    <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
                      Sign Up
                    </Button>
                  </Link>
                )}
              </>
            ) : (
              <>
                {/* Login/Signup buttons for non-authenticated users */}
                <Link to="/login">
                  <Button variant="outline" className="text-white border-[#1E2328] bg-[#1E2328] hover:bg-[#282D34]">
                    Login
                  </Button>
                </Link>
                <Link to="/login?signup=true">
                  <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 