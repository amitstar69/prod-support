import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

type UserTypeOption = 'client' | 'developer';

const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userType, setUserType] = useState<UserTypeOption>('client');
  const [error, setError] = useState('');
  
  const handleUserTypeChange = (type: UserTypeOption) => {
    setUserType(type);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password, userType);
      if (success) {
        const redirectPath = userType === 'client' ? '/client' : 
                           userType === 'developer' ? '/developer-dashboard' : '/';
        
        if (location.state && location.state.returnTo) {
          navigate(location.state.returnTo);
        } else {
          navigate(redirectPath);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="grid grid-cols-2 gap-4 bg-muted p-1 rounded-lg">
          <Button
            type="button"
            variant={userType === 'client' ? 'default' : 'ghost'}
            onClick={() => handleUserTypeChange('client')}
            className="w-full"
          >
            Client
          </Button>
          <Button
            type="button"
            variant={userType === 'developer' ? 'default' : 'ghost'}
            onClick={() => handleUserTypeChange('developer')}
            className="w-full"
          >
            Developer
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="your@email.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button
                variant="link"
                className="p-0 h-auto font-normal text-xs"
                type="button"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator className="w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" type="button" disabled={isLoading}>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={isLoading}>
            GitHub
          </Button>
        </div>
        
        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Button
            variant="link"
            className="p-0 h-auto font-normal"
            type="button"
            onClick={() => navigate('/register')}
          >
            Sign up
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
