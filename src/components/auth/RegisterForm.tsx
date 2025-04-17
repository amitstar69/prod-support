
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertCircle, RefreshCw } from 'lucide-react';
import SocialRegisterButtons from './SocialRegisterButtons';
import { UserType } from '@/contexts/auth/types';

interface RegisterFormProps {
  formValues: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  passwordsMatch: boolean;
  termsAgreed: boolean;
  isLoading: boolean;
  formError: string | null;
  userType: UserType;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTermsChange: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onGoogleRegister: () => void;
  onGithubRegister: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  formValues,
  passwordsMatch,
  termsAgreed,
  isLoading,
  formError,
  userType,
  handleInputChange,
  handleTermsChange,
  handleSubmit,
  onGoogleRegister,
  onGithubRegister
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="firstName">First Name</Label>
          <Input 
            id="firstName"
            name="firstName"
            type="text"
            placeholder="John"
            value={formValues.firstName}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="lastName">Last Name</Label>
          <Input 
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Doe"
            value={formValues.lastName}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="email">Email Address</Label>
        <Input 
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formValues.email}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input 
          id="password"
          name="password"
          type="password"
          placeholder="Create a password (6+ characters)"
          value={formValues.password}
          onChange={handleInputChange}
          required
        />
      </div>
      
      <div className="space-y-1">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input 
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={formValues.confirmPassword}
          onChange={handleInputChange}
          aria-invalid={!passwordsMatch}
          className={!passwordsMatch && formValues.confirmPassword ? "border-destructive" : ""}
          required
        />
        
        {!passwordsMatch && formValues.confirmPassword && (
          <p className="text-xs text-destructive mt-1">
            Passwords do not match
          </p>
        )}
      </div>
      
      <div className="flex items-start space-x-2 pt-2">
        <Checkbox 
          id="termsAgreed" 
          checked={termsAgreed}
          onCheckedChange={handleTermsChange}
        />
        <Label 
          htmlFor="termsAgreed" 
          className="text-sm font-normal"
        >
          I agree to the{' '}
          <Link to="/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </Label>
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || !termsAgreed || !passwordsMatch}
      >
        {isLoading ? (
          <span className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </span>
        ) : (
          'Create Account'
        )}
      </Button>

      <SocialRegisterButtons
        userType={userType}
        onGoogleRegister={onGoogleRegister}
        onGithubRegister={onGithubRegister}
        isLoading={isLoading}
      />
    </form>
  );
};

export default RegisterForm;
