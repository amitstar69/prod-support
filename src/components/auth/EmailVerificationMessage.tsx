import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Mail, RefreshCw, ArrowLeft } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '../ui/alert';

interface EmailVerificationMessageProps {
  email: string;
  onResend?: () => void;
  onBack?: () => void;
}

const EmailVerificationMessage: React.FC<EmailVerificationMessageProps> = ({ 
  email,
  onResend,
  onBack
}) => {
  const [isResending, setIsResending] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [resendLimited, setResendLimited] = useState(false);
  
  const handleResendEmail = async () => {
    if (resendLimited) {
      toast.error('Too many resend attempts. Please wait a few minutes and try again.');
      return;
    }
    
    setIsResending(true);
    
    try {
      // If a custom resend handler is provided, use it
      if (onResend) {
        onResend();
        setResendCount(prev => prev + 1);
        
        // Check if we should limit resends
        if (resendCount >= 2) {
          setResendLimited(true);
          setTimeout(() => setResendLimited(false), 5 * 60 * 1000); // Reset after 5 minutes
        }
        
        return;
      }
      
      // Otherwise use the default implementation
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        toast.error(`Failed to resend: ${error.message}`);
      } else {
        toast.success('Verification email has been resent');
        setResendCount(prev => prev + 1);
        
        // Check if we should limit resends
        if (resendCount >= 2) {
          setResendLimited(true);
          setTimeout(() => setResendLimited(false), 5 * 60 * 1000); // Reset after 5 minutes
        }
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg dark:bg-blue-950/20 dark:border-blue-900">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Please verify your email address</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          We've sent a verification email to <span className="font-medium">{email}</span>.
          <br />Please check your inbox and click on the verification link to continue.
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          If you don't see the email, check your spam folder or request a new verification link.
        </div>
        
        {resendLimited && (
          <Alert variant="warning" className="mb-4">
            <AlertDescription>
              Too many resend attempts. Please wait a few minutes before trying again.
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
          <Button
            onClick={onBack || (() => {})}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Button>
          
          <Button
            onClick={handleResendEmail}
            disabled={isResending || resendLimited}
            className="flex items-center gap-2"
          >
            {isResending ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Resend Email
              </>
            )}
          </Button>
        </div>
        
        {resendCount > 0 && (
          <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            {resendCount === 1 ? 'Email resent once.' : `Email resent ${resendCount} times.`}
          </p>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationMessage;
