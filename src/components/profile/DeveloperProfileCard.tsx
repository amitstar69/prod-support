
import React, { useState, useEffect } from 'react';
import { Developer } from '../../types/product';
import ProfileImageUpload from './ProfileImageUpload';
import DeveloperInfoForm from './DeveloperInfoForm';
import AboutSection from './AboutSection';
import BioSection from './BioSection';
import DeveloperSkillsSection from './DeveloperSkillsSection';
import DeveloperCommunicationSection from './DeveloperCommunicationSection';
import ProfileActions from './ProfileActions';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';

interface DeveloperProfileCardProps {
  developer: Developer;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    category: string;
    skills: string[];
    experience: string;
    hourlyRate: number;
    minuteRate: number;
    availability: boolean;
    description: string;
    communicationPreferences: string[];
    username: string;
    bio: string;
  };
  onInputChange: (field: string, value: any) => void;
  isSaving: boolean;
  onSave: () => void;
}

const DeveloperProfileCard: React.FC<DeveloperProfileCardProps> = ({
  developer,
  formData,
  onInputChange,
  isSaving,
  onSave
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(formData);

  // Track if the form has any changes
  useEffect(() => {
    const isChanged = JSON.stringify(initialFormData) !== JSON.stringify(formData);
    setHasChanges(isChanged);
  }, [formData, initialFormData]);

  // Reset tracked changes when saved successfully
  useEffect(() => {
    if (!isSaving && hasChanges) {
      setInitialFormData(formData);
      setHasChanges(false);
    }
  }, [isSaving]);

  const handleSave = () => {
    if (formData.skills.length === 0) {
      toast.error("Please add at least one skill");
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      toast.error("Please provide a more detailed description of your services");
      return;
    }

    onSave();
  };

  const handleCancel = () => {
    if (hasChanges && confirm("Discard all changes?")) {
      onInputChange('formData', initialFormData);
      setHasChanges(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto border border-border/40 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Developer Information</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            <ProfileImageUpload 
              imageUrl={developer.image} 
              onImageUpdate={(url) => console.log("Image updated:", url)} 
            />
            <DeveloperInfoForm 
              firstName={formData.firstName}
              lastName={formData.lastName}
              email={formData.email}
              phone={formData.phone}
              location={formData.location}
              onChange={(field, value) => onInputChange(field, value)}
            />
          </div>
        </div>
        
        <BioSection 
          username={formData.username}
          bio={formData.bio}
          company=""
          position=""
          onChange={onInputChange}
        />
        
        <DeveloperSkillsSection 
          category={formData.category}
          skills={formData.skills}
          experience={formData.experience}
          hourlyRate={formData.hourlyRate}
          minuteRate={formData.minuteRate}
          availability={formData.availability}
          onChange={onInputChange}
        />
        
        <DeveloperCommunicationSection 
          communicationPreferences={formData.communicationPreferences}
          onChange={onInputChange}
        />
        
        <AboutSection 
          description={formData.description} 
          onChange={(value) => onInputChange('description', value)}
        />
        
        <ProfileActions 
          isSaving={isSaving} 
          onSave={handleSave}
          onCancel={handleCancel}
          hasChanges={hasChanges}
        />
      </CardContent>
    </Card>
  );
};

export default DeveloperProfileCard;
