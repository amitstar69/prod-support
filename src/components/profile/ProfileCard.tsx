
import React from 'react';
import ProfileImageUpload from './ProfileImageUpload';
import ClientInfoForm from './ClientInfoForm';
import AboutSection from './AboutSection';
import ProfileActions from './ProfileActions';
import { Client } from '../../types/product';

interface ProfileCardProps {
  client: Client;
  isSaving: boolean;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ client, isSaving, onSubmit }) => {
  const nameParts = client?.name ? client.name.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={onSubmit}>
        <div className="bg-card rounded-xl border border-border/40 shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <h2 className="text-xl font-semibold mb-6">Client Information</h2>
            
            <div className="flex flex-col md:flex-row gap-8">
              <ProfileImageUpload imageUrl={client.image} />
              <ClientInfoForm 
                firstName={firstName}
                lastName={lastName}
                email={client.email}
                location={client.location || ''}
              />
            </div>
          </div>
          
          <AboutSection description={client.description || ''} />
          <ProfileActions isSaving={isSaving} />
        </div>
      </form>
    </div>
  );
};

export default ProfileCard;
