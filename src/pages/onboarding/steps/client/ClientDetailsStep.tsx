
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth } from '../../../../contexts/auth';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { toast } from 'sonner';

const ClientDetailsStep = () => {
  const { state, setStepData, saveProgress } = useOnboarding();
  const { authState } = useAuth();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [location, setLocation] = useState('');

  // Load saved data if available
  useEffect(() => {
    const stepNumber = 1;
    if (state.stepData[stepNumber]) {
      const data = state.stepData[stepNumber];
      if (data.name) setName(data.name);
      if (data.company) setCompany(data.company);
      if (data.position) setPosition(data.position);
      if (data.location) setLocation(data.location);
    }
  }, [state.stepData]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    updateData({ name: e.target.value });
  };

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany(e.target.value);
    updateData({ company: e.target.value });
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPosition(e.target.value);
    updateData({ position: e.target.value });
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocation(e.target.value);
    updateData({ location: e.target.value });
  };

  const updateData = (newData: any) => {
    const currentData = state.stepData[1] || {};
    const updatedData = { ...currentData, ...newData };
    
    // Save to onboarding context
    setStepData(1, updatedData);
    
    // We don't need to save to the database on every keystroke
    // We'll rely on the auto-save when moving to the next step
  };

  const handleBlur = () => {
    // Save to database when user stops typing (blur event)
    const data = {
      name,
      company,
      position,
      location
    };
    
    saveProgress(data).catch(error => {
      console.error('Error saving client details:', error);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Personal Information</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us a bit about yourself
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            value={name}
            onChange={handleNameChange}
            onBlur={handleBlur}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            id="company"
            placeholder="Your company name"
            value={company}
            onChange={handleCompanyChange}
            onBlur={handleBlur}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="position">Job Title (Optional)</Label>
          <Input
            id="position"
            placeholder="Your position"
            value={position}
            onChange={handlePositionChange}
            onBlur={handleBlur}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="location">Location (Optional)</Label>
          <Input
            id="location"
            placeholder="City, Country"
            value={location}
            onChange={handleLocationChange}
            onBlur={handleBlur}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsStep;
