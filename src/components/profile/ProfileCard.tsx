
import React from 'react';
import ProfileImageUpload from './ProfileImageUpload';
import ClientInfoForm from './ClientInfoForm';
import AboutSection from './AboutSection';
import BioSection from './BioSection';
import TechPreferencesSection from './TechPreferencesSection';
import BudgetPaymentSection from './BudgetPaymentSection';
import ProfileActions from './ProfileActions';
import { Client } from '../../types/product';
import { Card, CardContent } from '../ui/card';

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
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="bg-secondary/20 p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
            <ProfileImageUpload 
              imageUrl={formData.image || client.image} 
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
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <BioSection 
            username={formData.username}
            bio={formData.bio}
            company={formData.company}
            position={formData.position}
            onChange={onInputChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <AboutSection 
            description={formData.description} 
            onChange={(value) => onInputChange('description', value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <TechPreferencesSection 
            techStack={formData.techStack}
            industry={formData.industry}
            projectTypes={formData.projectTypes}
            preferredHelpFormat={formData.preferredHelpFormat}
            onChange={onInputChange}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <BudgetPaymentSection 
            budgetPerHour={formData.budgetPerHour}
            paymentMethod={formData.paymentMethod}
            onChange={onInputChange}
          />
        </CardContent>
      </Card>

      <ProfileActions isSaving={isSaving} onSave={onSave} />
    </div>
  );
};

export default ProfileCard;
