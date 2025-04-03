
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import OnboardingLayout from '../../../../components/onboarding/OnboardingLayout';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { toast } from 'sonner';

const ClientDetailsStep: React.FC<{ goToNextStep: () => void; setStepData: (step: number, data: any) => void }> = ({ 
  goToNextStep, 
  setStepData 
}) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    industry: '',
    bio: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing data if available
  const { state, saveProgress } = useOnboarding();
  
  useEffect(() => {
    if (state.stepData[1]) {
      setFormData({
        ...formData,
        ...state.stepData[1]
      });
    }
  }, [state.stepData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.industry.trim()) {
      toast.error("Please enter your industry");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Save to context
      setStepData(1, formData);
      
      // Save to database
      await saveProgress({
        company: formData.company,
        position: formData.position,
        industry: formData.industry,
        bio: formData.bio,
        profileCompletionPercentage: 25
      });
      
      goToNextStep();
    } catch (error) {
      console.error('Error saving client details:', error);
      toast.error("Failed to save your details. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <OnboardingLayout
      title="About You"
      subtitle="Let's start with some basic information about you and your company"
      onNextStep={handleSubmit}
      nextDisabled={isSubmitting}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="company">Company Name (Optional)</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Your company name"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">Your Position (Optional)</Label>
          <Input
            id="position"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Your job title"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="industry">Industry <span className="text-destructive">*</span></Label>
          <Input
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            placeholder="E.g., Technology, Healthcare, E-commerce"
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="bio">Brief Introduction (Optional)</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            placeholder="Tell us a bit about yourself or your company..."
            rows={4}
          />
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default ClientDetailsStep;
