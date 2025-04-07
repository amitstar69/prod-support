
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import Layout from '../components/Layout';
import { ArrowLeft, Mail, RefreshCw } from 'lucide-react';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        toast.error(error.message);
      } else {
        setResetSent(true);
        toast.success('Password reset link has been sent to your email');
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="bg-secondary/50 py-10">
        <div className="container mx-auto px-4">
          <h1 className="heading-2 mb-2 text-center">Reset Your Password</h1>
          <p className="text-center text-muted-foreground">
            {resetSent 
              ? 'Check your email for password reset instructions' 
              : 'Enter your email to receive a password reset link'}
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              {!resetSent ? (
                <form onSubmit={handleResetPassword}>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Sending Reset Link...
                        </>
                      ) : (
                        'Send Reset Link'
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 text-center">
                  <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Check Your Email</h3>
                  <p className="text-gray-600 mb-6">
                    We've sent password reset instructions to <span className="font-semibold">{email}</span>
                  </p>
                  <Button
                    variant="outline"
                    className="mx-auto"
                    onClick={() => setResetSent(false)}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Send Again
                  </Button>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t border-border/30 text-center">
                <p className="text-sm text-muted-foreground">
                  <Link to="/login" className="flex items-center justify-center gap-1 text-primary font-medium">
                    <ArrowLeft className="h-4 w-4" /> Back to Login
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage;
