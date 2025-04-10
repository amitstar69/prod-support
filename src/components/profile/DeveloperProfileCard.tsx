
import React, { useState, useEffect } from 'react';
import { Developer } from '../../types/product';
import { Card, CardContent } from '../ui/card';
import { toast } from 'sonner';
import { useLocation, useNavigate } from 'react-router-dom';
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
import { supabase } from '../../integrations/supabase/client';

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
  const [isVerified, setIsVerified] = useState(developer.premiumVerified || false);
  const location = useLocation();
  const navigate = useNavigate();
  const { userId } = useAuth();

  // Check for verification status on mount and URL parameters
  useEffect(() => {
    // Set initial verified status from developer prop
    setIsVerified(developer.premiumVerified || false);
    
    const checkVerificationStatus = async () => {
      // Check for query parameters that indicate verification flow
      const urlParams = new URLSearchParams(location.search);
      const verificationStatus = urlParams.get('verification');
      const refresh = urlParams.get('refresh');
      
      // If coming from verification flow or refresh is requested
      if ((verificationStatus === 'success' || refresh === 'true') && userId) {
        console.log('Detected verification completion or refresh request. Checking database status.');
        
        try {
          // Force invalidate cache first
          invalidateUserDataCache(userId);
          
          // Then double-check directly with database for latest status
          const { data, error } = await supabase
            .from('developer_profiles')
            .select('premium_verified')
            .eq('id', userId)
            .single();
            
          if (error) {
            console.error('Error checking verification status:', error);
            return;
          }
          
          // If database shows verified but our local state doesn't, update it
          if (data && data.premium_verified && !isVerified) {
            console.log('Updated verification status from database:', data.premium_verified);
            setIsVerified(true);
            
            // If we have a refresh function, call it to update the whole profile
            if (refreshProfile) {
              console.log('Refreshing entire profile data');
              refreshProfile();
            }
            
            // Show success toast
            toast.success('Your account verification has been processed successfully!');
            
            // Clean up URL params to avoid repeated checks
            if (verificationStatus || refresh) {
              navigate(location.pathname, { replace: true });
            }
          }
        } catch (err) {
          console.error('Error during verification status check:', err);
        }
      }
    };
    
    checkVerificationStatus();
  }, [developer.premiumVerified, location, userId, refreshProfile]);

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
            isVerified={isVerified} 
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
