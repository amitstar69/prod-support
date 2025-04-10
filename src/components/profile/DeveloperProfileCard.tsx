
import React, { useState, useEffect } from 'react';
import { Developer } from '../../types/product';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { useLocation } from 'react-router-dom';
import { useAuth, invalidateUserDataCache } from '../../contexts/auth';
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
  refreshProfile?: () => void;
}

const DeveloperProfileCard: React.FC<DeveloperProfileCardProps> = ({
  developer,
  formData,
  onInputChange,
  isSaving,
  onSave,
  refreshProfile
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(formData);
  const location = useLocation();
  const { userId } = useAuth();

  // Check for verification status upon returning from Stripe checkout
  useEffect(() => {
    const checkVerificationReturn = async () => {
      const urlParams = new URLSearchParams(location.search);
      const verificationStatus = urlParams.get('verification');
      
      if (verificationStatus === 'success' && userId && refreshProfile) {
        console.log('Detected successful verification. Refreshing profile data.');
        invalidateUserDataCache(userId);
        refreshProfile();
        toast.success('Your account verification has been processed successfully!');
      } else if (verificationStatus === 'canceled') {
        toast.info('Verification was canceled. You can try again anytime.');
      }
    };
    
    checkVerificationReturn();
  }, [location, userId, refreshProfile]);

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
  }, [isSaving, hasChanges, formData]);

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
      
      {/* Verification Section - Only for developers */}
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
