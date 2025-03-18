
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { useAuth, getCurrentUserData, updateUserData } from '../../../../contexts/auth';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { toast } from 'sonner';
import { X } from 'lucide-react';

// Common tech stacks
const COMMON_TECH_STACKS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
  'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C#', '.NET',
  'PHP', 'Laravel', 'Ruby', 'Ruby on Rails', 'Go', 'Rust',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes'
];

// Industries
const INDUSTRIES = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'E-commerce',
  'Entertainment', 'Media', 'Manufacturing', 'Real Estate', 'Transportation',
  'Energy', 'Hospitality', 'Retail', 'Agriculture', 'Consulting'
];

const ClientPreferencesStep: React.FC = () => {
  const { goToNextStep } = useOnboarding();
  const { userId } = useAuth();
  
  const [techStack, setTechStack] = useState<string[]>([]);
  const [industry, setIndustry] = useState<string>('');
  const [newTech, setNewTech] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          if (userData.techStack && Array.isArray(userData.techStack)) {
            setTechStack(userData.techStack);
          }
          if (userData.industry) {
            setIndustry(userData.industry);
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
  
  useEffect(() => {
    // Check if form is valid - require at least one selected tech and an industry
    setFormValid(techStack.length > 0 && industry !== '');
  }, [techStack, industry]);
  
  const addTech = (tech: string) => {
    if (!techStack.includes(tech)) {
      setTechStack([...techStack, tech]);
    }
  };
  
  const removeTech = (tech: string) => {
    setTechStack(techStack.filter(t => t !== tech));
  };
  
  const handleAddNewTech = () => {
    if (newTech.trim() && !techStack.includes(newTech.trim())) {
      setTechStack([...techStack, newTech.trim()]);
      setNewTech('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewTech();
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedUserData = {
        techStack,
        industry,
        profileCompletionPercentage: 66 // 2/3 steps completed
      };
      
      const success = await updateUserData(updatedUserData);
      
      if (success) {
        toast.success('Preferences saved successfully');
        goToNextStep();
      } else {
        toast.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <OnboardingLayout
      title="Technical Preferences"
      subtitle="Tell us about your tech stack and industry"
      onNextStep={handleSubmit}
      nextDisabled={!formValid || isLoading}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Industry</Label>
          <div className="grid grid-cols-3 gap-2">
            {INDUSTRIES.map((ind) => (
              <Button
                key={ind}
                type="button"
                variant={industry === ind ? "default" : "outline"}
                className="justify-start"
                onClick={() => setIndustry(ind)}
              >
                {ind}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Tech Stack</Label>
          <div className="p-3 border border-border rounded-md min-h-20">
            {techStack.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {techStack.map((tech) => (
                  <Badge 
                    key={tech} 
                    variant="secondary"
                    className="flex items-center gap-1 py-1 px-2"
                  >
                    {tech}
                    <button 
                      onClick={() => removeTech(tech)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-2">
                Add some technologies below to get started
              </p>
            )}
          </div>
          
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add a custom technology..."
              value={newTech}
              onChange={(e) => setNewTech(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              type="button" 
              onClick={handleAddNewTech}
              disabled={!newTech.trim()}
            >
              Add
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="mb-2 block">Common Technologies</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_TECH_STACKS.filter(tech => !techStack.includes(tech)).map((tech) => (
              <Button
                key={tech}
                variant="outline"
                size="sm"
                onClick={() => addTech(tech)}
                className="mb-2"
              >
                {tech}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ClientPreferencesStep;
