import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Mail } from "lucide-react";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // If user is already confirmed, redirect to login
    if (user?.email_confirmed_at) {
      navigate('/auth/login');
    }
  }, [user, navigate]);

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
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-[#3B82F6]/20 flex items-center justify-center">
                <Mail className="w-6 h-6 text-[#3B82F6]" />
              </div>
            </div>
            <CardTitle className="text-white text-center">Check your email</CardTitle>
            <CardDescription className="text-[#94A3B8] text-center">
              We've sent you a verification link. Please check your email to verify your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-[#94A3B8] text-center">
              If you don't see the email, please check your spam folder.
            </p>
            <div className="flex flex-col space-y-2">
              <Button 
                asChild
                className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
              >
                <Link to="/login">Return to login</Link>
              </Button>
              <Button 
                variant="outline" 
                asChild
                className="w-full text-white border-[#282D34] bg-[#282D34] hover:bg-[#3B82F6] hover:text-white transition-colors"
              >
                <Link to="/">Back to home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 