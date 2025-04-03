
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth } from '../../../../contexts/auth';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Label } from '../../../../components/ui/label';
import { Input } from '../../../../components/ui/input';
import { Card, CardContent } from '../../../../components/ui/card';
import { Separator } from '../../../../components/ui/separator';
import { DollarSign, Clock } from 'lucide-react';

const BudgetStep = () => {
  const { state, setStepData, saveProgress } = useOnboarding();
  const { authState } = useAuth();
  const [budgetPerHour, setBudgetPerHour] = useState<string>('');
  const [budgetPreference, setBudgetPreference] = useState<string>('hourly');
  const [customBudget, setCustomBudget] = useState<string>('');

  // Load saved data if available
  useEffect(() => {
    const stepNumber = 3;
    if (state.stepData[stepNumber]) {
      const data = state.stepData[stepNumber];
      if (data.budgetPerHour) {
        setBudgetPerHour(String(data.budgetPerHour));
      }
      if (data.budgetPreference) {
        setBudgetPreference(data.budgetPreference);
      }
      if (data.customBudget) {
        setCustomBudget(String(data.customBudget));
      }
    }
  }, [state.stepData]);

  const handleBudgetPreferenceChange = (value: string) => {
    setBudgetPreference(value);
    updateData({ budgetPreference: value });
  };

  const handleBudgetPerHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBudgetPerHour(value);
    updateData({ budgetPerHour: value ? Number(value) : '' });
  };

  const handleCustomBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomBudget(value);
    updateData({ customBudget: value ? Number(value) : '' });
  };

  const updateData = (newData: any) => {
    const currentData = state.stepData[3] || {};
    const updatedData = { ...currentData, ...newData };
    
    // Save to onboarding context
    setStepData(3, updatedData);
    
    // Save to database
    saveProgress(updatedData).catch(error => {
      console.error('Error saving budget data:', error);
    });
  };

  const getBudgetHelpText = () => {
    if (budgetPreference === 'hourly' && budgetPerHour) {
      const hourlyRate = Number(budgetPerHour);
      return (
        <div className="text-sm text-muted-foreground space-y-1 mt-2">
          <p>Your per-minute rate: ${(hourlyRate / 60).toFixed(2)}/minute</p>
          <p>1 hour session: ${hourlyRate}</p>
          <p>30 minute session: ${(hourlyRate / 2).toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Budget Preferences</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Let us know your budget preferences for working with developers
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="text-base">How would you like to budget for help?</Label>
          <RadioGroup 
            value={budgetPreference} 
            onValueChange={handleBudgetPreferenceChange}
            className="mt-2 space-y-3"
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hourly" id="budget-hourly" />
                  <Label htmlFor="budget-hourly" className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Hourly Rate</span>
                  </Label>
                </div>
                {budgetPreference === 'hourly' && (
                  <div className="mt-3 ml-6">
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="hourly-budget"
                        type="number"
                        min="1"
                        step="1"
                        value={budgetPerHour}
                        onChange={handleBudgetPerHourChange}
                        placeholder="e.g., 75"
                        className="max-w-[120px]"
                      />
                      <span className="ml-2">/ hour</span>
                    </div>
                    {getBudgetHelpText()}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="project" id="budget-project" />
                  <Label htmlFor="budget-project" className="flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    <span>Project-based Budget</span>
                  </Label>
                </div>
                {budgetPreference === 'project' && (
                  <div className="mt-3 ml-6">
                    <div className="flex items-center">
                      <span className="mr-2">$</span>
                      <Input
                        id="project-budget"
                        type="number"
                        min="1"
                        step="1"
                        value={customBudget}
                        onChange={handleCustomBudgetChange}
                        placeholder="Enter your budget"
                        className="max-w-[150px]"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      This is your estimated budget for the entire project
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </RadioGroup>
        </div>

        <Separator />

        <div>
          <h4 className="font-medium">What to expect</h4>
          <ul className="text-sm mt-2 space-y-1 list-disc pl-4">
            <li>Developer rates typically range from $40 to $150 per hour based on experience</li>
            <li>You can adjust your budget before starting any session</li>
            <li>For urgent issues, you might need to offer a higher rate</li>
            <li>Set a budget that matches the complexity of your project</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BudgetStep;
