
import React from 'react';
import ProfileImageUpload from './ProfileImageUpload';
import ClientInfoForm from './ClientInfoForm';
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
    username: string;
    bio: string;
    techStack: string[];
    preferredHelpFormat: string;
    budgetPerHour: number;
    paymentMethod: string;
  };
  onInputChange: (field: string, value: string) => void;
  onTechStackChange: (techStack: string[]) => void;
  onFormatChange: (format: string) => void;
  onBudgetChange: (budget: number) => void;
  onPaymentMethodChange: (method: string) => void;
  isSaving: boolean;
  onSave: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ 
  client, 
  formData,
  onInputChange,
  onTechStackChange,
  onFormatChange,
  onBudgetChange,
  onPaymentMethodChange,
  isSaving, 
  onSave
}) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-semibold mb-6">Client Information</h2>
          
          <div className="flex flex-col md:flex-row gap-8">
            <ProfileImageUpload imageUrl={client.image} />
            <ClientInfoForm 
              firstName={formData.firstName}
              lastName={formData.lastName}
              email={formData.email}
              location={formData.location}
              username={formData.username}
              onChange={(field, value) => onInputChange(field, value)}
            />
          </div>
        </div>
        
        <BioSection 
          bio={formData.bio} 
          onChange={(value) => onInputChange('bio', value)}
        />
        
        <TechPreferencesSection
          techStack={formData.techStack}
          preferredHelpFormat={formData.preferredHelpFormat}
          onTechStackChange={onTechStackChange}
          onFormatChange={onFormatChange}
        />
        
        <BudgetPaymentSection
          budgetPerHour={formData.budgetPerHour}
          paymentMethod={formData.paymentMethod}
          onBudgetChange={onBudgetChange}
          onPaymentMethodChange={onPaymentMethodChange}
        />
        
        <ProfileActions isSaving={isSaving} onSave={onSave} />
      </div>
    </div>
  );
};

export default ProfileCard;
