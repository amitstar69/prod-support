
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

// Common tech skills
const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
  'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
  'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'Material UI',
  'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'Firebase',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'GraphQL', 'REST API', 'Redux', 'Next.js', 'Express'
];

// Categories
const CATEGORIES = [
  'Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps',
  'Data Science', 'Machine Learning', 'Blockchain', 'Game Development'
];

const DeveloperSkillsStep: React.FC = () => {
  const { goToNextStep } = useOnboarding();
  const { userId } = useAuth();
  
  const [skills, setSkills] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [experience, setExperience] = useState<string>('');
  const [newSkill, setNewSkill] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [formValid, setFormValid] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getCurrentUserData();
        if (userData) {
          if (userData.skills && Array.isArray(userData.skills)) {
            setSkills(userData.skills);
          }
          if (userData.category) {
            setCategory(userData.category);
          }
          if (userData.experience) {
            setExperience(userData.experience);
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
    // Check if form is valid
    setFormValid(
      skills.length > 0 && 
      category !== '' && 
      experience !== ''
    );
  }, [skills, category, experience]);
  
  const addSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };
  
  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };
  
  const handleAddNewSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddNewSkill();
    }
  };
  
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const updatedUserData = {
        skills,
        category,
        experience,
      };
      
      const success = await updateUserData(updatedUserData);
      
      if (success) {
        toast.success('Skills and expertise saved successfully');
        goToNextStep();
      } else {
        toast.error('Failed to save information');
      }
    } catch (error) {
      console.error('Error saving skills:', error);
      toast.error('An error occurred while saving');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <OnboardingLayout
      title="Your Skills & Expertise"
      subtitle="Let clients know what you're great at"
      nextDisabled={!formValid || isLoading}
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label>Primary Category</Label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                type="button"
                variant={category === cat ? "default" : "outline"}
                className="justify-start"
                onClick={() => setCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Experience Level</Label>
          <div className="grid grid-cols-3 gap-2">
            {['1+ years', '3+ years', '5+ years', '7+ years', '10+ years', 'Expert'].map((exp) => (
              <Button
                key={exp}
                type="button"
                variant={experience === exp ? "default" : "outline"}
                className="justify-start"
                onClick={() => setExperience(exp)}
              >
                {exp}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label>Your Skills</Label>
          <div className="p-3 border border-border rounded-md min-h-20">
            {skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    variant="secondary"
                    className="flex items-center gap-1 py-1 px-2"
                  >
                    {skill}
                    <button 
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X size={14} />
                    </button>
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-2">
                Add some skills below to get started
              </p>
            )}
          </div>
          
          <div className="flex gap-2 mt-2">
            <Input
              placeholder="Add a custom skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <Button 
              type="button" 
              onClick={handleAddNewSkill}
              disabled={!newSkill.trim()}
            >
              Add
            </Button>
          </div>
        </div>
        
        <div>
          <Label className="mb-2 block">Common Skills</Label>
          <div className="flex flex-wrap gap-2">
            {COMMON_SKILLS.filter(skill => !skills.includes(skill)).map((skill) => (
              <Button
                key={skill}
                variant="outline"
                size="sm"
                onClick={() => addSkill(skill)}
                className="mb-2"
              >
                {skill}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeveloperSkillsStep;
