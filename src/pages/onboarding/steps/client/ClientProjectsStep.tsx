
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Client } from '../../../../types/product';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Label } from '../../../../components/ui/label';

const ClientProjectsStep: React.FC = () => {
  const { userData, updateUserDataAndProceed } = useOnboarding();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    projectTypes: [] as string[],
    communicationPreferences: [] as string[],
    preferredHelpFormat: [] as string[],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        projectTypes: 'projectTypes' in userData ? userData.projectTypes || [] : [],
        communicationPreferences: 'communicationPreferences' in userData ? userData.communicationPreferences || [] : [],
        preferredHelpFormat: 'preferredHelpFormat' in userData ? userData.preferredHelpFormat || [] : [],
      });
    }
  }, [userData]);
  
  const projectTypeOptions = [
    'Web Application', 'Mobile App', 'Desktop Application',
    'API/Backend Service', 'Database Design', 'Legacy Code Maintenance',
    'DevOps/CI/CD', 'Cloud Migration', 'Microservices Architecture'
  ];
  
  const communicationOptions = [
    'Email', 'Slack', 'Microsoft Teams', 'Discord', 'WhatsApp'
  ];
  
  const helpFormatOptions = [
    'Chat', 'Voice Call', 'Video Call', 'Screen Sharing', 'Code Editor'
  ];
  
  const toggleProjectType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter(t => t !== type)
        : [...prev.projectTypes, type],
    }));
  };
  
  const toggleCommunication = (comm: string) => {
    setFormData(prev => ({
      ...prev,
      communicationPreferences: prev.communicationPreferences.includes(comm)
        ? prev.communicationPreferences.filter(c => c !== comm)
        : [...prev.communicationPreferences, comm],
    }));
  };
  
  const toggleHelpFormat = (format: string) => {
    setFormData(prev => ({
      ...prev,
      preferredHelpFormat: prev.preferredHelpFormat.includes(format)
        ? prev.preferredHelpFormat.filter(f => f !== format)
        : [...prev.preferredHelpFormat, format],
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const clientData: Partial<Client> = {
        projectTypes: formData.projectTypes,
        communicationPreferences: formData.communicationPreferences,
        preferredHelpFormat: formData.preferredHelpFormat,
        profileCompletionPercentage: 75, // 75% complete after projects
      };
      
      await updateUserDataAndProceed(clientData);
    } catch (error) {
      console.error('Error updating project preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <OnboardingLayout 
      title="Your Projects & Communication"
      subtitle="Tell us about your projects and how you prefer to communicate"
      onNextStep={handleSubmit}
      nextDisabled={isSubmitting}
      onBackStep={() => navigate(-1)}
    >
      <div className="space-y-8">
        <div>
          <Label className="text-base font-medium mb-4 block">Type of projects you work on</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {projectTypeOptions.map(type => (
              <div className="flex items-center space-x-2" key={type}>
                <Checkbox 
                  id={`project-${type}`} 
                  checked={formData.projectTypes.includes(type)}
                  onCheckedChange={() => toggleProjectType(type)}
                />
                <label
                  htmlFor={`project-${type}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {type}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="text-base font-medium mb-4 block">Preferred communication tools</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {communicationOptions.map(comm => (
              <div className="flex items-center space-x-2" key={comm}>
                <Checkbox 
                  id={`comm-${comm}`} 
                  checked={formData.communicationPreferences.includes(comm)}
                  onCheckedChange={() => toggleCommunication(comm)}
                />
                <label
                  htmlFor={`comm-${comm}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {comm}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label className="text-base font-medium mb-4 block">How would you prefer to get help?</Label>
          <div className="grid grid-cols-2 gap-2">
            {helpFormatOptions.map(format => (
              <div className="flex items-center space-x-2" key={format}>
                <Checkbox 
                  id={`format-${format}`} 
                  checked={formData.preferredHelpFormat.includes(format)}
                  onCheckedChange={() => toggleHelpFormat(format)}
                />
                <label
                  htmlFor={`format-${format}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {format}
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
