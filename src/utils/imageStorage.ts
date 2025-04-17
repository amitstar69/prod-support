
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

type ImageStorageOptions = {
  maxSizeMB?: number;
  allowedTypes?: string[];
  bucketName?: string;
  folderPath?: string;
};

// Default options for image handling
const defaultOptions: ImageStorageOptions = {
  maxSizeMB: 2, // 2MB max file size
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  bucketName: 'profiles',
  folderPath: 'profile-images'
};

/**
 * Utility for uploading images to Supabase storage
 */
export const uploadImage = async (
  file: File,
  userId: string,
  options: ImageStorageOptions = {}
): Promise<{ success: boolean; url?: string; error?: string }> => {
  const opts = { ...defaultOptions, ...options };
  
  // Validate file type
  if (!opts.allowedTypes?.includes(file.type)) {
    return { 
      success: false, 
      error: `Invalid file type. Allowed types: ${opts.allowedTypes?.join(', ')}` 
    };
  }

  // Validate file size
  const maxSize = opts.maxSizeMB! * 1024 * 1024;
  if (file.size > maxSize) {
    return { 
      success: false, 
      error: `File size exceeds maximum allowed (${opts.maxSizeMB}MB)` 
    };
  }

  try {
    // Generate a unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${opts.folderPath}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(opts.bucketName!)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from(opts.bucketName!)
      .getPublicUrl(filePath);

    if (!urlData?.publicUrl) {
      return { success: false, error: 'Failed to generate public URL' };
    }

    return { success: true, url: urlData.publicUrl };
  } catch (error: any) {
    console.error('Image upload error:', error);
    return { success: false, error: error.message || 'Unknown error during upload' };
  }
};

/**
 * Delete an image from storage
 */
export const deleteImage = async (
  imageUrl: string,
  bucketName: string = defaultOptions.bucketName!
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Extract path from URL
    const urlParts = imageUrl.split('/');
    const storagePath = urlParts.slice(-2).join('/');
    
    if (!storagePath || !storagePath.includes('/')) {
      return { success: false, error: 'Invalid image URL format' };
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([storagePath]);

    if (error) {
      console.error('Error deleting image:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Image deletion error:', error);
    return { success: false, error: error.message || 'Unknown error during deletion' };
  }
};

/**
 * Get a signed URL for private images that require authentication
 */
export const getSignedImageUrl = async (
  path: string,
  bucketName: string = defaultOptions.bucketName!,
  expiresIn: number = 60 // 60 seconds default
): Promise<{ signedUrl?: string; error?: string }> => {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(path, expiresIn);

    if (error) {
      return { error: error.message };
    }

    return { signedUrl: data.signedUrl };
  } catch (error: any) {
    console.error('Error getting signed URL:', error);
    return { error: error.message || 'Failed to generate signed URL' };
  }
};
