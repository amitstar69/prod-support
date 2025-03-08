
import React from 'react';
import { Link } from 'react-router-dom';
import { UserType } from '../../hooks/useLoginForm';

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
    <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
      <div className="p-6 md:p-8">
        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={onSubmit}>
          <div className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={onEmailChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={onPasswordChange}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium mb-2">
                Account Type
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="client"
                    checked={userType === 'client'}
                    onChange={() => onUserTypeChange('client')}
                    className="h-4 w-4 text-primary border-border focus:ring-primary/25"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm">Client</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="developer"
                    checked={userType === 'developer'}
                    onChange={() => onUserTypeChange('developer')}
                    className="h-4 w-4 text-primary border-border focus:ring-primary/25"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm">Developer</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={onRememberMeChange}
                  className="h-4 w-4 text-primary border-border focus:ring-primary/25 rounded"
                  disabled={isLoading}
                />
                <span className="ml-2 text-sm">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </a>
            </div>
            
            <div>
              <button
                type="submit"
                className="button-primary w-full flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </button>
            </div>
          </div>
        </form>
        
        <div className="mt-6 pt-6 border-t border-border/30 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary font-medium">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
