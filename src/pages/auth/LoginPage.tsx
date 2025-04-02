import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, playAsGuest, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent, isSignUp: boolean) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Validate password before signup
        if (password.length < 8) {
          throw new Error('Password must be at least 8 characters');
        }
        if (!/[A-Z]/.test(password)) {
          throw new Error('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
          throw new Error('Password must contain at least one lowercase letter');
        }
        if (!/[0-9]/.test(password)) {
          throw new Error('Password must contain at least one number');
        }
        if (!/[^A-Za-z0-9]/.test(password)) {
          throw new Error('Password must contain at least one special character');
        }
        
        await signUp(email, password);
      } else {
        try {
          await signIn(email, password);
          navigate('/');
        } catch (error) {
          if (error instanceof Error && error.message.includes('Email not confirmed')) {
            toast({
              variant: "destructive",
              title: "Email Not Verified",
              description: "Please check your email for a verification link before signing in.",
            });
            navigate('/auth/verify-email');
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Show error in the UI
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: error.message,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestMode = () => {
    playAsGuest();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0E1114]">
      {/* Navbar */}
      <nav className="bg-[#0E1114] border-b border-[#1E2328]">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center text-2xl font-bold">
              <span className="text-[#3B82F6]">Neo</span>
              <span className="text-white ml-2">Vegas</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#1E2328] border-[#282D34]">
          <CardHeader>
            <CardTitle className="text-white">Welcome Back</CardTitle>
            <CardDescription className="text-[#94A3B8]">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-[#282D34]">
                <TabsTrigger 
                  value="login" 
                  className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger 
                  value="signup"
                  className="data-[state=active]:bg-[#3B82F6] data-[state=active]:text-white"
                >
                  Sign Up
                </TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-[#282D34] border-[#3B82F6]/20 text-white placeholder:text-[#94A3B8]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-[#282D34] border-[#3B82F6]/20 text-white placeholder:text-[#94A3B8]"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={(e) => handleSubmit(e, true)} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-[#282D34] border-[#3B82F6]/20 text-white placeholder:text-[#94A3B8]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-[#282D34] border-[#3B82F6]/20 text-white placeholder:text-[#94A3B8]"
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#282D34]"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-[#1E2328] text-[#94A3B8]">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full text-white border-[#282D34] bg-[#282D34] hover:bg-[#3B82F6] hover:text-white transition-colors"
                  onClick={handleGuestMode}
                >
                  Play as Guest
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 