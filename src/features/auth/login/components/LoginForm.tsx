import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserType } from '@/contexts/auth/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoginErrorDisplay } from './LoginErrorDisplay';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { SocialLoginButtons } from './SocialLoginButtons';
import { LoginInputField } from './LoginInputField';

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
  onUserTypeChange: (type: UserType) => void;
  onRememberMeChange: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onEmailBlur?: () => void;
  onPasswordBlur?: () => void;
  onGoogleLogin?: () => void;
  onGithubLogin?: () => void;
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
  onPasswordBlur,
  onGoogleLogin,
  onGithubLogin
}) => {
  return (
    <Card className="w-[350px]">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Login</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Tabs defaultValue={userType} className="w-full">
          <TabsList>
            <TabsTrigger value="client" onClick={() => onUserTypeChange('client')}>Client</TabsTrigger>
            <TabsTrigger value="developer" onClick={() => onUserTypeChange('developer')}>Developer</TabsTrigger>
          </TabsList>
          <TabsContent value="client">
            <form onSubmit={onSubmit}>
              <LoginInputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={onEmailChange}
                error={emailError}
                onBlur={onEmailBlur}
              />
              <LoginInputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={onPasswordChange}
                error={passwordError}
                onBlur={onPasswordBlur}
              />
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={onRememberMeChange} />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <LoginErrorDisplay error={error} />
              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading ? "Logging in..." : "Login as Client"}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="developer">
            <form onSubmit={onSubmit}>
              <LoginInputField
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={onEmailChange}
                error={emailError}
                onBlur={onEmailBlur}
              />
              <LoginInputField
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={onPasswordChange}
                error={passwordError}
                onBlur={onPasswordBlur}
              />
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={onRememberMeChange} />
                <Label htmlFor="remember">Remember me</Label>
              </div>
              <LoginErrorDisplay error={error} />
              <Button disabled={isLoading} className="w-full" type="submit">
                {isLoading ? "Logging in..." : "Login as Developer"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 items-center text-sm">
        <SocialLoginButtons onGoogleLogin={onGoogleLogin} onGithubLogin={onGithubLogin} />
        <Link to="/register" className="text-blue-500 hover:underline">
          Don't have an account? Register
        </Link>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
