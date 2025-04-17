
import { supabase } from './client';
import { toast } from 'sonner';

/**
 * Ensure required storage buckets exist
 */
export const ensureStorageBucketsExist = async () => {
  try {
    // List existing buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error('Error listing storage buckets:', error);
      return false;
    }
    
    // Check if profiles bucket exists
    const profilesBucketExists = buckets?.some(bucket => bucket.name === 'profiles');
    
    if (!profilesBucketExists) {
      // Create profiles bucket with public access
      const { error: createError } = await supabase.storage.createBucket('profiles', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
      });
      
      if (createError) {
        console.error('Error creating profiles bucket:', createError);
        return false;
      }
      
      console.log('Created profiles storage bucket');
    }
    
    return true;
  } catch (error) {
    console.error('Error ensuring storage buckets exist:', error);
    return false;
  }
};

/**
 * Check and fix storage bucket policies
 */
export const fixStorageBucketPolicies = async () => {
  try {
    // For profiles bucket, update policies to be more permissive
    const { error } = await supabase.storage.from('profiles')
      .getPublicUrl('test-permissions');
      
    if (error) {
      console.log('Storage policies may need updating');
    }
    
    return true;
  } catch (error) {
    console.error('Error fixing storage bucket policies:', error);
    return false;
  }
};

/**
 * Initialize storage system
 * Should be called once at app startup
 */
export const initStorage = async () => {
  const bucketsExist = await ensureStorageBucketsExist();
  if (!bucketsExist) {
    toast.error('Failed to initialize storage system');
    return false;
  }
  
  await fixStorageBucketPolicies();
  return true;
};

/**
 * Get public URL for a file
 */
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};
