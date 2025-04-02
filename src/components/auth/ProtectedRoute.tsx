import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequired } from './AuthRequired';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  allowGuest?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  allowGuest = true,
}) => {
  const { user, loading, isGuest, playAsGuest } = useAuth();
  const location = useLocation();

  if (loading) {
    // You can add a loading spinner here if needed
    return (
      <div className="min-h-screen bg-[#0E1114] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // If user is not logged in and route doesn't allow guests, show auth required page
  if (!user && !allowGuest) {
    return <AuthRequired />;
  }

  // If user is not logged in and not in guest mode, show guest mode UI
  if (!user && !isGuest && allowGuest) {
    return (
      <div className="min-h-screen bg-[#0E1114] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#1E2328] border border-casino-muted rounded-lg p-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-yellow-600/10 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-yellow-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Play as Guest</h1>
            <p className="text-[#94A3B8]">
              You can play most games with 0 coins, or sign up to get 1000 free coins!
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                playAsGuest();
                window.location.reload();
              }}
              className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white py-2 px-4 rounded-lg"
            >
              Play as Guest
            </button>
            <a
              href="/signup"
              className="w-full border border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10 py-2 px-4 rounded-lg"
            >
              Sign Up for Free Coins
            </a>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1E2328] px-2 text-gray-500">or</span>
              </div>
            </div>
            <a
              href="/"
              className="w-full text-gray-400 hover:text-white hover:bg-gray-800 py-2 px-4 rounded-lg"
            >
              Return to Home
            </a>
          </div>

          <p className="text-sm text-gray-500">
            By playing as guest, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 