
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Textarea } from '../../../../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';
import { Label } from '../../../../components/ui/label';
import { toast } from 'sonner';

interface DeveloperExperienceStepProps {
  step: number;
}

const DeveloperExperienceStep: React.FC<DeveloperExperienceStepProps> = ({ step }) => {
  const { state, goToNextStep, goToPreviousStep, setStepData, saveProgress } = useOnboarding();
  const [formData, setFormData] = useState({
    yearsExperience: '3-5',
    experienceDescription: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data if available
  useEffect(() => {
    if (state.stepData[step]) {
      setFormData({
        yearsExperience: state.stepData[step].yearsExperience || '3-5',
        experienceDescription: state.stepData[step].experienceDescription || '',
      });
    }
  }, [state.stepData, step]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleExperienceChange = (value: string) => {
    setFormData({ ...formData, yearsExperience: value });
  };

  const handleSubmit = async () => {
    if (!formData.experienceDescription.trim()) {
      toast.error('Please provide a description of your experience');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save step data
      setStepData(step, formData);

      // Update database
      await saveProgress({ 
        experience: formData.experienceDescription,
        experienceYears: formData.yearsExperience
      });
      
      // Move to next step
      goToNextStep();
    } catch (error) {
      console.error('Error saving experience info:', error);
      toast.error('Failed to save your information');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      title="Your Experience"
      subtitle="Tell us about your professional experience"
      onNextStep={handleSubmit}
      onBackStep={goToPreviousStep}
      nextDisabled={isSubmitting}
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label>Years of Professional Experience</Label>
          <RadioGroup value={formData.yearsExperience} onValueChange={handleExperienceChange} className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="<1" id="exp-1" />
              <Label htmlFor="exp-1" className="cursor-pointer">Less than 1 year</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1-2" id="exp-2" />
              <Label htmlFor="exp-2" className="cursor-pointer">1-2 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="3-5" id="exp-3" />
              <Label htmlFor="exp-3" className="cursor-pointer">3-5 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6-10" id="exp-4" />
              <Label htmlFor="exp-4" className="cursor-pointer">6-10 years</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10+" id="exp-5" />
              <Label htmlFor="exp-5" className="cursor-pointer">10+ years</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <Label htmlFor="experienceDescription">Describe your experience</Label>
          <Textarea
            id="experienceDescription"
            name="experienceDescription"
            value={formData.experienceDescription}
            onChange={handleTextChange}
            placeholder="Share your professional background, key achievements, and areas of expertise..."
            className="min-h-[150px]"
            required
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperExperienceStep;
