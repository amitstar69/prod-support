
import React from 'react';
import ProfileImageUpload from './ProfileImageUpload';
import ClientInfoForm from './ClientInfoForm';
import AboutSection from './AboutSection';
import BioSection from './BioSection';
import TechPreferencesSection from './TechPreferencesSection';
import BudgetPaymentSection from './BudgetPaymentSection';
import ProfileActions from './ProfileActions';
import { Client } from '../../types/product';

interface ProfileCardProps {
  client: Client;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    location: string;
    description: string;
    username: string;
    bio: string;
    company: string;
    position: string;
    techStack: string[];
    industry: string;
    projectTypes: string[];
    preferredHelpFormat: string[];
    budgetPerHour: number;
    paymentMethod: string;
    image?: string;
  };
  onInputChange: (field: string, value: any) => void;
  isSaving: boolean;
  onSave: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  client, 
  formData,
  onInputChange,
  isSaving, 
  onSave
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Client Information</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            <ProfileImageUpload 
              imageUrl={client.image} 
              onImageUpdate={(url) => onInputChange('image', url)}
            />
            <ClientInfoForm 
              firstName={formData.firstName}
              lastName={formData.lastName}
              email={formData.email}
              location={formData.location}
              onChange={(field, value) => onInputChange(field, value)}
            />
          </div>
        </div>
        
        <BioSection 
          username={formData.username}
          bio={formData.bio}
          company={formData.company}
          position={formData.position}
          onChange={onInputChange}
        />
        
        <TechPreferencesSection 
          techStack={formData.techStack}
          industry={formData.industry}
          projectTypes={formData.projectTypes}
          preferredHelpFormat={formData.preferredHelpFormat}
          onChange={onInputChange}
        />
        
        <BudgetPaymentSection 
          budgetPerHour={formData.budgetPerHour}
          paymentMethod={formData.paymentMethod}
          onChange={onInputChange}
        />
        
        <AboutSection 
          description={formData.description} 
          onChange={(value) => onInputChange('description', value)}
        />
        
        <ProfileActions isSaving={isSaving} onSave={onSave} />
      </div>
    </div>
  );
};

export default ProfileCard;
