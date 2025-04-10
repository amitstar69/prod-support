
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, BadgeCheck, ArrowRight, Shield, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { invalidateUserDataCache } from '../contexts/auth';

interface VerificationProfileSectionProps {
  isVerified: boolean;
  userId: string;
}

const VerificationProfileSection: React.FC<VerificationProfileSectionProps> = ({ 
  isVerified, 
  userId 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<boolean>(isVerified);
  const navigate = useNavigate();

  // Check verification status on mount and when redirected back from payment
  useEffect(() => {
    const checkVerificationStatus = async () => {
      const url = new URL(window.location.href);
      const verificationInProgress = url.searchParams.get('verification') === 'in-progress';
      
      if (verificationInProgress) {
        toast.info('Verification in progress. Please wait...', { duration: 5000 });
        await refreshVerificationStatus();
      }
      
      // This ensures we're showing the latest verification status
      setVerificationStatus(isVerified);
    };
    
    checkVerificationStatus();
  }, [isVerified]);

  // Double check verification status directly from the database
  const refreshVerificationStatus = async () => {
    setIsCheckingStatus(true);
    try {
      if (!userId) return;
      
      console.log('Checking verification status for user:', userId);
      
      const { data, error } = await supabase
        .from('developer_profiles')
        .select('premium_verified')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error checking verification status:', error);
        return;
      }
      
      if (data) {
        console.log('Verification status from database:', data.premium_verified);
        if (data.premium_verified && !isVerified) {
          // If database shows verified but our component doesn't, invalidate cache and notify
          invalidateUserDataCache(userId);
          toast.success('Your verification status has been updated!');
          // Force update local state until the cache is refreshed
          setVerificationStatus(true);
        }
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleStartVerification = async () => {
    setIsLoading(true);
    
    try {
      console.log('Starting developer verification process for user:', userId);
      
      const { data, error } = await supabase.functions.invoke('create-developer-payment', {
        body: { userId }
      });
      
      if (error) {
        console.error('Payment initialization error from Edge Function:', error);
        throw new Error(`Payment initialization failed: ${error.message || 'Unknown error'}`);
      }
      
      if (!data) {
        throw new Error('No response received from payment service');
      }
      
      console.log('Verification payment response:', data);
      
      if (data?.url) {
        console.log('Redirecting to Stripe checkout:', data.url);
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      toast.error(`Failed to start verification process: ${err instanceof Error ? err.message : 'Please try again'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Use the local state for rendering, which will reflect the most up-to-date status
  if (verificationStatus) {
    return (
      <Card className="border-2 border-green-200 bg-green-50/50 dark:bg-green-900/10">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Verified Developer</CardTitle>
          </div>
          <CardDescription>
            Your account is verified and you have access to premium features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm space-y-2">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Priority placement in search results</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Verified badge on your profile</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span>Lower platform fees on earnings</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BadgeCheck className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Verify Your Account</CardTitle>
        </div>
        <CardDescription>
          Get better visibility and access to premium features
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm space-y-2 mb-4">
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-1" />
            <span>Priority placement in developer search results</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-1" />
            <span>Verified badge on your profile</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-1" />
            <span>Lower platform fees on earnings</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="h-4 w-4 text-primary mt-1" />
            <span>Access to premium clients and projects</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md text-xs text-amber-800 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-300">
          <Info className="h-4 w-4 flex-shrink-0" />
          <p>One-time verification fee: $29.99</p>
        </div>
      </CardContent>
      <CardFooter>
        {isCheckingStatus ? (
          <Button className="w-full" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Checking verification status...
          </Button>
        ) : (
          <Button 
            className="w-full" 
            onClick={handleStartVerification}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                Start Verification
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default VerificationProfileSection;
