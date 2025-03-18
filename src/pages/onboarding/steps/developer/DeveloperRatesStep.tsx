
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth, getCurrentUserData, updateUserData } from '../../../../contexts/auth';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Slider } from '../../../../components/ui/slider';
import { toast } from 'sonner';

const DeveloperRatesStep: React.FC = () => {
  const { goToNextStep } = useOnboarding();
  const { userId } = useAuth();
  
  const [hourlyRate, setHourlyRate] = useState<number>(50);
  const [minuteRate, setMinuteRate] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          if (userData.hourlyRate) {
            setHourlyRate(userData.hourlyRate);
          }
          if (userData.minuteRate) {
            setMinuteRate(userData.minuteRate);
          } else {
            // Default to hourly rate / 60, rounded to nearest dollar
            setMinuteRate(Math.round(hourlyRate / 60));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);
  
  // Update minute rate when hourly rate changes
  useEffect(() => {
    setMinuteRate(Math.round(hourlyRate / 60));
  }, [hourlyRate]);
  
  const handleHourlyRateChange = (value: number[]) => {
    setHourlyRate(value[0]);
  };
  
  const handleMinuteRateChange = (value: number[]) => {
    setMinuteRate(value[0]);
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedUserData = {
        hourlyRate,
        minuteRate,
        profileCompletionPercentage: 60 // 3/5 steps completed
      };
      
      const success = await updateUserData(updatedUserData);
      
      if (success) {
        toast.success('Rates saved successfully');
        goToNextStep();
      } else {
        toast.error('Failed to save rates');
      }
    } catch (error) {
      console.error('Error saving rates:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <OnboardingLayout
      title="Set Your Rates"
      subtitle="How much do you charge for your expertise?"
      onNextStep={handleSubmit}
      nextDisabled={isLoading}
    >
      <div className="space-y-8 py-4">
        <div className="space-y-4">
          <Label htmlFor="hourlyRate">Hourly Rate (USD)</Label>
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <Slider
                id="hourlyRate"
                min={15}
                max={250}
                step={5}
                value={[hourlyRate]}
                onValueChange={handleHourlyRateChange}
              />
            </div>
            <div className="w-16">
              <Input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                min={15}
                max={250}
                className="text-right"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            The average rate for your experience level is $45-75/hour
          </p>
        </div>
        
        <div className="space-y-4">
          <Label htmlFor="minuteRate">Per-Minute Rate (USD)</Label>
          <div className="flex items-center gap-4">
            <div className="flex-grow">
              <Slider
                id="minuteRate"
                min={0.25}
                max={5}
                step={0.25}
                value={[minuteRate]}
                onValueChange={handleMinuteRateChange}
              />
            </div>
            <div className="w-16">
              <Input
                type="number"
                value={minuteRate}
                onChange={(e) => setMinuteRate(Number(e.target.value))}
                min={0.25}
                max={5}
                step={0.25}
                className="text-right"
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This is what clients pay for quick help sessions
          </p>
        </div>
        
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Pricing Tips</h3>
          <ul className="text-sm space-y-1 list-disc pl-4">
            <li>Set competitive rates based on your experience level</li>
            <li>Higher rates can signal expertise but may limit inquiries</li>
            <li>Lower rates might attract more clients but could undervalue your skills</li>
            <li>You can adjust your rates at any time from your profile settings</li>
          </ul>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperRatesStep;
