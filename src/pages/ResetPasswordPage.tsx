
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import Layout from '../components/Layout';
import { Eye, EyeOff, Lock, RefreshCw } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const navigate = useNavigate();
  
  // Check if the URL contains a password reset token from Supabase
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (!hashParams.get('access_token')) {
      toast.error('Invalid or missing reset token. Please try again.');
    }
  }, []);
  
  const validatePassword = (password: string): boolean => {
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return false;
    }
    return true;
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePassword(password)) {
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error(error.message);
      } else {
        setResetComplete(true);
        toast.success('Password has been reset successfully');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRedirectToLogin = () => {
    navigate('/login');
  };
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">Reset Your Password</h1>
          <p className="text-center text-muted-foreground">
            {resetComplete 
              ? 'Your password has been updated' 
              : 'Enter your new password'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              {!resetComplete ? (
                <form onSubmit={handlePasswordReset}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">New Password</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          required
                          minLength={8}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? 'Hide Password' : 'Show Password'}
                          </span>
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Password must be at least 8 characters long
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Resetting Password...
                        </>
                      ) : (
                        'Reset Password'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Password Reset Complete</h3>
                  <p className="text-gray-600 mb-6">
                    Your password has been reset successfully. You can now log in with your new password.
                  </p>
                  <Button
                    onClick={handleRedirectToLogin}
                    className="mx-auto"
                  >
                    Continue to Login
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPasswordPage;
