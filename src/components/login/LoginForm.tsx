
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { UserType } from '../../hooks/useLoginForm';
import { Check } from 'lucide-react';

interface LoginFormProps {
  email?: string;
  password?: string;
  userType?: UserType;
  isLoading?: boolean;
  error?: string;
  rememberMe?: boolean;
  onEmailChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserTypeChange?: (type: UserType) => void;
  onRememberMeChange?: () => void;
  onSubmit?: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email: externalEmail,
  password: externalPassword,
  userType: externalUserType,
  isLoading: externalIsLoading,
  error: externalError,
  rememberMe: externalRememberMe,
  onEmailChange,
  onPasswordChange,
  onUserTypeChange,
  onRememberMeChange,
  onSubmit,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState(externalEmail || '');
  const [password, setPassword] = useState(externalPassword || '');
  const [isLoading, setIsLoading] = useState(externalIsLoading || false);
  const [userType, setUserType] = useState<UserType>(externalUserType || 'client');
  const [error, setError] = useState(externalError || '');
  
  const handleUserTypeChange = (type: UserType) => {
    if (onUserTypeChange) {
      onUserTypeChange(type);
    } else {
      setUserType(type);
    }
  };
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onEmailChange) {
      onEmailChange(e);
    } else {
      setEmail(e.target.value);
    }
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onPasswordChange) {
      onPasswordChange(e);
    } else {
      setPassword(e.target.value);
    }
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(e);
      return;
    }
    
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
      <form onSubmit={onSubmit || handleLogin} className="space-y-6">
        <div className="text-center mb-2">
          <div className="text-sm mb-1">
            Don't have an account?{' '}
            <Button
              variant="link"
              className="p-0 h-auto font-medium text-primary"
              type="button"
              onClick={() => navigate('/register')}
            >
              Sign up
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 bg-muted p-1 rounded-lg">
          <Button
            type="button"
            variant={userType === 'client' ? 'default' : 'outline'}
            onClick={() => handleUserTypeChange('client')}
            className={`w-full relative ${userType === 'client' ? 'text-white bg-primary hover:bg-primary/90' : 'bg-background border hover:bg-muted/50'}`}
            aria-pressed={userType === 'client'}
          >
            {userType === 'client' && (
              <Check className="h-4 w-4 absolute left-2" />
            )}
            <span className={userType === 'client' ? 'ml-2' : ''}>Client</span>
          </Button>
          <Button
            type="button"
            variant={userType === 'developer' ? 'default' : 'outline'}
            onClick={() => handleUserTypeChange('developer')}
            className={`w-full relative ${userType === 'developer' ? 'text-white bg-primary hover:bg-primary/90' : 'bg-background border hover:bg-muted/50'}`}
            aria-pressed={userType === 'developer'}
          >
            {userType === 'developer' && (
              <Check className="h-4 w-4 absolute left-2" />
            )}
            <span className={userType === 'developer' ? 'ml-2' : ''}>Developer</span>
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="your@email.com"
              type="email"
              value={externalEmail !== undefined ? externalEmail : email}
              onChange={handleEmailChange}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={externalPassword !== undefined ? externalPassword : password}
              onChange={handlePasswordChange}
              required
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={externalIsLoading !== undefined ? externalIsLoading : isLoading}
        >
          {(externalIsLoading !== undefined ? externalIsLoading : isLoading) ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            'Sign In'
          )}
        </Button>

        <div className="text-center">
          <Button
            variant="link"
            className="p-0 h-auto font-normal text-sm"
            type="button"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </Button>
        </div>
        
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
          <Button variant="outline" type="button" disabled={externalIsLoading !== undefined ? externalIsLoading : isLoading}>
            Google
          </Button>
          <Button variant="outline" type="button" disabled={externalIsLoading !== undefined ? externalIsLoading : isLoading}>
            GitHub
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
