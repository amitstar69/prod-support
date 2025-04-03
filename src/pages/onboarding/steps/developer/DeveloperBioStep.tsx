
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Textarea } from '../../../../components/ui/textarea';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { useAuth } from '../../../../contexts/auth';
import { toast } from 'sonner';

const DeveloperBioStep = () => {
  const { state, setStepData, saveProgress, completeOnboarding } = useOnboarding();
  const { authState } = useAuth();
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data if available
  useEffect(() => {
    const stepNumber = 5;
    if (state.stepData[stepNumber]) {
      const data = state.stepData[stepNumber];
      if (data.bio) setBio(data.bio);
      if (data.title) setTitle(data.title);
    }
  }, [state.stepData]);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setBio(e.target.value);
    updateStepData(e.target.value, title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateStepData(bio, e.target.value);
  };

  const updateStepData = (bioText: string, titleText: string) => {
    const data = {
      bio: bioText,
      title: titleText
    };
    
    // Save to onboarding context
    setStepData(5, data);
  };

  const handleSaveAndComplete = async () => {
    if (!title.trim()) {
      toast.error('Please add a professional title');
      return;
    }

    if (!bio.trim() || bio.length < 20) {
      toast.error('Please add a bio with at least 20 characters');
      return;
    }

    setIsSubmitting(true);

    try {
      // Save the final data
      const data = {
        bio,
        title,
        profileCompleted: true,
        onboardingCompletedAt: new Date().toISOString()
      };
      
      await saveProgress(data);
      await completeOnboarding();
      
      toast.success('Profile completed successfully!');
    } catch (error) {
      console.error('Error completing profile:', error);
      toast.error('There was a problem completing your profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">About You</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tell clients about your expertise and what makes you stand out
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="professional-title" className="text-base">Professional Title</Label>
          <Input
            id="professional-title"
            placeholder="e.g., Senior React Developer, Full Stack Engineer"
            value={title}
            onChange={handleTitleChange}
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            This will be displayed at the top of your profile
          </p>
        </div>

        <div className="mt-4">
          <Label htmlFor="bio" className="text-base">Professional Bio</Label>
          <Textarea
            id="bio"
            placeholder="Share your professional journey, expertise, and what you enjoy working on..."
            value={bio}
            onChange={handleBioChange}
            className="mt-1 min-h-[150px]"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Min. 20 characters</span>
            <span>{bio.length} characters</span>
          </div>
        </div>
      </div>

      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="font-medium">Tips for a great bio:</h4>
          <ul className="text-sm mt-2 space-y-1 list-disc pl-4">
            <li>Highlight your key skills and specialties</li>
            <li>Mention years of experience and notable achievements</li>
            <li>Explain what kind of projects you enjoy working on</li>
            <li>Share your communication style and work approach</li>
            <li>Keep it professional but let your personality show</li>
          </ul>
        </CardContent>
      </Card>

      <div className="pt-4 flex justify-end">
        <Button
          onClick={handleSaveAndComplete}
          disabled={isSubmitting || !title.trim() || !bio.trim() || bio.length < 20}
        >
          {isSubmitting ? 'Saving...' : 'Complete Profile'}
        </Button>
      </div>
    </div>
  );
};

export default DeveloperBioStep;
