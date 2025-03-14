
import React from 'react';
import { Link } from 'react-router-dom';
import { UserType } from '../../hooks/useLoginForm';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Loader2, Mail, Lock } from "lucide-react";

interface LoginFormProps {
  email: string;
  password: string;
  userType: UserType;
  isLoading: boolean;
  error: string;
  rememberMe: boolean;
  onEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUserTypeChange: (type: UserType) => void;
  onRememberMeChange: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  userType,
  isLoading,
  error,
  rememberMe,
  onEmailChange,
  onPasswordChange,
  onUserTypeChange,
  onRememberMeChange,
  onSubmit,
}) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Log In</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <Mail size={16} />
              </div>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={onEmailChange}
                className="pl-10"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <Lock size={16} />
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={onPasswordChange}
                className="pl-10"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Account Type</Label>
            <RadioGroup 
              value={userType} 
              onValueChange={(value) => onUserTypeChange(value as UserType)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="client" id="client" disabled={isLoading} />
                <Label htmlFor="client" className="cursor-pointer">Client</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="developer" id="developer" disabled={isLoading} />
                <Label htmlFor="developer" className="cursor-pointer">Developer</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={onRememberMeChange}
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary/25"
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm cursor-pointer">
                Remember me
              </Label>
            </div>
            <Link to="/forgot-password" className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="flex justify-center border-t border-border/30 pt-6">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-medium hover:underline">
            Register
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
