
import React, { useState } from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Edit2 } from 'lucide-react';

interface AboutSectionProps {
  description: string;
  bio: string;
  onChange: (field: string, value: any) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ description, bio, onChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSave = () => {
    setIsEditing(false);
  };
  
  return (
    <Card className="border border-border/40 shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold">About Me</h2>
          <Button variant="ghost" size="sm" onClick={handleToggleEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium mb-1">
                Short Bio
              </label>
              <input
                id="bio"
                name="bio"
                type="text"
                value={bio}
                onChange={(e) => onChange('bio', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md transition-colors"
                placeholder="A brief headline about yourself"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Full Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={6}
                value={description}
                onChange={(e) => onChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md transition-colors"
                placeholder="Describe your experience, expertise, and what you can offer to clients"
              />
            </div>
            
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {bio && <p className="text-lg font-medium">{bio}</p>}
            {description ? (
              <div className="whitespace-pre-wrap">{description}</div>
            ) : (
              <p className="text-muted-foreground italic">
                Add a description to tell clients about your experience and expertise
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AboutSection;
