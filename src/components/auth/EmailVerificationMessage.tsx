
import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { CheckCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

interface EmailVerificationMessageProps {
  email: string;
  onResend: () => Promise<boolean>;
  onBack: () => void;
}

const EmailVerificationMessage: React.FC<EmailVerificationMessageProps> = ({ 
  email, 
  onResend,
  onBack 
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const handleResend = async () => {
    setIsResending(true);
    try {
      const success = await onResend();
      setResendSuccess(success);
      setTimeout(() => setResendSuccess(false), 5000); // Reset after 5 seconds
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <Card className="border border-border/40 shadow-md">
      <CardHeader>
        <CardTitle className="text-center">Email Verification Required</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-primary/10 text-primary flex flex-col items-center justify-center p-6 rounded-md">
          <Mail className="h-12 w-12 mb-2" />
          <p className="text-center">
            A verification email has been sent to <strong>{email}</strong>
          </p>
        </div>
        
        <div className="space-y-2">
          <p>Please check your inbox and click the verification link to activate your account.</p>
          <p className="text-sm text-muted-foreground">
            If you don't see it, check your spam folder or request a new verification email.
          </p>
        </div>
        
        {resendSuccess && (
          <div className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-3 rounded-md flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <p>Verification email sent successfully!</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col space-y-2">
        <Button 
          onClick={handleResend}
          disabled={isResending}
          className="w-full"
          variant="outline"
        >
          {isResending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            'Resend Verification Email'
          )}
        </Button>
        <Button 
          onClick={onBack}
          variant="ghost"
          className="w-full"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Login
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailVerificationMessage;
