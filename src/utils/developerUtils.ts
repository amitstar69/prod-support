
/**
 * Utility functions for working with developer data
 */

/**
 * Gets the developer's name from an application object
 */
export const getDeveloperName = (application: any): string => {
  if (application.developers?.profiles?.name) {
    return application.developers.profiles.name;
  }
  if (application.developer?.profile?.name) {
    return application.developer.profile.name;
  }
  return 'Developer';
};

/**
 * Gets the developer's profile image from an application object
 */
export const getDeveloperImage = (application: any): string => {
  if (application.developers?.profiles?.image) {
    return application.developers.profiles.image;
  }
  if (application.developer?.profile?.image) {
    return application.developer.profile.image;
  }
  return '/placeholder.svg';
};

/**
 * Formats a number as a currency string
 */
export const formatCurrency = (value: number): string => {
  return `$${value}`;
};
