
import React, { useState, memo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import { useAuth } from '../../contexts/auth';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { UserType } from '../../hooks/useLoginForm';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';

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

// Memoize the form component to prevent unnecessary re-renders
const LoginForm: React.FC<LoginFormProps> = memo(({
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
  
  // Use callbacks for handlers to prevent unnecessary re-renders
  const handleUserTypeChange = useCallback((value: string) => {
    const newType = value as UserType;
    if (onUserTypeChange) {
      onUserTypeChange(newType);
    } else {
      setUserType(newType);
    }
  }, [onUserTypeChange]);
  
  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onEmailChange) {
      onEmailChange(e);
    } else {
      setEmail(e.target.value);
    }
  }, [onEmailChange]);
  
  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (onPasswordChange) {
      onPasswordChange(e);
    } else {
      setPassword(e.target.value);
    }
  }, [onPasswordChange]);
  
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(e);
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // Store login start time for performance monitoring
      const startTime = Date.now();
      
      const success = await login(email, password, userType);
      
      // Calculate login duration
      const duration = Date.now() - startTime;
      console.log(`Login attempt took ${duration}ms`);
      
      if (success) {
        const redirectPath = userType === 'client' ? '/client' : 
                           userType === 'developer' ? '/developer-dashboard' : '/';
        
        // Show toast notification
        toast.success(`Successfully logged in as ${userType}`);
        
        // Perform navigation
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
  }, [email, login, location.state, navigate, password, userType, onSubmit]);
  
  // Add preconnect hint for Google to speed up social login (if implemented)
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = 'https://accounts.google.com';
    document.head.appendChild(link);
    
    return () => {
      document.head.removeChild(link);
    };
  }, []);
  
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

        <div className="flex flex-col gap-4">
          <div className="text-center mb-0">
            <span className="text-sm font-medium">Sign in as</span>
          </div>
          
          <RadioGroup 
            defaultValue={externalUserType || userType} 
            value={externalUserType || userType}
            onValueChange={handleUserTypeChange}
            className="grid grid-cols-2 gap-4"
          >
            <div className={`flex items-center justify-center gap-2 p-3 rounded-md border cursor-pointer
              ${(externalUserType || userType) === 'client' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}
            >
              <RadioGroupItem value="client" id="client-type" className="text-primary" />
              <Label htmlFor="client-type" className="cursor-pointer font-medium">Client</Label>
            </div>
            <div className={`flex items-center justify-center gap-2 p-3 rounded-md border cursor-pointer
              ${(externalUserType || userType) === 'developer' ? 'border-primary bg-primary/5' : 'border-slate-200'}`}
            >
              <RadioGroupItem value="developer" id="developer-type" className="text-primary" />
              <Label htmlFor="developer-type" className="cursor-pointer font-medium">Developer</Label>
            </div>
          </RadioGroup>
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
              autoComplete="email"
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
              autoComplete="current-password"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90" 
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
});

// Display name for React DevTools
LoginForm.displayName = 'LoginForm';

export default LoginForm;
