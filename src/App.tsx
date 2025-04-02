import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { CoinProvider } from './contexts/CoinContext';
import { Toaster } from "@/components/ui/toaster";
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import DragonTower from './pages/DragonTower';
import Mines from './pages/Mines';
import HiLo from './pages/HiLo';
import Wheel from './pages/Wheel';
import Dice from './pages/Dice';
import { SattePeSatta } from './pages/SattePeSatta';
import { SattePeSattaGame } from './pages/SattePeSattaGame';
import NotFound from './pages/NotFound';
import MainLayout from './components/layout/MainLayout';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <CoinProvider>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/login" element={<SignUpPage />} />
                <Route path="/auth/verify-email" element={<VerifyEmailPage />} />
                
                {/* Game Routes */}
                <Route
                  path="/dragon-tower"
                  element={
                    <ProtectedRoute>
                      <DragonTower />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/mines"
                  element={
                    <ProtectedRoute>
                      <Mines />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hi-lo"
                  element={
                    <ProtectedRoute>
                      <HiLo />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/wheel"
                  element={
                    <ProtectedRoute>
                      <Wheel />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dice"
                  element={
                    <ProtectedRoute>
                      <Dice />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/satte-pe-satta"
                  element={
                    <ProtectedRoute allowGuest={false}>
                      <MainLayout>
                        <SattePeSatta />
                      </MainLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/satte-pe-satta/game/:roomCode"
                  element={
                    <ProtectedRoute>
                      <SattePeSattaGame />
                    </ProtectedRoute>
                  }
                />
                
                {/* Catch all route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <Toaster />
            </div>
          </AuthProvider>
        </CoinProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
