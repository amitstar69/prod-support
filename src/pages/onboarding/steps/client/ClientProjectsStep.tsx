
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth, getCurrentUserData, updateUserData } from '../../../../contexts/auth';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Label } from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import { toast } from 'sonner';

// Project Types
const PROJECT_TYPES = [
  'Frontend Development',
  'Backend Development',
  'Full Stack Development',
  'Mobile App Development',
  'Web Development',
  'Database Design',
  'API Integration',
  'DevOps',
  'UI/UX Design',
  'Bug Fixing',
  'Performance Optimization',
  'Security Audit',
  'Code Review',
  'Testing',
  'Maintenance'
];

const ClientProjectsStep: React.FC = () => {
  const { goToNextStep } = useOnboarding();
  const { userId } = useAuth();
  
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUserData();
        if (userData && 'projectTypes' in userData && userData.projectTypes && Array.isArray(userData.projectTypes)) {
          setProjectTypes(userData.projectTypes);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId]);
  
  useEffect(() => {
    // Check if form is valid - require at least one project type
    setFormValid(projectTypes.length > 0);
  }, [projectTypes]);
  
  const toggleProjectType = (type: string) => {
    if (projectTypes.includes(type)) {
      setProjectTypes(projectTypes.filter(t => t !== type));
    } else {
      setProjectTypes([...projectTypes, type]);
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedUserData = {
        projectTypes,
        profileCompletionPercentage: 100 // Final step
      };
      
      const success = await updateUserData(updatedUserData);
      
      if (success) {
        toast.success('Project types saved successfully');
        goToNextStep();
      } else {
        toast.error('Failed to save project types');
      }
    } catch (error) {
      console.error('Error saving project types:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <OnboardingLayout
      title="Project Types"
      subtitle="What kind of projects are you looking to get help with?"
      nextDisabled={!formValid || isLoading}
      onNextStep={handleSubmit}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Select Project Types (Select all that apply)</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {PROJECT_TYPES.map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={type} 
                  checked={projectTypes.includes(type)}
                  onCheckedChange={() => toggleProjectType(type)}
                />
                <label
                  htmlFor={type}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ClientProjectsStep;
