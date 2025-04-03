
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Label } from '../../../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Input } from '../../../../components/ui/input';
import { toast } from 'sonner';

const BudgetStep: React.FC<{
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setStepData: (step: number, data: any) => void;
}> = ({
  goToNextStep,
  goToPreviousStep,
  setStepData
}) => {
  const [budgetPreference, setBudgetPreference] = useState<'hourly' | 'fixed'>('hourly');
  const [hourlyBudget, setHourlyBudget] = useState<string>('');
  const [totalBudget, setTotalBudget] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Load existing data if available
  const { state, saveProgress } = useOnboarding();
  
  useEffect(() => {
    if (state.stepData[3]) {
      if (state.stepData[3].budgetPreference) {
        setBudgetPreference(state.stepData[3].budgetPreference);
      }
      if (state.stepData[3].hourlyBudget) {
        setHourlyBudget(state.stepData[3].hourlyBudget);
      }
      if (state.stepData[3].totalBudget) {
        setTotalBudget(state.stepData[3].totalBudget);
      }
    }
  }, [state.stepData]);

  const validateForm = () => {
    if (budgetPreference === 'hourly' && (!hourlyBudget || isNaN(Number(hourlyBudget)))) {
      toast.error("Please enter a valid hourly budget");
      return false;
    }
    
    if (budgetPreference === 'fixed' && (!totalBudget || isNaN(Number(totalBudget)))) {
      toast.error("Please enter a valid total budget");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Save to context
      setStepData(3, {
        budgetPreference,
        hourlyBudget,
        totalBudget
      });
      
      // Save to database
      await saveProgress({
        budget_per_hour: budgetPreference === 'hourly' ? Number(hourlyBudget) : null,
        budget: budgetPreference === 'fixed' ? Number(totalBudget) : null,
        profileCompletionPercentage: 75
      });
      
      goToNextStep();
    } catch (error) {
      console.error('Error saving budget information:', error);
      toast.error("Failed to save your budget preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      title="Budget Preferences"
      subtitle="Set your budget preferences for hiring developers"
      onNextStep={handleSubmit}
      onBackStep={goToPreviousStep}
      nextDisabled={isSubmitting}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-base">How would you prefer to pay developers?</Label>
          
          <RadioGroup 
            value={budgetPreference} 
            onValueChange={(value) => setBudgetPreference(value as 'hourly' | 'fixed')}
            className="space-y-3"
          >
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="hourly" id="hourly" className="mt-1" />
              <div>
                <Label htmlFor="hourly" className="text-base cursor-pointer">Hourly Rate</Label>
                <p className="text-sm text-muted-foreground">
                  Pay developers based on the time they spend helping you
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-2">
              <RadioGroupItem value="fixed" id="fixed" className="mt-1" />
              <div>
                <Label htmlFor="fixed" className="text-base cursor-pointer">Fixed Budget</Label>
                <p className="text-sm text-muted-foreground">
                  Set a total budget for your projects regardless of time spent
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        
        {budgetPreference === 'hourly' ? (
          <div className="space-y-2">
            <Label htmlFor="hourlyBudget">What's your hourly budget?</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="hourlyBudget"
                type="number"
                min="1"
                value={hourlyBudget}
                onChange={(e) => setHourlyBudget(e.target.value)}
                className="pl-8"
                placeholder="75"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              The average hourly rate on our platform is $75/hour
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="totalBudget">What's your total project budget?</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
              <Input
                id="totalBudget"
                type="number"
                min="1"
                value={totalBudget}
                onChange={(e) => setTotalBudget(e.target.value)}
                className="pl-8"
                placeholder="500"
              />
            </div>
          </div>
        )}
        
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium text-sm mb-2">Budget Tips</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• More complex problems typically require higher budgets</li>
            <li>• Setting a competitive budget attracts higher quality developers</li>
            <li>• You can always adjust your budget for specific help requests</li>
          </ul>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default BudgetStep;
