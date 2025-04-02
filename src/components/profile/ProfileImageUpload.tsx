
import React, { useRef, useState } from 'react';
import { User, Camera } from 'lucide-react';
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

      console.log('Uploading image to path:', filePath);

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('profiles')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        toast.error(`Failed to upload image: ${uploadError.message}`);
        return;
      }

      console.log('Upload successful:', uploadData);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      console.log('Generated public URL:', publicUrl);

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
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt="Profile" className="object-cover" />
          ) : (
            <AvatarFallback className="bg-secondary">
              <User className="h-12 w-12 md:h-16 md:w-16 text-muted-foreground" />
            </AvatarFallback>
          )}
        </Avatar>
        <button 
          type="button" 
          className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center shadow-sm hover:bg-primary/90 transition-colors"
          onClick={handleImageButtonClick}
          disabled={isUploading}
          aria-label="Change profile picture"
        >
          <Camera className="h-4 w-4" />
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
        className="mt-2 text-sm text-primary font-medium hover:underline"
        onClick={handleImageButtonClick}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Change Photo'}
      </button>
    </div>
  );
};

export default ProfileImageUpload;
