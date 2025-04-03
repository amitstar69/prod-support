
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Card, CardContent } from '../../../../components/ui/card';
import { useAuth } from '../../../../contexts/auth';

const DeveloperExperienceStep = () => {
  const { state, setStepData, saveProgress } = useOnboarding();
  const { authState } = useAuth();
  const [experienceYears, setExperienceYears] = useState<string>('');
  const [customYears, setCustomYears] = useState<string>('');
  const [hourlyRate, setHourlyRate] = useState<string>('');

  // Load saved data if available
  useEffect(() => {
    const stepNumber = 3;
    if (state.stepData[stepNumber]) {
      const data = state.stepData[stepNumber];
      if (data.experienceYears) {
        const years = String(data.experienceYears);
        setExperienceYears(years);
        if (!['1', '2', '3-5', '5-10', '10+'].includes(years)) {
          setCustomYears(years);
          setExperienceYears('custom');
        }
      }
      if (data.hourlyRate) {
        setHourlyRate(String(data.hourlyRate));
      }
    }
  }, [state.stepData]);

  const handleExperienceChange = (value: string) => {
    setExperienceYears(value);
    
    // If not custom, save directly
    if (value !== 'custom') {
      updateAndSave(value, hourlyRate);
    }
  };

  const handleCustomYearsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomYears(value);
    
    // Automatically save custom years
    if (experienceYears === 'custom' && value) {
      updateAndSave(value, hourlyRate);
    }
  };

  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHourlyRate(value);
    
    // Save years experience based on whether it's custom or predefined
    const yearsToSave = experienceYears === 'custom' ? customYears : experienceYears;
    updateAndSave(yearsToSave, value);
  };

  const updateAndSave = (years: string, rate: string) => {
    if (!years || !rate) return;
    
    const data = {
      experienceYears: years,
      hourlyRate: Number(rate)
    };
    
    // Save to onboarding context
    setStepData(3, data);
    
    // Save to database
    saveProgress(data).catch(error => {
      console.error('Error saving experience data:', error);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Professional Experience</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about your experience and rates to help match you with the right clients
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-base">Years of Experience</Label>
          <RadioGroup 
            value={experienceYears} 
            onValueChange={handleExperienceChange}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="exp-1" />
              <Label htmlFor="exp-1">Less than 1 year</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="2" id="exp-2" />
              <Label htmlFor="exp-2">1-2 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3-5" id="exp-3-5" />
              <Label htmlFor="exp-3-5">3-5 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="5-10" id="exp-5-10" />
              <Label htmlFor="exp-5-10">5-10 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10+" id="exp-10-plus" />
              <Label htmlFor="exp-10-plus">10+ years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom" id="exp-custom" />
              <Label htmlFor="exp-custom">Custom</Label>
              {experienceYears === 'custom' && (
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={customYears}
                  onChange={handleCustomYearsChange}
                  className="ml-2 w-20"
                  placeholder="Years"
                />
              )}
            </div>
          </RadioGroup>
        </div>

        <div className="pt-4">
          <Label htmlFor="hourly-rate" className="text-base">Hourly Rate (USD)</Label>
          <div className="flex items-center mt-2">
            <span className="mr-2">$</span>
            <Input
              id="hourly-rate"
              type="number"
              min="1"
              step="1"
              value={hourlyRate}
              onChange={handleRateChange}
              placeholder="e.g., 75"
              className="max-w-[120px]"
            />
            <span className="ml-2">/ hour</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Set a competitive rate based on your experience and skills
          </p>
        </div>
      </div>

      {hourlyRate && experienceYears && (
        <Card className="mt-6">
          <CardContent className="p-4">
            <p className="text-sm font-medium">Summary</p>
            <ul className="text-sm mt-2 space-y-1">
              <li>Experience: {experienceYears === 'custom' ? `${customYears} years` : 
                experienceYears === '1' ? 'Less than 1 year' : 
                experienceYears === '2' ? '1-2 years' : 
                experienceYears === '3-5' ? '3-5 years' : 
                experienceYears === '5-10' ? '5-10 years' : 
                experienceYears === '10+' ? '10+ years' : 
                `${experienceYears} years`}
              </li>
              <li>Hourly Rate: ${hourlyRate}/hour</li>
              <li>Per-minute Rate: ${(Number(hourlyRate) / 60).toFixed(2)}/minute</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeveloperExperienceStep;
