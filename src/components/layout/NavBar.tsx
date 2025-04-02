import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useCoins } from '@/contexts/CoinContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export const NavBar: React.FC = () => {
  const { user, isGuest, signOut } = useAuth();
  const { coins, resetCoins } = useCoins();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-xl font-bold text-primary">NeoVegas</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {!isGuest && (
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Coins:</span>
                <span className="text-lg font-bold text-primary">{coins}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetCoins}
                  className="ml-2"
                >
                  Reset
                </Button>
              </div>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} alt={user.username} />
                      <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="outline">
                  {isGuest ? 'Sign Up' : 'Login / login?signup=true'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}; 