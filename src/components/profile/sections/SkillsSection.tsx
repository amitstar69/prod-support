
import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Edit2, X, Plus } from 'lucide-react';

interface SkillsSectionProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({ skills, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
    setNewSkill('');
  };
  
  const handleSave = () => {
    setIsEditing(false);
  };
  
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      onChange([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };
  
  const handleRemoveSkill = (skill: string) => {
    onChange(skills.filter(s => s !== skill));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };
  
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">Skills</h2>
          <Button variant="ghost" size="sm" onClick={handleToggleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 px-3 py-2 border border-border rounded-md transition-colors"
                placeholder="Add a skill (e.g. JavaScript, React, Node.js)"
              />
              <Button onClick={handleAddSkill}>
                <Plus className="h-4 w-4 mr-2" />
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <Badge key={index} className="flex items-center gap-1 px-3 py-1">
                  {skill}
                  <button 
                    onClick={() => handleRemoveSkill(skill)}
                    className="ml-1 rounded-full hover:bg-primary/20 p-1"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            
            {skills.length === 0 && (
              <p className="text-muted-foreground text-sm">No skills added yet</p>
            )}
            
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-muted-foreground italic">Add skills to showcase your expertise</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SkillsSection;
