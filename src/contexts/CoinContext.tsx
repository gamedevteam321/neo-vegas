import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface CoinContextType {
  coins: number;
  addCoins: (amount: number) => void;
  removeCoins: (amount: number) => void;
  resetCoins: () => void;
  isGuest: boolean;
  setIsGuest: (isGuest: boolean) => void;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export const useCoins = () => {
  const context = useContext(CoinContext);
  if (!context) {
    throw new Error('useCoins must be used within a CoinProvider');
  }
  return context;
};

export const CoinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coins, setCoins] = useState(0); // Default to 0 coins
  const [isGuest, setIsGuest] = useState(false);
  const navigate = useNavigate();

  // Initialize coins and guest status
  useEffect(() => {
    const guestMode = sessionStorage.getItem('isGuest') === 'true';
    setIsGuest(guestMode);
    
    if (guestMode) {
      setCoins(0);
      localStorage.removeItem('coins');
    } else {
      const savedCoins = localStorage.getItem('coins');
      if (savedCoins !== null) {
        setCoins(parseInt(savedCoins));
      } else {
        setCoins(10000);
        localStorage.setItem('coins', '10000');
      }
    }
  }, []);

  // Handle guest status changes
  useEffect(() => {
    if (isGuest) {
      sessionStorage.setItem('isGuest', 'true');
      setCoins(0);
      localStorage.removeItem('coins');
    } else {
      sessionStorage.removeItem('isGuest');
      const savedCoins = localStorage.getItem('coins');
      if (!savedCoins) {
        setCoins(10000);
        localStorage.setItem('coins', '10000');
      }
    }
  }, [isGuest]);

  // Save coins to localStorage for non-guest users
  useEffect(() => {
    if (!isGuest && coins > 0) {
      localStorage.setItem('coins', coins.toString());
    }
  }, [coins, isGuest]);

  const addCoins = (amount: number) => {
    if (isGuest) {
      if (window.confirm('Please sign up to add coins and save your progress!')) {
        navigate('/login');
      }
      return;
    }
    setCoins((prev) => {
      const newAmount = prev + amount;
      localStorage.setItem('coins', newAmount.toString());
      return newAmount;
    });
  };

  const removeCoins = (amount: number) => {
    if (isGuest) return;
    setCoins((prev) => {
      const newAmount = Math.max(0, prev - amount);
      localStorage.setItem('coins', newAmount.toString());
      return newAmount;
    });
  };

  const resetCoins = () => {
    if (isGuest) return;
    setCoins(10000);
    localStorage.setItem('coins', '10000');
  };

  const value = {
    coins,
    addCoins,
    removeCoins,
    resetCoins,
    isGuest,
    setIsGuest,
  };

  return <CoinContext.Provider value={value}>{children}</CoinContext.Provider>;
};
