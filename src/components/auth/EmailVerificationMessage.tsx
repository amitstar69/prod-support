
import React from 'react';
import { Button } from '../ui/button';
import { Envelope, RefreshCw } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface EmailVerificationMessageProps {
  email: string;
}

const EmailVerificationMessage: React.FC<EmailVerificationMessageProps> = ({ email }) => {
  const [isResending, setIsResending] = React.useState(false);
  
  const handleResendEmail = async () => {
    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) {
        toast.error(`Failed to resend: ${error.message}`);
      } else {
        toast.success('Verification email has been resent');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsResending(false);
    }
  };
  
  return (
    <div className="p-6 bg-blue-50 border border-blue-100 rounded-lg">
      <div className="flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Envelope className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Verify your email address</h2>
        <p className="text-gray-600 mb-4">
          We've sent a verification email to <span className="font-medium">{email}</span>.
          <br />Please check your inbox and click on the verification link.
        </p>
        <div className="text-sm text-gray-500 mb-6">
          If you don't see the email, check your spam folder or request a new verification link.
        </div>
        <Button
          onClick={handleResendEmail}
          disabled={isResending}
          variant="outline"
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
              Resend Verification Email
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default EmailVerificationMessage;
