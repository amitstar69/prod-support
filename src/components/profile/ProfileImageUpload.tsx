
import React, { useRef, useState } from 'react';
import { User } from 'lucide-react';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ProfileImageUploadProps {
  imageUrl?: string;
  onImageUpdate?: (url: string) => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ imageUrl, onImageUpdate }) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const fileType = file.type;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(fileType)) {
      toast.error('Please upload a valid image file (JPEG, PNG, or WEBP)');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size exceeds 2MB limit');
      return;
    }

    setIsUploading(true);
    try {
      // Get current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error('User authentication required');
        return;
      }

      const userId = userData.user.id;
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error('Failed to upload image. Please try again.');
        return;
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Call the callback with the new URL
      if (onImageUpdate) {
        onImageUpdate(publicUrl);
        toast.success('Profile image updated successfully');
      }
    } catch (error) {
      console.error('Image upload error:', error);
      toast.error('An error occurred while uploading the image');
    } finally {
      setIsUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex flex-col items-center md:items-start gap-4">
      <div className="relative">
        <div className="h-20 w-20 md:h-24 md:w-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <Avatar className="h-full w-full">
              <AvatarImage src={imageUrl} alt="Profile" className="h-full w-full object-cover" />
              <AvatarFallback>
                <User className="h-10 w-10 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
        </div>
        <button 
          type="button" 
          className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm"
          onClick={handleImageButtonClick}
          disabled={isUploading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleImageChange}
      />
      <button 
        type="button" 
        className="text-sm text-primary font-medium"
        onClick={handleImageButtonClick}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Change Image'}
      </button>
    </div>
  );
};

export default ProfileImageUpload;
