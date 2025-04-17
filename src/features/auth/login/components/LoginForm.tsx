
import React, { KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Code, RefreshCw } from 'lucide-react';
import { LoginInputField } from './LoginInputField';
import { LoginErrorDisplay } from './LoginErrorDisplay';
import { UserType } from '@/contexts/auth/types';

interface LoginFormProps {
  email: string;
  password: string;
  userType: UserType;
  isLoading: boolean;
  error: string;
  emailError: string;
  passwordError: string;
  rememberMe: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserTypeChange: (value: UserType) => void;
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
  // Handle Enter key press for form inputs
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      const formEvent = new Event('submit', { cancelable: true }) as unknown as React.FormEvent;
      onSubmit(formEvent);
    }
  };

  // Determine which error message to show (with priority)
  const getDisplayError = (): string => {
    // Only return one error with priority: error > emailError > passwordError
    if (error) return error;
    if (emailError) return emailError;
    if (passwordError) return passwordError;
    return '';
  };

  const displayError = getDisplayError();

  return (
    <Card className="border border-border/40 shadow-sm">
      <CardHeader className="pb-2">
        <Tabs
          defaultValue={userType}
          onValueChange={(value) => onUserTypeChange(value as UserType)}
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
          {/* Error display component */}
          {displayError && <LoginErrorDisplay error={displayError} />}
          
          <LoginInputField 
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={onEmailChange}
            onBlur={onEmailBlur}
            onKeyDown={handleKeyDown}
            placeholder="you@example.com"
            autoComplete="email"
            error={emailError}
            disabled={isLoading}
            required
          />
          
          <LoginInputField 
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={onPasswordChange}
            onBlur={onPasswordBlur}
            onKeyDown={handleKeyDown}
            placeholder="••••••••"
            autoComplete="current-password"
            error={passwordError}
            disabled={isLoading}
            required
            endAdornment={
              <Link 
                to="/forgot-password" 
                className="text-xs text-primary hover:underline"
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot password?
              </Link>
            }
          />
          
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
