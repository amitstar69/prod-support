
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Textarea } from '../../../../components/ui/textarea';
import { Label } from '../../../../components/ui/label';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { PlusCircle, X } from 'lucide-react';
import { toast } from 'sonner';

const ProjectDetailsStep = () => {
  const { state, setStepData, saveProgress } = useOnboarding();
  const [description, setDescription] = useState('');
  const [techInterests, setTechInterests] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  // Load saved data if available
  useEffect(() => {
    const stepNumber = 2;
    if (state.stepData[stepNumber]) {
      const data = state.stepData[stepNumber];
      if (data.description) setDescription(data.description);
      if (data.techInterests && Array.isArray(data.techInterests)) {
        setTechInterests(data.techInterests);
      }
    }
  }, [state.stepData]);

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    updateData({ description: e.target.value });
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) {
      return;
    }

    const interest = newInterest.trim();
    
    // Check if interest already exists
    if (techInterests.includes(interest)) {
      toast.error('Item already added');
      return;
    }

    const updatedInterests = [...techInterests, interest];
    setTechInterests(updatedInterests);
    setNewInterest('');
    
    updateData({ techInterests: updatedInterests });
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    const updatedInterests = techInterests.filter(interest => interest !== interestToRemove);
    setTechInterests(updatedInterests);
    
    updateData({ techInterests: updatedInterests });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInterest();
    }
  };

  const updateData = (newData: any) => {
    const currentData = state.stepData[2] || {};
    const updatedData = { ...currentData, ...newData };
    
    // Save to onboarding context
    setStepData(2, updatedData);
  };

  const handleBlur = () => {
    // Save to database when user stops typing (blur event)
    const data = {
      description,
      technical_interests: techInterests
    };
    
    saveProgress(data).catch(error => {
      console.error('Error saving project details:', error);
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Project Information</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Tell us about the projects you'll need help with
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="description">Project Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the types of projects or tasks you need help with..."
            value={description}
            onChange={handleDescriptionChange}
            onBlur={handleBlur}
            className="mt-1 min-h-[100px]"
          />
        </div>

        <div className="mt-6">
          <Label>Technical Areas of Interest</Label>
          <p className="text-sm text-muted-foreground mt-1 mb-2">
            What technologies are you working with or interested in?
          </p>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Add technologies (e.g., React, AWS, Machine Learning)"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button 
              type="button" 
              onClick={handleAddInterest}
              size="icon"
              variant="outline"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>

          {techInterests.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-4">
              {techInterests.map((interest) => (
                <Badge key={interest} variant="secondary" className="pl-2 py-1.5">
                  {interest}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 w-5 p-0 ml-1"
                    onClick={() => handleRemoveInterest(interest)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          ) : (
            <div className="bg-muted/50 rounded-md p-4 text-center mt-4">
              <p className="text-sm text-muted-foreground">No technologies added yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsStep;
