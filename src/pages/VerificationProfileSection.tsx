
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, BadgeCheck, ArrowRight, Shield, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';

interface VerificationProfileSectionProps {
  isVerified: boolean;
  userId: string;
}

const VerificationProfileSection: React.FC<VerificationProfileSectionProps> = ({ 
  isVerified, 
  userId 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleStartVerification = async () => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-developer-payment', {
        body: {}
      });
      
      if (error) {
        throw error;
      }
      
      if (data?.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      console.error('Payment initialization error:', err);
      toast.error('Failed to start verification process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerified) {
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
      </CardFooter>
    </Card>
  );
};

export default VerificationProfileSection;
