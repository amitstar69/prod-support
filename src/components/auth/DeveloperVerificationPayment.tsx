
import React, { useState } from 'react';
import { ArrowRight, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface DeveloperVerificationPaymentProps {
  onSkip: () => void;
  onSuccess: () => void;
}

const DeveloperVerificationPayment: React.FC<DeveloperVerificationPaymentProps> = ({ onSkip, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
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
      toast.error('Failed to start payment process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Developer Verification</h2>
        <p className="text-muted-foreground">One-time verification fee to ensure quality service</p>
      </div>

      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Developer Verification Fee</h3>
            <span className="text-lg font-semibold">$29.99</span>
          </div>
          
          <ul className="space-y-2 mb-6">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Priority placement in developer search results</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Verified badge on your profile</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Lower platform fees on earnings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span>Access to premium clients and projects</span>
            </li>
          </ul>
          
          <div className="pt-4 border-t border-border/40 space-y-3">
            <Button 
              className="w-full" 
              onClick={handlePayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </span>
              ) : (
                <>
                  Continue to Payment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={onSkip}
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <p>
          The verification fee helps us maintain a high-quality developer pool. 
          You can skip this step now and verify your account later from your profile settings.
        </p>
      </div>
    </div>
  );
};

export default DeveloperVerificationPayment;
