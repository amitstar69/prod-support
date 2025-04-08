
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Button } from '../ui/button';
import { RegisterFormValues } from '../../hooks/useRegisterForm';

interface RegisterFormProps {
  formValues: RegisterFormValues;
  passwordsMatch: boolean;
  termsAgreed: boolean;
  isLoading: boolean;
  formError: string | null;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTermsChange: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  formValues,
  passwordsMatch,
  termsAgreed,
  isLoading,
  formError,
  handleInputChange,
  handleTermsChange,
  handleSubmit
}) => {
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {formError && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {formError}
          </div>
        )}
        
        <div className="pt-4 border-t border-border/30">
          <h2 className="font-medium text-lg mb-4">Account Information</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name*</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formValues.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name*</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formValues.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address*</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formValues.email}
                onChange={handleInputChange}
                required
                placeholder="example@domain.com"
              />
              <p className="text-xs text-muted-foreground mt-1">Enter a valid email address with domain (e.g., example@domain.com)</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password*</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleInputChange}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground mt-1">Password must be at least 6 characters</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password*</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formValues.confirmPassword}
                onChange={handleInputChange}
                required
                className={!passwordsMatch && formValues.confirmPassword ? 'border-destructive focus:border-destructive' : ''}
              />
              {!passwordsMatch && formValues.confirmPassword && (
                <p className="text-xs text-destructive mt-1">Passwords do not match</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2">
          <Checkbox 
            id="terms" 
            checked={termsAgreed}
            onCheckedChange={(checked) => handleTermsChange(checked as boolean)}
            className="mt-1"
            required
          />
          <Label htmlFor="terms" className="text-sm font-normal leading-tight">
            I agree to the <a href="#" className="text-primary font-medium">Terms of Service</a> and <a href="#" className="text-primary font-medium">Privacy Policy</a>
          </Label>
        </div>
        
        <div>
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isLoading || !passwordsMatch}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              <>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default RegisterForm;
