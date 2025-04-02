import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Lock } from 'lucide-react';

export const AuthRequired: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0E1114] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#1E2328] border-casino-muted">
        <div className="p-6 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-yellow-600/10 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-yellow-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-white">Authentication Required</h1>
            <p className="text-[#94A3B8]">
              Please sign in or create an account to access this feature.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/login" className="w-full">
              <Button
                className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              >
                Sign In
              </Button>
            </Link>
            <Link to="/login" className="w-full">
              <Button
                variant="outline"
                className="w-full border-[#3B82F6] text-[#3B82F6] hover:bg-[#3B82F6]/10"
              >
                Create Account
              </Button>
            </Link>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-700" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#1E2328] px-2 text-gray-500">or</span>
              </div>
            </div>
            <Link to="/" className="w-full">
              <Button
                variant="ghost"
                className="w-full text-gray-400 hover:text-white hover:bg-gray-800"
              >
                Return to Home
              </Button>
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </Card>
    </div>
  );
}; 