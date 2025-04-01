import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/user';
import { AuthService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import { useCoins } from './CoinContext';
import { Session } from '@supabase/supabase-js';
import { toast } from "@/components/ui/use-toast";

interface AuthContextType {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  playAsGuest: () => void;
  convertToRealAccount: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setIsGuest: setCoinGuest } = useCoins();

  useEffect(() => {
    // Check for guest mode in session storage
    const guestMode = sessionStorage.getItem('isGuest') === 'true';
    setIsGuest(guestMode);
    setCoinGuest(guestMode);

    if (!guestMode) {
      checkUser();
    } else {
      setLoading(false);
    }

    const { data: { subscription } } = AuthService.subscribeToAuthChanges((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user as User);
        setIsGuest(false);
        setCoinGuest(false);
        sessionStorage.removeItem('isGuest');
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsGuest(false);
        setCoinGuest(false);
        sessionStorage.removeItem('isGuest');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setCoinGuest]);

  async function checkUser() {
    try {
      setError(null);
      const { session, error: sessionError } = await AuthService.getSession();
      if (sessionError) throw sessionError;
      
      if (session?.user) {
        setUser(session.user as User);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking user:', error);
      // Don't set error state for missing session, just set user to null
      if (error instanceof Error && error.message.includes('Auth session missing')) {
        setUser(null);
      } else {
        setError(error instanceof Error ? error.message : 'Failed to check user');
      }
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setError(null);
      await AuthService.signIn(email, password);
      navigate('/');
    } catch (error) {
      console.error('Error signing in:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign in');
      throw error;
    }
  }

  async function signUp(email: string, password: string) {
    try {
      setError(null);
      console.log('Starting signup process...');
      const { data, error: signUpError } = await AuthService.signUp(email, password);
      
      if (signUpError) {
        console.error('Detailed signup error:', {
          message: signUpError.message,
          details: signUpError,
        });
        
        toast({
          variant: "destructive",
          title: "Signup Failed",
          description: signUpError.message || "An error occurred during signup",
        });
        
        // If signup fails, fall back to guest mode
        toast({
          title: "Using Guest Mode",
          description: "Sign up is currently unavailable. Playing as guest instead.",
        });
        playAsGuest();
        navigate('/');
        return;
      }
      
      console.log('Signup response:', data);
      
      if (data?.user) {
        console.log('User created successfully:', data.user);
        // If email confirmation is required, redirect to verify email page
        if (!data.user.email_confirmed_at) {
          console.log('Email confirmation required, redirecting...');
          toast({
            title: "Check your email",
            description: "We've sent you a verification link. Please check your email to verify your account.",
          });
          navigate('/auth/verify-email');
        } else {
          console.log('Attempting automatic signin after signup...');
          // If email confirmation is not required, sign in automatically
          try {
            await signIn(email, password);
          } catch (signInError) {
            console.error('Detailed signin error after signup:', signInError);
            toast({
              variant: "destructive",
              title: "Auto-login Failed",
              description: signInError instanceof Error ? signInError.message : "Failed to sign in after signup",
            });
            // Fallback to guest mode if signin fails too
            playAsGuest();
            navigate('/');
          }
        }
      }
    } catch (error) {
      console.error('Unexpected signup error:', error);
      toast({
        variant: "destructive",
        title: "Signup Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during signup",
      });
      
      // Fall back to guest mode on error
      playAsGuest();
      navigate('/');
    }
  }

  async function signOut() {
    try {
      setError(null);
      await AuthService.signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      setError(error instanceof Error ? error.message : 'Failed to sign out');
      throw error;
    }
  }

  async function resetPassword(email: string) {
    try {
      setError(null);
      await AuthService.resetPassword(email);
      navigate('/auth/reset-password-sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      setError(error instanceof Error ? error.message : 'Failed to reset password');
      throw error;
    }
  }

  const playAsGuest = () => {
    setIsGuest(true);
    setCoinGuest(true);
    sessionStorage.setItem('isGuest', 'true');
    setUser(null);
    setLoading(false);
    
    // Show toast notification for guest mode
    toast({
      title: "Playing as Guest",
      description: "You can play games but cannot bet coins. Sign up to play with real coins!",
    });
  };

  const convertToRealAccount = async (email: string, password: string) => {
    try {
      setError(null);
      await signUp(email, password);
      setIsGuest(false);
      setCoinGuest(false);
      sessionStorage.removeItem('isGuest');
    } catch (error: any) {
      setError(error.message || 'Failed to convert to real account');
      throw error;
    }
  };

  const value = {
    user,
    isGuest,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    playAsGuest,
    convertToRealAccount,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 