
/**
 * Get a developer's display name from an application object
 * Handles different possible data structures
 */
export const getDeveloperName = (application: any): string => {
  if (!application) return 'Developer';
  
  if (application.developers?.profiles?.name) {
    return application.developers.profiles.name;
  }
  
  if (application.developer?.profile?.name) {
    return application.developer.profile.name;
  }
  
  if (application.developer?.name) {
    return application.developer.name;
  }
  
  return 'Developer';
};

/**
 * Get a developer's avatar image URL from an application object
 * Handles different possible data structures
 */
export const getDeveloperImage = (application: any): string => {
  if (!application) return '/placeholder.svg';
  
  if (application.developers?.profiles?.image) {
    return application.developers.profiles.image;
  }
  
  if (application.developer?.profile?.image) {
    return application.developer.profile.image;
  }
  
  if (application.developer?.image) {
    return application.developer.image;
  }
  
  return '/placeholder.svg';
};
