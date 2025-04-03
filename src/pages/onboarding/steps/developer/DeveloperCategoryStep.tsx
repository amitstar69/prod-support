
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { toast } from 'sonner';

interface DeveloperCategoryStepProps {
  step: number;
}

const DeveloperCategoryStep: React.FC<DeveloperCategoryStepProps> = ({ step }) => {
  const { state, goToNextStep, goToPreviousStep, setStepData, saveProgress } = useOnboarding();
  const [selectedCategory, setSelectedCategory] = useState('frontend');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data if available
  useEffect(() => {
    if (state.stepData[step]?.category) {
      setSelectedCategory(state.stepData[step].category);
    }
  }, [state.stepData, step]);

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.error('Please select a primary category');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save step data
      setStepData(step, { category: selectedCategory });

      // Update database with the category
      await saveProgress({ category: selectedCategory });
      
      // Move to next step
      goToNextStep();
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error('Failed to save your selection');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      title="Development Category"
      subtitle="Select your primary area of expertise"
      onNextStep={handleSubmit}
      onBackStep={goToPreviousStep}
      nextDisabled={isSubmitting}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Primary Development Category</label>
          <p className="text-sm text-muted-foreground">
            This helps us match you with the right clients seeking your expertise
          </p>
          
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select your primary category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="frontend">Frontend Development</SelectItem>
              <SelectItem value="backend">Backend Development</SelectItem>
              <SelectItem value="fullstack">Full Stack Development</SelectItem>
              <SelectItem value="mobile">Mobile Development</SelectItem>
              <SelectItem value="devops">DevOps Engineering</SelectItem>
              <SelectItem value="database">Database Engineering</SelectItem>
              <SelectItem value="security">Security Engineering</SelectItem>
              <SelectItem value="ai">AI & Machine Learning</SelectItem>
              <SelectItem value="data">Data Science & Analytics</SelectItem>
              <SelectItem value="gamedev">Game Development</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {selectedCategory && (
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">
              {selectedCategory === 'frontend' && "Frontend Development"}
              {selectedCategory === 'backend' && "Backend Development"}
              {selectedCategory === 'fullstack' && "Full Stack Development"}
              {selectedCategory === 'mobile' && "Mobile Development"}
              {selectedCategory === 'devops' && "DevOps Engineering"}
              {selectedCategory === 'database' && "Database Engineering"}
              {selectedCategory === 'security' && "Security Engineering"}
              {selectedCategory === 'ai' && "AI & Machine Learning"}
              {selectedCategory === 'data' && "Data Science & Analytics"}
              {selectedCategory === 'gamedev' && "Game Development"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {selectedCategory === 'frontend' && "Specializing in user interfaces, client-side logic, and web experiences using technologies like React, Vue, or Angular."}
              {selectedCategory === 'backend' && "Focusing on server-side applications, APIs, and business logic using Node.js, Python, Java, or other server technologies."}
              {selectedCategory === 'fullstack' && "Proficient in both client and server-side development with end-to-end implementation skills."}
              {selectedCategory === 'mobile' && "Creating applications for iOS, Android, or cross-platform using React Native, Flutter, or native development."}
              {selectedCategory === 'devops' && "Managing infrastructure, CI/CD pipelines, and deployment automation for reliable operations."}
              {selectedCategory === 'database' && "Specializing in database design, optimization, and data management solutions."}
              {selectedCategory === 'security' && "Focusing on application security, penetration testing, and implementing secure coding practices."}
              {selectedCategory === 'ai' && "Developing machine learning models, AI solutions, and intelligent applications."}
              {selectedCategory === 'data' && "Working with data processing, analysis, visualization, and data-driven solutions."}
              {selectedCategory === 'gamedev' && "Creating interactive experiences using game engines and graphics programming."}
            </p>
          </div>
        )}
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperCategoryStep;
