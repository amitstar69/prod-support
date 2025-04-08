
import React, { useState, useEffect } from 'react';
import { Developer } from '../../types/product';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import ProfileHeader from './sections/ProfileHeader';
import AboutSection from './sections/AboutSection';
import SkillsSection from './sections/SkillsSection';
import EducationSection from './sections/EducationSection';
import CertificationsSection from './sections/CertificationsSection';
import PortfolioSection from './sections/PortfolioSection';
import ServiceDetailsSection from './sections/ServiceDetailsSection';
import LanguagesSection from './sections/LanguagesSection';
import ProfileActions from './ProfileActions';
import VerificationProfileSection from '../../pages/VerificationProfileSection';

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
    education: any[];
    certifications: any[];
    portfolioItems: any[];
    languagesSpoken: any[];
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
    <div className="space-y-6">
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <ProfileHeader 
            developer={developer}
            formData={formData}
            onChange={onInputChange}
          />
        </CardContent>
      </Card>
      
      {/* Add Verification Section */}
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <VerificationProfileSection 
            isVerified={developer.premiumVerified || false} 
            userId={developer.id}
          />
        </CardContent>
      </Card>
      
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <AboutSection 
            description={formData.description}
            bio={formData.bio}
            onChange={onInputChange}
          />
        </CardContent>
      </Card>
      
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <ServiceDetailsSection
            category={formData.category}
            experience={formData.experience}
            hourlyRate={formData.hourlyRate}
            minuteRate={formData.minuteRate}
            availability={formData.availability}
            communicationPreferences={formData.communicationPreferences}
            onChange={onInputChange}
          />
        </CardContent>
      </Card>
      
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <SkillsSection 
            skills={formData.skills}
            onChange={(skills) => onInputChange('skills', skills)}
          />
        </CardContent>
      </Card>
      
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <EducationSection 
            education={formData.education || []}
            onChange={(education) => onInputChange('education', education)}
          />
        </CardContent>
      </Card>
      
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <CertificationsSection 
            certifications={formData.certifications || []}
            onChange={(certifications) => onInputChange('certifications', certifications)}
          />
        </CardContent>
      </Card>
      
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <LanguagesSection 
            languages={formData.languagesSpoken || []}
            onChange={(languages) => onInputChange('languagesSpoken', languages)}
          />
        </CardContent>
      </Card>
      
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <PortfolioSection 
            portfolioItems={formData.portfolioItems || []}
            onChange={(items) => onInputChange('portfolioItems', items)}
          />
        </CardContent>
      </Card>
      
      <Card className="rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <ProfileActions 
            isSaving={isSaving} 
            onSave={handleSave}
            onCancel={handleCancel}
            hasChanges={hasChanges}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperProfileCard;
