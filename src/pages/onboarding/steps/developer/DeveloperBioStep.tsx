
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Textarea } from '../../../../components/ui/textarea';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { toast } from 'sonner';

interface DeveloperBioStepProps {
  step: number;
}

const DeveloperBioStep: React.FC<DeveloperBioStepProps> = ({ step }) => {
  const { state, goToPreviousStep, completeOnboarding, setStepData } = useOnboarding();
  const [formData, setFormData] = useState({
    bio: '',
    linkedin: '',
    github: '',
    portfolio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data if available
  useEffect(() => {
    if (state.stepData[step]) {
      setFormData({
        ...formData,
        ...state.stepData[step]
      });
    }
  }, [state.stepData, step]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    if (!formData.bio || formData.bio.length < 50) {
      toast.error('Please provide a detailed bio of at least 50 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save step data
      setStepData(step, formData);

      // Prepare social links
      const socialLinks = {
        linkedin: formData.linkedin || '',
        github: formData.github || '',
        portfolio: formData.portfolio || ''
      };

      // Complete the onboarding process
      await completeOnboarding();

      toast.success('Your developer profile has been completed!');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete the profile setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      title="About You"
      subtitle="Tell clients about yourself and share your professional profiles"
      onNextStep={handleSubmit}
      onBackStep={goToPreviousStep}
      nextDisabled={isSubmitting}
      nextLabel="Complete Setup"
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bio">Professional Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Share your professional journey, what you specialize in, and what makes you unique as a developer..."
            className="min-h-[200px]"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.bio.length < 50 
              ? `Please write at least 50 characters. Currently: ${formData.bio.length}/50`
              : `Character count: ${formData.bio.length}`}
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Professional Profiles (Optional)</h3>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn Profile</Label>
            <Input
              id="linkedin"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourusername"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="github">GitHub Profile</Label>
            <Input
              id="github"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="https://github.com/yourusername"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="portfolio">Portfolio Website</Label>
            <Input
              id="portfolio"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="https://yourportfolio.com"
            />
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperBioStep;
