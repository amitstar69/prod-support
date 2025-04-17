
import React, { KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { User, Code, RefreshCw, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface LoginFormProps {
  email: string;
  password: string;
  userType: 'client' | 'developer';
  isLoading: boolean;
  error: string;
  emailError: string;
  passwordError: string;
  rememberMe: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserTypeChange: (value: 'client' | 'developer') => void;
  onRememberMeChange: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onEmailBlur?: () => void;
  onPasswordBlur?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  userType,
  isLoading,
  error,
  emailError,
  passwordError,
  rememberMe,
  onEmailChange,
  onPasswordChange,
  onUserTypeChange,
  onRememberMeChange,
  onSubmit,
  onEmailBlur,
  onPasswordBlur
}) => {
  // Handle Enter key press for both email and password inputs
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
      onSubmit(formEvent);
    }
  };

  // Determine error type for better user feedback
  const getErrorType = (error: string): string => {
    if (error.includes('Network') || error.includes('connection') || error.includes('timed out')) {
      return 'network';
    } else if (error.includes('credentials') || error.includes('invalid') || error.includes('incorrect')) {
      return 'credentials'; 
    } else if (error.includes('verify') || error.includes('verification') || error.includes('confirmed')) {
      return 'verification';
    }
    return 'general';
  };

  const errorType = error ? getErrorType(error) : null;

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="pb-2">
        <Tabs
          defaultValue={userType}
          onValueChange={(value) => onUserTypeChange(value as 'client' | 'developer')}
          className="mb-1"
        >
          <TabsList className="w-full">
            <TabsTrigger value="client" className="w-full">
              <User className="mr-2 h-4 w-4" />
              Client
            </TabsTrigger>
            <TabsTrigger value="developer" className="w-full">
              <Code className="mr-2 h-4 w-4" />
              Developer
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      
      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4 pt-4">
          {error && (
            <Alert variant={errorType === 'network' ? 'destructive' : errorType === 'verification' ? 'warning' : 'destructive'} className="py-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errorType === 'verification' ? (
                  <>
                    {error}{' '}
                    <Link to="/forgot-password" className="underline font-medium">
                      Resend verification email
                    </Link>
                  </>
                ) : (
                  error
                )}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={onEmailChange}
              onBlur={onEmailBlur}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              autoComplete="email"
              className={emailError ? "border-destructive" : ""}
              disabled={isLoading}
              required
              aria-invalid={emailError ? "true" : "false"}
              aria-describedby={emailError ? "email-error" : undefined}
            />
            {emailError && (
              <p id="email-error" className="text-xs text-destructive mt-1">{emailError}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link 
                to="/forgot-password" 
                className="text-xs text-primary hover:underline"
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={onPasswordChange}
              onBlur={onPasswordBlur}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              autoComplete="current-password"
              className={passwordError ? "border-destructive" : ""}
              disabled={isLoading}
              required
              aria-invalid={passwordError ? "true" : "false"}
              aria-describedby={passwordError ? "password-error" : undefined}
            />
            {passwordError && (
              <p id="password-error" className="text-xs text-destructive mt-1">{passwordError}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="rememberMe" 
              checked={rememberMe}
              onCheckedChange={onRememberMeChange}
              disabled={isLoading}
            />
            <Label 
              htmlFor="rememberMe" 
              className="text-sm font-normal"
            >
              Keep me signed in
            </Label>
          </div>
        </CardContent>
        
        <CardFooter className="flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </Button>
          
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default LoginForm;
