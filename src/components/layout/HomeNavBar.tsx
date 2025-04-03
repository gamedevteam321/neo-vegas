import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCoins } from '@/contexts/CoinContext';
import { Button } from '@/components/ui/button';
import { Coins, User, RefreshCcw, Menu, X, LogOut } from 'lucide-react';
import { formatCoins } from '@/utils/coinManager';

export const HomeNavBar: React.FC = () => {
  const { user, isGuest, signOut } = useAuth();
  const { coins, resetCoins } = useCoins();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const NavContent = () => (
    <>
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

      {/* Profile button */}
      {user ? (
        <Button
          variant="outline"
          size="sm"
          className="text-white border-[#1E2328] bg-[#1E2328] hover:bg-[#282D34]"
        >
          <User className="w-4 h-4 mr-2" />
          {user.username}
        </Button>
      ) : (
        <Link to="/login">
          <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
            Sign Up
          </Button>
        </Link>
      )}
    </>
  );

  const AuthButtons = () => (
    <>
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
  );

  return (
    <nav className="bg-[#0E1114] border-b border-[#1E2328]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Home Link */}
          <Link to="/" className="flex items-center text-xl sm:text-2xl font-bold">
            <span className="text-[#3B82F6]">Neo</span>
            <span className="text-white ml-2">Vegas</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {/* Coins display - always visible */}
            <div className="flex items-center gap-2 mr-4">
              <Coins className="w-5 h-5 text-[#FFB800]" />
              <span className="font-bold text-[#FFB800]">{formatCoins(coins)}</span>
            </div>

            {user || isGuest ? <NavContent /> : <AuthButtons />}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-4 md:hidden">
            {/* Coins display for mobile */}
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-[#FFB800]" />
              <span className="font-bold text-[#FFB800]">{formatCoins(coins)}</span>
            </div>
            <button
              className="p-2 text-white hover:bg-[#282D34] rounded-lg"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-[#1E2328]">
            {user || isGuest ? (
              <div className="flex flex-col gap-4">
                <NavContent />
                {user && (
                  <Button
                    variant="outline"
                    className="text-white border-[#1E2328] bg-[#1E2328] hover:bg-[#282D34] w-full"
                    onClick={signOut}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <AuthButtons />
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}; 