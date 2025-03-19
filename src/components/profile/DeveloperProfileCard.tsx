
import React from 'react';
import { Developer } from '../../types/product';
import ProfileImageUpload from './ProfileImageUpload';
import DeveloperInfoForm from './DeveloperInfoForm';
import AboutSection from './AboutSection';
import BioSection from './BioSection';
import DeveloperSkillsSection from './DeveloperSkillsSection';
import DeveloperCommunicationSection from './DeveloperCommunicationSection';
import ProfileActions from './ProfileActions';

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
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Developer Information</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            <ProfileImageUpload imageUrl={developer.image} />
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
          onSave={onSave} 
        />
      </div>
    </div>
  );
};

export default DeveloperProfileCard;
