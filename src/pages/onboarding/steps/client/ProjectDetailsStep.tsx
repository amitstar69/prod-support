
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Label } from '../../../../components/ui/label';
import { Checkbox } from '../../../../components/ui/checkbox';
import { toast } from 'sonner';

const PROJECT_TYPES = [
  { value: 'website', label: 'Website Development' },
  { value: 'mobile-app', label: 'Mobile Application' },
  { value: 'web-app', label: 'Web Application' },
  { value: 'ecommerce', label: 'E-commerce Platform' },
  { value: 'api-integration', label: 'API Integration' },
  { value: 'devops', label: 'DevOps & Infrastructure' },
  { value: 'debugging', label: 'Debugging & Bug Fixing' },
  { value: 'refactoring', label: 'Code Refactoring' },
  { value: 'legacy-maintenance', label: 'Legacy System Maintenance' },
  { value: 'security', label: 'Security Improvements' },
  { value: 'other', label: 'Other Technical Projects' }
];

const TECH_STACK = [
  { value: 'react', label: 'React / React Native' },
  { value: 'angular', label: 'Angular' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'node', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'dotnet', label: '.NET / C#' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'golang', label: 'Go' },
  { value: 'aws', label: 'AWS' },
  { value: 'azure', label: 'Azure' },
  { value: 'gcp', label: 'Google Cloud' },
  { value: 'devops', label: 'DevOps Tools' },
  { value: 'wordpress', label: 'WordPress' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'other', label: 'Other' }
];

const ProjectDetailsStep: React.FC<{ 
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  setStepData: (step: number, data: any) => void;
}> = ({ 
  goToNextStep, 
  goToPreviousStep,
  setStepData 
}) => {
  const [selectedProjectTypes, setSelectedProjectTypes] = useState<string[]>([]);
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing data if available
  const { state, saveProgress } = useOnboarding();
  
  useEffect(() => {
    if (state.stepData[2]) {
      if (state.stepData[2].projectTypes) {
        setSelectedProjectTypes(state.stepData[2].projectTypes);
      }
      if (state.stepData[2].techStack) {
        setSelectedTechStack(state.stepData[2].techStack);
      }
    }
  }, [state.stepData]);

  const toggleProjectType = (value: string) => {
    setSelectedProjectTypes(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const toggleTechStack = (value: string) => {
    setSelectedTechStack(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const validateForm = () => {
    if (selectedProjectTypes.length === 0) {
      toast.error("Please select at least one project type");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Save to context
      setStepData(2, {
        projectTypes: selectedProjectTypes,
        techStack: selectedTechStack
      });
      
      // Save to database
      await saveProgress({
        project_types: selectedProjectTypes,
        tech_stack: selectedTechStack,
        profileCompletionPercentage: 50
      });
      
      goToNextStep();
    } catch (error) {
      console.error('Error saving project details:', error);
      toast.error("Failed to save your project preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      title="Project Details"
      subtitle="Tell us about the types of projects you're looking for help with"
      onNextStep={handleSubmit}
      onBackStep={goToPreviousStep}
      nextDisabled={isSubmitting}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="block text-base font-medium">Project Types <span className="text-destructive">*</span></Label>
          <p className="text-sm text-muted-foreground">
            Select the types of projects you need help with
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {PROJECT_TYPES.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`project-${type.value}`} 
                  checked={selectedProjectTypes.includes(type.value)}
                  onCheckedChange={() => toggleProjectType(type.value)}
                />
                <label
                  htmlFor={`project-${type.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label className="block text-base font-medium">Tech Stack (Optional)</Label>
          <p className="text-sm text-muted-foreground">
            Select the technologies you're working with
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {TECH_STACK.map((tech) => (
              <div key={tech.value} className="flex items-center space-x-2">
                <Checkbox 
                  id={`tech-${tech.value}`} 
                  checked={selectedTechStack.includes(tech.value)}
                  onCheckedChange={() => toggleTechStack(tech.value)}
                />
                <label
                  htmlFor={`tech-${tech.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {tech.label}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ProjectDetailsStep;
