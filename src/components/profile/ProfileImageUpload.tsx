
import React from 'react';
import { User } from 'lucide-react';

interface ProfileImageUploadProps {
  imageUrl?: string;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ imageUrl }) => {
  return (
    <div className="flex flex-col items-center md:items-start gap-4">
      <div className="relative">
        <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-muted flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={imageUrl} 
              alt="Profile" 
              className="h-full w-full object-cover rounded-full" 
            />
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <button 
          type="button" 
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
      <button type="button" className="text-sm text-primary font-medium">
        Change Image
      </button>
    </div>
  );
};

export default ProfileImageUpload;
