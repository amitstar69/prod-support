
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Developer } from '../../../../types/product';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Slider } from '../../../../components/ui/slider';

const DeveloperRatesStep: React.FC = () => {
  const { userData, updateUserDataAndProceed } = useOnboarding();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    hourlyRate: 0,
    minuteRate: 0,
    calculateMinuteRate: true
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      const hourlyRate = 'hourlyRate' in userData ? userData.hourlyRate || 50 : 50;
      setFormData({
        hourlyRate,
        minuteRate: 'minuteRate' in userData ? userData.minuteRate || Math.round(hourlyRate / 60) : Math.round(hourlyRate / 60),
        calculateMinuteRate: true
      });
    }
  }, [userData]);
  
  const handleHourlyRateChange = (value: number[]) => {
    const newHourlyRate = value[0];
    setFormData(prev => ({ 
      ...prev, 
      hourlyRate: newHourlyRate,
      minuteRate: prev.calculateMinuteRate ? Math.round(newHourlyRate / 60) : prev.minuteRate
    }));
  };
  
  const handleMinuteRateChange = (value: number[]) => {
    const newMinuteRate = value[0];
    setFormData(prev => ({ 
      ...prev, 
      minuteRate: newMinuteRate,
      calculateMinuteRate: false
    }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = parseInt(value);
    
    if (name === 'hourlyRate') {
      setFormData(prev => ({ 
        ...prev, 
        hourlyRate: numValue || 0,
        minuteRate: prev.calculateMinuteRate ? Math.round((numValue || 0) / 60) : prev.minuteRate
      }));
    } else if (name === 'minuteRate') {
      setFormData(prev => ({ 
        ...prev, 
        minuteRate: numValue || 0,
        calculateMinuteRate: false
      }));
    }
  };
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const developerData: Partial<Developer> = {
        hourlyRate: formData.hourlyRate,
        minuteRate: formData.minuteRate,
        profileCompletionPercentage: 65, // 65% complete after rates
      };
      
      await updateUserDataAndProceed(developerData);
    } catch (error) {
      console.error('Error updating rates:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <OnboardingLayout 
      title="Your Rates"
      subtitle="Set your hourly and per-minute rates for client work"
      onNextStep={handleSubmit}
      nextDisabled={isSubmitting}
      onBackStep={() => navigate(-1)}
    >
      <div className="space-y-10 py-4">
        <div className="space-y-6">
          <div>
            <label className="text-base font-medium mb-4 block">Hourly Rate (USD)</label>
            <div className="space-y-4">
              <Slider
                value={[formData.hourlyRate]}
                onValueChange={handleHourlyRateChange}
                min={20}
                max={200}
                step={5}
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">$20</div>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  min={0}
                  className="w-24 text-center px-2 py-1 border border-gray-300 rounded-md"
                />
                <div className="text-sm text-muted-foreground">$200+</div>
              </div>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200">
            <label className="text-base font-medium mb-4 block">Per-Minute Rate (USD)</label>
            <div className="space-y-4">
              <Slider
                value={[formData.minuteRate]}
                onValueChange={handleMinuteRateChange}
                min={0}
                max={10}
                step={0.1}
              />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">$0</div>
                <input
                  type="number"
                  name="minuteRate"
                  value={formData.minuteRate}
                  onChange={handleChange}
                  min={0}
                  step={0.1}
                  className="w-24 text-center px-2 py-1 border border-gray-300 rounded-md"
                />
                <div className="text-sm text-muted-foreground">$10+</div>
              </div>
              {formData.calculateMinuteRate && (
                <p className="text-sm text-muted-foreground italic">
                  This is automatically calculated from your hourly rate (hourly ÷ 60).
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="bg-muted p-4 rounded-lg">
          <h3 className="font-medium mb-2">Rate Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Set rates based on your experience level and specialized skills</li>
            <li>• Research market rates for developers in your specialty</li>
            <li>• Consider your location and cost of living</li>
            <li>• You can adjust your rates later as you gain more experience</li>
          </ul>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperRatesStep;
