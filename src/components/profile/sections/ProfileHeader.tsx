
import React from 'react';
import { Developer } from '../../../types/product';
import ProfileImageUpload from '../ProfileImageUpload';
import { MapPin, Edit2 } from 'lucide-react';
import { Button } from '../../ui/button';

interface ProfileHeaderProps {
  developer: Developer;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    username: string;
  };
  onChange: (field: string, value: any) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ developer, formData, onChange }) => {
  const [isEditing, setIsEditing] = React.useState(false);
  
  const handleToggleEdit = () => {
    setIsEditing(!isEditing);
  };
  
  const handleSave = () => {
    setIsEditing(false);
  };
  
  const fullName = `${formData.firstName} ${formData.lastName}`.trim();
  
  return (
    <div className="flex-1 space-y-4 w-full">
      <div className="flex justify-between items-start w-full">
        <div className="flex items-center gap-6">
          <ProfileImageUpload 
            imageUrl={developer.image} 
            onImageUpdate={(url) => console.log("Image updated:", url)} 
          />
          
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{fullName}</h1>
            <p className="text-muted-foreground">@{formData.username}</p>
            
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{formData.location || 'Add your location'}</span>
            </div>
          </div>
        </div>
        
        <Button variant="outline" size="sm" onClick={handleToggleEdit} className="shrink-0">
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </div>
      
      {isEditing && (
        <div className="space-y-4 mt-4 p-4 border rounded-md bg-secondary/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => onChange('firstName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => onChange('lastName', e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="username" className="block text-sm font-medium mb-1">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={(e) => onChange('username', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium mb-1">
              Location
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={(e) => onChange('location', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:ring-2 focus:ring-primary/10 focus:border-primary/50 transition-colors"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleSave}>Save</Button>
            <Button variant="outline" onClick={handleToggleEdit}>Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;
