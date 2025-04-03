
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth } from '../../../../contexts/auth';
import { Switch } from '../../../../components/ui/switch';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent } from '../../../../components/ui/card';
import { Button } from '../../../../components/ui/button';
import { Separator } from '../../../../components/ui/separator';
import { Clock, Calendar } from 'lucide-react';

const DeveloperAvailabilityStep = () => {
  const { state, setStepData, saveProgress } = useOnboarding();
  const { authState } = useAuth();
  const [isAvailable, setIsAvailable] = useState(true);
  const [daysAvailable, setDaysAvailable] = useState<string[]>([]);
  const [prefTimeZone, setPrefTimeZone] = useState('UTC');

  const days = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  // Load saved data if available
  useEffect(() => {
    const stepNumber = 4;
    if (state.stepData[stepNumber]) {
      const data = state.stepData[stepNumber];
      if (typeof data.availability === 'boolean') {
        setIsAvailable(data.availability);
      } else if (data.availability && typeof data.availability === 'object') {
        setIsAvailable(true);
        if (data.availability.days && Array.isArray(data.availability.days)) {
          setDaysAvailable(data.availability.days);
        }
      }
      if (data.timeZone) {
        setPrefTimeZone(data.timeZone);
      }
    }
  }, [state.stepData]);

  const handleAvailabilityChange = (available: boolean) => {
    setIsAvailable(available);
    updateAndSave(available, daysAvailable, prefTimeZone);
  };

  const toggleDay = (day: string) => {
    const updatedDays = daysAvailable.includes(day)
      ? daysAvailable.filter(d => d !== day)
      : [...daysAvailable, day];
    
    setDaysAvailable(updatedDays);
    updateAndSave(isAvailable, updatedDays, prefTimeZone);
  };

  const handleSelectAllDays = () => {
    const allDays = days.map(day => day.value);
    setDaysAvailable(allDays);
    updateAndSave(isAvailable, allDays, prefTimeZone);
  };

  const handleClearAllDays = () => {
    setDaysAvailable([]);
    updateAndSave(isAvailable, [], prefTimeZone);
  };

  const updateAndSave = (available: boolean, selectedDays: string[], timezone: string) => {
    const data = {
      availability: available ? (selectedDays.length > 0 ? { days: selectedDays } : true) : false,
      timeZone: timezone
    };
    
    // Save to onboarding context
    setStepData(4, data);
    
    // Save to database
    saveProgress(data).catch(error => {
      console.error('Error saving availability data:', error);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Availability Settings</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Let clients know when you're available to help them with their projects
        </p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Available for Work</h4>
              <p className="text-sm text-muted-foreground">Show your profile to clients looking for help</p>
            </div>
            <Switch 
              checked={isAvailable} 
              onCheckedChange={handleAvailabilityChange} 
              aria-label="Toggle availability"
            />
          </div>
        </CardContent>
      </Card>

      {isAvailable && (
        <div className="space-y-6">
          <div>
            <h4 className="font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Days Available
            </h4>
            <div className="flex flex-wrap gap-2 mt-3">
              <div className="w-full flex justify-between mb-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  type="button" 
                  onClick={handleSelectAllDays}
                >
                  Select All
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  type="button" 
                  onClick={handleClearAllDays}
                >
                  Clear All
                </Button>
              </div>
              {days.map((day) => (
                <Button
                  key={day.value}
                  variant={daysAvailable.includes(day.value) ? "default" : "outline"}
                  className="flex-1 min-w-[100px]"
                  onClick={() => toggleDay(day.value)}
                  type="button"
                >
                  {day.label}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Time Zone
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              This helps clients know when to expect your availability
            </p>
            <div className="text-sm">
              Your timezone appears to be: <span className="font-medium">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeveloperAvailabilityStep;
