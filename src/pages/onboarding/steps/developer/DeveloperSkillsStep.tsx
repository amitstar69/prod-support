
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../../../contexts/OnboardingContext';
import { Input } from '../../../../components/ui/input';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { PlusCircle, X } from 'lucide-react';
import { toast } from 'sonner';

const DeveloperSkillsStep = () => {
  const { state, setStepData, saveProgress } = useOnboarding();
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load saved data if available
  useEffect(() => {
    const stepNumber = 1;
    if (state.stepData[stepNumber]?.skills && Array.isArray(state.stepData[stepNumber].skills)) {
      setSkills(state.stepData[stepNumber].skills);
    }
  }, [state.stepData]);

  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      return;
    }

    const skill = newSkill.trim();
    
    // Check if skill already exists
    if (skills.includes(skill)) {
      toast.error('Skill already added');
      return;
    }

    const updatedSkills = [...skills, skill];
    setSkills(updatedSkills);
    setNewSkill('');
    
    // Save to onboarding context
    setStepData(1, { skills: updatedSkills });
    
    // Save to database
    saveProgress({ skills: updatedSkills }).catch(error => {
      console.error('Error saving skills:', error);
    });
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updatedSkills = skills.filter(skill => skill !== skillToRemove);
    setSkills(updatedSkills);
    
    // Save to onboarding context
    setStepData(1, { skills: updatedSkills });
    
    // Save to database
    saveProgress({ skills: updatedSkills }).catch(error => {
      console.error('Error saving skills:', error);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Your Technical Skills</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Add the programming languages, frameworks, and tools you're proficient with
        </p>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Add a skill (e.g., React, Node.js, Python)"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>
        <Button 
          type="button" 
          onClick={handleAddSkill}
          size="icon"
          variant="outline"
        >
          <PlusCircle className="h-4 w-4" />
        </Button>
      </div>

      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-4">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="pl-2 py-1.5">
              {skill}
              <Button
                size="sm"
                variant="ghost"
                className="h-5 w-5 p-0 ml-1"
                onClick={() => handleRemoveSkill(skill)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      ) : (
        <div className="bg-muted/50 rounded-md p-4 text-center">
          <p className="text-sm text-muted-foreground">No skills added yet. Add your first skill above.</p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="text-sm text-muted-foreground">
          <p>Added {skills.length} {skills.length === 1 ? 'skill' : 'skills'}</p>
        </div>
      )}
    </div>
  );
};

export default DeveloperSkillsStep;
