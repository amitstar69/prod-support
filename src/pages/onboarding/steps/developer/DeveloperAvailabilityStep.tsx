
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth, getCurrentUserData, updateUserData } from '../../../../contexts/auth';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Label } from '../../../../components/ui/label';
import { Switch } from '../../../../components/ui/switch';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { toast } from 'sonner';

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const DeveloperAvailabilityStep: React.FC = () => {
  const { goToNextStep } = useOnboarding();
  const { userId } = useAuth();
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [workingDays, setWorkingDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
  ]);
  const [workingHours, setWorkingHours] = useState('Standard (9 AM - 5 PM)');
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          // Handle availability which could be a boolean or an object
          if (typeof userData.availability === 'boolean') {
            setIsAvailable(userData.availability);
          } else if (userData.availability) {
            setIsAvailable(true);
            if (userData.availability.days) {
              setWorkingDays(userData.availability.days);
            }
            if (userData.availability.hours) {
              setWorkingHours(userData.availability.hours);
            }
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
  
  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter(d => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedUserData = {
        availability: isAvailable ? {
          days: workingDays,
          hours: workingHours
        } : false,
        profileCompletionPercentage: 80 // 4/5 steps completed
      };
      
      const success = await updateUserData(updatedUserData);
      
      if (success) {
        toast.success('Availability saved successfully');
        goToNextStep();
      } else {
        toast.error('Failed to save availability');
      }
    } catch (error) {
      console.error('Error saving availability:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <OnboardingLayout
      title="Your Availability"
      subtitle="Let clients know when you're available to help"
      nextDisabled={isLoading}
      onNextStep={handleSubmit}
    >
      <div className="space-y-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="available" className="text-base">Available for work</Label>
            <p className="text-sm text-muted-foreground">
              Turn this off if you're not currently accepting new clients
            </p>
          </div>
          <Switch
            id="available"
            checked={isAvailable}
            onCheckedChange={setIsAvailable}
          />
        </div>
        
        {isAvailable && (
          <>
            <div className="space-y-4">
              <Label>Working Days</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox 
                      id={day} 
                      checked={workingDays.includes(day)}
                      onCheckedChange={() => toggleDay(day)}
                    />
                    <label
                      htmlFor={day}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {day}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Working Hours</Label>
              <Select 
                value={workingHours} 
                onValueChange={setWorkingHours}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your working hours" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Standard (9 AM - 5 PM)">Standard (9 AM - 5 PM)</SelectItem>
                  <SelectItem value="Early (6 AM - 2 PM)">Early (6 AM - 2 PM)</SelectItem>
                  <SelectItem value="Late (2 PM - 10 PM)">Late (2 PM - 10 PM)</SelectItem>
                  <SelectItem value="Night (9 PM - 5 AM)">Night (9 PM - 5 AM)</SelectItem>
                  <SelectItem value="Flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
        
        {!isAvailable && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm">
              You're currently set as unavailable. Clients won't be able to request your help
              until you change your availability status.
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperAvailabilityStep;
