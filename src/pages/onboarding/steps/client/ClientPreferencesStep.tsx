
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Client } from '../../../../types/product';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Checkbox } from '../../../../components/ui/checkbox';
import { Label } from '../../../../components/ui/label';

const ClientPreferencesStep: React.FC = () => {
  const { userData, updateUserDataAndProceed } = useOnboarding();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    techStack: [] as string[],
    industry: '',
    budget: 0,
    lookingFor: [] as string[],
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Update form data when userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        techStack: 'techStack' in userData ? userData.techStack || [] : [],
        industry: 'industry' in userData ? userData.industry || '' : '',
        budget: 'budgetPerHour' in userData ? userData.budgetPerHour || 0 : 0,
        lookingFor: 'lookingFor' in userData ? userData.lookingFor || [] : [],
      });
    }
  }, [userData]);
  
  const technologiesOptions = [
    'React', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 
    'Flask', 'Laravel', 'Python', 'JavaScript', 'TypeScript', 
    'PHP', 'Ruby', 'Java', 'C#', '.NET', 'AWS', 'Azure', 'GCP'
  ];
  
  const helpCategoriesOptions = [
    'Bug fixing', 'Feature implementation', 'Code review', 
    'Architecture design', 'Performance optimization', 'Security review',
    'Database design', 'API development', 'Frontend development'
  ];
  
  const toggleTechStack = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech],
    }));
  };
  
  const toggleLookingFor = (category: string) => {
    setFormData(prev => ({
      ...prev,
      lookingFor: prev.lookingFor.includes(category)
        ? prev.lookingFor.filter(c => c !== category)
        : [...prev.lookingFor, category],
    }));
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'budget' ? parseInt(value) || 0 : value 
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const clientData: Partial<Client> = {
        techStack: formData.techStack,
        industry: formData.industry,
        budgetPerHour: formData.budget,
        lookingFor: formData.lookingFor,
        profileCompletionPercentage: 50, // 50% complete after preferences
      };
      
      await updateUserDataAndProceed(clientData);
    } catch (error) {
      console.error('Error updating preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <OnboardingLayout 
      title="Your Technical Environment"
      subtitle="Tell us about your tech stack and what kind of help you need"
      onNextStep={handleSubmit}
      nextDisabled={isSubmitting}
      onBackStep={() => navigate(-1)}
    >
      <div className="space-y-8">
        <div>
          <Label className="text-base font-medium mb-4 block">Technologies you work with</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {technologiesOptions.map(tech => (
              <div className="flex items-center space-x-2" key={tech}>
                <Checkbox 
                  id={`tech-${tech}`} 
                  checked={formData.techStack.includes(tech)}
                  onCheckedChange={() => toggleTechStack(tech)}
                />
                <label
                  htmlFor={`tech-${tech}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {tech}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <Label htmlFor="industry" className="text-base font-medium mb-2 block">
            Your Industry
          </Label>
          <select
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select your industry</option>
            <option value="software">Software & IT</option>
            <option value="finance">Finance & Banking</option>
            <option value="healthcare">Healthcare</option>
            <option value="ecommerce">E-commerce</option>
            <option value="education">Education</option>
            <option value="media">Media & Entertainment</option>
            <option value="manufacturing">Manufacturing</option>
            <option value="government">Government</option>
            <option value="nonprofit">Non-profit</option>
            <option value="other">Other</option>
          </select>
        </div>
        
        <div>
          <Label htmlFor="budget" className="text-base font-medium mb-2 block">
            Hourly Budget (USD)
          </Label>
          <input
            id="budget"
            name="budget"
            type="number"
            min="0"
            value={formData.budget}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Your hourly budget for developers"
          />
        </div>
        
        <div>
          <Label className="text-base font-medium mb-4 block">What kind of help are you looking for?</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {helpCategoriesOptions.map(category => (
              <div className="flex items-center space-x-2" key={category}>
                <Checkbox 
                  id={`help-${category}`}
                  checked={formData.lookingFor.includes(category)}
                  onCheckedChange={() => toggleLookingFor(category)}
                />
                <label
                  htmlFor={`help-${category}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ClientPreferencesStep;
